/**
 * Hook for intelligent alerts from vessel_alerts table
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntelligentAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  vessel_id: string;
  vessel_name?: string;
  status: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  metadata?: Record<string, unknown>;
}

// Fetch alerts
export function useIntelligentAlertsData() {
  return useQuery({
    queryKey: ["intelligent-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessel_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch vessel names separately
      const vesselIds = [...new Set((data || []).map(a => a.vessel_id).filter((id): id is string => !!id))];
      const { data: vessels } = vesselIds.length > 0 
        ? await supabase.from("vessels").select("id, name").in("id", vesselIds)
        : { data: [] };
      
      const vesselMap = new Map(vessels?.map(v => [v.id, v.name]) || []);

      return (data || []).map((alert): IntelligentAlert => ({
        id: alert.id,
        type: alert.alert_type || "operational",
        severity: alert.severity || "info",
        title: alert.title || "Alert",
        description: alert.description || alert.message || "",
        vessel_id: alert.vessel_id || "",
        vessel_name: alert.vessel_id ? vesselMap.get(alert.vessel_id) || "Unknown" : "Unknown",
        status: alert.status || "open",
        created_at: alert.created_at,
        acknowledged_at: alert.acknowledged_at ?? undefined,
        acknowledged_by: alert.acknowledged_by ?? undefined,
        resolved_at: alert.resolved_at ?? undefined,
        metadata: alert.metadata as Record<string, unknown>,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Acknowledge alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, userId }: { alertId: string; userId: string }) => {
      const { error } = await supabase
        .from("vessel_alerts")
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userId,
          status: "acknowledged",
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligent-alerts"] });
    },
  });
}

// Dashboard hook with stats
export function useIntelligentAlertsDashboard() {
  const { data: alerts, isLoading, refetch } = useIntelligentAlertsData();
  const acknowledgeMutation = useAcknowledgeAlert();

  const stats = {
    total: alerts?.length ?? 0,
    open: alerts?.filter((a) => a.status === "open").length ?? 0,
    critical: alerts?.filter((a) => a.severity === "critical" || a.severity === "emergency").length ?? 0,
    resolved: alerts?.filter((a) => a.status === "resolved").length ?? 0,
  };

  return {
    alerts: alerts || [],
    stats,
    isLoading,
    refetch,
    acknowledgeAlert: acknowledgeMutation.mutateAsync,
  };
}
