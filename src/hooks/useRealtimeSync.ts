/**
 * Realtime Sync Hook with Offline Fallback
 * PATCH 624 - Supabase offline/error fallback
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { offlineCache } from "@/services/offlineCache";

interface UseRealtimeSyncOptions<T> {
  table: string;
  cacheKey: string;
  select?: string;
  filter?: Record<string, unknown>;
  cacheTTL?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface SyncState {
  isOnline: boolean;
  isFromCache: boolean;
  lastSync: Date | null;
  retryCount: number;
}

export function useRealtimeSync<T>({
  table,
  cacheKey,
  select = "*",
  filter,
  cacheTTL = 3600000, // 1 hour
  maxRetries = 5,
  retryDelay = 1000 // Initial delay in ms
}: UseRealtimeSyncOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isFromCache: false,
    lastSync: null,
    retryCount: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const subscriptionRef = useRef<any>(null);

  /**
   * Fetch data with exponential backoff retry
   */
  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      
      // Build query with type assertions to bypass strict typing
      const query: any = (supabase as any).from(table).select(select);
      
      // Apply filters if provided
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query.eq(key, value);
        });
      }

      const { data: fetchedData, error: fetchError } = await query.maybeSingle();

      if (fetchError) throw fetchError;

      // Successfully fetched data
      setData(fetchedData as T);
      setError(null);
      setSyncState({
        isOnline: true,
        isFromCache: false,
        lastSync: new Date(),
        retryCount: 0
      });

      // Update cache
      offlineCache.set(cacheKey, fetchedData, cacheTTL);
      setLoading(false);

    } catch (err) {
      console.error(`[RealtimeSync] Error fetching ${table}:`, err);

      // Try to load from cache
      const cachedData = offlineCache.get<T>(cacheKey);
      
      if (cachedData) {
        console.warn(`[RealtimeSync] Using cached data for ${table}`);
        setData(cachedData);
        setSyncState({
          isOnline: false,
          isFromCache: true,
          lastSync: null,
          retryCount
        });
        setError(null);
        setLoading(false);

        // Schedule retry with exponential backoff
        if (retryCount < maxRetries) {
          const delay = retryDelay * Math.pow(2, retryCount);
          console.log(`[RealtimeSync] Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(retryCount + 1);
          }, delay);
        }
      } else {
        // No cache available
        setError(err as Error);
        setLoading(false);
        setSyncState(prev => ({
          ...prev,
          isOnline: false,
          retryCount
        }));

        // Retry anyway
        if (retryCount < maxRetries) {
          const delay = retryDelay * Math.pow(2, retryCount);
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(retryCount + 1);
          }, delay);
        }
      }
    }
  }, [table, select, filter, cacheKey, cacheTTL, maxRetries, retryDelay]);

  /**
   * Manual retry function
   */
  const retry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    fetchData(0);
  }, [fetchData]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up realtime subscription
    try {
      subscriptionRef.current = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            console.log(`[RealtimeSync] Received update for ${table}:`, payload);
            
            // Update data based on event type
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setData(payload.new as T);
              offlineCache.set(cacheKey, payload.new, cacheTTL);
              setSyncState(prev => ({
                ...prev,
                isOnline: true,
                lastSync: new Date()
              }));
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.error('[RealtimeSync] Error setting up subscription:', err);
    }

    // Cleanup
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [fetchData, table, cacheKey, cacheTTL]);

  return {
    data,
    loading,
    error,
    syncState,
    retry
  };
}
