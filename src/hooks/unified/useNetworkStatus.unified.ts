/**
 * UNIFIED NETWORK STATUS HOOK
 * Fusão de: use-network-status.ts + useNetworkStatus.ts
 * 
 * Combina:
 * - Detecção de qualidade de conexão (use-network-status.ts)
 * - Sincronização e pending changes (useNetworkStatus.ts)
 */

import { useState, useEffect, useCallback } from "react";
import { syncEngine } from "@/lib/syncEngine";
import { logger } from "@/lib/logger";

// ============================================
// TYPES
// ============================================

export type ConnectionQuality = "fast" | "medium" | "slow" | "offline";

export interface NetworkStatus {
  // Basic connectivity
  online: boolean;
  isOnline: boolean; // Alias for backward compatibility
  
  // Quality metrics
  quality: ConnectionQuality;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
  
  // Sync status
  wasOffline: boolean;
  pendingChanges: number;
}

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

// ============================================
// HELPERS
// ============================================

function getConnectionQuality(connection: NetworkConnection | null): ConnectionQuality {
  if (!navigator.onLine) return "offline";
  if (!connection) return "medium";
  
  const { effectiveType, downlink, rtt } = connection;
  
  // Check effective type first
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (effectiveType === "3g") return "medium";
  if (effectiveType === "4g") return "fast";
  
  // Fallback to speed metrics
  if (downlink !== undefined) {
    if (downlink < 0.5) return "slow";
    if (downlink < 2) return "medium";
    return "fast";
  }
  
  if (rtt !== undefined) {
    if (rtt > 500) return "slow";
    if (rtt > 200) return "medium";
    return "fast";
  }
  
  return "medium";
}

function getConnection(): NetworkConnection | null {
  if (typeof navigator !== "undefined") {
    return (navigator as any).connection || 
           (navigator as any).mozConnection || 
           (navigator as any).webkitConnection || 
           null;
  }
  return null;
}

// ============================================
// MAIN HOOK
// ============================================

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const connection = getConnection();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    
    return {
      online: isOnline,
      isOnline: isOnline,
      quality: getConnectionQuality(connection),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false,
      wasOffline: false,
      pendingChanges: 0,
    };
  });

  useEffect(() => {
    const connection = getConnection();

    // Update pending changes count
    const updatePendingCount = async () => {
      try {
        const count = await syncEngine.getPendingCount();
        setStatus(prev => ({ ...prev, pendingChanges: count }));
      } catch {
        // Sync engine might not be available
      }
    };

    updatePendingCount();

    const updateStatus = async () => {
      const conn = getConnection();
      const isOnline = navigator.onLine;
      const quality = getConnectionQuality(conn);
      
      logger.info(`Network: ${isOnline ? "Online" : "Offline"} (${quality})`);
      
      setStatus(prev => ({
        online: isOnline,
        isOnline: isOnline,
        quality,
        effectiveType: conn?.effectiveType || null,
        downlink: conn?.downlink || null,
        rtt: conn?.rtt || null,
        saveData: conn?.saveData || false,
        wasOffline: prev.wasOffline || !isOnline,
        pendingChanges: prev.pendingChanges,
      }));
      
      if (isOnline) {
        await updatePendingCount();
      }
    };

    // Event listeners
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    
    if (connection?.addEventListener) {
      connection.addEventListener("change", updateStatus);
    }

    // Listen for sync progress
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = syncEngine.onSyncProgress((stats) => {
        setStatus(prev => ({
          ...prev,
          pendingChanges: stats.pending
        }));
      });
    } catch {
      // Sync engine might not be available
    }

    // Periodic check
    const interval = setInterval(updatePendingCount, 3000);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      
      if (connection?.removeEventListener) {
        connection.removeEventListener("change", updateStatus);
      }
      
      unsubscribe?.();
      clearInterval(interval);
    };
  }, []);

  return status;
}

// ============================================
// ADAPTIVE SETTINGS HOOK
// ============================================

export interface AdaptiveSettings {
  imageQuality: number;
  pageSize: number;
  enableAnimations: boolean;
  enablePrefetch: boolean;
  refreshInterval: number;
  enableRealtime: boolean;
}

export function useAdaptiveSettings(): AdaptiveSettings {
  const { quality, saveData } = useNetworkStatus();
  
  return {
    imageQuality: quality === "slow" || saveData ? 50 : quality === "medium" ? 75 : 90,
    pageSize: quality === "slow" || saveData ? 10 : quality === "medium" ? 25 : 50,
    enableAnimations: quality !== "slow" && !saveData,
    enablePrefetch: quality === "fast" && !saveData,
    refreshInterval: quality === "slow" ? 60000 : quality === "medium" ? 30000 : 15000,
    enableRealtime: quality !== "slow" && !saveData,
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Simple boolean hook for online status
 */
export function useOnlineStatus(): boolean {
  const { online } = useNetworkStatus();
  return online;
}

/**
 * Hook for connection quality only
 */
export function useConnectionQuality(): ConnectionQuality {
  const { quality } = useNetworkStatus();
  return quality;
}

export default useNetworkStatus;
