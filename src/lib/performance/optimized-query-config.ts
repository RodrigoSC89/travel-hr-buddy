/**
 * Optimized Query Configurations
 * PATCH 880: Query caching strategies for Lighthouse 98+
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Create optimized query client with aggressive caching
 */
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5 minutes before data is considered stale
        staleTime: 1000 * 60 * 5,
        
        // 30 minutes cache time
        gcTime: 1000 * 60 * 30,
        
        // Retry failed queries twice
        retry: 2,
        
        // Exponential backoff
        retryDelay: (attemptIndex) => 
          Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Don't refetch on window focus (saves bandwidth)
        refetchOnWindowFocus: false,
        
        // Refetch when reconnecting
        refetchOnReconnect: "always",
        
        // Offline first for slow connections
        networkMode: "offlineFirst",
        
        // Use placeholder data while loading
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations twice
        retry: 2,
        retryDelay: 1000,
        networkMode: "offlineFirst",
      },
    },
  });
}

/**
 * Query key factory for consistent caching
 */
export const queryKeys = {
  // User queries
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    profile: (id: string) => [...queryKeys.user.all, "profile", id] as const,
  },
  
  // Crew queries
  crew: {
    all: ["crew"] as const,
    list: (orgId: string) => [...queryKeys.crew.all, "list", orgId] as const,
    detail: (id: string) => [...queryKeys.crew.all, "detail", id] as const,
    search: (query: string) => [...queryKeys.crew.all, "search", query] as const,
  },
  
  // Vessel queries
  vessels: {
    all: ["vessels"] as const,
    list: (orgId: string) => [...queryKeys.vessels.all, "list", orgId] as const,
    detail: (id: string) => [...queryKeys.vessels.all, "detail", id] as const,
  },
  
  // Documents queries
  documents: {
    all: ["documents"] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.documents.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.documents.all, "detail", id] as const,
  },
  
  // Certificates queries
  certificates: {
    all: ["certificates"] as const,
    list: (crewId?: string) => 
      [...queryKeys.certificates.all, "list", crewId] as const,
    expiring: (days: number) => 
      [...queryKeys.certificates.all, "expiring", days] as const,
  },
  
  // Dashboard queries
  dashboard: {
    all: ["dashboard"] as const,
    stats: (orgId: string) => [...queryKeys.dashboard.all, "stats", orgId] as const,
    alerts: () => [...queryKeys.dashboard.all, "alerts"] as const,
  },
};

/**
 * Prefetch common queries
 */
export async function prefetchCriticalQueries(
  queryClient: QueryClient,
  userId: string,
  orgId: string
): Promise<void> {
  await Promise.all([
    // Prefetch current user
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.current(),
      staleTime: 1000 * 60 * 10, // 10 minutes
    }),
    
    // Prefetch dashboard stats
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(orgId),
      staleTime: 1000 * 60 * 2, // 2 minutes
    }),
  ]);
}

/**
 * Optimistic update helper
 */
export function createOptimisticUpdate<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (old: T[]) => T[]
): { previousData: T[] | undefined; rollback: () => void } {
  // Get previous data
  const previousData = queryClient.getQueryData<T[]>(queryKey);
  
  // Optimistically update
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return old;
    return updater(old);
  });
  
  // Return rollback function
  return {
    previousData,
    rollback: () => {
      queryClient.setQueryData(queryKey, previousData);
    },
  };
}

/**
 * Invalidate related queries
 */
export function invalidateRelatedQueries(
  queryClient: QueryClient,
  ...keys: (readonly unknown[])[]
): Promise<void[]> {
  return Promise.all(
    keys.map(key => queryClient.invalidateQueries({ queryKey: key }))
  );
}
