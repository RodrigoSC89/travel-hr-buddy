/**
 * PATCH 180.0 - Slow Network Optimizer
 * Automatic optimizations for connections < 2 Mbps
 */

import { ReactNode, createContext, useContext, useEffect, useState } from "react";;;
import { logger } from "@/lib/logger";

// ===== Types =====

interface NetworkQuality {
  effectiveType: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  downlink: number; // Mbps
  rtt: number; // Round-trip time in ms
  saveData: boolean;
}

interface NetworkOptimizations {
  /** Reduce image quality */
  reduceImageQuality: boolean;
  /** Disable animations */
  disableAnimations: boolean;
  /** Use skeleton loaders instead of spinners */
  useSkeletons: boolean;
  /** Limit concurrent requests */
  maxConcurrentRequests: number;
  /** Defer non-critical resources */
  deferNonCritical: boolean;
  /** Use compressed assets */
  useCompressedAssets: boolean;
  /** Pagination size */
  pageSize: number;
  /** Prefetch enabled */
  enablePrefetch: boolean;
  /** Cache duration multiplier */
  cacheDurationMultiplier: number;
}

interface SlowNetworkContextValue {
  quality: NetworkQuality;
  optimizations: NetworkOptimizations;
  isSlowNetwork: boolean;
  isCriticallySlowNetwork: boolean;
}

// ===== Constants =====

const DEFAULT_QUALITY: NetworkQuality = {
  effectiveType: "unknown",
  downlink: 10,
  rtt: 50,
  saveData: false,
};

const FAST_NETWORK_OPTS: NetworkOptimizations = {
  reduceImageQuality: false,
  disableAnimations: false,
  useSkeletons: true,
  maxConcurrentRequests: 6,
  deferNonCritical: false,
  useCompressedAssets: false,
  pageSize: 20,
  enablePrefetch: true,
  cacheDurationMultiplier: 1,
};

const SLOW_NETWORK_OPTS: NetworkOptimizations = {
  reduceImageQuality: true,
  disableAnimations: true,
  useSkeletons: true,
  maxConcurrentRequests: 2,
  deferNonCritical: true,
  useCompressedAssets: true,
  pageSize: 10,
  enablePrefetch: false,
  cacheDurationMultiplier: 3,
};

const CRITICAL_NETWORK_OPTS: NetworkOptimizations = {
  reduceImageQuality: true,
  disableAnimations: true,
  useSkeletons: true,
  maxConcurrentRequests: 1,
  deferNonCritical: true,
  useCompressedAssets: true,
  pageSize: 5,
  enablePrefetch: false,
  cacheDurationMultiplier: 5,
};

// ===== Context =====

const SlowNetworkContext = createContext<SlowNetworkContextValue>({
  quality: DEFAULT_QUALITY,
  optimizations: FAST_NETWORK_OPTS,
  isSlowNetwork: false,
  isCriticallySlowNetwork: false,
});

export const useSlowNetwork = () => useContext(SlowNetworkContext);

// ===== Provider =====

interface SlowNetworkProviderProps {
  children: ReactNode;
}

export function SlowNetworkProvider({ children }: SlowNetworkProviderProps) {
  const [quality, setQuality] = useState<NetworkQuality>(DEFAULT_QUALITY);
  const [optimizations, setOptimizations] = useState<NetworkOptimizations>(FAST_NETWORK_OPTS);

  useEffect(() => {
    const updateNetworkInfo = () => {
      const nav = navigator as Navigator & {
        connection?: {
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
          saveData?: boolean;
        };
      };

      if (nav.connection) {
        const newQuality: NetworkQuality = {
          effectiveType: (nav.connection.effectiveType as NetworkQuality["effectiveType"]) || "unknown",
          downlink: nav.connection.downlink || 10,
          rtt: nav.connection.rtt || 50,
          saveData: nav.connection.saveData || false,
        };

        setQuality(newQuality);

        // Determine optimizations based on connection
        const isSlowNetwork = newQuality.downlink < 2 || 
                             ["2g", "slow-2g"].includes(newQuality.effectiveType);
        const isCriticallySlowNetwork = newQuality.downlink < 0.5 || 
                                        newQuality.effectiveType === "slow-2g";

        if (isCriticallySlowNetwork) {
          setOptimizations(CRITICAL_NETWORK_OPTS);
          logger.warn("[SlowNetwork] Critical slow network detected", newQuality);
        } else if (isSlowNetwork || newQuality.saveData) {
          setOptimizations(SLOW_NETWORK_OPTS);
          logger.info("[SlowNetwork] Slow network detected, applying optimizations", newQuality);
        } else {
          setOptimizations(FAST_NETWORK_OPTS);
        }

        // Apply CSS optimizations
        document.documentElement.classList.toggle("reduce-motion", isSlowNetwork);
        document.documentElement.classList.toggle("slow-network", isSlowNetwork);
        document.documentElement.classList.toggle("critical-network", isCriticallySlowNetwork);
      }
    };

    // Initial check
    updateNetworkInfo();

    // Listen for connection changes
    const nav = navigator as Navigator & {
      connection?: EventTarget;
    };

    if (nav.connection) {
      nav.connection.addEventListener("change", updateNetworkInfo);
      return () => nav.connection?.removeEventListener("change", updateNetworkInfo);
    }
  }, []);

  const isSlowNetwork = quality.downlink < 2 || ["2g", "slow-2g", "3g"].includes(quality.effectiveType);
  const isCriticallySlowNetwork = quality.downlink < 0.5 || quality.effectiveType === "slow-2g";

  return (
    <SlowNetworkContext.Provider value={{ 
      quality, 
      optimizations, 
      isSlowNetwork,
      isCriticallySlowNetwork 
    }}>
      {children}
    </SlowNetworkContext.Provider>
  );
}

// ===== Components =====

/**
 * Conditionally render based on network speed
 */
export function NetworkAware({ 
  children, 
  fallback,
  minSpeed = 2, // Minimum Mbps to show full content
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
  minSpeed?: number;
}) {
  const { quality } = useSlowNetwork();

  if (quality.downlink < minSpeed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Defer loading on slow networks
 */
export function DeferOnSlowNetwork({ 
  children,
  delay = 2000,
}: { 
  children: ReactNode;
  delay?: number;
}) {
  const { isSlowNetwork } = useSlowNetwork();
  const [shouldRender, setShouldRender] = useState(!isSlowNetwork);

  useEffect(() => {
    if (isSlowNetwork) {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isSlowNetwork, delay]);

  if (!shouldRender) return null;

  return <>{children}</>;
}

/**
 * Network status indicator
 */
export function NetworkStatusBadge() {
  const { quality, isSlowNetwork, isCriticallySlowNetwork } = useSlowNetwork();

  if (!isSlowNetwork) return null;

  return (
    <div className={`
      fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-full text-xs font-medium
      ${isCriticallySlowNetwork 
      ? "bg-destructive/90 text-destructive-foreground" 
      : "bg-warning/90 text-warning-foreground"}
      backdrop-blur-sm shadow-lg
    `}>
      {isCriticallySlowNetwork ? "⚠️ Conexão muito lenta" : "📶 Conexão lenta"} 
      ({quality.downlink.toFixed(1)} Mbps)
    </div>
  );
}
