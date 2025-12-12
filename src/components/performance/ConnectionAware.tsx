/**
import { useCallback, useContext, useEffect, useState } from "react";;
 * Connection-Aware Components - PATCH 831
 * Adaptive UI based on network conditions
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react";

// Connection types
type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "offline";
type EffectiveType = "4g" | "3g" | "2g" | "slow-2g";

interface ConnectionInfo {
  isOnline: boolean;
  quality: ConnectionQuality;
  effectiveType?: EffectiveType;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface ConnectionContextValue extends ConnectionInfo {
  shouldReduceData: boolean;
  shouldDisableAnimations: boolean;
  shouldUseLowQuality: boolean;
  isSlowConnection: boolean;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

// Get connection info from Network Information API
function getConnectionInfo(): ConnectionInfo {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: EffectiveType;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const isOnline = navigator.onLine;
  const connection = nav.connection;

  if (!isOnline) {
    return { isOnline: false, quality: "offline" };
  }

  if (!connection) {
    return { isOnline: true, quality: "good" };
  }

  const { effectiveType, downlink, rtt, saveData } = connection;

  let quality: ConnectionQuality = "good";

  if (effectiveType === "4g" && (rtt === undefined || rtt < 100)) {
    quality = "excellent";
  } else if (effectiveType === "4g") {
    quality = rtt && rtt > 300 ? "fair" : "good";
  } else if (effectiveType === "3g") {
    quality = "fair";
  } else if (effectiveType === "2g" || effectiveType === "slow-2g") {
    quality = "poor";
  }

  return {
    isOnline,
    quality,
    effectiveType,
    downlink,
    rtt,
    saveData,
  };
}

// Provider component
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(getConnectionInfo);

  useEffect(() => {
    const updateConnection = () => {
      setConnectionInfo(getConnectionInfo());
    };

    // Listen for online/offline events
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    // Listen for connection changes
    const nav = navigator as Navigator & {
      connection?: {
        addEventListener: (event: string, handler: () => void) => void;
        removeEventListener: (event: string, handler: () => void) => void;
      };
    };

    if (nav.connection) {
      nav.connection.addEventListener("change", updateConnection);
    }

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      if (nav.connection) {
        nav.connection.removeEventListener("change", updateConnection);
      }
    };
  }, []);

  const value: ConnectionContextValue = {
    ...connectionInfo,
    shouldReduceData: connectionInfo.quality === "poor" || connectionInfo.saveData || false,
    shouldDisableAnimations: connectionInfo.quality === "poor" || connectionInfo.quality === "offline",
    shouldUseLowQuality: connectionInfo.quality !== "excellent" && connectionInfo.quality !== "good",
    isSlowConnection: connectionInfo.quality === "poor" || connectionInfo.quality === "fair",
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

// Hook to use connection info
export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    // Return default values if not wrapped in provider
    return {
      isOnline: navigator.onLine,
      quality: "good" as ConnectionQuality,
      shouldReduceData: false,
      shouldDisableAnimations: false,
      shouldUseLowQuality: false,
      isSlowConnection: false,
    };
  }
  return context;
}

// Connection status indicator component
export function ConnectionIndicator({ 
  className,
  showLabel = false,
  size = "sm",
}: { 
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const { isOnline, quality } = useConnection();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const iconClass = sizeClasses[size];

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className={cn(iconClass, "text-destructive")} />;
    }

    switch (quality) {
    case "excellent":
      return <SignalHigh className={cn(iconClass, "text-green-500")} />;
    case "good":
      return <SignalMedium className={cn(iconClass, "text-green-400")} />;
    case "fair":
      return <SignalLow className={cn(iconClass, "text-yellow-500")} />;
    case "poor":
      return <Signal className={cn(iconClass, "text-orange-500")} />;
    default:
      return <Wifi className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const getLabel = () => {
    if (!isOnline) return "Offline";
    switch (quality) {
    case "excellent": return "Excelente";
    case "good": return "Boa";
    case "fair": return "Regular";
    case "poor": return "Fraca";
    default: return "Conectado";
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {getIcon()}
      {showLabel && (
        <span className="text-xs text-muted-foreground">{getLabel()}</span>
      )}
    </div>
  );
}

// Offline banner component
export function OfflineBanner({ className }: { className?: string }) {
  const { isOnline } = useConnection();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300",
        isOnline 
          ? "bg-green-500 text-white" 
          : "bg-destructive text-destructive-foreground",
        className
      )}
    >
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <Wifi className="h-4 w-4" />
          Conexão restaurada
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          Você está offline. Algumas funcionalidades podem estar limitadas.
        </span>
      )}
    </div>
  );
}

// HOC for connection-aware components
export function withConnectionAware<P extends object>(
  Component: React.ComponentType<P & { connection: ConnectionContextValue }>,
  fallback?: React.ReactNode
) {
  return function ConnectionAwareComponent(props: P) {
    const connection = useConnection();

    if (!connection.isOnline && fallback) {
      return <>{fallback}</>;
    }

    return <Component {...props} connection={connection} />;
  };
}

// Conditional rendering based on connection
export function ConnectionConditional({
  children,
  fallback,
  minQuality = "poor",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  minQuality?: ConnectionQuality;
}) {
  const { quality, isOnline } = useConnection();

  const qualityOrder: ConnectionQuality[] = ["offline", "poor", "fair", "good", "excellent"];
  const currentIndex = qualityOrder.indexOf(quality);
  const minIndex = qualityOrder.indexOf(minQuality);

  if (!isOnline || currentIndex < minIndex) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// Hook for adaptive data fetching
export function useAdaptiveFetch<T>(
  fetchFn: () => Promise<T>,
  options: {
    cacheKey?: string;
    staleTime?: number;
    onOffline?: () => T | null;
  } = {}
) {
  const { isOnline, isSlowConnection } = useConnection();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!isOnline && options.onOffline) {
      const offlineData = options.onOffline();
      setData(offlineData);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, isOnline, options]);

  return {
    data,
    isLoading,
    error,
    fetch,
    isOnline,
    isSlowConnection,
  };
}
