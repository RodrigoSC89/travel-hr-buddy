/**
 * Hook para Alertas do Sistema - dados reais do Supabase
 * Substitui mockAlerts em AlertsDialog e outros componentes
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  module?: string;
  severity?: string;
  vesselId?: string;
}

function mapAlertType(severity: string | null, level: string | null): SystemAlert["type"] {
  const s = (severity || level || "").toLowerCase();
  if (s.includes("critical") || s.includes("error") || s.includes("high")) return "error";
  if (s.includes("warning") || s.includes("medium")) return "warning";
  if (s.includes("success") || s.includes("resolved")) return "success";
  return "info";
}

export function useSystemAlerts() {
  const queryClient = useQueryClient();
  const [realtimeAlerts, setRealtimeAlerts] = useState<SystemAlert[]>([]);

  const alertsQuery = useQuery({
    queryKey: ["system-alerts"],
    queryFn: async (): Promise<SystemAlert[]> => {
      // Fetch from soc_alerts
      const { data: socAlerts, error: socError } = await supabase
        .from("soc_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      // Fetch from intelligent_notifications if available
      const { data: notifications, error: notifError } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      const alerts: SystemAlert[] = [];

      if (!socError && socAlerts) {
        alerts.push(
          ...socAlerts.map((alert) => ({
            id: alert.id,
            title: alert.title || "Alerta do Sistema",
            message: alert.message || "",
            type: mapAlertType(alert.severity, null),
            timestamp: new Date(alert.created_at),
            isRead: alert.is_acknowledged || false,
            module: alert.source_module || "Sistema",
            severity: alert.severity || undefined,
            vesselId: alert.vessel_id || undefined,
          }))
        );
      }

      if (!notifError && notifications) {
        alerts.push(
          ...notifications.map((notif) => ({
            id: notif.id,
            title: notif.title || "Notificação",
            message: notif.message || "",
            type: mapAlertType(notif.priority, null),
            timestamp: new Date(notif.created_at),
            isRead: notif.is_read || false,
            module: notif.type || "Sistema",
            severity: notif.priority || undefined,
            vesselId: (notif.metadata as any)?.vessel_id || undefined,
          }))
        );
      }

      // Sort by timestamp and remove duplicates
      return alerts
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .filter((alert, index, self) => index === self.findIndex((a) => a.id === alert.id));
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("system-alerts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "soc_alerts" }, (payload) => {
        const newAlert: SystemAlert = {
          id: payload.new.id,
          title: payload.new.title || "Novo Alerta",
          message: payload.new.message || "",
          type: mapAlertType(payload.new.severity, null),
          timestamp: new Date(payload.new.created_at),
          isRead: false,
          module: payload.new.source_module || "Sistema",
          severity: payload.new.severity,
          vesselId: payload.new.vessel_id,
        };
        setRealtimeAlerts((prev) => [newAlert, ...prev].slice(0, 10));
        
        // Show toast for critical alerts
        if (newAlert.type === "error") {
          toast.error(newAlert.title, { description: newAlert.message });
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "intelligent_notifications" }, (payload) => {
        const newNotif: SystemAlert = {
          id: payload.new.id,
          title: payload.new.title || "Nova Notificação",
          message: payload.new.message || "",
          type: mapAlertType(payload.new.priority, null),
          timestamp: new Date(payload.new.created_at),
          isRead: false,
          module: payload.new.module || "Sistema",
        };
        setRealtimeAlerts((prev) => [newNotif, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      // Try soc_alerts first
      const { error: socError } = await supabase
        .from("soc_alerts")
        .update({ is_acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq("id", alertId);

      if (socError) {
        // Try intelligent_notifications
        const { error: notifError } = await supabase
          .from("intelligent_notifications")
          .update({ is_read: true })
          .eq("id", alertId);

        if (notifError) throw notifError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-alerts"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await supabase.from("soc_alerts").update({ is_acknowledged: true }).eq("is_acknowledged", false);
      await supabase.from("intelligent_notifications").update({ is_read: true }).eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-alerts"] });
      toast.success("Todas as notificações marcadas como lidas");
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      // Soft delete via is_acknowledged
      await supabase.from("soc_alerts").update({ is_acknowledged: true }).eq("id", alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-alerts"] });
    },
  });

  // Combine DB alerts with realtime
  const allAlerts = [...realtimeAlerts, ...(alertsQuery.data || [])]
    .filter((alert, index, self) => index === self.findIndex((a) => a.id === alert.id))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = allAlerts.filter((a) => !a.isRead).length;

  return {
    alerts: allAlerts,
    unreadCount,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteAlert: deleteAlert.mutate,
    refetch: alertsQuery.refetch,
  };
}

export function useAlertsByModule(module: string) {
  const { alerts, ...rest } = useSystemAlerts();
  const filteredAlerts = alerts.filter(
    (a) => a.module?.toLowerCase() === module.toLowerCase()
  );
  return { alerts: filteredAlerts, ...rest };
}
