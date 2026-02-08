/**
 * React Query hook for Tracking & Telemetry Intelligence
 * Bridges TrackingIntelligenceService to world-class UI components
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackingIntelligence, type TrackingDashboardData } from "@/services/tracking/tracking-intelligence.service";
import { toast } from "sonner";

export function useTrackingDashboard() {
  return useQuery<TrackingDashboardData>({
    queryKey: ["tracking-dashboard"],
    queryFn: () => trackingIntelligence.getDashboardData(),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 min for near real-time
  });
}

export function useTrackingAIAnalysis() {
  return useMutation({
    mutationFn: () => trackingIntelligence.runAIAnalysis(),
    onSuccess: (data) => {
      if (data) {
        toast.success("Análise AI de tracking concluída");
      } else {
        toast.info("Análise AI retornou sem resultados");
      }
    },
    onError: () => toast.error("Erro ao executar análise AI de tracking"),
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, table }: { alertId: string; table: "iot_sensor_alerts" | "telemetry_alerts" }) =>
      trackingIntelligence.acknowledgeAlert(alertId, table),
    onSuccess: () => {
      toast.success("Alerta reconhecido");
      queryClient.invalidateQueries({ queryKey: ["tracking-dashboard"] });
    },
    onError: () => toast.error("Erro ao reconhecer alerta"),
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, table }: { alertId: string; table: "iot_sensor_alerts" | "telemetry_alerts" }) =>
      trackingIntelligence.resolveAlert(alertId, table),
    onSuccess: () => {
      toast.success("Alerta resolvido");
      queryClient.invalidateQueries({ queryKey: ["tracking-dashboard"] });
    },
    onError: () => toast.error("Erro ao resolver alerta"),
  });
}

export function useTrackingStats() {
  const dashboardQuery = useTrackingDashboard();
  const data = dashboardQuery.data;

  return {
    positions: data?.positions || [],
    sensors: data?.sensors || [],
    iotAlerts: data?.iotAlerts || [],
    telemetryAlerts: data?.telemetryAlerts || [],
    insights: data?.insights || [],
    stats: data?.stats || {
      totalVessels: 0,
      trackedVessels: 0,
      totalSensors: 0,
      activeSensors: 0,
      criticalAlerts: 0,
      pendingInsights: 0,
    },
    isLoading: dashboardQuery.isLoading,
    refetch: () => dashboardQuery.refetch(),
  };
}
