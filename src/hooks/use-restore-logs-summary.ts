/**
 * Hook to fetch restore logs summary data
 * 
 * DISABLED: Requires database tables that don't exist yet:
 * - document_restore_logs table
 * - get_restore_summary RPC function
 * - get_restore_count_by_day_with_email RPC function
 * 
 * TODO: Create proper database schema before enabling this hook
 */

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
 * Temporary mock implementation until database schema is created
 */
export function useRestoreLogsSummary(_emailInput: string | null = null): UseRestoreLogsSummaryResult {
  return {
    data: {
      summary: {
        total: 0,
        unique_docs: 0,
        avg_per_day: 0,
        last_execution: null,
      },
      byDay: [],
      byStatus: [],
    },
    loading: false,
    error: new Error("Database schema not configured. Please create document_restore_logs table."),
    refetch: async () => {
      // No-op until schema is created
    },
  };
}
