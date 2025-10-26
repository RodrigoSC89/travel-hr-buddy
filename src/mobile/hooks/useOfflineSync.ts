/**
 * PATCH 188.0 - Offline Sync Hook
 * 
 * React hook for managing offline data synchronization
 * Features:
 * - Auto-sync when connection restored
 * - Manual sync trigger
 * - Sync status tracking
 * - Conflict resolution
 */

import { useState, useEffect, useCallback } from 'react';
import { enhancedSyncEngine } from '../services/enhanced-sync-engine';
import { networkDetector } from '../services/networkDetector';
import { structuredLogger } from '@/lib/logger/structured-logger';

export interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncMode: 'realtime' | 'polling' | 'offline';
  error: Error | null;
}

export interface UseOfflineSyncResult extends OfflineSyncState {
  sync: () => Promise<void>;
  clearError: () => void;
  retryFailedSync: () => Promise<void>;
}

/**
 * Hook for managing offline synchronization
 * 
 * @example
 * ```tsx
 * const { isOnline, isSyncing, pendingChanges, sync } = useOfflineSync();
 * 
 * return (
 *   <div>
 *     {!isOnline && <p>Offline mode</p>}
 *     {pendingChanges > 0 && (
 *       <button onClick={sync}>Sync {pendingChanges} changes</button>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useOfflineSync = (): UseOfflineSyncResult => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    syncMode: 'offline',
    error: null,
  });

  /**
   * Update state from sync engine status
   */
  const updateFromSyncEngine = useCallback(() => {
    const status = enhancedSyncEngine.getStatus();
    setState((prev) => ({
      ...prev,
      lastSync: status.lastSync,
      pendingChanges: status.pendingChanges,
      syncMode: status.mode,
      isOnline: status.isConnected,
    }));
  }, []);

  /**
   * Manual sync trigger
   */
  const sync = useCallback(async () => {
    setState((prev) => ({ ...prev, isSyncing: true, error: null }));
    
    try {
      await enhancedSyncEngine.forceSync();
      updateFromSyncEngine();
      structuredLogger.info('Manual sync completed successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sync failed');
      setState((prev) => ({ ...prev, error: err }));
      structuredLogger.error('Manual sync failed', err);
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [updateFromSyncEngine]);

  /**
   * Retry failed synchronization
   */
  const retryFailedSync = useCallback(async () => {
    if (state.error) {
      await sync();
    }
  }, [state.error, sync]);

  /**
   * Clear sync error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Initialize and listen for changes
   */
  useEffect(() => {
    // Initialize sync engine
    enhancedSyncEngine.initialize();

    // Subscribe to sync status updates
    const unsubscribeSync = enhancedSyncEngine.addStatusListener((status) => {
      setState((prev) => ({
        ...prev,
        lastSync: status.lastSync,
        pendingChanges: status.pendingChanges,
        syncMode: status.mode,
        isOnline: status.isConnected,
      }));
    });

    // Subscribe to network status
    const unsubscribeNetwork = networkDetector.addListener((isOnline) => {
      setState((prev) => ({ ...prev, isOnline }));
      
      // Auto-sync when connection restored
      if (isOnline && state.pendingChanges > 0) {
        structuredLogger.info('Connection restored, starting auto-sync');
        sync();
      }
    });

    // Get initial status
    updateFromSyncEngine();

    return () => {
      unsubscribeSync();
      unsubscribeNetwork();
    };
  }, [updateFromSyncEngine, sync, state.pendingChanges]);

  return {
    ...state,
    sync,
    clearError,
    retryFailedSync,
  };
};

/**
 * Hook for table-specific offline sync
 * 
 * @param tableName - Name of the table to sync
 * @example
 * ```tsx
 * const { syncTable, isPending } = useTableSync('checklists');
 * ```
 */
export const useTableSync = (tableName: string) => {
  const { sync, isSyncing, pendingChanges } = useOfflineSync();
  const [isPending, setIsPending] = useState(false);

  const syncTable = useCallback(async () => {
    await sync();
  }, [sync]);

  useEffect(() => {
    // Check if this table has pending changes
    // This is a simplified check - in production, you'd query the sync queue
    setIsPending(pendingChanges > 0);
  }, [pendingChanges]);

  return {
    syncTable,
    isSyncing,
    isPending,
  };
};
