/**
 * Hook to fetch restore logs summary data
 * 
 * Note: Requires document_restore_logs table and related RPCs.
 * Returns mock data until database schema is fully configured.
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
