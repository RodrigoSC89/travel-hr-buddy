/**
 * useCrossModuleCorrelation - Correlates events across modules for pattern detection
 * Identifies cascading risks: e.g., expired cert + overdue maintenance + voyage departure
 */

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface CorrelatedRisk {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  modules: string[];
  factors: RiskFactor[];
  suggestedAction: string;
  impactScore: number; // 0-100
}

interface RiskFactor {
  module: string;
  issue: string;
  weight: number;
}

export function useCrossModuleCorrelation(enabled = true) {
  const query = useQuery({
    queryKey: ["cross-module-correlation"],
    queryFn: async (): Promise<CorrelatedRisk[]> => {
      const risks: CorrelatedRisk[] = [];

      try {
        // Parallel data fetch for correlation
        const [vesselRes, certRes, maintRes, voyageRes, ncRes] = await Promise.all([
          supabase.from("vessels").select("id, name, status"),
          supabase.from("crew_certifications").select("id, certification_name, expiry_date, crew_member_id").lte("expiry_date", new Date(Date.now() + 30 * 86400000).toISOString()).gte("expiry_date", new Date().toISOString()),
          supabase.from("maintenance_tasks").select("id, title, vessel_id, priority, status, due_date").in("status", ["pending", "overdue"]).order("due_date"),
          supabase.from("missions").select("id, mission_name, vessel_id, status, start_date").in("status", ["planned", "in_progress"]),
          supabase.from("non_conformities").select("id, vessel_id, severity, status").neq("status", "closed"),
        ]);

        const vessels = vesselRes.data || [];
        const expiringCerts = certRes.data || [];
        const pendingMaint = maintRes.data || [];
        const activeVoyages = voyageRes.data || [];
        const openNCs = ncRes.data || [];

        // Pattern 1: Vessel with expired certs + active voyage = CRITICAL
        for (const voyage of activeVoyages) {
          if (!voyage.vessel_id) continue;
          const vessel = vessels.find(v => v.id === voyage.vessel_id);
          const vesselCerts = expiringCerts.filter(c => c.crew_member_id); // crew on vessel
          const vesselMaint = pendingMaint.filter(m => m.vessel_id === voyage.vessel_id);
          const vesselNCs = openNCs.filter(n => n.vessel_id === voyage.vessel_id);

          const factors: RiskFactor[] = [];
          if (vesselCerts.length > 0) factors.push({ module: "Compliance", issue: `${vesselCerts.length} certificado(s) expirando`, weight: 35 });
          if (vesselMaint.length > 0) factors.push({ module: "Manutenção", issue: `${vesselMaint.length} tarefa(s) pendente(s)`, weight: 25 });
          if (vesselNCs.length > 0) factors.push({ module: "QHSE", issue: `${vesselNCs.length} NC(s) aberta(s)`, weight: 20 });

          if (factors.length >= 2) {
            const impact = factors.reduce((sum, f) => sum + f.weight, 0);
            risks.push({
              id: `corr-${voyage.vessel_id}-${Date.now()}`,
              severity: impact >= 60 ? "critical" : impact >= 40 ? "high" : "medium",
              title: `Risco cascata: ${vessel?.name || "Embarcação"}`,
              description: `Embarcação em viagem ativa com ${factors.length} riscos correlacionados`,
              modules: [...new Set(factors.map(f => f.module))],
              factors,
              suggestedAction: impact >= 60 
                ? "Revisão imediata recomendada antes de próxima escala"
                : "Monitorar e priorizar resolução dos itens pendentes",
              impactScore: Math.min(impact, 100),
            });
          }
        }

        // Pattern 2: Cluster of overdue maintenance on same vessel
        const maintByVessel = new Map<string, typeof pendingMaint>();
        for (const m of pendingMaint) {
          if (!m.vessel_id) continue;
          const arr = maintByVessel.get(m.vessel_id) || [];
          arr.push(m);
          maintByVessel.set(m.vessel_id, arr);
        }

        for (const [vesselId, tasks] of maintByVessel) {
          const overdue = tasks.filter(t => t.status === "overdue" || (t.due_date && new Date(t.due_date) < new Date()));
          if (overdue.length >= 3) {
            const vessel = vessels.find(v => v.id === vesselId);
            risks.push({
              id: `maint-cluster-${vesselId}`,
              severity: overdue.length >= 5 ? "critical" : "high",
              title: `Acúmulo de manutenção: ${vessel?.name || vesselId}`,
              description: `${overdue.length} manutenções atrasadas — risco de indisponibilidade`,
              modules: ["Manutenção", "Operações"],
              factors: [
                { module: "Manutenção", issue: `${overdue.length} tarefas atrasadas`, weight: 40 },
                { module: "Operações", issue: "Risco de parada não programada", weight: 30 },
              ],
              suggestedAction: "Avaliar priorização e considerar parada programada para manutenção concentrada",
              impactScore: Math.min(overdue.length * 15, 100),
            });
          }
        }

        // Sort by impact
        risks.sort((a, b) => b.impactScore - a.impactScore);
        return risks.slice(0, 15);
      } catch (err) {
        logger.warn("[CrossModuleCorrelation] Analysis failed", { error: String(err) });
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  return {
    risks: query.data || [],
    isAnalyzing: query.isLoading,
    criticalRisks: (query.data || []).filter(r => r.severity === "critical"),
    highRisks: (query.data || []).filter(r => r.severity === "high"),
    refetch: query.refetch,
  };
}
