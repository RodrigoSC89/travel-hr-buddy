/**
 * Query Configuration - PATCH 651.0
 * Optimized cache strategies for React Query
 */

import { QueryClient } from "@tanstack/react-query";
import { logger } from "@/lib/logger";

/**
 * Cache strategies by data type
 */
export const CACHE_TIMES = {
  // Static data - cache for longer
  static: 1000 * 60 * 30, // 30 minutes
  
  // Semi-static (organizations, vessels) - moderate cache
  semiStatic: 1000 * 60 * 10, // 10 minutes
  
  // Dynamic data (dashboard metrics) - short cache
  dynamic: 1000 * 60 * 2, // 2 minutes
  
  // Real-time data (alerts, notifications) - very short cache
  realtime: 1000 * 30, // 30 seconds
  
  // User preferences - cache until manual refresh
  preferences: 1000 * 60 * 60, // 1 hour
} as const;

/**
 * Get connection quality for adaptive caching
 */
function getConnectionQuality(): "fast" | "slow" | "critical" {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number };
  };
  
  if (!nav.connection) return "fast";
  
  const downlink = nav.connection.downlink || 10;
  const effectiveType = nav.connection.effectiveType || "4g";
  
  if (downlink < 0.5 || effectiveType === "slow-2g") return "critical";
  if (downlink < 2 || ["2g", "3g"].includes(effectiveType)) return "slow";
  return "fast";
}

/**
 * Optimized QueryClient configuration with slow network support
 */
export function createOptimizedQueryClient(): QueryClient {
  const connectionQuality = getConnectionQuality();
  
  // Adjust settings based on connection
  const staleTimeMultiplier = connectionQuality === "critical" ? 5 : connectionQuality === "slow" ? 3 : 1;
  const gcTimeMultiplier = connectionQuality === "critical" ? 3 : connectionQuality === "slow" ? 2 : 1;
  const retryCount = connectionQuality === "critical" ? 3 : connectionQuality === "slow" ? 2 : 1;
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Adaptive stale time based on connection
        staleTime: CACHE_TIMES.semiStatic * staleTimeMultiplier,
        
        // Cache data longer on slow connections
        gcTime: 1000 * 60 * 15 * gcTimeMultiplier,
        
        // More retries on slow connections
        retry: retryCount,
        retryDelay: (attemptIndex) => {
          const baseDelay = connectionQuality === "critical" ? 2000 : 1000;
          return Math.min(baseDelay * Math.pow(2, attemptIndex), 60000);
        },
        
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
        
        // Refetch on reconnect
        refetchOnReconnect: true,
        
        // Network mode - allow offline access to cached data
        networkMode: "offlineFirst",
        
        // Placeholder data while loading
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // More retries for slow networks
        retry: retryCount,
        retryDelay: connectionQuality === "critical" ? 3000 : 1000,
        
        // Network mode for mutations - queue when offline
        networkMode: "offlineFirst",
        
        // Log mutation errors
        onError: (error) => {
          logger.error("Mutation error:", error);
        },
      },
    },
  });
}

/**
 * Query key factories for consistent caching
 */
export const queryKeys = {
  // User & Auth
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    profile: (id: string) => [...queryKeys.user.all, "profile", id] as const,
    sessions: () => [...queryKeys.user.all, "sessions"] as const,
  },
  
  // Organizations
  organizations: {
    all: ["organizations"] as const,
    detail: (id: string) => [...queryKeys.organizations.all, id] as const,
    vessels: (orgId: string) => [...queryKeys.organizations.all, orgId, "vessels"] as const,
  },
  
  // Vessels
  vessels: {
    all: ["vessels"] as const,
    detail: (id: string) => [...queryKeys.vessels.all, id] as const,
    status: (id: string) => [...queryKeys.vessels.all, id, "status"] as const,
    sensors: (id: string) => [...queryKeys.vessels.all, id, "sensors"] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    kpis: () => [...queryKeys.dashboard.all, "kpis"] as const,
    alerts: () => [...queryKeys.dashboard.all, "alerts"] as const,
  },
  
  // Modules
  modules: {
    all: ["modules"] as const,
    config: (moduleId: string) => [...queryKeys.modules.all, moduleId, "config"] as const,
    data: (moduleId: string) => [...queryKeys.modules.all, moduleId, "data"] as const,
  },
  
  // Compliance
  compliance: {
    all: ["compliance"] as const,
    audits: () => [...queryKeys.compliance.all, "audits"] as const,
    certificates: () => [...queryKeys.compliance.all, "certificates"] as const,
  },
  
  // AI & Analytics
  ai: {
    all: ["ai"] as const,
    insights: () => [...queryKeys.ai.all, "insights"] as const,
    predictions: () => [...queryKeys.ai.all, "predictions"] as const,
  },
} as const;

/**
 * Prefetch critical data on app load
 */
export async function prefetchCriticalData(queryClient: QueryClient): Promise<void> {
  try {
    logger.info("Prefetching critical data...");
    
    // Prefetch user profile
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.current(),
      staleTime: CACHE_TIMES.preferences,
    });
    
    // Prefetch organizations
    await queryClient.prefetchQuery({
      queryKey: queryKeys.organizations.all,
      staleTime: CACHE_TIMES.semiStatic,
    });
    
    logger.info("Critical data prefetched");
  } catch (error) {
    logger.error("Failed to prefetch critical data:", error);
  }
}

/**
 * Clear specific cache sections
 */
export function clearCache(queryClient: QueryClient, section: keyof typeof queryKeys): void {
  queryClient.removeQueries({ queryKey: queryKeys[section].all });
  logger.info(`Cleared ${section} cache`);
}

/**
 * Invalidate and refetch specific data
 */
export async function invalidateAndRefetch(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey });
  await queryClient.refetchQueries({ queryKey });
}
