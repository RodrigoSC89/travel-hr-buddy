// @ts-nocheck
/**
 * usePerformanceMonitoring Hook - PATCH 67.5
 * React hook for component-level performance monitoring
 */

import { useEffect, useState, useRef } from 'react';
import { performanceMonitor, WebVitalMetric } from '@/lib/monitoring/performance-monitor';
import { logger } from '@/lib/logger';

export interface ComponentPerformance {
  renderTime: number;
  renderCount: number;
  avgRenderTime: number;
  lastRender: number;
}

export function usePerformanceMonitoring(componentName: string) {
  const [metrics, setMetrics] = useState<Record<string, WebVitalMetric>>({});
  const renderTimes = useRef<number[]>([]);
  const renderCount = useRef(0);
  const mountTime = useRef<number>(Date.now());

  // Track component renders
  useEffect(() => {
    const renderStart = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStart;
      renderTimes.current.push(renderTime);
      renderCount.current++;

      if (renderTime > 16) { // More than one frame (60fps)
        logger.warn(`Slow render detected in ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
        });
      }
    };
  });

  // Subscribe to Web Vitals
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric,
      }, []));
    });

    return unsubscribe;
  }, []);

  // Get component performance stats
  const getComponentStats = (): ComponentPerformance => {
    const totalRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0);
    
    return {
      renderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
      renderCount: renderCount.current,
      avgRenderTime: renderCount.current > 0 ? totalRenderTime / renderCount.current : 0,
      lastRender: Date.now() - mountTime.current,
    };
  };

  // Mark custom performance measure
  const markPerformance = (label: string) => {
    const markName = `${componentName}:${label}`;
    performance.mark(markName);
    
    return () => {
      const measureName = `${markName}:measure`;
      try {
        performance.measure(measureName, markName);
        const measure = performance.getEntriesByName(measureName)[0];
        
        logger.debug(`Performance measure: ${label}`, {
          component: componentName,
          duration: `${measure.duration.toFixed(2)}ms`,
        });

        // Cleanup
        performance.clearMarks(markName);
        performance.clearMeasures(measureName);
      } catch (error) {
        // Ignore measurement errors
      }
    };
  };

  return {
    metrics,
    componentStats: getComponentStats(),
    markPerformance,
  };
}
