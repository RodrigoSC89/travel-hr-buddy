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
}

/**
 * Hook to get connection-aware optimizations
 * Automatically updates when connection changes
 */
export function useConnectionAware(): UseConnectionAwareResult {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(getConnectionInfo);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = onConnectionChange(setConnectionInfo);

    // Subscribe to online/offline events
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPollingInterval = useCallback((base: number) => {
    return getOptimalPollingInterval(base);
  }, [connectionInfo]);

  return useMemo(() => ({
    connectionInfo,
    isSlowConnection: isSlowConnection(),
    isOffline: offline,
    imageQuality: getOptimalImageQuality(),
    animationLevel: getOptimalAnimationLevel(),
    getPollingInterval,
    timeout: getOptimalTimeout()
  }), [connectionInfo, offline, getPollingInterval]);
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
