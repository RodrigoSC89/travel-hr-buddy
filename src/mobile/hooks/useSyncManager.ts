/**
 * PATCH 162.0 - useSyncManager Hook
 * React hook for managing offline sync operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { syncQueue } from '../services/syncQueue';
import { networkDetector } from '../services/networkDetector';
import { NetworkStatus } from '../types';
import { toast } from 'sonner';

interface SyncManagerState {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime: number | null;
  syncError: string | null;
  networkQuality: 'good' | 'poor' | 'offline';
}

interface SyncManagerActions {
  syncNow: () => Promise<void>;
  enqueueChange: (
    table: string,
    data: any,
    action: 'create' | 'update' | 'delete',
    priority?: 'high' | 'medium' | 'low'
  ) => Promise<void>;
  clearSynced: () => Promise<void>;
  getQueueStats: () => Promise<any>;
}

export const useSyncManager = (): SyncManagerState & SyncManagerActions => {
  const [state, setState] = useState<SyncManagerState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    queueSize: 0,
    lastSyncTime: null,
    syncError: null,
    networkQuality: 'good'
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update queue size
   */
  const updateQueueSize = useCallback(async () => {
    try {
      const size = await syncQueue.getQueueSize();
      setState(prev => ({ ...prev, queueSize: size }));
    } catch (error) {
      console.error('Failed to update queue size:', error);
    }
  }, []);

  /**
   * Determine network quality
   */
  const getNetworkQuality = useCallback((status: NetworkStatus): 'good' | 'poor' | 'offline' => {
    if (!status.isOnline) return 'offline';
    if (!status.effectiveType) return 'good';
    
    const goodTypes = ['3g', '4g'];
    return goodTypes.includes(status.effectiveType) ? 'good' : 'poor';
  }, []);

  /**
   * Sync now - manually trigger sync
   */
  const syncNow = useCallback(async () => {
    if (state.isSyncing) {
      toast.info('Sync already in progress');
      return;
    }

    if (!state.isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const result = await syncQueue.processQueue();
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        syncError: null
      }));

      await updateQueueSize();

      if (result.success > 0) {
        toast.success(`Synced ${result.success} items successfully`);
      }
      
      if (result.failed > 0) {
        toast.warning(`Failed to sync ${result.failed} items`);
      }

      if (result.total === 0) {
        toast.info('No items to sync');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage
      }));

      toast.error(errorMessage);
      console.error('Sync error:', error);
    }
  }, [state.isSyncing, state.isOnline, updateQueueSize]);

  /**
   * Enqueue a change for syncing
   */
  const enqueueChange = useCallback(async (
    table: string,
    data: any,
    action: 'create' | 'update' | 'delete',
    priority?: 'high' | 'medium' | 'low'
  ) => {
    try {
      // Auto-determine priority if not provided
      const finalPriority = priority || syncQueue.getPriorityForTable(table, action);
      
      await syncQueue.enqueue(table, data, action, finalPriority);
      await updateQueueSize();

      // If online and good connection, try immediate sync
      if (state.isOnline && state.networkQuality === 'good') {
        // Debounce sync to avoid too many requests
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        
        syncTimeoutRef.current = setTimeout(() => {
          syncNow();
        }, 2000); // Wait 2 seconds before syncing
      } else {
        toast.info('Change saved offline. Will sync when online.');
      }
    } catch (error) {
      console.error('Failed to enqueue change:', error);
      toast.error('Failed to save change');
      throw error;
    }
  }, [state.isOnline, state.networkQuality, syncNow, updateQueueSize]);

  /**
   * Clear synced items
   */
  const clearSynced = useCallback(async () => {
    try {
      await syncQueue.clearSynced();
      await updateQueueSize();
      toast.success('Cleared synced items');
    } catch (error) {
      console.error('Failed to clear synced items:', error);
      toast.error('Failed to clear synced items');
    }
  }, [updateQueueSize]);

  /**
   * Get queue statistics
   */
  const getQueueStats = useCallback(async () => {
    return syncQueue.getQueueStats();
  }, []);

  /**
   * Handle network status changes
   */
  useEffect(() => {
    const unsubscribe = networkDetector.onChange((status) => {
      const quality = getNetworkQuality(status);
      
      setState(prev => ({
        ...prev,
        isOnline: status.isOnline,
        networkQuality: quality
      }));

      // Auto-sync when coming online with good connection
      if (status.isOnline && quality === 'good' && state.queueSize > 0) {
        toast.success('Connection restored! Starting sync...');
        setTimeout(() => syncNow(), 1000);
      }
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
      }
    };
  }, [getNetworkQuality, state.queueSize, syncNow]);

  /**
   * Auto-sync interval (every 5 minutes if online)
   */
  useEffect(() => {
    autoSyncIntervalRef.current = setInterval(async () => {
      if (state.isOnline && state.networkQuality === 'good' && state.queueSize > 0) {
        console.log('Auto-sync check: syncing pending changes...');
        await syncNow();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
      }
    };
  }, [state.isOnline, state.networkQuality, state.queueSize, syncNow]);

  /**
   * Initial queue size update
   */
  useEffect(() => {
    updateQueueSize();
  }, [updateQueueSize]);

  return {
    ...state,
    syncNow,
    enqueueChange,
    clearSynced,
    getQueueStats
  };
};
