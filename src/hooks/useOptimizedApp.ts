/**
 * useOptimizedApp Hook - PATCH 835
 * Unified hook for all app optimizations
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useBandwidthOptimizer } from '@/lib/performance/low-bandwidth-optimizer';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { memoryManager, shouldReduceMemory } from '@/lib/performance/memory-manager';
import { smartPrefetch } from '@/lib/performance/smart-prefetch';

export interface OptimizedAppConfig {
  shouldReduceAnimations: boolean;
  shouldReduceData: boolean;
  shouldLazyLoadImages: boolean;
  shouldPrefetch: boolean;
  imageQuality: number;
  batchSize: number;
  timeout: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  isLowMemory: boolean;
}

export function useOptimizedApp(): OptimizedAppConfig & {
  prefetchRoute: (route: string) => void;
  optimizedFetch: (url: string, options?: RequestInit) => Promise<Response>;
} {
  const { 
    connectionType, 
    isLowBandwidth, 
    imageQuality, 
    batchSize, 
    timeout,
    getOptimizedFetchOptions 
  } = useBandwidthOptimizer();
  
  const { quality: networkQuality, online } = useNetworkStatus();

  // Determine connection quality
  const connectionQuality = useMemo(() => {
    if (!online) return 'offline' as const;
    if (connectionType === '4g') return 'excellent' as const;
    if (connectionType === '3g') return 'good' as const;
    if (connectionType === '2g') return 'fair' as const;
    return 'poor' as const;
  }, [connectionType, online]);

  // Memory-aware optimizations
  const isLowMemory = useMemo(() => shouldReduceMemory(), []);

  // Combined optimization config
  const config = useMemo((): OptimizedAppConfig => ({
    shouldReduceAnimations: isLowBandwidth || isLowMemory || connectionQuality === 'poor',
    shouldReduceData: isLowBandwidth || connectionQuality === 'fair' || connectionQuality === 'poor',
    shouldLazyLoadImages: true,
    shouldPrefetch: connectionQuality === 'excellent' || connectionQuality === 'good',
    imageQuality,
    batchSize,
    timeout,
    connectionQuality,
    isLowMemory,
  }), [isLowBandwidth, isLowMemory, connectionQuality, imageQuality, batchSize, timeout]);

  // Prefetch route handler
  const prefetchRoute = useCallback((route: string) => {
    if (config.shouldPrefetch) {
      smartPrefetch.prefetchRoute(route);
    }
  }, [config.shouldPrefetch]);

  // Optimized fetch wrapper
  const optimizedFetch = useCallback(async (url: string, options?: RequestInit) => {
    const optimizedOptions = getOptimizedFetchOptions(options);
    return fetch(url, optimizedOptions);
  }, [getOptimizedFetchOptions]);

  // Apply global optimizations
  useEffect(() => {
    // Apply CSS classes for global optimizations
    const html = document.documentElement;
    
    if (config.shouldReduceAnimations) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    if (config.shouldReduceData) {
      html.classList.add('low-bandwidth');
    } else {
      html.classList.remove('low-bandwidth');
    }

    if (config.isLowMemory) {
      html.classList.add('low-memory');
    } else {
      html.classList.remove('low-memory');
    }
  }, [config]);

  return {
    ...config,
    prefetchRoute,
    optimizedFetch,
  };
}

/**
 * Hook for adaptive image loading
 */
export function useAdaptiveImage(originalSrc: string, width?: number) {
  const { imageQuality, isLowBandwidth, getOptimizedImageUrl } = useBandwidthOptimizer();
  
  return useMemo(() => {
    if (!originalSrc) return '';
    
    // Skip images in ultra-low bandwidth mode
    if (isLowBandwidth && !originalSrc.includes('avatar')) {
      return '';
    }
    
    return getOptimizedImageUrl(originalSrc, width);
  }, [originalSrc, width, imageQuality, isLowBandwidth, getOptimizedImageUrl]);
}

/**
 * Hook for adaptive polling
 */
export function useAdaptivePolling(
  callback: () => void | Promise<void>,
  baseInterval: number = 30000
) {
  const { connectionQuality } = useOptimizedApp();
  
  useEffect(() => {
    // Don't poll when offline
    if (connectionQuality === 'offline') return;
    
    // Adjust interval based on connection
    const multiplier = {
      excellent: 1,
      good: 1.5,
      fair: 2,
      poor: 3,
      offline: 0,
    }[connectionQuality];
    
    const adjustedInterval = baseInterval * multiplier;
    
    const timer = setInterval(callback, adjustedInterval);
    return () => clearInterval(timer);
  }, [callback, baseInterval, connectionQuality]);
}

export default useOptimizedApp;
