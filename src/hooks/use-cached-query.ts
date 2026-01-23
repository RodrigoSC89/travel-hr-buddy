/**
 * Enhanced Cached Query Hook
 * React Query integration with IndexedDB cache
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { cacheManager } from '@/lib/cache/cache-manager';
import { logger } from '@/lib/logger';

interface UseCachedQueryOptions<T> extends Omit<UseQueryOptions<T, Error, T, string[]>, 'queryKey' | 'queryFn'> {
  /** Time-to-live in milliseconds (default: 1 hour) */
  ttl?: number;
  /** Force fresh data even if cache exists */
  skipCache?: boolean;
  /** Update cache in background while returning cached data */
  staleWhileRevalidate?: boolean;
}

/**
 * Hook that combines React Query with IndexedDB caching
 * Provides offline-first data fetching with automatic cache management
 */
export function useCachedQuery<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options: UseCachedQueryOptions<T> = {}
): UseQueryResult<T, Error> {
  const {
    ttl = 3600000, // 1 hour default
    skipCache = false,
    staleWhileRevalidate = true,
    ...queryOptions
  } = options;
  
  const queryKey = Array.isArray(key) ? key : [key];
  const cacheKey = queryKey.join(':');
  
  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      // Try cache first (unless skipped)
      if (!skipCache) {
        try {
          const cached = await cacheManager.get<T>(cacheKey);
          
          if (cached !== null) {
            logger.debug(`Cache HIT for: ${cacheKey}`);
            
            // Stale-while-revalidate: return cached, update in background
            if (staleWhileRevalidate) {
              queueMicrotask(async () => {
                try {
                  const freshData = await queryFn();
                  await cacheManager.set(cacheKey, freshData, ttl);
                  logger.debug(`Background cache update for: ${cacheKey}`);
                } catch (err) {
                  logger.warn('Background cache update failed', { key: cacheKey, error: err });
                }
              });
            }
            
            return cached;
          }
          
          logger.debug(`Cache MISS for: ${cacheKey}`);
        } catch (err) {
          logger.warn('Cache read failed, fetching fresh data', { error: err });
        }
      }
      
      // Fetch fresh data
      const data = await queryFn();
      
      // Update cache
      try {
        await cacheManager.set(cacheKey, data, ttl);
        logger.debug(`Cached data for: ${cacheKey}, TTL: ${ttl}ms`);
      } catch (err) {
        logger.warn('Failed to cache data', { key: cacheKey, error: err });
      }
      
      return data;
    },
    staleTime: ttl / 2, // Consider stale at half TTL
    gcTime: ttl, // Keep in memory for TTL duration
    ...queryOptions,
  });
}

/**
 * Hook for caching paginated data
 */
export function useCachedPaginatedQuery<T>(
  baseKey: string,
  page: number,
  pageSize: number,
  queryFn: (page: number, pageSize: number) => Promise<T>,
  options: UseCachedQueryOptions<T> = {}
): UseQueryResult<T, Error> {
  const key = [baseKey, `page:${page}`, `size:${pageSize}`];
  
  return useCachedQuery(
    key,
    () => queryFn(page, pageSize),
    {
      ...options,
      // Keep previous page data while loading new page
      placeholderData: (previousData) => previousData,
    }
  );
}

/**
 * Invalidate cached data for a key
 */
export async function invalidateCache(key: string | string[]): Promise<void> {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;
  await cacheManager.delete(cacheKey);
  logger.debug(`Cache invalidated for: ${cacheKey}`);
}

/**
 * Prefetch and cache data
 */
export async function prefetchAndCache<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  ttl: number = 3600000
): Promise<T> {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;
  
  // Check cache first
  const cached = await cacheManager.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch and cache
  const data = await queryFn();
  await cacheManager.set(cacheKey, data, ttl);
  
  return data;
}

export default useCachedQuery;
