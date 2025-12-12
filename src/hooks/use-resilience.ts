/**
 * useResilience Hook - PATCH 900
 * Comprehensive resilience status and utilities
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useConnectionResilience } from "./use-connection-resilience";
import { 
  circuitBreakerRegistry, 
  type CircuitStats 
} from "@/lib/offline/circuit-breaker";
import { 
  storageMonitor, 
  type StorageQuota,
  isStorageLow,
  clearOldCaches,
} from "@/lib/offline/storage-quota";
import { 
  offlineSyncManager, 
  type SyncStats 
} from "@/lib/offline/sync-manager";

export interface ResilienceStatus {
  // Connection
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  
  // Storage
  storageQuota: StorageQuota | null;
  isStorageLow: boolean;
  
  // Circuits
  circuits: Record<string, CircuitStats>;
  hasOpenCircuit: boolean;
  
  // Sync
  pendingSync: number;
  isSyncing: boolean;
  
  // Overall health
  healthScore: number;
  healthStatus: "healthy" | "degraded" | "critical";
}

export function useResilience() {
  const connection = useConnectionResilience();
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null);
  const [circuits, setCircuits] = useState<Record<string, CircuitStats>>({});
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalQueued: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor storage
  useEffect(() => {
    storageMonitor.start(30000);
    const unsubscribe = storageMonitor.subscribe(setStorageQuota);
    
    return () => {
      storageMonitor.stop();
      unsubscribe();
    };
  }, []);

  // Monitor circuits
  useEffect(() => {
    const updateCircuits = () => {
      setCircuits(circuitBreakerRegistry.getAllStats());
    };

    updateCircuits();
    const interval = setInterval(updateCircuits, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Monitor sync
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = offlineSyncManager.getStats();
      setSyncStats(stats);
      setIsSyncing(offlineSyncManager.getNetworkStatus().isSyncing);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate overall health
  const healthScore = useMemo(() => {
    let score = 100;
    
    // Connection impact
    if (!connection.isOnline) score -= 30;
    else if (connection.isSlowConnection) score -= 15;
    
    // Storage impact
    if (storageQuota) {
      if (storageQuota.usagePercent > 90) score -= 20;
      else if (storageQuota.usagePercent > 80) score -= 10;
    }
    
    // Circuit breaker impact
    const openCircuits = Object.values(circuits).filter(c => c.state === "open").length;
    const halfOpenCircuits = Object.values(circuits).filter(c => c.state === "half-open").length;
    score -= openCircuits * 15;
    score -= halfOpenCircuits * 5;
    
    // Pending sync impact
    if (syncStats.pending > 20) score -= 10;
    else if (syncStats.pending > 10) score -= 5;
    
    // Failed sync impact
    if (syncStats.failed > 0) score -= syncStats.failed * 5;
    
    return Math.max(0, Math.min(100, score));
  }, [connection, storageQuota, circuits, syncStats]);

  const healthStatus = useMemo((): "healthy" | "degraded" | "critical" => {
    if (healthScore >= 80) return "healthy";
    if (healthScore >= 50) return "degraded";
    return "critical";
  }, [healthScore]);

  const hasOpenCircuit = useMemo(() => {
    return Object.values(circuits).some(c => c.state === "open");
  }, [circuits]);

  const isLowStorage = useMemo(() => {
    return storageQuota ? storageQuota.usagePercent > 80 : false;
  }, [storageQuota]);

  // Actions
  const clearStorage = useCallback(async () => {
    await clearOldCaches(2);
    await storageMonitor.checkNow();
  }, []);

  const forceSyncNow = useCallback(async () => {
    if (connection.isOnline && !isSyncing) {
      await offlineSyncManager.syncAll();
    }
  }, [connection.isOnline, isSyncing]);

  const resetCircuits = useCallback(() => {
    circuitBreakerRegistry.resetAll();
  }, []);

  return {
    // Status
    status: {
      isOnline: connection.isOnline,
      isSlowConnection: connection.isSlowConnection,
      connectionType: connection.adaptiveSettings ? "adaptive" : "unknown",
      storageQuota,
      isStorageLow: isLowStorage,
      circuits,
      hasOpenCircuit,
      pendingSync: syncStats.pending,
      isSyncing,
      healthScore,
      healthStatus,
    } as ResilienceStatus,
    
    // Connection details
    connection,
    
    // Actions
    actions: {
      clearStorage,
      forceSyncNow,
      resetCircuits,
    },
  };
}

/**
 * Simple hook for health indicator
 */
export function useHealthStatus() {
  const { status } = useResilience();
  
  return {
    score: status.healthScore,
    status: status.healthStatus,
    isOnline: status.isOnline,
    pendingSync: status.pendingSync,
  };
}
