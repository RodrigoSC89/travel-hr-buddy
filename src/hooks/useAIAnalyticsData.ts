/**
 * AI Analytics Data Hook - Real Supabase Integration
 * Substitui mock data com dados reais da tabela ai_audit_logs
 */

import { useQuery } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

interface ModuleStats {
  total: number;
  success: number;
  avgResponseTime: number;
  totalTokens: number;
}

interface DailyUsage {
  date: string;
  command: number;
  peotram: number;
  peodp: number;
  safety: number;
  bunker: number;
  crew: number;
  weather: number;
  total: number;
}

interface AnalyticsData {
  period: string;
  totalRequests: number;
  successRate: number;
  moduleStats: Record<string, ModuleStats>;
  topModules: Array<{ module: string } & ModuleStats>;
  dailyUsage: DailyUsage[];
}

export function useAIAnalyticsData(period: string = "7d") {
  const days = period === "30d" ? 30 : period === "24h" ? 1 : 7;

  return useQuery({
    queryKey: ["ai-analytics", period],
    queryFn: async (): Promise<AnalyticsData> => {
      const startDate = subDays(new Date(), days).toISOString();

      // Fetch AI audit logs
      const { data: logs, error } = await supabase
        .from("ai_audit_logs")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching AI analytics:", error);
        throw error;
      }

      if (!logs || logs.length === 0) {
        return {
          period,
          totalRequests: 0,
          successRate: 100,
          moduleStats: {},
          topModules: [],
          dailyUsage: [],
        };
      }

      // Process module stats
      const moduleStats: Record<string, ModuleStats> = {};
      let totalSuccess = 0;

      logs.forEach((log) => {
        const module = log.module_name || "command";
        if (!moduleStats[module]) {
          moduleStats[module] = {
            total: 0,
            success: 0,
            avgResponseTime: 0,
            totalTokens: 0,
          };
        }

        moduleStats[module].total++;
        moduleStats[module].totalTokens += (log.tokens_input || 0) + (log.tokens_output || 0);
        moduleStats[module].avgResponseTime += log.response_time_ms || 0;

        // Consider successful if no explicit error or if confidence is high
        const isSuccess = (log.confidence_score || 0) > 0.5;
        if (isSuccess) {
          moduleStats[module].success++;
          totalSuccess++;
        }
      });

      // Calculate averages
      Object.keys(moduleStats).forEach((module) => {
        if (moduleStats[module].total > 0) {
          moduleStats[module].avgResponseTime = Math.round(
            moduleStats[module].avgResponseTime / moduleStats[module].total
          );
        }
      });

      // Get top modules
      const topModules = Object.entries(moduleStats)
        .map(([module, stats]) => ({ module, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Calculate daily usage
      const dailyData: Record<string, DailyUsage> = {};
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), "dd MMM");
        dailyData[date] = {
          date,
          command: 0,
          peotram: 0,
          peodp: 0,
          safety: 0,
          bunker: 0,
          crew: 0,
          weather: 0,
          total: 0,
        };
      }

      logs.forEach((log) => {
        const date = format(new Date(log.created_at || ""), "dd MMM");
        const module = log.module_name || "command";
        
        if (dailyData[date]) {
          dailyData[date].total++;
          const moduleKey = module.toLowerCase() as keyof DailyUsage;
          if (moduleKey in dailyData[date] && typeof dailyData[date][moduleKey] === "number") {
            (dailyData[date][moduleKey] as number)++;
          }
        }
      });

      const dailyUsage = Object.values(dailyData).reverse();

      return {
        period,
        totalRequests: logs.length,
        successRate: logs.length > 0 ? Math.round((totalSuccess / logs.length) * 100 * 10) / 10 : 100,
        moduleStats,
        topModules,
        dailyUsage,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export default useAIAnalyticsData;
