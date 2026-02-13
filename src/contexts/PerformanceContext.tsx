/**
 * Performance Provider
 * PATCH v12: Removed navigator.onLine - always assumes online for iOS PWA compatibility
 * Centralizes all performance optimizations and provides context
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { webVitalsMonitor } from '@/lib/web-vitals-monitor';
import { imageOptimizer } from '@/lib/image-optimizer';

interface PerformanceContextType {
  // Network state - always online for iOS PWA compatibility
  isSlowConnection: boolean;
  isOffline: boolean;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Performance metrics
  performanceScore: number;
  performanceRating: 'good' | 'needs-improvement' | 'poor';
  
  // Image optimization
  bestImageFormat: 'avif' | 'webp' | 'jpeg';
  imageQuality: number;
  
  // Actions
  prefetchRoute: (route: string) => void;
  reportCustomMetric: (name: string, value: number) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

// Optional hook that doesn't throw
export const usePerformanceOptional = () => {
  return useContext(PerformanceContext);
};

interface PerformanceProviderProps {
  children: ReactNode;
}

// Simple network detection without navigator.onLine
function useSimpleNetworkState() {
  // PATCH v12: Always assume online - navigator.onLine is unreliable on iOS PWA
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  useEffect(() => {
    // Check if we're in browser
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Check connection quality only (not online/offline status)
    interface NavigatorWithConnection extends Navigator {
      connection?: { effectiveType?: string; downlink?: number; addEventListener?: (type: string, cb: () => void) => void; removeEventListener?: (type: string, cb: () => void) => void };
      mozConnection?: NavigatorWithConnection['connection'];
      webkitConnection?: NavigatorWithConnection['connection'];
    }
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetworkQuality = () => {
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink ?? 10;
        
        if (effectiveType === '4g' && downlink >= 5) {
          setQuality('excellent');
          setIsSlowConnection(false);
        } else if (effectiveType === '4g' || effectiveType === '3g') {
          setQuality('good');
          setIsSlowConnection(downlink < 2);
        } else if (effectiveType === '2g') {
          setQuality('poor');
          setIsSlowConnection(true);
        } else {
          setQuality('fair');
          setIsSlowConnection(downlink < 2);
        }
      }
    };

    updateNetworkQuality();

    // Listen for connection changes only
    if (connection?.addEventListener) {
      connection.addEventListener('change', updateNetworkQuality);
    }

    return () => {
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', updateNetworkQuality);
      }
    };
  }, []);

  // PATCH v12: Always return online = true
  return { isOnline: true, isSlowConnection, quality };
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const networkState = useSimpleNetworkState();
  const [performanceScore, setPerformanceScore] = useState(100);
  const [performanceRating, setPerformanceRating] = useState<'good' | 'needs-improvement' | 'poor'>('good');
  const [bestImageFormat, setBestImageFormat] = useState<'avif' | 'webp' | 'jpeg'>('jpeg');

  // Initialize image optimizer and get best format
  useEffect(() => {
    const initImageOptimizer = async () => {
      try {
        await imageOptimizer.initialize();
        setBestImageFormat(imageOptimizer.getBestFormat());
      } catch (e) {
        // Silently fail - use default jpeg
      }
    };
    initImageOptimizer();
  }, []);

  // Subscribe to web vitals updates
  useEffect(() => {
    try {
      const unsubscribe = webVitalsMonitor.onMetric(() => {
        const score = webVitalsMonitor.getScore();
        setPerformanceScore(score.score);
        setPerformanceRating(score.rating);
      });
      
      return unsubscribe;
    } catch (e) {
      // Silently fail
      return () => {};
    }
  }, []);

  // Update web vitals monitor based on network
  useEffect(() => {
    try {
      webVitalsMonitor.setSlowNetworkMode(networkState.isSlowConnection);
    } catch (e) {
      // Silently fail
    }
  }, [networkState.isSlowConnection]);

  // Prefetch route for faster navigation
  const prefetchRoute = useCallback((route: string) => {
    if (networkState.isSlowConnection) return;
    
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    } catch (e) {
      // Silently fail
    }
  }, [networkState.isSlowConnection]);

  // Report custom performance metric
  const reportCustomMetric = useCallback((name: string, value: number) => {
    try {
      if ('performance' in window && 'mark' in performance) {
        performance.mark(`custom-${name}-${value}`);
      }
    } catch (e) {
      // Silently fail
    }
  }, []);

  // Calculate image quality based on network
  const imageQuality = networkState.isSlowConnection ? 60 : 80;

  const value: PerformanceContextType = {
    isSlowConnection: networkState.isSlowConnection,
    isOffline: false, // PATCH v12: Always false for iOS PWA compatibility
    networkQuality: networkState.quality,
    performanceScore,
    performanceRating,
    bestImageFormat,
    imageQuality,
    prefetchRoute,
    reportCustomMetric
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
