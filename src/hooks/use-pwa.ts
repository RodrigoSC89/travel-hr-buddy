/**
 * PWA Hooks
 * PATCH 850: Hooks for PWA functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineSyncManager } from '@/lib/pwa/offline-sync-manager';

// Hook for online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook for pending sync count
export function usePendingSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    offlineSyncManager.initialize().then(async () => {
      const count = await offlineSyncManager.getPendingCount();
      setPendingCount(count);
    });

    const unsubscribe = offlineSyncManager.subscribe((status) => {
      if (status.pendingCount !== undefined) setPendingCount(status.pendingCount);
      if (status.syncing !== undefined) setIsSyncing(status.syncing);
    });

    return unsubscribe;
  }, []);

  const sync = useCallback(async () => {
    return offlineSyncManager.syncPendingMutations();
  }, []);

  return { pendingCount, isSyncing, sync };
}

// Hook for offline mutations
export function useOfflineMutations() {
  const isOnline = useOnlineStatus();

  const queueMutation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    endpoint: string,
    payload: unknown,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    if (isOnline) {
      // Execute immediately if online
      const method = type === 'delete' ? 'DELETE' : type === 'create' ? 'POST' : 'PUT';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    }

    // Queue for later if offline
    return offlineSyncManager.queueMutation({
      type,
      endpoint,
      payload,
      priority,
    });
  }, [isOnline]);

  return { queueMutation, isOnline };
}

// Hook for cached data
export function useCachedData<T>(key: string, fetcher: () => Promise<T>, ttl = 300) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // Try cache first
        const cached = await offlineSyncManager.getCachedData<T>(key);
        if (cached && mounted) {
          setData(cached);
          setLoading(false);
        }

        // Fetch fresh data if online
        if (isOnline) {
          const fresh = await fetcher();
          if (mounted) {
            setData(fresh);
            await offlineSyncManager.cacheData(key, fresh, ttl);
          }
        } else if (!cached) {
          throw new Error('No cached data available offline');
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [key, isOnline, ttl]);

  const refresh = useCallback(async () => {
    if (!isOnline) return;
    
    setLoading(true);
    try {
      const fresh = await fetcher();
      setData(fresh);
      await offlineSyncManager.cacheData(key, fresh, ttl);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, isOnline, ttl]);

  return { data, loading, error, refresh, isOnline };
}

// Hook for PWA install prompt
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  return { canInstall, isInstalled };
}

// Export all hooks
export const pwaHooks = {
  useOnlineStatus,
  usePendingSync,
  useOfflineMutations,
  useCachedData,
  usePWAInstall,
};
