/**
 * Hook for fetching real compliance alerts from Supabase
 * PATCH 904 - Mock Zero compliance for ComplianceAlertHistory
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export interface ComplianceAlertRecord {
  id: string;
  timestamp: Date;
  type: "critical" | "warning" | "info";
  module: "mlc" | "peotram" | "peo-dp" | "sgso" | "pre-ovid" | "geofence";
  title: string;
  message: string;
  vesselId?: string;
  vesselName?: string;
  geofenceName?: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

function mapNotificationToComplianceAlert(notification: {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  metadata: Json | null;
}): ComplianceAlertRecord {
  const meta = notification.metadata as Record<string, unknown> | null;

  // Map priority to type
  const typeMap: Record<string, ComplianceAlertRecord["type"]> = {
    low: "info",
    normal: "info",
    medium: "warning",
    high: "warning",
    urgent: "critical",
    critical: "critical",
  };

  // Map notification type to module
  const moduleMap: Record<string, ComplianceAlertRecord["module"]> = {
    mlc: "mlc",
    peotram: "peotram",
    "peo-dp": "peo-dp",
    sgso: "sgso",
    "pre-ovid": "pre-ovid",
    geofence: "geofence",
    compliance: "mlc",
    training: "peotram",
    document: "peo-dp",
    safety: "sgso",
    inspection: "pre-ovid",
  };

  const acknowledgedAt = meta?.acknowledged_at
    ? new Date(meta.acknowledged_at as string)
    : notification.is_read
    ? new Date(notification.created_at)
    : undefined;

  return {
    id: notification.id,
    timestamp: new Date(notification.created_at),
    type: typeMap[notification.priority?.toLowerCase()] || "info",
    module: moduleMap[notification.type?.toLowerCase()] || "mlc",
    title: notification.title,
    message: notification.message,
    vesselId: typeof meta?.vessel_id === "string" ? meta.vessel_id : undefined,
    vesselName: typeof meta?.vessel_name === "string" ? meta.vessel_name : undefined,
    geofenceName: typeof meta?.geofence_name === "string" ? meta.geofence_name : undefined,
    acknowledged: notification.is_read || !!meta?.acknowledged_by,
    acknowledgedAt,
    acknowledgedBy: typeof meta?.acknowledged_by === "string" ? meta.acknowledged_by : undefined,
  };
}

export function useComplianceAlertsData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: alerts = [], isLoading, error, refetch } = useQuery({
    queryKey: ["compliance-alerts", user?.id],
    queryFn: async (): Promise<ComplianceAlertRecord[]> => {
      // Fetch from intelligent_notifications with compliance-related types
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(mapNotificationToComplianceAlert);
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy: string }) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({
          is_read: true,
          metadata: {
            acknowledged_by: acknowledgedBy,
            acknowledged_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("intelligent_notifications")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
    },
  });

  // Get unique vessels for filters
  const vessels = Array.from(
    new Map(
      alerts
        .filter((a) => a.vesselId && a.vesselName)
        .map((a) => [a.vesselId, { id: a.vesselId!, name: a.vesselName! }])
    ).values()
  );

  // Stats
  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.type === "critical").length,
    warning: alerts.filter((a) => a.type === "warning").length,
    info: alerts.filter((a) => a.type === "info").length,
    acknowledged: alerts.filter((a) => a.acknowledged).length,
    pending: alerts.filter((a) => !a.acknowledged).length,
  };

  return {
    alerts,
    isLoading,
    error: error?.message || null,
    refetch,
    acknowledgeAlert: acknowledgeAlert.mutate,
    deleteAlert: deleteAlert.mutate,
    isAcknowledging: acknowledgeAlert.isPending,
    isDeleting: deleteAlert.isPending,
    vessels,
    stats,
  };
}
