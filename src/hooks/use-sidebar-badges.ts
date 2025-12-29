/**
 * Hook for dynamic sidebar badges with Supabase realtime
 * Connects to notifications, maritime_alerts, and task_assignments tables
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SidebarBadges {
  alerts: number;
  notifications: number;
  tasks: number;
}

export function useSidebarBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<SidebarBadges>({
    alerts: 0,
    notifications: 0,
    tasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch counts from Supabase
  const fetchCounts = useCallback(async () => {
    if (!user?.id) {
      setBadges({ alerts: 0, notifications: 0, tasks: 0 });
      setIsLoading(false);
      return;
    }

    try {
      // Fetch unread notifications count
      const { count: notificationsCount } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      // Fetch unacknowledged maritime alerts count
      const { count: alertsCount } = await supabase
        .from("maritime_alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_acknowledged", false)
        .in("status", ["active", "pending"]);

      // Fetch pending tasks count
      const { count: tasksCount } = await supabase
        .from("task_assignments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["pending", "in_progress"]);

      setBadges({
        alerts: alertsCount ?? 0,
        notifications: notificationsCount ?? 0,
        tasks: tasksCount ?? 0,
      });
    } catch (error) {
      console.error("Error fetching sidebar badge counts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch and realtime subscriptions
  useEffect(() => {
    fetchCounts();

    if (!user?.id) return;

    // Subscribe to realtime changes for notifications
    const notificationsChannel = supabase
      .channel("sidebar-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchCounts()
      )
      .subscribe();

    // Subscribe to realtime changes for maritime_alerts
    const alertsChannel = supabase
      .channel("sidebar-alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maritime_alerts",
        },
        () => fetchCounts()
      )
      .subscribe();

    // Subscribe to realtime changes for task_assignments
    const tasksChannel = supabase
      .channel("sidebar-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_assignments",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user?.id, fetchCounts]);

  const getBadgeCount = useCallback(
    (type: "alerts" | "notifications" | "tasks"): number => {
      return badges[type] || 0;
    },
    [badges]
  );

  const formatBadge = useCallback(
    (type: "alerts" | "notifications" | "tasks"): string | null => {
      const count = getBadgeCount(type);
      if (count === 0) return null;
      if (count > 99) return "99+";
      return String(count);
    },
    [getBadgeCount]
  );

  return {
    badges,
    isLoading,
    getBadgeCount,
    formatBadge,
    refetch: fetchCounts,
  };
}
