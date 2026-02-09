/**
 * Hook para dados reais do NotificationsCenter
 * Substitui MOCK_NOTIFICATIONS em NotificationsCenter.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  category: "system" | "vessel" | "crew" | "maintenance" | "compliance";
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export function useNotificationsCenterData() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications-center"],
    queryFn: async () => {
      // Fetch from intelligent_notifications
      const { data: intelligentNotifs, error: error1 } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error1) throw error1;

      // Fetch from soc_alerts
      const { data: socAlerts, error: error2 } = await supabase
        .from("soc_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error2) throw error2;

      // Map intelligent_notifications
      type NotifRow = Record<string, unknown>;
      const fromNotifs: Notification[] = (intelligentNotifs || []).map((n: NotifRow) => ({
        id: n.id as string,
        title: (n.title as string) || "Notificação",
        message: (n.message as string) || (n.content as string) || "",
        type: mapPriorityToType(n.priority as string),
        category: mapChannelToCategory(n.channel as string),
        read: n.read_at !== null,
        timestamp: n.created_at as string,
        actionUrl: (n.action_url as string) || undefined,
      }));

      // Map soc_alerts
      type AlertRow = Record<string, unknown>;
      const fromAlerts: Notification[] = (socAlerts || []).map((a: AlertRow) => ({
        id: a.id as string,
        title: (a.title as string) || "Alerta",
        message: (a.message as string) || (a.description as string) || "",
        type: mapSeverityToType(a.severity as string),
        category: mapAlertTypeToCategory(a.alert_type as string),
        read: a.is_resolved === true,
        timestamp: a.created_at as string,
        actionUrl: undefined,
      }));

      return [...fromNotifs, ...fromAlerts].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      // Try intelligent_notifications first - update status field
      const { error: error1 } = await (supabase.from as Function)("intelligent_notifications")
        .update({ status: "read" })
        .eq("id", id);

      // Try soc_alerts - update acknowledged fields
      const { error: error2 } = await (supabase.from as Function)("soc_alerts")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("id", id);

      if (error1 && error2) throw error1;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await (supabase.from as Function)("intelligent_notifications")
        .update({ status: "read" })
        .eq("user_id", user.id)
        .neq("status", "read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      // Try both tables
      await supabase.from("intelligent_notifications").delete().eq("id", id);
      await supabase.from("soc_alerts").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "intelligent_notifications" },
        () => refetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "soc_alerts" },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    notifications,
    isLoading,
    refetch,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: string) => deleteNotificationMutation.mutate(id),
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}

function mapPriorityToType(priority: string): Notification["type"] {
  switch (priority) {
    case "critical":
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "info";
  }
}

function mapChannelToCategory(channel: string): Notification["category"] {
  switch (channel) {
    case "vessel":
    case "fleet":
      return "vessel";
    case "crew":
    case "hr":
      return "crew";
    case "maintenance":
      return "maintenance";
    case "compliance":
    case "audit":
      return "compliance";
    default:
      return "system";
  }
}

function mapSeverityToType(severity: string): Notification["type"] {
  switch (severity) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "warning";
    case "low":
    case "info":
      return "info";
    default:
      return "info";
  }
}

function mapAlertTypeToCategory(alertType: string): Notification["category"] {
  if (alertType?.includes("vessel") || alertType?.includes("fleet")) return "vessel";
  if (alertType?.includes("crew") || alertType?.includes("hr")) return "crew";
  if (alertType?.includes("maintenance")) return "maintenance";
  if (alertType?.includes("compliance") || alertType?.includes("audit")) return "compliance";
  return "system";
}
