/**
 * PATCH 190.0 - Offline Data Provider
 * 
 * React context for offline-first data access
 * Provides unified interface for online/offline operations
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { enhancedSyncEngine } from "../services/enhanced-sync-engine";
import { sqliteStorage } from "../services/sqlite-storage";
import { networkDetector } from "../services/networkDetector";
import { supabase } from "@/integrations/supabase/client";

interface OfflineDataContextType {
  // Status
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  lastSync: Date | null;
  
  // Data operations
  getData: <T>(table: string, id: string) => Promise<T | null>;
  getAllData: <T>(table: string) => Promise<T[]>;
  saveData: (table: string, data: Record<string, any>, priority?: "high" | "medium" | "low") => Promise<void>;
  deleteData: (table: string, id: string) => Promise<void>;
  
  // Sync operations
  syncNow: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

const OfflineDataContext = createContext<OfflineDataContextType | null>(null);

interface OfflineDataProviderProps {
  children: ReactNode;
}

export function OfflineDataProvider({ children }: OfflineDataProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await sqliteStorage.initialize();
      await enhancedSyncEngine.initialize();
      
      // Update pending count
      const count = await sqliteStorage.getQueueCount();
      setPendingChanges(count);
    };
    
    init();

    // Listen to network changes
    const unsubNetwork = networkDetector.addListener((online) => {
      setIsOnline(online);
    });

    // Listen to sync status changes
    const unsubSync = enhancedSyncEngine.addStatusListener((status) => {
      setPendingChanges(status.pendingChanges);
      setLastSync(status.lastSync);
    });

    return () => {
      unsubNetwork();
      unsubSync();
    };
  }, []);

  /**
   * Get single record (offline-first)
   */
  const getData = useCallback(async <T,>(table: string, id: string): Promise<T | null> => {
    // Try local cache first
    const cached = await sqliteStorage.getCached(table, id);
    if (cached) return cached as T;

    // If online, fetch from server and cache
    if (isOnline) {
      try {
        const { data, error } = await (supabase as any)
          .from(table)
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          await sqliteStorage.upsertLocal(table, data);
          return data as T;
        }
      } catch (e) {
        console.error("Failed to fetch from server:", e);
      }
    }

    return null;
  }, [isOnline]);

  /**
   * Get all records for a table (offline-first)
   */
  const getAllData = useCallback(async <T,>(table: string): Promise<T[]> => {
    // Try local cache first
    const cached = await sqliteStorage.getAllCached(table);
    
    // If online and cache is empty, fetch from server
    if (cached.length === 0 && isOnline) {
      try {
        const { data, error } = await (supabase as any)
          .from(table)
          .select("*")
          .limit(500);

        if (!error && data) {
          await sqliteStorage.cacheBulk(table, data);
          return data as T[];
        }
      } catch (e) {
        console.error("Failed to fetch from server:", e);
      }
    }

    return cached as T[];
  }, [isOnline]);

  /**
   * Save data (offline-first with sync queue)
   */
  const saveData = useCallback(async (
    table: string,
    data: Record<string, any>,
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<void> => {
    const action = data.id ? "update" : "create";
    const record = data.id ? data : { ...data, id: crypto.randomUUID() };

    // Save to local cache immediately
    await sqliteStorage.upsertLocal(table, record);

    // Queue for sync
    await sqliteStorage.save(table, record, action, priority);
    
    // Update pending count
    const count = await sqliteStorage.getQueueCount();
    setPendingChanges(count);

    // Try to sync if online
    if (isOnline) {
      try {
        await enhancedSyncEngine.forceSync();
      } catch (e) {
        console.log("Sync queued for later:", e);
      }
    }
  }, [isOnline]);

  /**
   * Delete data (offline-first)
   */
  const deleteData = useCallback(async (table: string, id: string): Promise<void> => {
    // Remove from local cache
    await sqliteStorage.deleteLocal(table, id);

    // Queue delete for sync
    await sqliteStorage.save(table, { id }, "delete", "high");
    
    // Update pending count
    const count = await sqliteStorage.getQueueCount();
    setPendingChanges(count);

    // Try to sync if online
    if (isOnline) {
      try {
        await enhancedSyncEngine.forceSync();
      } catch (e) {
        console.log("Delete queued for later:", e);
      }
    }
  }, [isOnline]);

  /**
   * Force sync now
   */
  const syncNow = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      throw new Error("Cannot sync while offline");
    }

    setIsSyncing(true);
    try {
      await enhancedSyncEngine.forceSync();
      const count = await sqliteStorage.getQueueCount();
      setPendingChanges(count);
      setLastSync(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  /**
   * Clear all offline data
   */
  const clearOfflineData = useCallback(async (): Promise<void> => {
    await sqliteStorage.clearAll();
    setPendingChanges(0);
  }, []);

  const value: OfflineDataContextType = {
    isOnline,
    isSyncing,
    pendingChanges,
    lastSync,
    getData,
    getAllData,
    saveData,
    deleteData,
    syncNow,
    clearOfflineData,
  };

  return (
    <OfflineDataContext.Provider value={value}>
      {children}
    </OfflineDataContext.Provider>
  );
}

/**
 * Hook to access offline data context
 */
export function useOfflineData(): OfflineDataContextType {
  const context = useContext(OfflineDataContext);
  if (!context) {
    throw new Error("useOfflineData must be used within OfflineDataProvider");
  }
  return context;
}

/**
 * Hook for table-specific offline data
 */
export function useOfflineTable<T extends { id?: string }>(tableName: string) {
  const { getData, getAllData, saveData, deleteData, isOnline, pendingChanges } = useOfflineData();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getAllData<T>(tableName);
        setData(result);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tableName, getAllData]);

  const save = useCallback(async (item: T) => {
    await saveData(tableName, item);
    // Refresh data
    const result = await getAllData<T>(tableName);
    setData(result);
  }, [tableName, saveData, getAllData]);

  const remove = useCallback(async (id: string) => {
    await deleteData(tableName, id);
    // Refresh data
    const result = await getAllData<T>(tableName);
    setData(result);
  }, [tableName, deleteData, getAllData]);

  const getById = useCallback(async (id: string): Promise<T | null> => {
    return getData<T>(tableName, id);
  }, [tableName, getData]);

  return {
    data,
    loading,
    error,
    isOnline,
    pendingChanges,
    save,
    remove,
    getById,
    refresh: async () => {
      const result = await getAllData<T>(tableName);
      setData(result);
    },
  };
}
