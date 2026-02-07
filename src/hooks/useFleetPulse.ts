/**
 * Fleet Pulse Hook - Real-time fleet overview with health scores
 * Aggregates: vessel status, maintenance, compliance, crew, next events
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FleetPulseVessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type?: string;
  flag?: string;
  status: string;
  healthScore: number;
  maintenanceScore: number;
  complianceScore: number;
  crewScore: number;
  safetyScore: number;
  currentActivity: string;
  riskLevel: string;
  nextEvent?: { type: string; date: string; description: string };
  alerts: Array<{ type: string; message: string; severity: string }>;
  crewCount: number;
  pendingTasks: number;
}

export function useFleetPulse() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["fleet-pulse"],
    queryFn: async (): Promise<FleetPulseVessel[]> => {
      // Fetch vessels
      const { data: vessels, error: vError } = await supabase
        .from("vessels")
        .select("*")
        .order("name");
      if (vError) throw vError;

      // Fetch health scores
      const { data: healthScores } = await supabase
        .from("fleet_health_scores")
        .select("*");

      // Fetch crew counts per vessel
      const { data: crewMembers } = await supabase
        .from("crew_members")
        .select("id, vessel_id, status");

      // Fetch pending maintenance
      const { data: maintenanceTasks } = await supabase
        .from("maintenance_tasks")
        .select("id, vessel_id, status")
        .neq("status", "completed");

      // Map vessels with enriched data
      return (vessels || []).map((v: any) => {
        const health = (healthScores || []).find((h: any) => h.vessel_id === v.id);
        const vesselCrew = (crewMembers || []).filter((c: any) => c.vessel_id === v.id && c.status === "active");
        const vesselTasks = (maintenanceTasks || []).filter((t: any) => t.vessel_id === v.id);

        const maintenanceScore = health?.maintenance_score ?? (vesselTasks.length === 0 ? 95 : Math.max(50, 95 - vesselTasks.length * 5));
        const complianceScore = health?.compliance_score ?? 90;
        const crewScore = health?.crew_score ?? (vesselCrew.length > 0 ? 85 : 60);
        const safetyScore = health?.safety_score ?? 88;
        const overall = health?.overall_score ?? Math.round((maintenanceScore + complianceScore + crewScore + safetyScore) / 4);

        const riskLevel = overall >= 85 ? "low" : overall >= 70 ? "moderate" : overall >= 50 ? "high" : "critical";

        const alerts: any[] = [];
        if (maintenanceScore < 70) alerts.push({ type: "maintenance", message: `${vesselTasks.length} tarefas pendentes`, severity: "warning" });
        if (complianceScore < 75) alerts.push({ type: "compliance", message: "Compliance abaixo do limite", severity: "error" });
        if (crewScore < 70) alerts.push({ type: "crew", message: "Score de tripulação baixo", severity: "warning" });

        return {
          id: v.id,
          name: v.name,
          imo_number: v.imo_number,
          vessel_type: v.vessel_type,
          flag: v.flag,
          status: v.status || "unknown",
          healthScore: overall,
          maintenanceScore,
          complianceScore,
          crewScore,
          safetyScore,
          currentActivity: health?.current_activity || (v.status === "active" ? "Navegando" : v.status === "maintenance" ? "Em Manutenção" : "Em Porto"),
          riskLevel,
          nextEvent: health?.next_event_type && health?.next_event_date ? {
            type: health.next_event_type,
            date: health.next_event_date as string,
            description: health.next_event_description || ""
          } : undefined,
          alerts,
          crewCount: vesselCrew.length,
          pendingTasks: vesselTasks.length,
        };
      });
    },
    refetchInterval: 30000,
  });

  const recalculateHealth = useMutation({
    mutationFn: async (vesselId: string) => {
      const vessel = query.data?.find(v => v.id === vesselId);
      if (!vessel) return;

      const { error } = await supabase.from("fleet_health_scores").upsert({
        vessel_id: vesselId,
        overall_score: vessel.healthScore,
        maintenance_score: vessel.maintenanceScore,
        compliance_score: vessel.complianceScore,
        crew_score: vessel.crewScore,
        safety_score: vessel.safetyScore,
        current_activity: vessel.currentActivity,
        risk_level: vessel.riskLevel,
        alerts: vessel.alerts,
        calculated_at: new Date().toISOString(),
      }, { onConflict: "vessel_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-pulse"] });
      toast({ title: "Health score recalculado" });
    },
  });

  return {
    vessels: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    recalculateHealth,
    stats: {
      total: query.data?.length || 0,
      active: query.data?.filter(v => v.status === "active" || v.status === "operational").length || 0,
      atRisk: query.data?.filter(v => v.riskLevel === "high" || v.riskLevel === "critical").length || 0,
      avgHealth: query.data?.length ? Math.round((query.data.reduce((s, v) => s + v.healthScore, 0)) / query.data.length) : 0,
    },
  };
}
