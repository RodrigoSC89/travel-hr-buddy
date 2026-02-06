/**
 * Hook para dados reais de incidentes SGSO
 * Substitui SAMPLE_INCIDENTS do SGSOReportPage
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SGSOIncident {
  date: string;
  description: string;
  sgso_category: string;
  sgso_risk_level: string;
  sgso_root_cause: string;
  action_plan: string;
}

export function useSGSOIncidentsData() {
  return useQuery({
    queryKey: ["sgso-incidents"],
    queryFn: async (): Promise<SGSOIncident[]> => {
      // Fetch from non_conformities table (SGSO incidents are NCs)
      const { data, error } = await supabase
        .from("non_conformities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      return data.map((nc) => ({
        date: nc.created_at
          ? new Date(nc.created_at).toLocaleDateString("pt-BR")
          : "N/A",
        description: nc.description || "Sem descrição",
        sgso_category: nc.category || "Operacional",
        sgso_risk_level: mapSeverityToRisk(nc.severity),
        sgso_root_cause: nc.root_cause || "Causa raiz em análise",
        action_plan: nc.corrective_action || "Plano de ação pendente",
      }));
    },
  });
}

function mapSeverityToRisk(severity: string | null): string {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "Crítico";
    case "major":
    case "high":
      return "Alto";
    case "minor":
    case "medium":
      return "Médio";
    default:
      return "Baixo";
  }
}
