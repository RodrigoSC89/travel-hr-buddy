/**
 * Hook: SGSO Incidents - Real data from incidents/non_conformities tables
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

export function useSGSOIncidents(vesselName?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sgso-incidents", vesselName],
    queryFn: async (): Promise<{ incidents: SGSOIncident[]; vessel: string }> => {
      // Try to get real incidents from non_conformities or incidents tables
      const { data: ncs, error: ncErr } = await supabase
        .from("non_conformities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (ncErr) throw ncErr;

      // Get vessel name for the report
      const { data: vessels } = await supabase
        .from("vessels")
        .select("name")
        .limit(1)
        .single();

      const vName = vesselName || vessels?.name || "FPSO Nautilus One";

      if (ncs && ncs.length > 0) {
        return {
          vessel: vName,
          incidents: ncs.map(nc => ({
            date: nc.created_at ? new Date(nc.created_at).toLocaleDateString("pt-BR") : "N/A",
            description: nc.description || "Não-conformidade detectada",
            sgso_category: nc.category || "Operacional",
            sgso_risk_level: mapRiskLevel(nc.severity || nc.priority),
            sgso_root_cause: nc.root_cause || "Análise de causa raiz pendente",
            action_plan: nc.corrective_action || "Plano de ação em elaboração",
          })),
        };
      }

      // If no NCs, return empty state
      return { vessel: vName, incidents: [] };
    },
  });

  return {
    incidents: data?.incidents || [],
    vesselName: data?.vessel || vesselName || "N/A",
    isLoading,
    error,
    refetch,
  };
}

function mapRiskLevel(severity: string | null): string {
  switch (severity?.toLowerCase()) {
    case "critical": case "high": return "Crítico";
    case "major": return "Alto";
    case "minor": case "medium": return "Médio";
    case "low": case "observation": return "Baixo";
    default: return "Médio";
  }
}
