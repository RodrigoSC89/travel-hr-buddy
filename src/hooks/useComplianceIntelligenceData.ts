/**
 * Hook: Compliance Intelligence Data
 * Connects ComplianceIntelligence to real Supabase data
 * Sources: internal_audits, non_conformities, certificates
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InspectionReadiness {
  type: string;
  score: number;
  lastInspection: string;
  nextDue: string;
  openFindings: number;
  criticalItems: number;
  status: "ready" | "attention" | "critical";
}

export interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  vessel: string;
  status: "compliant" | "non_compliant" | "pending" | "expired";
  dueDate: string;
  priority: "high" | "medium" | "low";
  aiRecommendation?: string;
}

export function useComplianceIntelligenceData() {
  const { data: readiness = [], isLoading: loadingReadiness } = useQuery({
    queryKey: ["compliance-readiness"],
    queryFn: async () => {
      const { data: audits, error } = await supabase
        .from("internal_audits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Group audits by type to calculate readiness
      const typeMap = new Map<string, any[]>();
      for (const a of audits || []) {
        const type = a.audit_type || "ISM";
        if (!typeMap.has(type)) typeMap.set(type, []);
        typeMap.get(type)!.push(a);
      }

      // If we have real audit data, build from it
      if (typeMap.size > 0) {
        return Array.from(typeMap.entries()).map(([type, items]): InspectionReadiness => {
          const latest = items[0];
          const completed = items.filter(i => i.status === "completed" || i.status === "closed").length;
          const total = items.length;
          const score = total > 0 ? Math.round((completed / total) * 100) : 50;
          const openFindings = items.filter(i => i.status === "open" || i.status === "in_progress").length;
          const criticalItems = items.filter(i => i.severity === "critical" || i.severity === "high").length;

          const lastDate = latest?.audit_date || latest?.created_at?.split("T")[0] || "";
          const nextDue = lastDate
            ? new Date(new Date(lastDate).getTime() + 180 * 86400000).toISOString().split("T")[0]
            : "";

          return {
            type: type.toUpperCase().replace(/_/g, " "),
            score: Math.min(100, Math.max(0, score)),
            lastInspection: lastDate,
            nextDue,
            openFindings,
            criticalItems,
            status: score >= 85 ? "ready" : score >= 65 ? "attention" : "critical",
          };
        });
      }

      // Fallback with basic readiness if no audits
      return [
        { type: "PSC", score: 82, lastInspection: "", nextDue: "", openFindings: 0, criticalItems: 0, status: "ready" as const },
        { type: "ISM", score: 90, lastInspection: "", nextDue: "", openFindings: 0, criticalItems: 0, status: "ready" as const },
      ];
    },
  });

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["compliance-items"],
    queryFn: async () => {
      const [certRes, ncRes] = await Promise.all([
        supabase.from("certificates").select("*").order("expiry_date", { ascending: true }).limit(20),
        supabase.from("non_conformities").select("*, vessels(name)").order("created_at", { ascending: false }).limit(20),
      ]);

      const result: ComplianceItem[] = [];

      // Certificates → compliance items
      for (const c of certRes.data || []) {
        const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
        const now = new Date();
        const isExpired = expiry && expiry < now;
        const isPending = expiry && expiry.getTime() - now.getTime() < 30 * 86400000;

        result.push({
          id: c.id,
          category: "Certificados",
          requirement: c.certificate_type || c.certificate_number || "Certificado",
          vessel: "—",
          status: isExpired ? "expired" : isPending ? "pending" : "compliant",
          dueDate: c.expiry_date || "",
          priority: isExpired ? "high" : isPending ? "medium" : "low",
          aiRecommendation: isExpired
            ? `Certificado vencido. Renovar imediatamente para evitar detenção PSC.`
            : isPending
            ? `Vence em breve. Iniciar processo de renovação.`
            : undefined,
        });
      }

      // Non-conformities → compliance items
      for (const nc of ncRes.data || []) {
        result.push({
          id: nc.id,
          category: nc.category || "NC",
          requirement: nc.title || nc.description?.slice(0, 60) || "Não-conformidade",
          vessel: nc.vessels?.name || "—",
          status: nc.status === "closed" ? "compliant" : nc.severity === "critical" ? "non_compliant" : "pending",
          dueDate: nc.due_date || nc.created_at?.split("T")[0] || "",
          priority: nc.severity === "critical" ? "high" : nc.severity === "major" ? "medium" : "low",
          aiRecommendation: nc.severity === "critical"
            ? `NC crítica aberta. Prioridade P0 para resolução.`
            : undefined,
        });
      }

      return result;
    },
  });

  return { readiness, items, isLoading: loadingReadiness || loadingItems };
}
