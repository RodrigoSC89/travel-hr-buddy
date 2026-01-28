/**
 * useOptimizedData - Hook for efficient data fetching with caching
 * PATCH 880: Implements stale-while-revalidate pattern
 */

import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OptimizedQueryOptions<TData> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
  select?: (data: TData) => TData;
}

/**
 * Optimized data fetching hook with built-in caching strategies
 */
export function useOptimizedData<TData>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 30 * 60 * 1000, // 30 minutes
  enabled = true,
  refetchOnMount = false,
  select,
}: OptimizedQueryOptions<TData>) {
  const queryClient = useQueryClient();

  // Memoize query key to prevent unnecessary refetches
  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  const query = useQuery({
    queryKey: memoizedKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    enabled,
    refetchOnMount,
    refetchOnWindowFocus: false,
    networkMode: "offlineFirst",
    select,
    placeholderData: (previousData) => previousData,
  });

  // Prefetch next page or related data
  const prefetch = useCallback(
    async (prefetchKey: readonly unknown[], prefetchFn: () => Promise<TData>) => {
      await queryClient.prefetchQuery({
        queryKey: prefetchKey,
        queryFn: prefetchFn,
        staleTime,
      });
    },
    [queryClient, staleTime]
  );

  // Invalidate and refetch
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: memoizedKey });
  }, [queryClient, memoizedKey]);

  // Optimistic update helper
  const optimisticUpdate = useCallback(
    (updater: (old: TData | undefined) => TData) => {
      const previous = queryClient.getQueryData<TData>(memoizedKey);
      queryClient.setQueryData(memoizedKey, updater);
      return { previous, rollback: () => queryClient.setQueryData(memoizedKey, previous) };
    },
    [queryClient, memoizedKey]
  );

  return {
    ...query,
    prefetch,
    refresh,
    optimisticUpdate,
  };
}

/**
 * Paginated data hook with cursor-based pagination
 */
interface PaginatedOptions<TData> {
  table: string;
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  pageSize?: number;
}

export function usePaginatedData<TData extends { id: string; created_at?: string }>({
  table,
  select = "*",
  filters = {},
  orderBy = { column: "created_at", ascending: false },
  pageSize = 20,
}: PaginatedOptions<TData>) {
  const fetchPage = useCallback(
    async (cursor?: string) => {
      let query = (supabase
        .from(table as any)
        .select(select) as any)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false })
        .limit(pageSize);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply cursor
      if (cursor) {
        query = query.lt(orderBy.column, cursor);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        items: (data || []) as TData[],
        nextCursor: data && data.length === pageSize
          ? (data[data.length - 1] as any)[orderBy.column]
          : null,
      };
    },
    [table, select, filters, orderBy, pageSize]
  );

  return useOptimizedData({
    queryKey: [table, "paginated", filters, orderBy],
    queryFn: () => fetchPage(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Real-time subscription with optimistic updates
 */
export function useRealtimeData<TData extends { id: string }>(
  table: string,
  queryKey: readonly unknown[]
) {
  const queryClient = useQueryClient();

  // Subscribe to real-time changes
  const subscribe = useCallback(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          // Update cache based on event type
          if (payload.eventType === "INSERT") {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old) return [payload.new as TData];
              return [payload.new as TData, ...old];
            });
          } else if (payload.eventType === "UPDATE") {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old) return old;
              return old.map((item) =>
                item.id === payload.new.id ? (payload.new as TData) : item
              );
            });
          } else if (payload.eventType === "DELETE") {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old) return old;
              return old.filter((item) => item.id !== payload.old.id);
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [table, queryKey, queryClient]);

  return { subscribe };
}
