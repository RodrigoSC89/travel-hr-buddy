/**
 * System Health Monitor - PATCH 750
 * Monitors system performance and health in real-time
 */

import { useEffect, useState, useCallback } from 'react';
import { getConnectionInfo, type ConnectionInfo } from '@/lib/performance/connection-aware';

export interface SystemHealth {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    fcp: number | null; // First Contentful Paint
    lcp: number | null; // Largest Contentful Paint
    fid: number | null; // First Input Delay
    cls: number | null; // Cumulative Layout Shift
    ttfb: number | null; // Time to First Byte
  };
  connection: ConnectionInfo;
  isHealthy: boolean;
  issues: string[];
}

/**
 * Get current memory usage (if available)
 */
function getMemoryUsage(): SystemHealth['memory'] {
  const memory = (performance as any).memory;
  
  if (!memory) {
    return { used: 0, total: 0, percentage: 0 };
  }

  const used = memory.usedJSHeapSize;
  const total = memory.jsHeapSizeLimit;
  const percentage = Math.round((used / total) * 100);

  return { used, total, percentage };
}

/**
 * Get performance metrics from Performance API
 */
function getPerformanceMetrics(): SystemHealth['performance'] {
  const entries = performance.getEntriesByType('paint');
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  const fcp = entries.find(e => e.name === 'first-contentful-paint')?.startTime || null;
  
  return {
    fcp,
    lcp: null, // Set by PerformanceObserver
    fid: null, // Set by PerformanceObserver
    cls: null, // Set by PerformanceObserver
    ttfb: navEntry?.responseStart || null
  };
}

/**
 * Analyze health and identify issues
 */
function analyzeHealth(
  memory: SystemHealth['memory'],
  performance: SystemHealth['performance'],
  connection: ConnectionInfo
): { isHealthy: boolean; issues: string[] } {
  const issues: string[] = [];

  // Memory issues
  if (memory.percentage > 80) {
    issues.push('Uso de memória alto (>80%)');
  }

  // Performance issues
  if (performance.fcp && performance.fcp > 3000) {
    issues.push('First Contentful Paint lento (>3s)');
  }
  if (performance.lcp && performance.lcp > 4000) {
    issues.push('Largest Contentful Paint lento (>4s)');
  }
  if (performance.cls && performance.cls > 0.25) {
    issues.push('Layout instável (CLS >0.25)');
  }
  if (performance.ttfb && performance.ttfb > 600) {
    issues.push('Tempo de resposta do servidor alto (TTFB >600ms)');
  }

  // Connection issues
  if (connection.type === 'slow-2g' || connection.type === '2g') {
    issues.push('Conexão lenta detectada');
  }
  if (connection.saveData) {
    issues.push('Modo economia de dados ativo');
  }

  return {
    isHealthy: issues.length === 0,
    issues
  };
}

/**
 * Hook to monitor system health
 */
export function useSystemHealth(interval: number = 10000): SystemHealth {
  const [health, setHealth] = useState<SystemHealth>(() => {
    const memory = getMemoryUsage();
    const perf = getPerformanceMetrics();
    const connection = getConnectionInfo();
    const { isHealthy, issues } = analyzeHealth(memory, perf, connection);

    return {
      memory,
      performance: perf,
      connection,
      isHealthy,
      issues
    };
  });

  useEffect(() => {
    // Update metrics periodically
    const updateMetrics = () => {
      const memory = getMemoryUsage();
      const perf = getPerformanceMetrics();
      const connection = getConnectionInfo();
      const { isHealthy, issues } = analyzeHealth(memory, perf, connection);

      setHealth({
        memory,
        performance: perf,
        connection,
        isHealthy,
        issues
      });
    };

    const timer = setInterval(updateMetrics, interval);

    // Set up Performance Observer for Web Vitals
    const observers: PerformanceObserver[] = [];

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setHealth(prev => ({
          ...prev,
          performance: { ...prev.performance, lcp: lastEntry.startTime }
        }));
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0] as PerformanceEventTiming;
        setHealth(prev => ({
          ...prev,
          performance: { ...prev.performance, fid: firstEntry.processingStart - firstEntry.startTime }
        }));
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        setHealth(prev => ({
          ...prev,
          performance: { ...prev.performance, cls: clsValue }
        }));
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch {
      // PerformanceObserver not supported
    }

    return () => {
      clearInterval(timer);
      observers.forEach(o => o.disconnect());
    };
  }, [interval]);

  return health;
}

/**
 * Get health status color
 */
export function getHealthColor(isHealthy: boolean, issues: string[]): string {
  if (isHealthy) return 'text-green-500';
  if (issues.length > 2) return 'text-red-500';
  return 'text-yellow-500';
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format milliseconds to human readable
 */
export function formatMs(ms: number | null): string {
  if (ms === null) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default useSystemHealth;
