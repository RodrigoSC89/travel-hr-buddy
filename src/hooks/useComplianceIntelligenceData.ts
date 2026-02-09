/**
 * useComplianceIntelligenceData - Real compliance data from Supabase
 * Sources: certificates, internal_audits, non_conformities, agent_registry
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types expected by ComplianceIntelligence.tsx
export interface InspectionReadiness {
  type: string;
  score: number;
  status: "ready" | "attention" | "critical";
  nextDue: string;
  openFindings: number;
  criticalItems: number;
}

export interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  vessel: string;
  dueDate: string;
  status: "compliant" | "pending" | "non_compliant" | "expired";
  priority: "high" | "medium" | "low";
  aiRecommendation?: string;
}

export interface CertificationData {
  id: string;
  name: string;
  issuer: string;
  vessel: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "renewal_due" | "expired";
  category: string;
}

export interface AuditAgentData {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  accuracy: number;
}

export interface AuditData {
  id: string;
  type: string;
  vessel: string;
  auditor: string;
  scheduledDate: string;
  status: string;
  scope: string[];
}

export interface NonConformityData {
  id: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  raisedDate: string;
  closedDate: string | null;
  vessel: string;
}

export function useComplianceIntelligenceData() {
  const certificatesQuery = useQuery({
    queryKey: ["compliance-certificates-intel"],
    queryFn: async (): Promise<CertificationData[]> => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id, certificate_type, issuing_authority, expiry_date, issue_date, status, employee_id")
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const now = new Date();
      return data.map((c: any) => {
        const expiry = new Date(c.expiry_date);
        const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let certStatus: CertificationData["status"] = "valid";
        if (daysUntil < 0) certStatus = "expired";
        else if (daysUntil < 90) certStatus = "renewal_due";

        return {
          id: c.id,
          name: c.certificate_type || "Certificado",
          issuer: c.issuing_authority || "N/A",
          vessel: "Fleet-wide",
          issueDate: c.issue_date || "",
          expiryDate: c.expiry_date || "",
          status: certStatus,
          category: c.certificate_type?.includes("STCW") ? "STCW" :
                    c.certificate_type?.includes("MLC") ? "MLC" :
                    c.certificate_type?.includes("ISM") ? "ISM" : "General",
        };
      });
    },
  });

  const agentsQuery = useQuery({
    queryKey: ["compliance-agents-intel"],
    queryFn: async (): Promise<AuditAgentData[]> => {
      const { data, error } = await supabase
        .from("agent_registry")
        .select("id, agent_id, name, status, capabilities, metadata")
        .order("name");

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((a: Record<string, unknown>) => ({
        id: a.id as string,
        name: (a.name as string) || (a.agent_id as string) || "AI Agent",
        status: (a.status as string) || "standby",
        capabilities: Array.isArray(a.capabilities) ? a.capabilities : [],
        accuracy: ((a.metadata as Record<string, unknown>)?.accuracy_score as number) || 90,
      }));
    },
  });

  const auditsQuery = useQuery({
    queryKey: ["compliance-audits-intel"],
    queryFn: async (): Promise<AuditData[]> => {
      const { data, error } = await supabase
        .from("internal_audits")
        .select("id, audit_type, vessel_id, auditor_name, scheduled_date, status, scope")
        .order("scheduled_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((a: any) => ({
        id: a.id,
        type: a.audit_type || "Internal Audit",
        vessel: a.vessel_id || "Fleet-wide",
        auditor: a.auditor_name || "Quality Team",
        scheduledDate: a.scheduled_date || "",
        status: a.status || "scheduled",
        scope: Array.isArray(a.scope) ? a.scope : ["General"],
      }));
    },
  });

  const ncsQuery = useQuery({
    queryKey: ["compliance-ncs-intel"],
    queryFn: async (): Promise<NonConformityData[]> => {
      const { data, error } = await supabase
        .from("non_conformities")
        .select("id, title, description, category, severity, status, created_at, closed_date, vessel_id")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((nc: any) => ({
        id: nc.id,
        description: nc.title || nc.description || "Não conformidade",
        category: nc.category || "ISM",
        severity: nc.severity || "minor",
        status: nc.status || "open",
        raisedDate: nc.created_at || "",
        closedDate: nc.closed_date || null,
        vessel: nc.vessel_id || "N/A",
      }));
    },
  });

  // Derive InspectionReadiness from certificates + audits + NCs
  const readiness: InspectionReadiness[] = (() => {
    const certs = certificatesQuery.data || [];
    const ncs = ncsQuery.data || [];
    const audits = auditsQuery.data || [];
    const inspectionTypes = ["PSC", "SIRE 2.0", "ISM", "MLC"];

    return inspectionTypes.map((type, idx) => {
      const relevantCerts = certs.filter((c) => c.category === type || c.category === "General");
      const relevantNCs = ncs.filter((nc) => nc.category === type || nc.category === "ISM");
      const validCount = relevantCerts.filter((c) => c.status === "valid").length;
      const total = Math.max(relevantCerts.length, 1);
      const score = Math.round((validCount / total) * 100);
      const openFindings = relevantNCs.filter((nc) => nc.status !== "closed").length;
      const criticalItems = relevantNCs.filter((nc) => nc.severity === "major").length;

      // Derive next due from scheduled audits or earliest expiring cert
      const scheduledAudit = audits.find((a) => a.status === "scheduled");
      const earliestExpiry = relevantCerts
        .filter((c) => c.status === "valid" || c.status === "renewal_due")
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
      
      const nextDue = scheduledAudit?.scheduledDate 
        || earliestExpiry?.expiryDate 
        || new Date(Date.now() + (30 + idx * 30) * 24 * 60 * 60 * 1000).toISOString();

      return {
        type,
        score: Math.min(score, 100),
        status: score >= 80 ? "ready" as const : score >= 50 ? "attention" as const : "critical" as const,
        nextDue,
        openFindings,
        criticalItems,
      };
    });
  })();

  // Derive ComplianceItems from certificates
  const items: ComplianceItem[] = (() => {
    const certs = certificatesQuery.data || [];
    return certs.map((c) => ({
      id: c.id,
      category: c.category,
      requirement: c.name,
      vessel: c.vessel,
      dueDate: c.expiryDate,
      status: c.status === "valid" ? "compliant" as const :
              c.status === "renewal_due" ? "pending" as const : "expired" as const,
      priority: c.status === "expired" ? "high" as const :
               c.status === "renewal_due" ? "medium" as const : "low" as const,
      aiRecommendation: c.status === "expired" ? "Renovação urgente. Agende inspeção imediatamente." :
                        c.status === "renewal_due" ? "Programar renovação nas próximas 4 semanas." : undefined,
    }));
  })();

  return {
    certificates: certificatesQuery.data || [],
    agents: agentsQuery.data || [],
    audits: auditsQuery.data || [],
    nonConformities: ncsQuery.data || [],
    readiness,
    items,
    isLoading: certificatesQuery.isLoading || agentsQuery.isLoading || auditsQuery.isLoading || ncsQuery.isLoading,
    error: certificatesQuery.error || agentsQuery.error || auditsQuery.error || ncsQuery.error,
  };
}
