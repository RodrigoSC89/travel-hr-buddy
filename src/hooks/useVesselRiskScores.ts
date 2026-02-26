/**
 * useVesselRiskScores - Calculates composite risk scores per vessel
 * Correlates maintenance, compliance, safety and operational data
 * Stores results in vessel_risk_scores table for dashboard consumption
 */

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { logger } from "@/lib/logger";

export interface VesselRisk {
  vessel_id: string;
  vessel_name: string;
  maintenance_score: number;
  compliance_score: number;
  safety_score: number;
  operational_score: number;
  composite_score: number;
  health_status: "healthy" | "degraded" | "critical";
  top_risks: string[];
}

const WEIGHTS = {
  maintenance: 0.30,
  compliance: 0.30,
  safety: 0.25,
  operational: 0.15,
};

export function useVesselRiskScores() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["vessel-risk-scores"],
    queryFn: async (): Promise<VesselRisk[]> => {
      // Fetch all vessels
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, status");
      if (!vessels || vessels.length === 0) return [];

      // Parallel data fetch
      const [maintRes, certRes, ncRes, incidentRes] = await Promise.all([
        supabase.from("maintenance_tasks")
          .select("vessel_id, status, priority, due_date")
          .in("status", ["pending", "in_progress", "overdue"]),
        supabase.from("crew_certifications")
          .select("crew_member_id, expiry_date")
          .lte("expiry_date", new Date(Date.now() + 90 * 86400000).toISOString())
          .gte("expiry_date", new Date().toISOString()),
        supabase.from("non_conformities")
          .select("vessel_id, severity, status")
          .neq("status", "closed"),
        supabase.from("incidents")
          .select("vessel_id, severity")
          .is("resolved_at", null),
      ]);

      const maintTasks = maintRes.data || [];
      const openNCs = ncRes.data || [];
      const openIncidents = incidentRes.data || [];

      return vessels.map(vessel => {
        const vMaint = maintTasks.filter(m => m.vessel_id === vessel.id);
        const vNCs = openNCs.filter(n => n.vessel_id === vessel.id);
        const vIncidents = openIncidents.filter(i => i.vessel_id === vessel.id);

        // Maintenance Score: 100 - (overdue * 15) - (pending_high * 8) - (pending * 3)
        const overdue = vMaint.filter(m => m.status === "overdue" || (m.due_date && new Date(m.due_date) < new Date()));
        const highPriority = vMaint.filter(m => m.priority === "high" || m.priority === "critical");
        const maintScore = Math.max(0, 100 - (overdue.length * 15) - (highPriority.length * 8) - (vMaint.length * 3));

        // Compliance Score: 100 - (critical_ncs * 20) - (major_ncs * 10) - (minor_ncs * 5)
        const criticalNCs = vNCs.filter(n => n.severity === "critical").length;
        const majorNCs = vNCs.filter(n => n.severity === "major").length;
        const complianceScore = Math.max(0, 100 - (criticalNCs * 20) - (majorNCs * 10) - ((vNCs.length - criticalNCs - majorNCs) * 5));

        // Safety Score: 100 - (critical_incidents * 25) - (incidents * 10)
        const criticalIncidents = vIncidents.filter(i => i.severity === "critical").length;
        const safetyScore = Math.max(0, 100 - (criticalIncidents * 25) - (vIncidents.length * 10));

        // Operational Score: based on vessel status
        const statusScores: Record<string, number> = {
          active: 95, underway: 95, navigating: 95,
          in_port: 85, moored: 85, anchored: 75,
          maintenance: 50, drydock: 40,
          laid_up: 20, decommissioned: 0,
        };
        const operationalScore = statusScores[(vessel.status || "").toLowerCase()] ?? 60;

        // Composite weighted score
        const composite = Math.round(
          maintScore * WEIGHTS.maintenance +
          complianceScore * WEIGHTS.compliance +
          safetyScore * WEIGHTS.safety +
          operationalScore * WEIGHTS.operational
        );

        // Identify top risks
        const topRisks: string[] = [];
        if (overdue.length > 0) topRisks.push(`${overdue.length} manutenção(ões) atrasada(s)`);
        if (criticalNCs > 0) topRisks.push(`${criticalNCs} NC(s) crítica(s)`);
        if (criticalIncidents > 0) topRisks.push(`${criticalIncidents} incidente(s) crítico(s)`);
        if (vMaint.length >= 5) topRisks.push(`Acúmulo de ${vMaint.length} tarefas pendentes`);

        const health: VesselRisk["health_status"] =
          composite >= 75 ? "healthy" : composite >= 50 ? "degraded" : "critical";

        return {
          vessel_id: vessel.id,
          vessel_name: vessel.name || "—",
          maintenance_score: maintScore,
          compliance_score: complianceScore,
          safety_score: safetyScore,
          operational_score: operationalScore,
          composite_score: composite,
          health_status: health,
          top_risks: topRisks,
        };
      }).sort((a, b) => a.composite_score - b.composite_score); // worst first
    },
    staleTime: 1000 * 60 * 5,
  });

  // Persist scores to DB for dashboard widgets and reports
  const persistScores = useMutation({
    mutationFn: async (scores: VesselRisk[]) => {
      const rows = scores.flatMap(s => [
        { vessel_id: s.vessel_id, risk_category: "maintenance", risk_score: s.maintenance_score, risk_factors: { top_risks: s.top_risks }, calculated_at: new Date().toISOString() },
        { vessel_id: s.vessel_id, risk_category: "compliance", risk_score: s.compliance_score, risk_factors: {}, calculated_at: new Date().toISOString() },
        { vessel_id: s.vessel_id, risk_category: "safety", risk_score: s.safety_score, risk_factors: {}, calculated_at: new Date().toISOString() },
        { vessel_id: s.vessel_id, risk_category: "operational", risk_score: s.operational_score, risk_factors: {}, calculated_at: new Date().toISOString() },
      ]);

      // Upsert in batches
      for (let i = 0; i < rows.length; i += 20) {
        const batch = rows.slice(i, i + 20);
        await fromUntyped("vessel_risk_scores").upsert(batch, {
          onConflict: "vessel_id,risk_category",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vessel-risk-scores"] });
    },
  });

  return {
    risks: query.data || [],
    isLoading: query.isLoading,
    criticalVessels: (query.data || []).filter(v => v.health_status === "critical"),
    degradedVessels: (query.data || []).filter(v => v.health_status === "degraded"),
    healthyVessels: (query.data || []).filter(v => v.health_status === "healthy"),
    avgFleetScore: (query.data || []).length > 0
      ? Math.round((query.data || []).reduce((sum, v) => sum + v.composite_score, 0) / (query.data || []).length)
      : 0,
    refetch: query.refetch,
    persistScores: () => query.data && persistScores.mutate(query.data),
    isPersisting: persistScores.isPending,
  };
}
