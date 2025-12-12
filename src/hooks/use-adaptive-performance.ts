/**
 * Adaptive Performance Hook
 * Unified hook that combines all performance optimizations
 */

import { useMemo, useCallback, useEffect, useRef } from "react";
import { useNetworkStatus, useAdaptiveSettings, ConnectionQuality } from "./use-network-status";
import { memoryManager, getMemoryAwareSettings } from "@/lib/performance/memory-manager";

export interface PerformanceConfig {
  // Data fetching
  pageSize: number;
  staleTime: number;
  cacheTime: number;
  retryCount: number;
  retryDelay: number;
  
  // UI/UX
  enableAnimations: boolean;
  enableTransitions: boolean;
  imageQuality: number;
  
  // Real-time
  enableRealtime: boolean;
  realtimeThrottle: number;
  pollingInterval: number;
  
  // Prefetch
  enablePrefetch: boolean;
  prefetchDelay: number;
  
  // Memory
  virtualListOverscan: number;
  maxCacheItems: number;
  
  // Network
  quality: ConnectionQuality;
  isOnline: boolean;
  isSaveData: boolean;
}

/**
 * Get performance configuration based on network and device
 */
export function useAdaptivePerformance(): PerformanceConfig {
  const networkStatus = useNetworkStatus();
  const adaptiveSettings = useAdaptiveSettings();
  const memorySettings = getMemoryAwareSettings();

  return useMemo(() => {
    const { quality, online, saveData } = networkStatus;
    const isSlow = quality === "slow" || quality === "offline";
    const isMedium = quality === "medium";

    return {
      // Data fetching - adapt to network
      pageSize: isSlow ? 10 : isMedium ? 20 : 50,
      staleTime: isSlow ? 10 * 60 * 1000 : isMedium ? 5 * 60 * 1000 : 2 * 60 * 1000,
      cacheTime: isSlow ? 30 * 60 * 1000 : isMedium ? 15 * 60 * 1000 : 5 * 60 * 1000,
      retryCount: isSlow ? 1 : 3,
      retryDelay: isSlow ? 3000 : 1000,

      // UI/UX - reduce for slow connections and low memory
      enableAnimations: adaptiveSettings.enableAnimations && memorySettings.enableAnimations,
      enableTransitions: !isSlow && memorySettings.enableAnimations,
      imageQuality: Math.min(adaptiveSettings.imageQuality, memorySettings.imageQuality),

      // Real-time - throttle or disable for slow connections
      enableRealtime: online && adaptiveSettings.enableRealtime,
      realtimeThrottle: isSlow ? 5000 : isMedium ? 2000 : 500,
      pollingInterval: adaptiveSettings.refreshInterval,

      // Prefetch - disable for slow/save data
      enablePrefetch: adaptiveSettings.enablePrefetch && memorySettings.enablePrefetch,
      prefetchDelay: isSlow ? 5000 : 2000,

      // Memory - reduce for low memory
      virtualListOverscan: memorySettings.virtualListOverscan,
      maxCacheItems: memorySettings.cacheSize,

      // Network status
      quality,
      isOnline: online,
      isSaveData: saveData,
    };
  }, [networkStatus, adaptiveSettings, memorySettings]);
}

/**
 * Hook for throttled real-time updates based on network
 */
export function useThrottledRealtime<T>(
  callback: (data: T) => void,
  deps: React.DependencyList = []
) {
  const config = useAdaptivePerformance();
  const lastCallRef = useRef<number>(0);
  const pendingDataRef = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback((data: T) => {
    if (!config.enableRealtime) {
      // Store for when we come back online
      pendingDataRef.current = data;
      return;
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= config.realtimeThrottle) {
      lastCallRef.current = now;
      callback(data);
    } else {
      // Schedule for later
      pendingDataRef.current = data;
      
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (pendingDataRef.current) {
            lastCallRef.current = Date.now();
            callback(pendingDataRef.current);
            pendingDataRef.current = null;
          }
          timeoutRef.current = undefined;
        }, config.realtimeThrottle - timeSinceLastCall);
      }
    }
  }, [callback, config.enableRealtime, config.realtimeThrottle, ...deps]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Process pending data when coming back online
  useEffect(() => {
    if (config.isOnline && pendingDataRef.current) {
      callback(pendingDataRef.current);
      pendingDataRef.current = null;
    }
  }, [config.isOnline, callback]);

  return throttledCallback;
}

/**
 * Hook for adaptive polling based on network quality
 */
export function useAdaptivePolling(
  callback: () => void | Promise<void>,
  enabled: boolean = true
) {
  const config = useAdaptivePerformance();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !config.isOnline) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    // Initial call
    callback();

    // Setup polling
    intervalRef.current = setInterval(callback, config.pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, enabled, config.isOnline, config.pollingInterval]);
}

/**
 * Hook to check if features should be enabled
 */
export function useFeatureFlags() {
  const config = useAdaptivePerformance();

  return useMemo(() => ({
    // Heavy features disabled on slow connections
    enable3DVisualization: config.quality === "fast" && config.enableAnimations,
    enableVideoPlayback: config.quality !== "slow" && config.quality !== "offline",
    enableAutoRefresh: config.enableRealtime,
    enablePushNotifications: config.isOnline,
    enableBackgroundSync: config.isOnline,
    
    // UI features
    enableRichAnimations: config.enableAnimations && config.quality === "fast",
    enableParallax: config.enableAnimations && config.quality === "fast",
    enableBlurEffects: config.quality !== "slow",
    
    // Data features  
    enableInfiniteScroll: config.quality !== "offline",
    enableOptimisticUpdates: config.isOnline,
    enableDataPrefetch: config.enablePrefetch,
  }), [config]);
}

export default useAdaptivePerformance;
