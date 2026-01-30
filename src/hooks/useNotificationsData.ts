/**
 * Hook para dados reais de Notificações do Sistema
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  createdAt: Date;
  source: string;
  link?: string;
  actionRequired?: boolean;
}

function mapNotificationType(severity: string | null): SystemNotification["type"] {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "error":
    case "high":
      return "error";
    case "warning":
    case "medium":
      return "warning";
    case "success":
    case "resolved":
      return "success";
    default:
      return "info";
  }
}

function mapPriority(severity: string | null): SystemNotification["priority"] {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
    case "error":
      return "high";
    case "medium":
    case "warning":
      return "medium";
    default:
      return "low";
  }
}

export function useNotificationsData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [realtimeNotifications, setRealtimeNotifications] = useState<SystemNotification[]>([]);

  // Fetch notifications from multiple sources
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["system-notifications", user?.id],
    queryFn: async (): Promise<SystemNotification[]> => {
      const allNotifications: SystemNotification[] = [];

      // Fetch from intelligent_notifications
      const { data: intNotifs } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      (intNotifs || []).forEach(n => {
        allNotifications.push({
          id: n.id,
          title: n.title || "Notificação",
          message: n.message || "",
          type: mapNotificationType(n.priority),
          priority: mapPriority(n.priority),
          read: n.is_read || false,
          createdAt: new Date(n.created_at),
          source: n.type || "Sistema",
          link: (n.action_data as any)?.url || undefined,
          actionRequired: n.action_type === "required" || false,
        });
      });

      // Fetch from soc_alerts (unacknowledged)
      const { data: alerts } = await supabase
        .from("soc_alerts")
        .select("*")
        .is("acknowledged_at", null)
        .order("created_at", { ascending: false })
        .limit(30);

      (alerts || []).forEach(a => {
        allNotifications.push({
          id: a.id,
          title: a.title || "Alerta",
          message: a.message || "",
          type: mapNotificationType(a.severity),
          priority: mapPriority(a.severity),
          read: false,
          createdAt: new Date(a.created_at),
          source: a.source_module || "SOC",
          actionRequired: a.severity === "critical" || a.severity === "high",
        });
      });

      // Sort by date
      return allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "intelligent_notifications" },
        (payload) => {
          const newNotif: SystemNotification = {
            id: payload.new.id,
            title: payload.new.title || "Nova Notificação",
            message: payload.new.message || "",
            type: mapNotificationType(payload.new.priority),
            priority: mapPriority(payload.new.priority),
            read: false,
            createdAt: new Date(),
            source: payload.new.source_module || "Sistema",
            actionRequired: payload.new.action_required || false,
          };
          setRealtimeNotifications(prev => [newNotif, ...prev].slice(0, 10));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "soc_alerts" },
        (payload) => {
          const newAlert: SystemNotification = {
            id: payload.new.id,
            title: payload.new.title || "Novo Alerta",
            message: payload.new.message || "",
            type: mapNotificationType(payload.new.severity),
            priority: mapPriority(payload.new.severity),
            read: false,
            createdAt: new Date(),
            source: payload.new.source_module || "SOC",
            actionRequired: true,
          };
          setRealtimeNotifications(prev => [newAlert, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // Try intelligent_notifications first
      const { error: intError } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (intError) {
        // Try soc_alerts
        const { error: alertError } = await supabase
          .from("soc_alerts")
          .update({ 
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user?.id 
          })
          .eq("id", notificationId);

        if (alertError) throw alertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await supabase
        .from("intelligent_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("is_read", false);

      await supabase
        .from("soc_alerts")
        .update({ 
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id 
        })
        .is("acknowledged_at", null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      setRealtimeNotifications([]);
    },
  });

  // Combine realtime with fetched
  const combinedNotifications = [...realtimeNotifications, ...notifications]
    .filter((n, index, self) => index === self.findIndex(m => m.id === n.id))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Stats
  const stats = {
    total: combinedNotifications.length,
    unread: combinedNotifications.filter(n => !n.read).length,
    critical: combinedNotifications.filter(n => n.priority === "critical" && !n.read).length,
    actionRequired: combinedNotifications.filter(n => n.actionRequired && !n.read).length,
  };

  return {
    notifications: combinedNotifications,
    stats,
    isLoading,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
  };
}
