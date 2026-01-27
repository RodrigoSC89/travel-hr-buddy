/**
 * Performance Provider v4.0
 * Context provider for performance optimization features
 * Optimized for 2G/Satellite (2MB/s) connections
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useConnectionAdaptive } from '@/hooks/useConnectionAdaptive';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { PERFORMANCE_CONFIG } from '@/lib/performance';

type ConnectionQuality = 'fast' | 'moderate' | 'slow' | 'offline';

interface PerformanceContextValue {
  // Connection
  connectionQuality: ConnectionQuality;
  isOnline: boolean;
  saveData: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;

  // Light mode
  lightMode: boolean;
  setLightMode: (value: boolean) => void;

  // Cache & Sync
  hasPendingSync: boolean;
  clearCache: () => void;

  // Configuration
  config: typeof PERFORMANCE_CONFIG;

  // Recommendations
  shouldLoadImages: boolean;
  shouldAnimate: boolean;
  shouldPrefetch: boolean;
  debounceMs: number;
  imageQuality: number;
  timeout: number;
  batchSize: number;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const connection = useConnectionAdaptive();
  const offline = useOfflineMode();
  const [lightMode, setLightModeState] = useState(false);

  // Load lightMode preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lightMode');
      if (saved !== null) {
        setLightModeState(saved === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save lightMode preference
  const setLightMode = useCallback((value: boolean) => {
    setLightModeState(value);
    try {
      localStorage.setItem('lightMode', String(value));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Clear cache wrapper
  const clearCache = useCallback(() => {
    offline.clearExpiredCache();
  }, [offline]);

  // Memoized recommendations
  const recommendations = useMemo(() => {
    const quality = connection.quality;
    const saveData = connection.saveData;
    const connRec = connection.recommendations;
    const isRestricted = lightMode || quality === 'slow' || quality === 'offline' || saveData;

    return {
      shouldLoadImages: !isRestricted,
      shouldAnimate: !isRestricted && connRec.enableAnimations,
      shouldPrefetch: !isRestricted && connRec.enablePrefetch,
      debounceMs: isRestricted ? PERFORMANCE_CONFIG.DEBOUNCE_SLOW : connRec.debounceMs,
      imageQuality: isRestricted ? PERFORMANCE_CONFIG.IMAGE_QUALITY_LOW : connRec.imageQuality,
      timeout: isRestricted ? 45000 : 15000,
      batchSize: isRestricted ? 5 : 20,
    };
  }, [connection.quality, connection.saveData, connection.recommendations, lightMode]);

  const value = useMemo<PerformanceContextValue>(
    () => ({
      // Connection
      connectionQuality: connection.quality,
      isOnline: connection.isOnline,
      saveData: connection.saveData,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,

      // Light mode
      lightMode,
      setLightMode,

      // Cache & Sync
      hasPendingSync: offline.hasPendingSync,
      clearCache,

      // Configuration
      config: PERFORMANCE_CONFIG,

      // Recommendations
      ...recommendations,
    }),
    [connection, lightMode, setLightMode, offline.hasPendingSync, clearCache, recommendations]
  );

  return (
    <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

/**
 * Simplified hook to check if optimizations should be applied
 */
export function useShouldOptimize(): boolean {
  const { lightMode, connectionQuality, saveData } = usePerformance();
  return lightMode || connectionQuality === 'slow' || connectionQuality === 'offline' || saveData;
}
