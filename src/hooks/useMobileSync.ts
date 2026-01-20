/**
 * React Hook for Mobile Offline Sync
 * PATCH v12: Removed navigator.onLine - always assumes online
 * Provides sync status and queue management in components
 */

import { useState, useEffect, useCallback } from 'react';
import { mobileSyncManager, SyncStatus, QueuedItem } from '@/lib/mobile/mobile-sync-manager';
import { useToast } from '@/hooks/use-toast';

interface UseMobileSyncOptions {
  showNotifications?: boolean;
  autoSync?: boolean;
}

export function useMobileSync(options: UseMobileSyncOptions = {}) {
  const { showNotifications = true, autoSync = true } = options;
  const { toast } = useToast();
  
  // PATCH v12: Always assume online - navigator.onLine is unreliable on iOS PWA
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    failedCount: 0,
    isOnline: true
  });

  // Update status
  const refreshStatus = useCallback(async () => {
    const newStatus = await mobileSyncManager.getStatus();
    // Force isOnline to true for iOS PWA compatibility
    setStatus({ ...newStatus, isOnline: true });
  }, []);

  useEffect(() => {
    // Initial status
    refreshStatus();

    // Subscribe to events
    const unsubscribes = [
      mobileSyncManager.on('sync-start', () => {
        setStatus(prev => ({ ...prev, isSyncing: true }));
      }),
      
      mobileSyncManager.on('sync-complete', ({ data }) => {
        refreshStatus();
        if (showNotifications && (data as { synced: number }).synced > 0) {
          toast({
            title: 'Sincronização concluída',
            description: `${(data as { synced: number }).synced} item(s) sincronizado(s)`
          });
        }
      }),
      
      mobileSyncManager.on('sync-error', ({ error }) => {
        refreshStatus();
        if (showNotifications) {
          toast({
            variant: 'destructive',
            title: 'Erro na sincronização',
            description: error?.message || 'Tentando novamente...'
          });
        }
      }),
      
      // PATCH v12: Removed 'online' and 'offline' event handlers
      // These events are unreliable on iOS PWA and cause false positives
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub?.());
    };
  }, [refreshStatus, showNotifications, toast]);

  // Queue a create operation
  const queueCreate = useCallback(async (table: string, data: Record<string, unknown>) => {
    return mobileSyncManager.queueItem({
      type: 'create',
      table,
      data
    });
  }, []);

  // Queue an update operation
  const queueUpdate = useCallback(async (table: string, id: string, data: Record<string, unknown>) => {
    return mobileSyncManager.queueItem({
      type: 'update',
      table,
      data: { id, ...data }
    });
  }, []);

  // Queue a delete operation
  const queueDelete = useCallback(async (table: string, id: string) => {
    return mobileSyncManager.queueItem({
      type: 'delete',
      table,
      data: { id }
    });
  }, []);

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    await mobileSyncManager.syncData();
    await refreshStatus();
  }, [refreshStatus]);

  // Clear all pending items
  const clearQueue = useCallback(async () => {
    await mobileSyncManager.clearQueue();
    await refreshStatus();
  }, [refreshStatus]);

  return {
    ...status,
    queueCreate,
    queueUpdate,
    queueDelete,
    syncNow,
    clearQueue,
    refreshStatus
  };
}

export default useMobileSync;
