/**
 * System Optimizer Hook - FINAL VERSION
 * Unified hook for all performance optimizations
 * Optimized for 2Mbps networks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNetworkStatus, useAdaptiveSettings } from './use-network-status';
import { bandwidthOptimizer } from '@/lib/performance/low-bandwidth-optimizer';

export interface SystemOptimizations {
  // Connection
  isOnline: boolean;
  connectionQuality: 'fast' | 'medium' | 'slow' | 'offline';
  isSaveData: boolean;
  
  // Adaptive settings
  imageQuality: number;
  pageSize: number;
  enableAnimations: boolean;
  enablePrefetch: boolean;
  refreshInterval: number;
  enableRealtime: boolean;
  
  // Actions
  prefetchRoute: (path: string) => void;
  preloadImage: (src: string) => void;
  clearCache: () => Promise<void>;
}

export function useSystemOptimizer(): SystemOptimizations {
  const networkStatus = useNetworkStatus();
  const adaptiveSettings = useAdaptiveSettings();
  const [isClearing, setIsClearing] = useState(false);

  // Prefetch route with smart loading
  const prefetchRoute = useCallback((path: string) => {
    if (networkStatus.quality === 'slow' || networkStatus.quality === 'offline') {
      return; // Don't prefetch on slow connections
    }
    
    // Use link preload
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  }, [networkStatus.quality]);

  // Preload image with quality adjustment
  const preloadImage = useCallback((src: string) => {
    if (networkStatus.quality === 'offline') return;
    
    const img = new Image();
    img.src = src;
  }, [networkStatus.quality]);

  // Clear all caches
  const clearCache = useCallback(async () => {
    if (isClearing) return;
    setIsClearing(true);
    
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      
      // Clear local storage cache entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_') || key.startsWith('nautilus_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
      }
    } finally {
      setIsClearing(false);
    }
  }, [isClearing]);

  // Apply low bandwidth mode class
  useEffect(() => {
    const root = document.documentElement;
    
    if (networkStatus.quality === 'slow' || networkStatus.saveData) {
      root.classList.add('low-bandwidth');
    } else {
      root.classList.remove('low-bandwidth');
    }

    return () => {
      root.classList.remove('low-bandwidth');
    };
  }, [networkStatus.quality, networkStatus.saveData]);

  return useMemo(() => ({
    isOnline: networkStatus.online,
    connectionQuality: networkStatus.quality,
    isSaveData: networkStatus.saveData,
    ...adaptiveSettings,
    prefetchRoute,
    preloadImage,
    clearCache,
  }), [networkStatus, adaptiveSettings, prefetchRoute, preloadImage, clearCache]);
}

/**
 * Hook for component-level optimizations
 */
export function useComponentOptimizer(componentName: string) {
  const { connectionQuality, enableAnimations } = useSystemOptimizer();
  
  const shouldRender = useCallback((priority: 'high' | 'medium' | 'low') => {
    if (connectionQuality === 'offline') return priority === 'high';
    if (connectionQuality === 'slow') return priority !== 'low';
    return true;
  }, [connectionQuality]);

  const getTransition = useCallback((defaultDuration: number = 300) => {
    if (!enableAnimations) return '0ms';
    if (connectionQuality === 'slow') return `${defaultDuration * 0.5}ms`;
    return `${defaultDuration}ms`;
  }, [enableAnimations, connectionQuality]);

  return {
    shouldRender,
    getTransition,
    enableAnimations,
    isSlowConnection: connectionQuality === 'slow' || connectionQuality === 'offline',
  };
}

export default useSystemOptimizer;
