/**
 * React Query Client Configuration
 * Optimized defaults for bandwidth-limited scenarios (~2Mb)
 * PATCH: Audit Plan 2025 - Data & Queries
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { isSlowConnection } from './llm-optimizer';

// Default stale times based on data freshness requirements
const STALE_TIMES = {
  // Static data - rarely changes
  static: 1000 * 60 * 60, // 1 hour
  
  // Reference data - changes occasionally
  reference: 1000 * 60 * 15, // 15 minutes
  
  // Dynamic data - changes frequently but can be stale briefly
  dynamic: 1000 * 60 * 2, // 2 minutes
  
  // Real-time data - needs to be fresh
  realtime: 1000 * 30, // 30 seconds
};

// Increase stale times on slow connections
const getAdjustedStaleTime = (baseTime: number): number => {
  if (isSlowConnection()) {
    return baseTime * 2; // Double stale time on slow connections
  }
  return baseTime;
};

// Query client configuration optimized for performance
const createQueryClientConfig = (): QueryClientConfig => ({
  defaultOptions: {
    queries: {
      // Aggressive caching for slow connections
      staleTime: getAdjustedStaleTime(STALE_TIMES.dynamic),
      
      // Keep data in cache longer
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
      
      // Retry with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Reduce background refetches on slow connections
      refetchOnWindowFocus: !isSlowConnection(),
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode - always fetch but use cache while loading
      networkMode: 'offlineFirst',
      
      // Placeholder data while loading
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Create query client instance
let queryClientInstance: QueryClient | null = null;

export const getQueryClient = (): QueryClient => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient(createQueryClientConfig());
  }
  return queryClientInstance;
};

// Query key factories for consistent cache keys
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    profile: (userId: string) => ['user', 'profile', userId] as const,
    preferences: (userId: string) => ['user', 'preferences', userId] as const,
  },
  
  // Crew queries
  crew: {
    all: ['crew'] as const,
    list: (filters?: Record<string, unknown>) => ['crew', 'list', filters] as const,
    detail: (crewId: string) => ['crew', 'detail', crewId] as const,
    documents: (crewId: string) => ['crew', 'documents', crewId] as const,
  },
  
  // Mission queries
  missions: {
    all: ['missions'] as const,
    list: (filters?: Record<string, unknown>) => ['missions', 'list', filters] as const,
    detail: (missionId: string) => ['missions', 'detail', missionId] as const,
    active: () => ['missions', 'active'] as const,
  },
  
  // Documents queries
  documents: {
    all: ['documents'] as const,
    list: (folderId?: string) => ['documents', 'list', folderId] as const,
    detail: (docId: string) => ['documents', 'detail', docId] as const,
    search: (query: string) => ['documents', 'search', query] as const,
  },
  
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => ['analytics', 'dashboard'] as const,
    metrics: (range: string) => ['analytics', 'metrics', range] as const,
  },
  
  // AI queries
  ai: {
    all: ['ai'] as const,
    suggestions: (context: string) => ['ai', 'suggestions', context] as const,
    insights: () => ['ai', 'insights'] as const,
  },
};

// Utility to create query options with appropriate stale times
export const createQueryOptions = <T>(
  type: keyof typeof STALE_TIMES,
  queryFn: () => Promise<T>
) => ({
  queryFn,
  staleTime: getAdjustedStaleTime(STALE_TIMES[type]),
});

// Prefetch critical queries
export const prefetchCriticalQueries = async (queryClient: QueryClient) => {
  // Skip on slow connections
  if (isSlowConnection()) {
    return;
  }
  
  // Prefetch common data
  const prefetchPromises: Promise<void>[] = [];
  
  // Add prefetch calls here as needed
  // Example:
  // prefetchPromises.push(
  //   queryClient.prefetchQuery({
  //     queryKey: queryKeys.user.all,
  //     queryFn: fetchUser,
  //   })
  // );
  
  await Promise.allSettled(prefetchPromises);
};

// Invalidation helpers
export const invalidateQueries = {
  user: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
  
  crew: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.crew.all }),
  
  missions: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.missions.all }),
  
  documents: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all }),
  
  all: (queryClient: QueryClient) => 
    queryClient.invalidateQueries(),
};

export { STALE_TIMES };
