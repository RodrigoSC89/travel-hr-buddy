import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
  last_execution: string | null;
}

interface RestoreCountByDay {
  day: string;
  count: number;
}

interface RestoreCountByStatus {
  name: string;
  value: number;
}

interface RestoreLogsSummaryData {
  summary: RestoreSummary;
  byDay: RestoreCountByDay[];
  byStatus: RestoreCountByStatus[];
}

interface UseRestoreLogsSummaryResult {
  data: RestoreLogsSummaryData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch restore logs summary data
 * Mimics the behavior of /api/restore-logs/summary endpoint
 * 
 * @param emailInput - Optional email filter
 * @returns Object with data, loading state, error, and refetch function
 */
export function useRestoreLogsSummary(emailInput: string | null = null): UseRestoreLogsSummaryResult {
  const [data, setData] = useState<RestoreLogsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary and byDay data in parallel
      const [summaryRes, byDayRes] = await Promise.all([
        supabase.rpc("get_restore_summary", { email_input: emailInput }),
        supabase.rpc("get_restore_count_by_day_with_email", { email_input: emailInput }),
      ]);

      if (summaryRes.error) throw summaryRes.error;
      if (byDayRes.error) throw byDayRes.error;

      // Fetch all statuses to group manually
      const { data: statusData, error: statusError } = await supabase
        .from("document_restore_logs")
        .select("status");

      if (statusError) throw statusError;

      // Process summary data
      const summary: RestoreSummary = summaryRes.data?.[0] || {
        total: 0,
        unique_docs: 0,
        avg_per_day: 0,
        last_execution: null,
      };

      // Process byDay data
      const byDay: RestoreCountByDay[] = (byDayRes.data || []).map((row: any) => ({
        day: row.day,
        count: row.count,
      }));

      // Group by status and count
      const statusCounts: Record<string, number> = {};
      statusData?.forEach((row: any) => {
        const status = row.status || "unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const byStatus: RestoreCountByStatus[] = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
      }));

      // Fetch last execution timestamp
      const { data: lastExecution } = await supabase
        .from("document_restore_logs")
        .select("restored_at")
        .order("restored_at", { ascending: false })
        .limit(1)
        .single();

      summary.last_execution = lastExecution?.restored_at || null;

      setData({
        summary,
        byDay,
        byStatus,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      console.error("Error fetching restore logs summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [emailInput]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
