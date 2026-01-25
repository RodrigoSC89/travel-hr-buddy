/**
 * useOfflineSync - React hook for maritime offline-first data management
 * PATCH v12: Removed navigator.onLine - always assumes online, queues on network failure
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/production-logger';
import {
  initOfflineDB,
  detectConnectionQuality,
  getAdaptiveTimeout,
  queueForSync,
  getPendingSyncItems,
  cacheData,
  getCachedData,
  syncManager,
  estimateSyncTime,
  ConnectionQuality,
} from '@/lib/maritime/offline-sync';

interface UseOfflineSyncOptions {
  autoSync?: boolean;
  syncIntervalMs?: number;
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const { autoSync = true, syncIntervalMs = 30000 } = options;

  // PATCH v12: Always assume online - navigator.onLine is unreliable on iOS PWA
  const [isOnline] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [estimatedSyncSeconds, setEstimatedSyncSeconds] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<{ synced: number; failed: number } | null>(null);

  // Initialize and monitor connection quality (not online status)
  useEffect(() => {
    initOfflineDB();

    const updateConnectionQuality = () => {
      setConnectionQuality(detectConnectionQuality());
    };

    updateConnectionQuality();

    // Periodic connection quality check (not online/offline)
    const interval = setInterval(updateConnectionQuality, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Update pending count
  useEffect(() => {
    const updatePendingCount = async () => {
      const items = await getPendingSyncItems(1000);
      setPendingCount(items.length);

      const estimate = await estimateSyncTime();
      setEstimatedSyncSeconds(estimate);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto background sync
  useEffect(() => {
    if (autoSync) {
      syncManager.startBackgroundSync(syncIntervalMs);
    }

    return () => {
      syncManager.stopBackgroundSync();
    };
  }, [autoSync, syncIntervalMs]);

  /**
   * Manually trigger sync - always attempts, queues on failure
   */
  const triggerSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncManager.performSync();
      setLastSyncResult(result);

      // Update pending count
      const items = await getPendingSyncItems(1000);
      setPendingCount(items.length);
    } catch (error) {
      // Silently handle - will retry on next sync
      logger.warn('Sync failed, will retry', { error });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  /**
   * Queue a mutation for later sync
   */
  const queueMutation = useCallback(async (
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: Record<string, any>,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ) => {
    const id = await queueForSync(table, operation, data, priority);
    setPendingCount(prev => prev + 1);
    return id;
  }, []);

  /**
   * Fetch with cache-first strategy
   */
  const fetchWithCache = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 3600000
  ): Promise<{ data: T; fromCache: boolean; stale: boolean }> => {
    // Try cache first
    const cached = await getCachedData<T>(key);

    // If we have cached data and connection is poor, return cached immediately
    // and refresh in background (stale-while-revalidate)
    if (cached && connectionQuality?.isMaritime) {
      // Refresh in background
      fetcher()
        .then(data => cacheData(key, data, ttlMs))
        .catch(console.error);

      return { data: cached.data, fromCache: true, stale: false };
    }

    // Fetch fresh data
    try {
      const data = await fetcher();
      await cacheData(key, data, ttlMs);
      return { data, fromCache: false, stale: false };
    } catch (error) {
      // On error, return cached if available
      if (cached) {
        return { data: cached.data, fromCache: true, stale: true };
      }
      throw error;
    }
  }, [connectionQuality]);

  /**
   * Get adaptive timeout for current connection
   */
  const getTimeout = useCallback(() => {
    if (!connectionQuality) return 30000;
    return getAdaptiveTimeout(connectionQuality);
  }, [connectionQuality]);

  return {
    // Connection status - always online for iOS PWA compatibility
    isOnline,
    connectionQuality,
    isMaritime: connectionQuality?.isMaritime || false,

    // Sync status
    pendingCount,
    isSyncing,
    estimatedSyncSeconds,
    lastSyncResult,

    // Actions
    triggerSync,
    queueMutation,
    fetchWithCache,
    getTimeout,
  };
}
