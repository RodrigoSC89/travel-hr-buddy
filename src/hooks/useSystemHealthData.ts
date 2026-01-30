/**
 * Hook for real system health metrics from database
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface SystemHealthMetrics {
  id: string;
  organization_id?: string;
  cpu_usage: number;
  memory_usage: number;
  network_status: string;
  database_latency_ms: number;
  active_users: number;
  response_time_ms: number;
  uptime_seconds: number;
  recorded_at: string;
}

// Fetch latest health metrics
export function useSystemHealthMetrics() {
  return useQuery({
    queryKey: ["system-health-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_health_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as SystemHealthMetrics | null;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Fetch metrics history
export function useSystemHealthHistory(hours: number = 24) {
  return useQuery({
    queryKey: ["system-health-history", hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("system_health_metrics")
        .select("*")
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return (data || []) as SystemHealthMetrics[];
    },
  });
}

// Record new health metrics
export function useRecordHealthMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: Omit<SystemHealthMetrics, "id" | "recorded_at">) => {
      const { data, error } = await supabase
        .from("system_health_metrics")
        .insert(metrics)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-health-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["system-health-history"] });
    },
  });
}

// Combined hook with browser performance data
export function useSystemHealth() {
  const { data: dbMetrics, isLoading, refetch } = useSystemHealthMetrics();
  const { data: history } = useSystemHealthHistory(24);
  const [browserMetrics, setBrowserMetrics] = useState({
    cpu: 0,
    memory: 0,
    jsHeapUsed: 0,
    jsHeapTotal: 0,
  });

  // Collect browser performance metrics
  useEffect(() => {
    const collectMetrics = () => {
      const performance = window.performance as any;
      const memory = performance?.memory;

      setBrowserMetrics({
        cpu: 0, // CPU usage not available in browser
        memory: memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0,
        jsHeapUsed: memory ? memory.usedJSHeapSize : 0,
        jsHeapTotal: memory ? memory.totalJSHeapSize : 0,
      });
    };

    collectMetrics();
    const interval = setInterval(collectMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate uptime string
  const formatUptime = (seconds?: number): string => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Merge DB metrics with browser metrics
  const metrics = dbMetrics
    ? {
        cpu: dbMetrics.cpu_usage ?? browserMetrics.cpu,
        memory: dbMetrics.memory_usage ?? browserMetrics.memory,
        disk: 0, // Would come from server
        network: dbMetrics.network_status === "online" ? 100 : 0,
        database: 100 - Math.min((dbMetrics.database_latency_ms ?? 0) / 10, 100),
        activeUsers: dbMetrics.active_users ?? 0,
        responseTime: dbMetrics.response_time_ms ?? 0,
        uptime: formatUptime(dbMetrics.uptime_seconds),
        lastUpdate: new Date(dbMetrics.recorded_at),
      }
    : {
        cpu: browserMetrics.cpu,
        memory: browserMetrics.memory,
        disk: 0,
        network: 100, // PATCH v38: Sempre online - navigator.onLine não é confiável no iOS PWA
        database: 100,
        activeUsers: 1,
        responseTime: 0,
        uptime: "N/A",
        lastUpdate: new Date(),
      };

  // Generate alerts based on thresholds
  const alerts = [];
  if (metrics.cpu > 80) {
    alerts.push({
      id: "cpu-high",
      type: "warning" as const,
      message: `Alto uso de CPU: ${metrics.cpu.toFixed(0)}%`,
      timestamp: new Date(),
    });
  }
  if (metrics.memory > 85) {
    alerts.push({
      id: "memory-critical",
      type: "error" as const,
      message: `Memória crítica: ${metrics.memory.toFixed(0)}%`,
      timestamp: new Date(),
    });
  }
  if (metrics.responseTime > 400) {
    alerts.push({
      id: "response-slow",
      type: "warning" as const,
      message: `Tempo de resposta alto: ${metrics.responseTime}ms`,
      timestamp: new Date(),
    });
  }

  return {
    metrics,
    alerts,
    history,
    isLoading,
    refetch,
  };
}
