/**
 * PATCH 547 - System Health Monitoring Hook
 * Tracks overall system health metrics and status
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface HealthMetric {
  service_name: string;
  status: "healthy" | "degraded" | "critical";
  response_time_ms?: number;
  error_rate?: number;
  uptime_percentage?: number;
  last_error?: string;
  metadata?: Record<string, any>;
}

export function useSystemHealth() {
  const [healthStatus, setHealthStatus] = useState<any[]>([]);
  const [overallStatus, setOverallStatus] = useState<"healthy" | "degraded" | "critical">("healthy");
  const [isLoading, setIsLoading] = useState(false);

  const logHealthMetric = useCallback(async (metric: HealthMetric) => {
    try {
      const { error } = await supabase.from("system_health").insert({
        service_name: metric.service_name,
        status: metric.status,
        response_time_ms: metric.response_time_ms,
        error_rate: metric.error_rate,
        uptime_percentage: metric.uptime_percentage,
        last_error: metric.last_error,
        last_check: new Date().toISOString(),
        metadata: metric.metadata,
      });

      if (error) throw error;

      logger.debug(`[System Health] ${metric.service_name}: ${metric.status}`);
    } catch (error) {
      logger.error("[System Health] Failed to log:", error);
    }
  }, []);

  const getLatestHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_health")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setHealthStatus(data || []);

      // Calculate overall status
      const criticalCount = data?.filter((m) => m.status === "critical").length || 0;
      const degradedCount = data?.filter((m) => m.status === "degraded").length || 0;

      if (criticalCount > 0) {
        setOverallStatus("critical");
      } else if (degradedCount > 0) {
        setOverallStatus("degraded");
      } else {
        setOverallStatus("healthy");
      }

      return data || [];
    } catch (error) {
      logger.error("[System Health] Failed to fetch:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHealthByService = useCallback(async (serviceName: string, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from("system_health")
        .select("*")
        .eq("service_name", serviceName)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("[System Health] Failed to fetch by service:", error);
      return [];
    }
  }, []);

  // Auto-refresh health status every 30 seconds
  useEffect(() => {
    getLatestHealth();

    const interval = setInterval(() => {
      getLatestHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [getLatestHealth]);

  return {
    healthStatus,
    overallStatus,
    logHealthMetric,
    getLatestHealth,
    getHealthByService,
    isLoading,
  };
}
