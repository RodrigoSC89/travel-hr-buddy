/**
 * useConnectionSpeed Hook
 * PATCH 753 - Detecta velocidade de conexão para otimização adaptativa
 */

import { useState, useEffect, useCallback } from "react";

export type ConnectionQuality = "fast" | "moderate" | "slow" | "offline";

interface ConnectionInfo {
  quality: ConnectionQuality;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  isOnline: boolean;
}

// Network Information API types (without global declaration to avoid conflicts)
interface NetworkInformationType {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformationType;
  mozConnection?: NetworkInformationType;
  webkitConnection?: NetworkInformationType;
}

const getConnection = (): NetworkInformationType | undefined => {
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
};

const getQuality = (effectiveType: string, rtt: number): ConnectionQuality => {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";
  
  // Based on Network Information API
  if (effectiveType === "4g" && rtt < 100) return "fast";
  if (effectiveType === "4g" || effectiveType === "3g") return "moderate";
  if (effectiveType === "2g" || effectiveType === "slow-2g") return "slow";
  
  // Fallback based on RTT
  if (rtt < 100) return "fast";
  if (rtt < 300) return "moderate";
  return "slow";
};

export function useConnectionSpeed(): ConnectionInfo {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(() => ({
    quality: "moderate" as ConnectionQuality,
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
    saveData: false,
    isOnline: true,
  }));

  const updateConnectionInfo = useCallback(() => {
    const connection = getConnection();
    const effectiveType = connection?.effectiveType || "4g";
    const rtt = connection?.rtt || 50;
    
    setConnectionInfo({
      quality: getQuality(effectiveType, rtt),
      effectiveType,
      downlink: connection?.downlink || 10,
      rtt,
      saveData: connection?.saveData || false,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    });
  }, []);

  useEffect(() => {
    // Initialize on mount
    updateConnectionInfo();
    
    const connection = getConnection();
    
    // Listen for connection changes
    if (connection?.addEventListener) {
      connection.addEventListener("change", updateConnectionInfo);
    }
    
    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", updateConnectionInfo);
      window.addEventListener("offline", updateConnectionInfo);
    }
    
    return () => {
      if (connection?.removeEventListener) {
        connection.removeEventListener("change", updateConnectionInfo);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("online", updateConnectionInfo);
        window.removeEventListener("offline", updateConnectionInfo);
      }
    };
  }, [updateConnectionInfo]);

  return connectionInfo;
}

/**
 * Hook para otimizar comportamento baseado na conexão
 */
export function useAdaptiveLoading() {
  const connection = useConnectionSpeed();
  
  return {
    ...connection,
    // Configurações adaptativas
    shouldLazyLoadImages: connection.quality !== "fast",
    shouldReduceAnimations: connection.quality === "slow" || connection.saveData,
    shouldPreloadData: connection.quality === "fast",
    fetchTimeout: connection.quality === "slow" ? 15000 : connection.quality === "moderate" ? 10000 : 5000,
    imageQuality: connection.quality === "slow" ? "low" : connection.quality === "moderate" ? "medium" : "high",
    batchSize: connection.quality === "slow" ? 10 : connection.quality === "moderate" ? 25 : 50,
  };
}
