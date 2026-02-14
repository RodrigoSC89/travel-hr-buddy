/**
 * Hook for dynamic sidebar badges
 * REAL DATA from Supabase: soc_alerts, notifications, action_items
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SidebarBadges {
  alerts: number;
  notifications: number;
  tasks: number;
}

export function useSidebarBadges() {
  const [badges, setBadges] = useState<SidebarBadges>({
    alerts: 0,
    notifications: 0,
    tasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [alertsRes, tasksRes] = await Promise.all([
          supabase.from("soc_alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("action_items").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        setBadges({
          alerts: alertsRes.count || 0,
          notifications: 0,
          tasks: tasksRes.count || 0,
        });
      } catch {
        // Silently fallback to zeros
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const getBadgeCount = useCallback(
    (type: "alerts" | "notifications" | "tasks"): number => badges[type] || 0,
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

  return { badges, isLoading, getBadgeCount, formatBadge };
}
