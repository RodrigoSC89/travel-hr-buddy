/**
 * Hook para dados reais de Certificações Marítimas
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Certification {
  id: string;
  name: string;
  type: "STCW" | "Medical" | "Security" | "Safety" | "Technical";
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: "valid" | "expiring" | "expired" | "pending";
  crewMember: {
    name: string;
    rank: string;
    vessel: string;
  };
  documentUrl?: string;
  renewalCost: number;
  mandatoryFor: string[];
}

export interface ComplianceMetric {
  category: string;
  compliance: number;
  total: number;
  critical: number;
}

export function useCertifications() {
  return useQuery({
    queryKey: ["maritime-certifications"],
    queryFn: async (): Promise<Certification[]> => {
      const { data, error } = await supabase
        .from("maritime_certificates")
        .select(`
          *,
          crew_members (
            full_name,
            rank
          )
        `)
        .order("expiry_date", { ascending: true })
        .limit(100);

      if (error) throw error;

      return (data || []).map((row) => {
        const expiryDate = new Date(row.expiry_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: Certification["status"] = "valid";
        if (row.status === "pending") status = "pending";
        else if (daysUntilExpiry < 0) status = "expired";
        else if (daysUntilExpiry <= 90) status = "expiring";

        // Type guard for crew_members
        const crewMember = row.crew_members as { full_name?: string; rank?: string } | null;

        return {
          id: row.id,
          name: row.certificate_number || "Certificado Marítimo",
          type: mapCertificateType(row.notes),
          issuingAuthority: row.issuing_authority || "Autoridade Marítima",
          issueDate: new Date(row.issue_date),
          expiryDate,
          status,
          crewMember: {
            name: crewMember?.full_name || "N/A",
            rank: crewMember?.rank || "N/A",
            vessel: "N/A",
          },
          documentUrl: row.document_url || undefined,
          renewalCost: Number(row.renewal_cost) || 0,
          mandatoryFor: [],
        };
      });
    },
  });
}

export function useComplianceMetrics() {
  return useQuery({
    queryKey: ["certification-compliance-metrics"],
    queryFn: async (): Promise<ComplianceMetric[]> => {
      const { data, error } = await supabase
        .from("maritime_certificates")
        .select("notes, expiry_date, status");

      if (error) throw error;

      const categories = ["STCW", "Medical", "Security", "Safety", "Technical"];
      const now = new Date();

      return categories.map((category) => {
        const categoryItems = (data || []).filter(
          (cert) => mapCertificateType(cert.notes) === category
        );
        
        const total = categoryItems.length;
        const critical = categoryItems.filter((cert) => {
          const expiry = new Date(cert.expiry_date);
          return expiry < now || cert.status === "expired";
        }).length;
        
        const compliance = total > 0 ? Math.round(((total - critical) / total) * 100) : 100;

        return { category, compliance, total, critical };
      });
    },
  });
}

function mapCertificateType(notes: string | null): Certification["type"] {
  if (!notes) return "Technical";
  const t = notes.toLowerCase();
  if (t.includes("stcw") || t.includes("basic safety")) return "STCW";
  if (t.includes("medical") || t.includes("health")) return "Medical";
  if (t.includes("security") || t.includes("isps")) return "Security";
  if (t.includes("safety") || t.includes("solas")) return "Safety";
  return "Technical";
}
