/**
 * PATCH 609 - System Stats Hook with SWR Cache
 * Provides cached system statistics with automatic revalidation
 */

import useSWR from "swr";
import { supabase } from "@/integrations/supabase/client";

export interface SystemStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  activeModules: number;
  systemHealth: number;
  lastUpdated: string;
}

const fetcher = async (): Promise<SystemStats> => {
  try {
    // Fetch logs count
    const { count: totalLogs } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true });

    // Fetch error logs count
    const { count: errorCount } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true })
      .eq("level", "error");

    // Fetch warning logs count
    const { count: warningCount } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true })
      .eq("level", "warning");

    // Fetch system health metrics
    const { data: healthData } = await supabase
      .from("system_health")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    // Calculate system health (0-100)
    const systemHealth = healthData?.status === "healthy" ? 95 : 
                         healthData?.status === "degraded" ? 70 : 50;

    // Count active modules
    const { count: activeModules } = await supabase
      .from("ia_performance_log")
      .select("module_name", { count: "exact", head: true });

    return {
      totalLogs: totalLogs || 0,
      errorCount: errorCount || 0,
      warningCount: warningCount || 0,
      activeModules: activeModules || 0,
      systemHealth,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching system stats:", error);
    // Return default values on error
    return {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      activeModules: 0,
      systemHealth: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
};

export function useSystemStats() {
  const { data, error, isLoading, mutate } = useSWR<SystemStats>(
    "/api/system-stats",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    stats: data || {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      activeModules: 0,
      systemHealth: 0,
      lastUpdated: new Date().toISOString(),
    },
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
