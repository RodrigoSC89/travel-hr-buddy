/**
 * PATCH 547 - AI Performance Logging Hook
 * Tracks and logs AI operation performance metrics
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface AIPerformanceMetric {
  module_name: string;
  operation_type: string;
  execution_time_ms: number;
  success?: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
  cpu_usage_percent?: number;
  memory_used_mb?: number;
}

export function useAIPerformanceLog() {
  const [isLogging, setIsLogging] = useState(false);

  const logPerformance = useCallback(async (metric: AIPerformanceMetric) => {
    setIsLogging(true);
    try {
      const { error } = await supabase
        .from("ia_performance_log")
        .insert({
          module_name: metric.module_name,
          operation_type: metric.operation_type,
          execution_time_ms: metric.execution_time_ms,
          success: metric.success,
          error_message: metric.error_message,
          metadata: metric.metadata,
          cpu_usage_percent: metric.cpu_usage_percent,
          memory_used_mb: metric.memory_used_mb,
        });

      if (error) throw error;

      logger.debug(`[AI Performance] ${metric.module_name}.${metric.operation_type}: ${metric.execution_time_ms}ms`);
    } catch (error) {
      logger.error("[AI Performance] Failed to log:", error);
    } finally {
      setIsLogging(false);
    }
  }, []);

  const getRecentPerformance = useCallback(async (operationType?: string, limit = 50) => {
    try {
      let query = supabase
        .from("ia_performance_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (operationType) {
        query = query.eq("operation_type", operationType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("[AI Performance] Failed to fetch:", error);
      return [];
    }
  }, []);

  return {
    logPerformance,
    getRecentPerformance,
    isLogging,
  };
}
