/**
 * Hook para dados reais de Incidentes DP/SGSO
 * Substitui MOCK_INCIDENTS em IncidentsSGSOPanel.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DPIncident {
  id: string;
  title: string;
  date: string;
  category: "equipment" | "operational" | "environmental" | "personnel" | "system";
  riskLevel: "low" | "medium" | "high" | "critical";
  dpClass: "DP1" | "DP2" | "DP3";
  vessel: string;
  description: string;
  rootCause?: string;
  correctiveActions: string[];
  status: "open" | "investigating" | "resolved" | "closed";
  sgsoCategory: string;
  imcaCode?: string;
  reportedBy: string;
}

export function useDPIncidents() {
  return useQuery({
    queryKey: ["dp-incidents-sgso"],
    queryFn: async (): Promise<DPIncident[]> => {
      // Tentar buscar de soc_alerts com filtro para DP
      const { data: alerts, error } = await supabase
        .from("soc_alerts")
        .select(`
          id,
          title,
          message,
          severity,
          alert_type,
          created_at,
          source_module,
          metadata,
          acknowledged_at,
          vessels:vessel_id (name)
        `)
        .or("source_module.ilike.%dp%,source_module.ilike.%sgso%,alert_type.ilike.%incident%")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && alerts && alerts.length > 0) {
        return alerts.map((alert) => {
          const meta = (alert.metadata as Record<string, unknown>) || {};
          return {
            id: alert.id,
            title: alert.title,
            date: alert.created_at,
            category: mapIncidentCategory(alert.alert_type),
            riskLevel: mapRiskLevel(alert.severity),
            dpClass: (meta.dp_class as "DP1" | "DP2" | "DP3") || "DP2",
            vessel: (alert.vessels as { name: string } | null)?.name || "Embarcação",
            description: alert.message || "",
            rootCause: (meta.root_cause as string) || undefined,
            correctiveActions: (meta.corrective_actions as string[]) || [],
            status: alert.acknowledged_at ? "resolved" as const : "open" as const,
            sgsoCategory: (meta.sgso_category as string) || "SGSO-001",
            imcaCode: (meta.imca_code as string) || undefined,
            reportedBy: (meta.reported_by as string) || "Sistema",
          };
        });
      }

      // Fallback: buscar non_conformities
      const { data: ncs } = await supabase
        .from("non_conformities")
        .select(`
          id,
          title,
          description,
          severity,
          status,
          category,
          root_cause,
          corrective_action,
          created_at,
          reported_by,
          vessels:vessel_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(15);

      if (ncs && ncs.length > 0) {
        return ncs.map((nc): DPIncident => ({
          id: nc.id,
          title: nc.title || "Não Conformidade",
          date: nc.created_at || new Date().toISOString(),
          category: mapNCCategory(nc.category),
          riskLevel: mapRiskLevel(nc.severity),
          dpClass: "DP2" as const,
          vessel: (nc.vessels as { name: string } | null)?.name || "Embarcação",
          description: nc.description || "",
          rootCause: nc.root_cause || undefined,
          correctiveActions: nc.corrective_action ? [nc.corrective_action] : [],
          status: mapNCStatus(nc.status),
          sgsoCategory: nc.category || "SGSO-001",
          reportedBy: nc.reported_by || "Sistema",
        }));
      }

      // Demo fallback
      return [
        {
          id: "demo-1",
          title: "Perda momentânea de posição",
          date: new Date().toISOString(),
          category: "system" as const,
          riskLevel: "medium" as const,
          dpClass: "DP2" as const,
          vessel: "Navio Demo",
          description: "Perda momentânea de posição durante operação de ancoragem",
          correctiveActions: ["Verificar sensores de posição", "Recalibrar sistema"],
          status: "investigating" as const,
          sgsoCategory: "SGSO-003",
          imcaCode: "M-182",
          reportedBy: "Oficial de Turno",
        },
      ];
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // Tentar atualizar em soc_alerts
      const { error } = await supabase
        .from("soc_alerts")
        .update({ 
          acknowledged_at: status === "resolved" || status === "closed" ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) {
        // Tentar em non_conformities
        const { error: ncError } = await supabase
          .from("non_conformities")
          .update({ status })
          .eq("id", id);
        
        if (ncError) throw ncError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dp-incidents-sgso"] });
      toast.success("Status do incidente atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });
}

function mapIncidentCategory(type: string | null): DPIncident["category"] {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("equip")) return "equipment";
  if (lower.includes("environ")) return "environmental";
  if (lower.includes("person")) return "personnel";
  if (lower.includes("system")) return "system";
  return "operational";
}

function mapNCCategory(category: string | null): DPIncident["category"] {
  const lower = category?.toLowerCase() || "";
  if (lower.includes("equip")) return "equipment";
  if (lower.includes("environ")) return "environmental";
  if (lower.includes("person") || lower.includes("crew")) return "personnel";
  if (lower.includes("system") || lower.includes("tech")) return "system";
  return "operational";
}

function mapRiskLevel(severity: string | null): DPIncident["riskLevel"] {
  const lower = severity?.toLowerCase() || "";
  if (lower.includes("critical")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium") || lower.includes("moderate")) return "medium";
  return "low";
}

function mapNCStatus(status: string | null): DPIncident["status"] {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("close")) return "closed";
  if (lower.includes("resolv")) return "resolved";
  if (lower.includes("invest") || lower.includes("progress")) return "investigating";
  return "open";
}
