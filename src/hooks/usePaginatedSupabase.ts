/**
 * usePaginatedSupabase - Generic paginated query hook
 * P1-005: Prevents full table scans on large tables
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UsePaginatedOptions {
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending: boolean };
  select?: string;
  enabled?: boolean;
  staleTime?: number;
}

export function usePaginatedSupabase<T>(
  queryKey: string[],
  tableName: string,
  pagination: PaginationOptions,
  options: UsePaginatedOptions = {}
) {
  const { page, pageSize } = pagination;
  const { filters = {}, orderBy, select = '*', enabled = true, staleTime = 120_000 } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery<PaginatedResult<T>>({
    queryKey: [...queryKey, page, pageSize, JSON.stringify(filters)],
    queryFn: async () => {
      let query = fromUntyped(tableName)
        .select(select, { count: 'exact' })
        .range(from, to);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data || []) as T[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime,
    enabled,
  });
}
