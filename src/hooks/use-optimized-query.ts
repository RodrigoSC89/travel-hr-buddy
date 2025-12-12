/**
 * Optimized Query Hook
 * Combines all performance optimizations for low-bandwidth connections
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNetworkStatus, useAdaptiveSettings, ConnectionQuality } from "./use-network-status";
import { compressPayload, deduplicatedRequest } from "@/lib/performance/api-compression";
import { queueAction, cacheData, getCachedData } from "@/lib/offline/sync-queue";
import { supabase } from "@/integrations/supabase/client";

interface OptimizedQueryOptions<T> {
  queryKey: string[];
  tableName: string;
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  offlineCache?: boolean;
}

interface OptimizedMutationOptions<T, V> {
  tableName: string;
  operation: "insert" | "update" | "delete";
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  offlineSupport?: boolean;
}

function getAdaptivePageSizeFromQuality(quality: ConnectionQuality): number {
  switch (quality) {
  case "fast": return 50;
  case "medium": return 30;
  case "slow": return 15;
  case "offline": return 10;
  default: return 20;
  }
}

/**
 * Optimized query hook with network-aware settings
 */
export function useOptimizedQuery<T>({
  queryKey,
  tableName,
  select = "*",
  filters = {},
  orderBy,
  pageSize,
  enabled = true,
  staleTime,
  cacheTime,
  offlineCache = true,
}: OptimizedQueryOptions<T>) {
  const { quality, online } = useNetworkStatus();
  const settings = useAdaptiveSettings();
  
  // Calculate adaptive page size
  const adaptivePageSize = pageSize ?? getAdaptivePageSizeFromQuality(quality);
  
  // Calculate adaptive stale time based on network
  const adaptiveStaleTime = staleTime ?? (
    quality === "slow" ? 10 * 60 * 1000 : // 10 min for slow
      quality === "medium" ? 5 * 60 * 1000 :  // 5 min for medium
        2 * 60 * 1000                          // 2 min for fast
  );
  
  const fetchData = useCallback(async (): Promise<T[]> => {
    const cacheKey = queryKey.join(":");
    
    // Try offline cache first if offline
    if (!online && offlineCache) {
      const cached = await getCachedData<T[]>(cacheKey);
      if (cached) return cached;
      throw new Error("Offline - no cached data available");
    }
    
    // Deduplicated request
    return deduplicatedRequest(cacheKey, async () => {
      let query = supabase.from(tableName as any).select(select);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value as any);
        }
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
      
      // Apply pagination
      query = query.limit(adaptivePageSize);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Compress and cache for offline
      const processedData = (data || []) as T[];
      
      if (offlineCache && processedData.length > 0) {
        await cacheData(cacheKey, processedData, adaptiveStaleTime);
      }
      
      return processedData;
    }, 200);
  }, [tableName, select, filters, orderBy, adaptivePageSize, online, offlineCache, quality, queryKey, adaptiveStaleTime]);

  return useQuery({
    queryKey,
    queryFn: fetchData,
    enabled: enabled,
    staleTime: adaptiveStaleTime,
    gcTime: cacheTime ?? adaptiveStaleTime * 2,
    retry: online ? (quality === "slow" ? 1 : 2) : 0,
    retryDelay: quality === "slow" ? 2000 : 1000,
    refetchOnWindowFocus: quality !== "slow",
    refetchOnReconnect: true,
  });
}

/**
 * Optimized mutation with offline support
 */
export function useOptimizedMutation<T extends Record<string, unknown>, V = T>({
  tableName,
  operation,
  onSuccess,
  onError,
  offlineSupport = true,
}: OptimizedMutationOptions<T, V>) {
  const { online } = useNetworkStatus();
  const queryClient = useQueryClient();

  const mutationFn = useCallback(async (variables: V): Promise<T | null> => {
    // If offline and offline support enabled, queue the action
    if (!online && offlineSupport) {
      await queueAction(
        `supabase:${operation}`,
        { table: tableName, data: variables },
        3
      );
      // Return optimistic data
      return variables as unknown as T;
    }

    // Online mutation
    const table = supabase.from(tableName as any);
    
    try {
      switch (operation) {
      case "insert": {
        const { data, error } = await table.insert(variables as any).select().single();
        if (error) throw error;
        return data as unknown as T;
      }
      case "update": {
        const { id, ...updateData } = variables as any;
        const { data, error } = await table.update(updateData).eq("id", id).select().single();
        if (error) throw error;
        return data as unknown as T;
      }
      case "delete": {
        const deleteId = (variables as any).id;
        const { error } = await table.delete().eq("id", deleteId);
        if (error) throw error;
        return null;
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      throw error;
    }
  }, [tableName, operation, online, offlineSupport]);

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [tableName] });
      onSuccess?.(data as T);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

/**
 * Hook for infinite scroll with network-aware loading
 */
export function useInfiniteOptimizedQuery<T>({
  queryKey,
  tableName,
  select = "*",
  filters = {},
  orderBy,
}: Omit<OptimizedQueryOptions<T>, "pageSize">) {
  const { quality } = useNetworkStatus();
  const pageSize = getAdaptivePageSizeFromQuality(quality);

  const fetchPage = useCallback(async ({ pageParam = 0 }): Promise<{ data: T[]); nextPage: number | null }> => {
    let query = supabase
      .from(tableName as any)
      .select(select)
      .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value as any);
      }
    });

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      data: (data || []) as T[],
      nextPage: data && data.length === pageSize ? pageParam + 1 : null,
    };
  }, [tableName, select, filters, orderBy, pageSize]);

  return { fetchPage, pageSize };
}

export default useOptimizedQuery;
