/**
 * PATCH 178.0 - Unified Network Hook
 * Fusão de: use-network-status.ts, useNetworkStatus.ts, use-connection-aware.ts, useConnectionAdaptive.ts
 * 
 * Provides comprehensive network status, connection quality, and adaptive settings
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { syncEngine } from "@/lib/syncEngine";
import { logger } from "@/lib/logger";

// =============================================================================
// TYPES
// =============================================================================

export type ConnectionQuality = "fast" | "medium" | "slow" | "offline";

export interface NetworkStatus {
  // Core status
  online: boolean;
  isOnline: boolean; // Alias for compatibility
  wasOffline: boolean;
  pendingChanges: number;
  
  // Connection quality
  quality: ConnectionQuality;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

export interface AdaptiveSettings {
  imageQuality: number;
  pageSize: number;
  enableAnimations: boolean;
  enablePrefetch: boolean;
  refreshInterval: number;
  enableRealtime: boolean;
  debounceMs: number;
}

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

function getConnection(): NetworkConnection | null {
  if (typeof navigator !== "undefined") {
    return (navigator as any).connection || 
           (navigator as any).mozConnection || 
           (navigator as any).webkitConnection || 
           null;
  }
  return null;
}

function getConnectionQuality(connection: NetworkConnection | null): ConnectionQuality {
  if (!navigator.onLine) return "offline";
  if (!connection) return "medium";
  
  const { effectiveType, downlink, rtt } = connection;
  
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (effectiveType === "3g") return "medium";
  if (effectiveType === "4g") return "fast";
  
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

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Unified network status hook
 * Combines all network-related functionality into a single hook
 */
export function useNetwork(): NetworkStatus & { 
  adaptiveSettings: AdaptiveSettings;
  shouldReduceData: boolean;
  isSlow: boolean;
  isFast: boolean;
} {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const connection = getConnection();
    const quality = getConnectionQuality(connection);
    return {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      wasOffline: false,
      pendingChanges: 0,
      quality,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false,
    };
  });

  // Update pending changes count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await syncEngine.getPendingCount();
      setStatus(prev => ({ ...prev, pendingChanges: count }));
    } catch (error) {
      // Sync engine might not be initialized
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
    const connection = getConnection();

    const updateStatus = () => {
      const conn = getConnection();
      const quality = getConnectionQuality(conn);
      setStatus(prev => ({
        ...prev,
        online: navigator.onLine,
        isOnline: navigator.onLine,
        wasOffline: prev.wasOffline || !prev.online,
        quality,
        effectiveType: conn?.effectiveType || null,
        downlink: conn?.downlink || null,
        rtt: conn?.rtt || null,
        saveData: conn?.saveData || false,
      }));
    };

    const handleOnline = async () => {
      logger.info("Network: Online");
      updateStatus();
      await updatePendingCount();
    };

    const handleOffline = () => {
      logger.info("Network: Offline");
      updateStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    if (connection?.addEventListener) {
      connection.addEventListener("change", updateStatus);
    }

    // Listen for sync progress
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = syncEngine.onSyncProgress((stats) => {
        setStatus(prev => ({ ...prev, pendingChanges: stats.pending }));
      });
    } catch (error) {
      // Sync engine might not be available
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      
      if (connection?.removeEventListener) {
        connection.removeEventListener("change", updateStatus);
      }
      
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [updatePendingCount]);

  // Adaptive settings based on connection quality
  const adaptiveSettings = useMemo((): AdaptiveSettings => {
    const { quality, saveData } = status;
    return {
      imageQuality: quality === "slow" || saveData ? 50 : quality === "medium" ? 75 : 90,
      pageSize: quality === "slow" || saveData ? 10 : quality === "medium" ? 25 : 50,
      enableAnimations: quality !== "slow" && !saveData,
      enablePrefetch: quality === "fast" && !saveData,
      refreshInterval: quality === "slow" ? 60000 : quality === "medium" ? 30000 : 15000,
      enableRealtime: quality !== "slow" && !saveData,
      debounceMs: quality === "slow" ? 500 : quality === "medium" ? 300 : 150,
    };
  }, [status.quality, status.saveData]);

  return {
    ...status,
    adaptiveSettings,
    shouldReduceData: status.quality === "slow" || status.quality === "offline" || status.saveData,
    isSlow: status.quality === "slow" || status.quality === "offline",
    isFast: status.quality === "fast",
  };
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Simple hook that returns only if we should use light mode
 */
export function useLightMode(): boolean {
  const { quality, saveData } = useNetwork();
  return quality === "slow" || quality === "offline" || saveData;
}

/**
 * Hook for adaptive debounce based on connection
 */
export function useAdaptiveDebounce(): number {
  const { adaptiveSettings } = useNetwork();
  return adaptiveSettings.debounceMs;
}

/**
 * Hook that returns adaptive settings based on network quality
 */
export function useAdaptiveSettings(): AdaptiveSettings {
  const { adaptiveSettings } = useNetwork();
  return adaptiveSettings;
}

/**
 * Hook that returns connection quality
 */
export function useConnectionQuality(): ConnectionQuality {
  const { quality } = useNetwork();
  return quality;
}

/**
 * Hook for adaptive polling with connection awareness
 */
export function useAdaptivePolling(
  callback: () => void | Promise<void>,
  baseInterval: number,
  enabled: boolean = true
) {
  const { online, quality } = useNetwork();

  useEffect(() => {
    if (!enabled || !online) return;

    // Adjust interval based on quality
    const multiplier = quality === "slow" ? 3 : quality === "medium" ? 1.5 : 1;
    const interval = Math.round(baseInterval * multiplier);
    
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, baseInterval, enabled, online, quality]);
}

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================

/** @deprecated Use useNetwork instead */
export const useNetworkStatus = useNetwork;

/** @deprecated Use useNetwork instead */
export const useConnectionAware = useNetwork;

/** @deprecated Use useNetwork instead */
export const useConnectionAdaptive = () => {
  const network = useNetwork();
  return {
    quality: network.quality,
    isOnline: network.online,
    isSlow: network.isSlow,
    isModerate: network.quality === "medium",
    isFast: network.isFast,
    saveData: network.saveData,
    recommendations: network.adaptiveSettings,
    shouldLoadHeavyResources: network.isFast && !network.saveData,
    effectiveType: network.effectiveType,
    downlink: network.downlink,
    rtt: network.rtt,
  };
};

export default useNetwork;
