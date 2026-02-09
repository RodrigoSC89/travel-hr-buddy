/**
 * Crew Wellbeing Score Hook - Burnout prediction & MLC compliance
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WellbeingScore {
  id: string;
  crew_member_id: string;
  crew_name?: string;
  crew_rank?: string;
  vessel_name?: string;
  overall_score: number;
  rest_hours_score: number;
  time_onboard_score: number;
  medical_score: number;
  performance_score: number;
  fatigue_risk_level: "low" | "moderate" | "high" | "critical";
  burnout_prediction_days?: number;
  recommendations: string[];
  calculated_at: string;
}

export function useCrewWellbeing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scores = useQuery({
    queryKey: ["crew-wellbeing"],
    queryFn: async (): Promise<WellbeingScore[]> => {
      const { data: crew, error: crewError } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, vessel_id, status, contract_start")
        .eq("status", "active");
      if (crewError) throw crewError;

      const { data: vessels } = await supabase.from("vessels").select("id, name");

      const { data: existingScores } = await supabase
        .from("crew_wellbeing_scores")
        .select("*")
        .order("calculated_at", { ascending: false });

      // Build scores: use existing or calculate
      type CrewRow = typeof crew extends (infer R)[] | null ? R : never;
      return (crew || []).map((c: CrewRow) => {
        const existing = (existingScores || []).find((s) => s.crew_member_id === c.id);
        const vessel = (vessels || []).find((v) => v.id === c.vessel_id);

        // Calculate time onboard using contract_start
        const daysOnboard = c.contract_start
          ? Math.floor((Date.now() - new Date(c.contract_start).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const timeOnboardScore = daysOnboard > 180 ? 30 : daysOnboard > 120 ? 50 : daysOnboard > 90 ? 70 : 90;

        if (existing) {
          return {
            id: existing.id,
            crew_member_id: c.id,
            crew_name: c.full_name,
            crew_rank: c.rank,
            vessel_name: vessel?.name,
            overall_score: existing.overall_score ?? 0,
            rest_hours_score: existing.rest_hours_score ?? 0,
            time_onboard_score: timeOnboardScore,
            medical_score: existing.medical_score ?? 0,
            performance_score: existing.performance_score ?? 0,
            fatigue_risk_level: (existing.fatigue_risk_level as WellbeingScore["fatigue_risk_level"]) || "low",
            burnout_prediction_days: existing.burnout_prediction_days ?? undefined,
            recommendations: existing.recommendations || [],
            calculated_at: existing.calculated_at,
          } as WellbeingScore;
        }

        // Derive deterministic baseline scores from crew data
        // Rest score: based on days onboard (less days = better rest)
        const restScore = daysOnboard > 150 ? 60 : daysOnboard > 90 ? 75 : 85;
        // Medical score: default healthy baseline
        const medicalScore = 80;
        // Performance score: based on rank seniority
        const rankScore: Record<string, number> = { "Master": 92, "Chief Officer": 88, "Chief Engineer": 88, "2nd Officer": 82, "2nd Engineer": 82 };
        const perfScore = rankScore[c.rank || ""] || 78;
        const overall = Math.round((restScore + timeOnboardScore + medicalScore + perfScore) / 4);
        const fatigue: WellbeingScore["fatigue_risk_level"] = overall >= 80 ? "low" : overall >= 65 ? "moderate" : overall >= 50 ? "high" : "critical";
        const burnoutDays = fatigue === "critical" ? Math.max(5, 180 - daysOnboard) : fatigue === "high" ? Math.max(20, 270 - daysOnboard) : undefined;

        const recommendations: string[] = [];
        if (timeOnboardScore < 60) recommendations.push("Agendar rotação de tripulação - tempo a bordo prolongado");
        if (restScore < 70) recommendations.push("Revisar escalas de descanso conforme MLC 2006");
        if (fatigue === "high" || fatigue === "critical") recommendations.push("Alerta de fadiga: avaliação médica recomendada");

        return {
          id: crypto.randomUUID(),
          crew_member_id: c.id,
          crew_name: c.full_name,
          crew_rank: c.rank || undefined,
          vessel_name: vessel?.name,
          overall_score: overall,
          rest_hours_score: restScore,
          time_onboard_score: timeOnboardScore,
          medical_score: medicalScore,
          performance_score: perfScore,
          fatigue_risk_level: fatigue,
          burnout_prediction_days: burnoutDays,
          recommendations,
          calculated_at: new Date().toISOString(),
        };
      });
    },
    refetchInterval: 60000,
  });

  const saveScores = useMutation({
    mutationFn: async () => {
      if (!scores.data?.length) return;
      const records = scores.data.map(s => ({
        crew_member_id: s.crew_member_id,
        overall_score: s.overall_score,
        rest_hours_score: s.rest_hours_score,
        time_onboard_score: s.time_onboard_score,
        medical_score: s.medical_score,
        performance_score: s.performance_score,
        fatigue_risk_level: s.fatigue_risk_level,
        burnout_prediction_days: s.burnout_prediction_days,
        recommendations: s.recommendations,
        calculated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("crew_wellbeing_scores").upsert(records, { onConflict: "crew_member_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-wellbeing"] });
      toast({ title: "Scores de wellbeing salvos" });
    },
  });

  const atRiskCrew = scores.data?.filter(s => s.fatigue_risk_level === "high" || s.fatigue_risk_level === "critical") || [];

  return {
    scores: scores.data || [],
    isLoading: scores.isLoading,
    atRiskCrew,
    saveScores,
    refetch: scores.refetch,
    stats: {
      total: scores.data?.length || 0,
      avgScore: scores.data?.length ? Math.round(scores.data.reduce((s, v) => s + v.overall_score, 0) / scores.data.length) : 0,
      critical: atRiskCrew.filter(s => s.fatigue_risk_level === "critical").length,
      high: atRiskCrew.filter(s => s.fatigue_risk_level === "high").length,
    },
  };
}
