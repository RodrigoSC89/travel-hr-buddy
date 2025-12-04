/**
 * PATCH 800: Network Status Hook for Adaptive Loading
 * Detects connection quality and adjusts behavior accordingly
 */
import { useState, useEffect, useCallback } from "react";

export type ConnectionQuality = "fast" | "medium" | "slow" | "offline";

interface NetworkStatus {
  online: boolean;
  quality: ConnectionQuality;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

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

export function useNetworkStatus(): NetworkStatus {
  const getConnection = useCallback((): NetworkConnection | null => {
    if (typeof navigator !== "undefined") {
      return (navigator as any).connection || 
             (navigator as any).mozConnection || 
             (navigator as any).webkitConnection || 
             null;
    }
    return null;
  }, []);

  const [status, setStatus] = useState<NetworkStatus>(() => {
    const connection = getConnection();
    return {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      quality: getConnectionQuality(connection),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false,
    };
  });

  useEffect(() => {
    const connection = getConnection();

    const updateStatus = () => {
      const conn = getConnection();
      setStatus({
        online: navigator.onLine,
        quality: getConnectionQuality(conn),
        effectiveType: conn?.effectiveType || null,
        downlink: conn?.downlink || null,
        rtt: conn?.rtt || null,
        saveData: conn?.saveData || false,
      });
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    
    if (connection?.addEventListener) {
      connection.addEventListener("change", updateStatus);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      
      if (connection?.removeEventListener) {
        connection.removeEventListener("change", updateStatus);
      }
    };
  }, [getConnection]);

  return status;
}

/**
 * Returns recommended settings based on network quality
 */
export function useAdaptiveSettings() {
  const { quality, saveData } = useNetworkStatus();
  
  return {
    // Image quality (1-100)
    imageQuality: quality === "slow" || saveData ? 50 : quality === "medium" ? 75 : 90,
    // Page size for lists
    pageSize: quality === "slow" || saveData ? 10 : quality === "medium" ? 25 : 50,
    // Enable animations
    enableAnimations: quality !== "slow" && !saveData,
    // Prefetch data
    enablePrefetch: quality === "fast" && !saveData,
    // Auto-refresh interval (ms)
    refreshInterval: quality === "slow" ? 60000 : quality === "medium" ? 30000 : 15000,
    // Enable real-time updates
    enableRealtime: quality !== "slow" && !saveData,
  };
}
