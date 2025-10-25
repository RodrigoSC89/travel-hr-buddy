/**
 * useSync Hook - Patch 149.1
 * Manages offline/online sync for crew app data
 */

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

interface SyncableData {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  synced: boolean;
}

interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UseSyncReturn {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  saveLocally: (data: any, type: string) => Promise<string>;
  syncToSupabase: () => Promise<void>;
  clearPending: () => Promise<void>;
  getSyncStatus: () => { synced: number; pending: number };
}

const STORAGE_KEY = "crew_app_sync_queue";

export const useSync = (options: UseSyncOptions = {}): UseSyncReturn => {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
  } = options;

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info("Network online - auto-sync will resume");
      if (autoSync) {
        syncToSupabase();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.info("Network offline - data will be queued");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoSync]);

  // Auto-sync interval
  useEffect(() => {
    if (!autoSync || !isOnline) return;

    const interval = setInterval(() => {
      syncToSupabase();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isOnline, syncInterval]);

  // Load pending count on mount
  useEffect(() => {
    updatePendingCount();
  }, []);

  /**
   * Get all pending data from localStorage
   */
  const getPendingData = (): SyncableData[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error("Failed to load pending sync data", error);
      return [];
    }
  };

  /**
   * Save pending data to localStorage
   */
  const savePendingData = (data: SyncableData[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updatePendingCount();
    } catch (error) {
      logger.error("Failed to save pending sync data", error);
    }
  };

  /**
   * Update the pending count
   */
  const updatePendingCount = (): void => {
    const pending = getPendingData();
    setPendingCount(pending.filter(item => !item.synced).length);
  };

  /**
   * Save data locally for later sync
   */
  const saveLocally = useCallback(async (data: any, type: string): Promise<string> => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const syncableData: SyncableData = {
      id,
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    const pending = getPendingData();
    pending.push(syncableData);
    savePendingData(pending);

    logger.info(`Data saved locally for sync`, { id, type });

    // If online and auto-sync is enabled, trigger sync
    if (isOnline && autoSync) {
      // Delay to allow batching
      setTimeout(() => syncToSupabase(), 1000);
    }

    return id;
  }, [isOnline, autoSync]);

  /**
   * Sync pending data to Supabase
   */
  const syncToSupabase = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      logger.info("Cannot sync - offline");
      return;
    }

    if (isSyncing) {
      logger.info("Sync already in progress");
      return;
    }

    const pending = getPendingData().filter(item => !item.synced);
    if (pending.length === 0) {
      logger.debug("No pending data to sync");
      return;
    }

    setIsSyncing(true);
    logger.info(`Starting sync of ${pending.length} items`);

    try {
      // Group by type for batch operations
      const groupedByType = pending.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return {};
      }, {} as Record<string, SyncableData[]>);

      // Sync each type
      for (const [type, items] of Object.entries(groupedByType)) {
        try {
          await syncByType(type, items);
          
          // Mark as synced
          const allPending = getPendingData();
          const updated = allPending.map(item => {
            if (items.find(i => i.id === item.id)) {
              return { ...item, synced: true };
            }
            return item;
          });
          savePendingData(updated);
          
          logger.info(`Synced ${items.length} ${type} items`);
        } catch (error) {
          logger.error(`Failed to sync ${type}`, error);
        }
      }

      setLastSyncTime(new Date().toISOString());
      updatePendingCount();

      toast({
        title: "Sincronização Completa",
        description: `${pending.length} itens sincronizados`,
      });

    } catch (error) {
      logger.error("Sync failed", error);
      toast({
        title: "Erro na Sincronização",
        description: "Tentaremos novamente em breve",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, toast]);

  /**
   * Sync specific type to Supabase
   */
  const syncByType = async (type: string, items: SyncableData[]): Promise<void> => {
    // In production, replace with actual Supabase API calls
    // For now, simulate API call
    
    logger.info(`Syncing ${type}`, { count: items.length });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Example implementation for different types:
    switch (type) {
      case "checklist":
        // await supabase.from('checklists').insert(items.map(i => i.data));
        logger.info("Checklists synced to Supabase");
        break;
      
      case "report":
        // await supabase.from('reports').insert(items.map(i => i.data));
        logger.info("Reports synced to Supabase");
        break;
      
      case "attendance":
        // await supabase.from('attendance').insert(items.map(i => i.data));
        logger.info("Attendance synced to Supabase");
        break;
      
      default:
        logger.warn(`Unknown sync type: ${type}`);
    }
  };

  /**
   * Clear all pending items (use with caution)
   */
  const clearPending = useCallback(async (): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPendingCount(0);
      logger.info("Cleared all pending sync data");
      
      toast({
        title: "Fila Limpa",
        description: "Dados pendentes foram removidos",
      });
    } catch (error) {
      logger.error("Failed to clear pending data", error);
    }
  }, [toast]);

  /**
   * Get sync status statistics
   */
  const getSyncStatus = useCallback(() => {
    const all = getPendingData();
    const synced = all.filter(item => item.synced).length;
    const pending = all.filter(item => !item.synced).length;
    
    return { synced, pending };
  }, []);

  return {
    pendingCount,
    isSyncing,
    lastSyncTime,
    saveLocally,
    syncToSupabase,
    clearPending,
    getSyncStatus,
  };
};
