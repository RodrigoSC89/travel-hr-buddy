/**
 * PATCH 652 - Performance Monitor Hook
 * Real-time performance metrics tracking
 */

import { useCallback, useRef } from 'react';
import { useOptimizedPolling } from './use-optimized-polling';

export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  memory: {
    used: number;
    total: number;
    percentage: number;
  } | null;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  interval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

/**
 * Hook to monitor application performance metrics
 * Tracks Core Web Vitals and browser resource usage
 */
export const usePerformanceMonitor = (options?: UsePerformanceMonitorOptions) => {
  const enabled = options?.enabled ?? true;
  const interval = options?.interval ?? 5000;
  const observersRef = useRef<PerformanceObserver[]>([]);

  const collectMetrics = useCallback(() => {
    const metrics: PerformanceMetrics = {
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      fcp: null,
      memory: null,
      timestamp: Date.now()
    };

    try {
      // Collect Web Vitals using PerformanceObserver
      if ('PerformanceObserver' in window) {
        // Clean up existing observers
        observersRef.current.forEach(observer => observer.disconnect());
        observersRef.current = [];

        try {
          // LCP - Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            metrics.lcp = lastEntry?.renderTime || lastEntry?.loadTime || null;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'], buffered: true });
          observersRef.current.push(lcpObserver);
        } catch (e) {
          // LCP not supported
        }

        try {
          // FID - First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              metrics.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'], buffered: true });
          observersRef.current.push(fidObserver);
        } catch (e) {
          // FID not supported
        }

        try {
          // CLS - Cumulative Layout Shift
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            metrics.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'], buffered: true });
          observersRef.current.push(clsObserver);
        } catch (e) {
          // CLS not supported
        }
      }

      // Navigation Timing API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
        metrics.fcp = navigation.responseEnd - navigation.fetchStart;
      }

      // Memory Usage (Chrome/Edge only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memory = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };
      }

      // Store in window for debugging
      if (typeof window !== 'undefined') {
        (window as any).__NAUTILUS_PERFORMANCE__ = metrics;
      }

      // Call user callback
      if (options?.onMetricsUpdate) {
        options.onMetricsUpdate(metrics);
      }
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }

    return metrics;
  }, [options]);

  // Use optimized polling for periodic metric collection
  useOptimizedPolling({
    id: 'performance-monitor',
    callback: () => void collectMetrics(),
    interval,
    enabled
  });

  return { 
    collectMetrics,
    // Cleanup function
    cleanup: () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    }
  };
};

/**
 * Get current performance metrics snapshot
 */
export const getPerformanceSnapshot = (): PerformanceMetrics | null => {
  if (typeof window !== 'undefined' && (window as any).__NAUTILUS_PERFORMANCE__) {
    return (window as any).__NAUTILUS_PERFORMANCE__;
  }
  return null;
};

/**
 * Evaluate if metrics meet production standards
 */
export const evaluatePerformance = (metrics: PerformanceMetrics): {
  score: number;
  rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
} => {
  const recommendations: string[] = [];
  let score = 100;

  // LCP scoring
  if (metrics.lcp) {
    if (metrics.lcp > 4000) {
      score -= 25;
      recommendations.push('LCP too high - optimize largest content loading');
    } else if (metrics.lcp > 2500) {
      score -= 10;
      recommendations.push('LCP could be improved - consider lazy loading');
    }
  }

  // FID scoring
  if (metrics.fid) {
    if (metrics.fid > 300) {
      score -= 25;
      recommendations.push('FID too high - reduce JavaScript execution time');
    } else if (metrics.fid > 100) {
      score -= 10;
      recommendations.push('FID could be improved - optimize event handlers');
    }
  }

  // CLS scoring
  if (metrics.cls !== null) {
    if (metrics.cls > 0.25) {
      score -= 25;
      recommendations.push('CLS too high - stabilize layout shifts');
    } else if (metrics.cls > 0.1) {
      score -= 10;
      recommendations.push('CLS could be improved - add size attributes to images');
    }
  }

  // Memory scoring
  if (metrics.memory && metrics.memory.percentage > 85) {
    score -= 15;
    recommendations.push('High memory usage - check for memory leaks');
  }

  // Determine rating
  let rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  if (score >= 90) rating = 'excellent';
  else if (score >= 75) rating = 'good';
  else if (score >= 50) rating = 'needs-improvement';
  else rating = 'poor';

  return { score, rating, recommendations };
};
