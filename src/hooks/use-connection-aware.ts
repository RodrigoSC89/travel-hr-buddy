/**
 * Connection-Aware Hook - PATCH 750
 * React hook for connection-aware optimizations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getConnectionInfo,
  onConnectionChange,
  isSlowConnection,
  isOffline,
  getOptimalImageQuality,
  getOptimalAnimationLevel,
  getOptimalPollingInterval,
  getOptimalTimeout,
  type ConnectionInfo
} from '@/lib/performance/connection-aware';

export interface UseConnectionAwareResult {
  connectionInfo: ConnectionInfo;
  isSlowConnection: boolean;
  isOffline: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  animationLevel: 'none' | 'reduced' | 'full';
  getPollingInterval: (base: number) => number;
  timeout: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  shouldReduceData: boolean;
}

/**
 * Hook to get connection-aware optimizations
 * Automatically updates when connection changes
 */
export function useConnectionAware(): UseConnectionAwareResult {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(getConnectionInfo);
  // PATCH v17 iOS PWA: SEMPRE false - navigator.onLine causa falsos positivos no iOS Safari PWA
  const [offline] = useState(false);

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = onConnectionChange(setConnectionInfo);
    // PATCH v17: REMOVIDO listeners online/offline - causam falsos positivos no iOS PWA
    return () => {
      unsubscribe();
    };
  }, []);

  const getPollingInterval = useCallback((base: number) => {
    return getOptimalPollingInterval(base);
  }, [connectionInfo]);

  const slow = isSlowConnection();
  // PATCH v17: Nunca retornar 'offline' - causa bloqueio no iOS PWA
  const quality = connectionInfo.effectiveType === '4g' ? 'excellent' as const :
    connectionInfo.effectiveType === '3g' ? 'good' as const :
    connectionInfo.effectiveType === '2g' ? 'fair' as const : 'poor' as const;

  return useMemo(() => ({
    connectionInfo,
    isSlowConnection: slow,
    isOffline: false, // PATCH v17: SEMPRE false
    imageQuality: getOptimalImageQuality(),
    animationLevel: getOptimalAnimationLevel(),
    getPollingInterval,
    timeout: getOptimalTimeout(),
    quality,
    shouldReduceData: slow || quality === 'fair' || quality === 'poor'
  }), [connectionInfo, getPollingInterval, slow, quality]);
}

/**
 * Hook for adaptive polling with connection awareness
 */
export function useAdaptivePolling(
  callback: () => void | Promise<void>,
  baseInterval: number,
  enabled: boolean = true
) {
  const { isOffline, getPollingInterval } = useConnectionAware();

  useEffect(() => {
    if (!enabled || isOffline) return;

    const interval = getPollingInterval(baseInterval);
    const timer = setInterval(callback, interval);

    return () => clearInterval(timer);
  }, [callback, baseInterval, enabled, isOffline, getPollingInterval]);
}

/**
 * Hook for lazy loading based on connection
 */
export function useLazyLoad(
  threshold: number = 0.1
): {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
} {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return {
    ref: { current: ref } as React.RefObject<HTMLElement>,
    isVisible
  };
}

export default useConnectionAware;
