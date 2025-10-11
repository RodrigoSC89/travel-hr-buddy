import { useMemo } from "react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";

interface RestoreLog {
  id: string;
  document_id: string;
  version_id: string;
  restored_by: string;
  restored_at: string;
  email: string | null;
}

interface TrendDataPoint {
  date: string;
  count: number;
}

interface UserDistribution {
  name: string;
  count: number;
}

interface RestoreMetrics {
  total: number;
  thisWeek: number;
  thisMonth: number;
  mostActiveUser: string;
  mostActiveCount: number;
  trendData: TrendDataPoint[];
  userDistribution: UserDistribution[];
}

/**
 * Custom hook to calculate metrics from restore logs
 * @param logs - Array of restore logs to analyze
 * @returns Calculated metrics including totals, trends, and user distribution
 */
export function useRestoreLogsMetrics(logs: RestoreLog[]): RestoreMetrics {
  return useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    // Calculate time-based totals
    const thisWeek = logs.filter(
      (log) => new Date(log.restored_at) >= weekStart
    ).length;
    const thisMonth = logs.filter(
      (log) => new Date(log.restored_at) >= monthStart
    ).length;

    // Count by user
    const userCounts = logs.reduce((acc, log) => {
      const email = log.email || "Unknown";
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveUser = Object.entries(userCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Prepare chart data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      return {
        date: format(date, "dd/MM"),
        count: 0,
      };
    });

    logs.forEach((log) => {
      const logDate = new Date(log.restored_at);
      const daysDiff = Math.floor(
        (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff >= 0 && daysDiff < 7) {
        last7Days[6 - daysDiff].count++;
      }
    });

    // Prepare user distribution data (top 5 users)
    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => ({
        name: email.length > 20 ? email.substring(0, 17) + "..." : email,
        count,
      }));

    return {
      total: logs.length,
      thisWeek,
      thisMonth,
      mostActiveUser: mostActiveUser ? mostActiveUser[0] : "N/A",
      mostActiveCount: mostActiveUser ? mostActiveUser[1] : 0,
      trendData: last7Days,
      userDistribution: topUsers,
    };
  }, [logs]);
}
