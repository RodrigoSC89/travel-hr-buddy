/**
 * Performance Monitor Hook
 * Tracks Core Web Vitals and reports to analytics
 * PATCH: Roadmap v3.2.0 - Performance Optimization
 */

import { useEffect, useCallback, useRef } from 'react';
import { measureCoreWebVitals, reportWebVitalsToAnalytics } from '@/lib/performance/lighthouse-config';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  enableLogging?: boolean;
  reportToSentry?: boolean;
  thresholds?: {
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const { enableLogging = true, reportToSentry = false } = options;
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const isInitializedRef = useRef(false);

  const handleMetric = useCallback((metric: { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) => {
    const enrichedMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    metricsRef.current.push(enrichedMetric);

    if (enableLogging && import.meta.env.DEV) {
      const icon = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      // eslint-disable-next-line no-console
      console.info(`[Performance] ${icon} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }

    // Report to analytics
    reportWebVitalsToAnalytics(metric);

    // Report poor metrics to Sentry if enabled
    if (reportToSentry && metric.rating === 'poor' && typeof window !== 'undefined') {
      import('@sentry/react').then(Sentry => {
        Sentry.captureMessage(`Poor ${metric.name}: ${metric.value}`, {
          level: 'warning',
          tags: { metric: metric.name, rating: metric.rating },
          extra: { value: metric.value, page: window.location.pathname },
        });
      }).catch(() => {
        // Sentry not available
      });
    }
  }, [enableLogging, reportToSentry]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    measureCoreWebVitals(handleMetric);

    // Track navigation timing
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        const domLoad = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;
        const pageLoad = navigationEntry.loadEventEnd - navigationEntry.startTime;

        if (enableLogging && import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.info('[Performance] Navigation Timing:', {
            TTFB: `${ttfb.toFixed(0)}ms`,
            DOMLoad: `${domLoad.toFixed(0)}ms`,
            PageLoad: `${pageLoad.toFixed(0)}ms`,
          });
        }
      }
    }
  }, [handleMetric, enableLogging]);

  const getMetrics = useCallback(() => metricsRef.current, []);

  const getAverageScore = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return null;

    const scores = metrics.map(m => {
      if (m.rating === 'good') return 100;
      if (m.rating === 'needs-improvement') return 70;
      return 40;
    });

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, []);

  return {
    getMetrics,
    getAverageScore,
  };
}
