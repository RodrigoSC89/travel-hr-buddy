/**
 * PATCH 547 - Watchdog Behavior Alerts Hook
 * Manages behavioral alerts and anomaly detection
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface WatchdogAlert {
  alert_type: string;
  component_name: string;
  anomaly_detected: string;
  severity: "low" | "medium" | "high" | "critical";
  actual_behavior?: string;
  expected_behavior?: string;
  deviation_score?: number;
  resolution_action?: string;
  metadata?: Record<string, any>;
}

export function useWatchdogAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const createAlert = useCallback(async (alert: WatchdogAlert) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("watchdog_behavior_alerts")
        .insert({
          alert_type: alert.alert_type,
          component_name: alert.component_name,
          anomaly_detected: alert.anomaly_detected,
          severity: alert.severity,
          actual_behavior: alert.actual_behavior,
          expected_behavior: alert.expected_behavior,
          deviation_score: alert.deviation_score,
          resolution_action: alert.resolution_action,
          metadata: alert.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      logger.warn(`[Watchdog Alert] ${alert.severity}: ${alert.anomaly_detected} on ${alert.component_name}`);
      return data;
    } catch (error) {
      logger.error("[Watchdog Alert] Failed to create:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string, resolutionAction: string) => {
    try {
      const { error } = await supabase
        .from("watchdog_behavior_alerts")
        .update({
          resolution_action: resolutionAction,
          resolved_at: new Date().toISOString(),
          auto_resolved: false,
        })
        .eq("id", alertId);

      if (error) throw error;

      logger.info(`[Watchdog Alert] Resolved: ${alertId} with action: ${resolutionAction}`);
    } catch (error) {
      logger.error("[Watchdog Alert] Failed to resolve:", error);
    }
  }, []);

  const getActiveAlerts = useCallback(async (severity?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("watchdog_behavior_alerts")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: false });

      if (severity) {
        query = query.eq("severity", severity);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAlerts(data || []);
      setUnreadCount(data?.length || 0);
      return data || [];
    } catch (error) {
      logger.error("[Watchdog Alert] Failed to fetch:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time subscription to alerts
  useEffect(() => {
    const channel = supabase
      .channel("watchdog-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "watchdog_behavior_alerts",
        },
        (payload) => {
          logger.info("[Watchdog Alert] New alert received", payload.new);
          setAlerts((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    unreadCount,
    createAlert,
    resolveAlert,
    getActiveAlerts,
    isLoading,
  };
}
