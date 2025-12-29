/**
 * Hook for dynamic sidebar badges
 * Returns mock/cached counts - can be extended to fetch real data
 */
import { useState, useEffect, useCallback } from "react";

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
  const [isLoading, setIsLoading] = useState(false);

  // For now, return static values - can be extended to fetch from Supabase
  useEffect(() => {
    // Mock data - replace with actual Supabase queries when tables exist
    setBadges({
      alerts: 0,
      notifications: 0,
      tasks: 0,
    });
    setIsLoading(false);
  }, []);

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
  };
}
