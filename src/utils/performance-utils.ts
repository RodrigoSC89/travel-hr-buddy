/**
 * Performance Utilities - PATCH 597
 * 
 * Provides utilities for runtime performance tracking including:
 * - FPS monitoring
 * - Web Vitals integration
 * - Memory tracking
 * - Debounce and throttle helpers
 */

import { logger } from "@/lib/logger";

interface PerformanceMemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemoryInfo;
}

export interface PerformanceMetrics {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timing?: PerformanceTiming;
}

export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export interface PageLoadMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

/**
 * FPS Monitor - tracks frame rate in real-time
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private animationFrameId?: number;
  private callback?: (fps: number) => void;

  start(callback?: (fps: number) => void): void {
    this.callback = callback;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measure();
  }

  private measure = (): void => {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.callback) {
        this.callback(this.fps);
      }

      // Log warning if FPS drops below threshold
      if (this.fps < 30) {
        logger.warn(`Low FPS detected: ${this.fps}`);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.measure);
  };

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  getCurrentFPS(): number {
    return this.fps;
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    fps: 60 // Default, should be updated by FPS monitor
  };

  // Memory info (Chrome only)
  const performanceWithMemory = performance as PerformanceWithMemory;
  if (performanceWithMemory.memory) {
    const memory = performanceWithMemory.memory;
    metrics.memory = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }

  // Navigation timing
  if (performance.timing) {
    metrics.timing = performance.timing;
  }

  return metrics;
}

/**
 * Measure Web Vitals using Performance Observer API
 */
export function measureWebVitals(callback: (vitals: WebVitals) => void): () => void {
  const vitals: WebVitals = {};
  const observers: PerformanceObserver[] = [];

  // First Contentful Paint
  if (PerformanceObserver.supportedEntryTypes?.includes("paint")) {
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          vitals.FCP = entry.startTime;
          callback(vitals);
        }
      }
    });
    paintObserver.observe({ entryTypes: ["paint"] });
    observers.push(paintObserver);
  }

  // Largest Contentful Paint
  if (PerformanceObserver.supportedEntryTypes?.includes("largest-contentful-paint")) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.LCP = lastEntry.startTime;
      callback(vitals);
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    observers.push(lcpObserver);
  }

  // First Input Delay
  if (PerformanceObserver.supportedEntryTypes?.includes("first-input")) {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        vitals.FID = fidEntry.processingStart - fidEntry.startTime;
        callback(vitals);
      }
    });
    fidObserver.observe({ entryTypes: ["first-input"] });
    observers.push(fidObserver);
  }

  // Cumulative Layout Shift
  if (PerformanceObserver.supportedEntryTypes?.includes("layout-shift")) {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as LayoutShift;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
          vitals.CLS = clsValue;
          callback(vitals);
        }
      }
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
    observers.push(clsObserver);
  }

  // Time to First Byte
  if (performance.timing) {
    const timing = performance.timing;
    vitals.TTFB = timing.responseStart - timing.requestStart;
    callback(vitals);
  }

  // Return cleanup function
  return () => {
    observers.forEach(observer => observer.disconnect());
  };
}

/**
 * Monitor memory usage
 */
export function monitorMemory(
  callback: (memory: PerformanceMetrics["memory"]) => void,
  interval: number = 5000
): () => void {
  const performanceWithMemory = performance as PerformanceWithMemory;
  if (!performanceWithMemory.memory) {
    logger.warn("Memory monitoring not supported in this browser");
    return () => {};
  }

  const checkMemory = () => {
    const memory = performanceWithMemory.memory;
    const memoryData = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };

    callback(memoryData);

    // Warn if memory usage is high
    const usagePercent = (memoryData.usedJSHeapSize / memoryData.jsHeapSizeLimit) * 100;
    if (usagePercent > 90) {
      logger.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
    }
  };

  const intervalId = setInterval(checkMemory, interval);
  checkMemory(); // Initial check

  return () => clearInterval(intervalId);
}

/**
 * Debounce function - delays execution until after wait time
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
      timeout = undefined;
    }, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let previous = 0;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = undefined;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Measure function execution time (handles both sync and async functions)
 */
export function measureExecutionTime<T extends (...args: unknown[]) => unknown>(
  func: T,
  label?: string
): T {
  const logDuration = (start: number): number => {
    const duration = performance.now() - start;
    logger.info(`${label || func.name} execution time:`, `${duration.toFixed(2)}ms`);
    return duration;
  };

  return ((...args: Parameters<T>): ReturnType<T> => {
    const startTime = performance.now();
    const result = func(...args);

    if (result instanceof Promise) {
      return result.then((value) => {
        logDuration(startTime);
        return value;
      }) as ReturnType<T>;
    }

    logDuration(startTime);
    return result as ReturnType<T>;
  }) as T;
}

/**
 * Mark performance milestone
 */
export function markPerformance(name: string): void {
  if (performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string): number {
  if (performance.measure) {
    performance.measure(name, startMark, endMark);
    const measures = performance.getEntriesByName(name);
    if (measures.length > 0) {
      return measures[0].duration;
    }
  }
  return 0;
}

/**
 * Get resource timing data
 */
export function getResourceTiming(): PerformanceResourceTiming[] {
  return performance.getEntriesByType("resource") as PerformanceResourceTiming[];
}

/**
 * Clear performance data
 */
export function clearPerformanceData(): void {
  if (performance.clearMarks) {
    performance.clearMarks();
  }
  if (performance.clearMeasures) {
    performance.clearMeasures();
  }
  if (performance.clearResourceTimings) {
    performance.clearResourceTimings();
  }
}

/**
 * Log long tasks (if supported)
 */
export function monitorLongTasks(threshold: number = 50): () => void {
  if (!PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
    logger.warn("Long task monitoring not supported in this browser");
    return () => {};
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > threshold) {
        logger.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
      }
    }
  });

  observer.observe({ entryTypes: ["longtask"] });

  return () => observer.disconnect();
}

/**
 * Get page load metrics
 */
export function getPageLoadMetrics(): PageLoadMetrics | null {
  if (!performance.timing) {
    return null;
  }

  const timing = performance.timing;
  const navigationStart = timing.navigationStart;

  const metrics: PageLoadMetrics = {
    domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
    loadComplete: timing.loadEventEnd - navigationStart
  };

  // Add paint timings if available
  const paintEntries = performance.getEntriesByType("paint");
  for (const entry of paintEntries) {
    if (entry.name === "first-paint") {
      metrics.firstPaint = entry.startTime;
    } else if (entry.name === "first-contentful-paint") {
      metrics.firstContentfulPaint = entry.startTime;
    }
  }

  return metrics;
}
