/**
 * useOfflineSync Hook - React hook for offline data synchronization
 */

import { useState, useEffect, useCallback } from "react";
import { offlineManager } from "@/lib/offline/OfflineManager";

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncStatus: "synced" | "syncing" | "error" | null;
  queueAction: (type: "create" | "update" | "delete", table: string, data: Record<string, any>) => Promise<string>;
  cacheData: (table: string, data: Record<string, any>[], ttlMinutes?: number) => Promise<void>;
  getCachedData: <T>(table: string) => Promise<T[] | null>;
  forceSync: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncStatus, setLastSyncStatus] = useState<"synced" | "syncing" | "error" | null>(null);

  useEffect(() => {
    // Initialize offline manager
    offlineManager.initialize();

    // Update pending count
    const updatePendingCount = async () => {
      const count = await offlineManager.getPendingCount();
      setPendingCount(count);
    };

    updatePendingCount();

    // Subscribe to sync status
    const unsubscribe = offlineManager.onSyncStatus((status) => {
      setLastSyncStatus(status);
      setIsSyncing(status === "syncing");
      updatePendingCount();
    });

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const queueAction = useCallback(async (
    type: "create" | "update" | "delete",
    table: string,
    data: Record<string, any>
  ): Promise<string> => {
    const id = await offlineManager.queueAction(type, table, data);
    const count = await offlineManager.getPendingCount();
    setPendingCount(count);
    return id;
  }, []);

  const cacheData = useCallback(async (
    table: string,
    data: Record<string, any>[],
    ttlMinutes?: number
  ): Promise<void> => {
    await offlineManager.cacheData(table, data, ttlMinutes);
  }, []);

  const getCachedData = useCallback(async <T>(table: string): Promise<T[] | null> => {
    return offlineManager.getCachedData<T>(table);
  }, []);

  const forceSync = useCallback(async (): Promise<void> => {
    await offlineManager.forceSync();
    const count = await offlineManager.getPendingCount();
    setPendingCount(count);
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncStatus,
    queueAction,
    cacheData,
    getCachedData,
    forceSync
  };
}
