/**
 * Performance Provider
 * Centralizes all performance optimizations and provides context
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useNetworkAware } from '@/mobile/hooks/useNetworkAware';
import { webVitalsMonitor, VitalMetric } from '@/lib/web-vitals-monitor';
import { imageOptimizer } from '@/lib/image-optimizer';

interface PerformanceContextType {
  // Network state
  isSlowConnection: boolean;
  isOffline: boolean;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  
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

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const networkState = useNetworkAware();
  const [performanceScore, setPerformanceScore] = useState(100);
  const [performanceRating, setPerformanceRating] = useState<'good' | 'needs-improvement' | 'poor'>('good');
  const [bestImageFormat, setBestImageFormat] = useState<'avif' | 'webp' | 'jpeg'>('jpeg');

  // Initialize image optimizer and get best format
  useEffect(() => {
    const initImageOptimizer = async () => {
      await imageOptimizer.initialize();
      setBestImageFormat(imageOptimizer.getBestFormat());
    };
    initImageOptimizer();
  }, []);

  // Subscribe to web vitals updates
  useEffect(() => {
    const unsubscribe = webVitalsMonitor.onMetric(() => {
      const score = webVitalsMonitor.getScore();
      setPerformanceScore(score.score);
      setPerformanceRating(score.rating);
    });
    
    return unsubscribe;
  }, []);

  // Update web vitals monitor based on network
  useEffect(() => {
    webVitalsMonitor.setSlowNetworkMode(networkState.isSlowConnection);
  }, [networkState.isSlowConnection]);

  // Prefetch route for faster navigation
  const prefetchRoute = useCallback((route: string) => {
    if (networkState.isSlowConnection || !navigator.onLine) return;
    
    // Use link preload for the route
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }, [networkState.isSlowConnection]);

  // Report custom performance metric
  const reportCustomMetric = useCallback((name: string, value: number) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`custom-${name}-${value}`);
    }
  }, []);

  // Calculate image quality based on network
  const imageQuality = networkState.isSlowConnection ? 60 : 80;

  const value: PerformanceContextType = {
    isSlowConnection: networkState.isSlowConnection,
    isOffline: !networkState.isOnline,
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
