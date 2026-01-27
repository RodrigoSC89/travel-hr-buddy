/**
 * Performance Validation v4.0
 * Tools for validating performance targets
 * Target: 2G/Satellite (2MB/s) compatibility
 */

// =============================================================================
// PERFORMANCE TARGETS
// =============================================================================

export interface PerformanceTargets {
  // Core Web Vitals
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive (ms)
  tbt: number; // Total Blocking Time (ms)

  // Network Performance (2G/Satellite)
  initialLoad2G: number; // Initial load time on 2G (ms)
  subsequentLoad2G: number; // Subsequent load (cached) (ms)
  apiResponse2G: number; // API response time on 2G (ms)

  // Bundle Size (gzipped KB)
  initialJS: number;
  initialCSS: number;
  totalInitial: number;

  // Runtime Performance
  memoryUsage: number; // MB
  cpuUsage: number; // %
  fps: number; // frames per second

  // Stability
  crashFreeRate: number; // %
  errorRate: number; // %
  uptimePercentage: number; // %
}

export const PERFORMANCE_TARGETS: PerformanceTargets = {
  // Core Web Vitals - Aggressive targets
  fcp: 1000, // < 1s
  lcp: 1800, // < 1.8s
  fid: 50, // < 50ms
  cls: 0.05, // < 0.05
  tti: 2500, // < 2.5s
  tbt: 150, // < 150ms

  // Network (2G/Satellite @ 2MB/s)
  initialLoad2G: 8000, // < 8s
  subsequentLoad2G: 3000, // < 3s
  apiResponse2G: 2000, // < 2s

  // Bundle Size (gzipped)
  initialJS: 100, // < 100KB
  initialCSS: 30, // < 30KB
  totalInitial: 150, // < 150KB

  // Runtime
  memoryUsage: 100, // < 100MB
  cpuUsage: 30, // < 30%
  fps: 60, // 60fps constant

  // Stability
  crashFreeRate: 99.99,
  errorRate: 0.01,
  uptimePercentage: 99.95,
};

// =============================================================================
// WEB VITALS COLLECTOR
// =============================================================================

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type WebVitalsCallback = (metric: WebVitalsMetric) => void;

class WebVitalsCollector {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private observers: PerformanceObserver[] = [];
  private callbacks: WebVitalsCallback[] = [];

  start(): void {
    this.observePaint();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeLongTasks();
  }

  stop(): void {
    this.observers.forEach((obs) => obs.disconnect());
    this.observers = [];
  }

  onMetric(callback: WebVitalsCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  getMetrics(): Map<string, WebVitalsMetric> {
    return new Map(this.metrics);
  }

  private reportMetric(metric: WebVitalsMetric): void {
    this.metrics.set(metric.name, metric);
    this.callbacks.forEach((cb) => cb(metric));
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      TBT: [200, 600],
    };

    const [good, poor] = thresholds[name] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private observePaint(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.reportMetric({
              name: 'FCP',
              value: entry.startTime,
              rating: this.getRating('FCP', entry.startTime),
              delta: entry.startTime,
              id: `fcp-${Date.now()}`,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.reportMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: this.getRating('LCP', lastEntry.startTime),
            delta: lastEntry.startTime,
            id: `lcp-${Date.now()}`,
          });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          const value = fidEntry.processingStart - fidEntry.startTime;
          this.reportMetric({
            name: 'FID',
            value,
            rating: this.getRating('FID', value),
            delta: value,
            id: `fid-${Date.now()}`,
          });
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            this.reportMetric({
              name: 'CLS',
              value: clsValue,
              rating: this.getRating('CLS', clsValue),
              delta: layoutShiftEntry.value,
              id: `cls-${Date.now()}`,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }

  private observeLongTasks(): void {
    try {
      let tbt = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            tbt += entry.duration - 50;
            this.reportMetric({
              name: 'TBT',
              value: tbt,
              rating: this.getRating('TBT', tbt),
              delta: entry.duration - 50,
              id: `tbt-${Date.now()}`,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch {
      // Observer not supported
    }
  }
}

export const webVitalsCollector = new WebVitalsCollector();

// =============================================================================
// MEMORY MONITOR
// =============================================================================

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usageMB: number;
  percentUsed: number;
}

export function getMemoryInfo(): MemoryInfo | null {
  const memory = (performance as Performance & { memory?: MemoryInfo }).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usageMB: memory.usedJSHeapSize / 1024 / 1024,
    percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

// =============================================================================
// PERFORMANCE REPORT
// =============================================================================

export interface PerformanceReport {
  timestamp: number;
  webVitals: Record<string, WebVitalsMetric>;
  memory: MemoryInfo | null;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null;
  passed: boolean;
  issues: string[];
}

export function generatePerformanceReport(): PerformanceReport {
  const webVitals = Object.fromEntries(webVitalsCollector.getMetrics());
  const memory = getMemoryInfo();
  const issues: string[] = [];

  // Check Web Vitals
  const fcp = webVitals['FCP']?.value;
  if (fcp && fcp > PERFORMANCE_TARGETS.fcp) {
    issues.push(`FCP: ${fcp.toFixed(0)}ms (target: ${PERFORMANCE_TARGETS.fcp}ms)`);
  }

  const lcp = webVitals['LCP']?.value;
  if (lcp && lcp > PERFORMANCE_TARGETS.lcp) {
    issues.push(`LCP: ${lcp.toFixed(0)}ms (target: ${PERFORMANCE_TARGETS.lcp}ms)`);
  }

  const cls = webVitals['CLS']?.value;
  if (cls && cls > PERFORMANCE_TARGETS.cls) {
    issues.push(`CLS: ${cls.toFixed(3)} (target: ${PERFORMANCE_TARGETS.cls})`);
  }

  const tbt = webVitals['TBT']?.value;
  if (tbt && tbt > PERFORMANCE_TARGETS.tbt) {
    issues.push(`TBT: ${tbt.toFixed(0)}ms (target: ${PERFORMANCE_TARGETS.tbt}ms)`);
  }

  // Check memory
  if (memory && memory.usageMB > PERFORMANCE_TARGETS.memoryUsage) {
    issues.push(`Memory: ${memory.usageMB.toFixed(2)}MB (target: ${PERFORMANCE_TARGETS.memoryUsage}MB)`);
  }

  // Get connection info
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  const connection = nav.connection
    ? {
        effectiveType: nav.connection.effectiveType || 'unknown',
        downlink: nav.connection.downlink || 0,
        rtt: nav.connection.rtt || 0,
        saveData: nav.connection.saveData || false,
      }
    : null;

  return {
    timestamp: Date.now(),
    webVitals,
    memory,
    connection,
    passed: issues.length === 0,
    issues,
  };
}

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useEffect } from 'react';

export function usePerformanceValidation() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    webVitalsCollector.start();
    setIsMonitoring(true);

    const interval = setInterval(() => {
      setReport(generatePerformanceReport());
    }, 5000);

    // Initial report after short delay
    const timeout = setTimeout(() => {
      setReport(generatePerformanceReport());
    }, 2000);

    return () => {
      webVitalsCollector.stop();
      clearInterval(interval);
      clearTimeout(timeout);
      setIsMonitoring(false);
    };
  }, []);

  return { report, isMonitoring };
}

// =============================================================================
// NETWORK INFORMATION TYPE
// =============================================================================

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}
