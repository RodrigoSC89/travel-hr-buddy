/**
 * Performance Monitor - PATCH 67.5
 * Real-time performance tracking with Web Vitals and Resource Timing
 */

import { logger } from "@/lib/logger";

export interface WebVitalMetric {
  name: "LCP" | "FID" | "CLS" | "TTFB" | "FCP" | "INP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export interface PerformanceSnapshot {
  webVitals: Record<string, WebVitalMetric>;
  resources: ResourceTiming[];
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    limit: number;
  };
  navigation: {
    loadTime: number;
    domContentLoaded: number;
    domInteractive: number;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, WebVitalMetric> = new Map();
  private observers: PerformanceObserver[] = [];
  private listeners: Array<(metric: WebVitalMetric) => void> = [];

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    if (typeof window === "undefined") return;

    this.trackWebVitals();
    this.trackResources();
    this.trackLongTasks();
    
    logger.info("Performance monitoring initialized");
  }

  /**
   * Track Web Vitals (LCP, FID, CLS, TTFB)
   */
  private trackWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.observeMetric("largest-contentful-paint", (entry: any) => {
      const metric: WebVitalMetric = {
        name: "LCP",
        value: entry.renderTime || entry.loadTime,
        rating: this.rateLCP(entry.renderTime || entry.loadTime),
        timestamp: Date.now(),
      };
      this.recordMetric(metric);
    });

    // First Input Delay (FID) - using INP as replacement
    this.observeMetric("first-input", (entry: any) => {
      const metric: WebVitalMetric = {
        name: "FID",
        value: entry.processingStart - entry.startTime,
        rating: this.rateFID(entry.processingStart - entry.startTime),
        timestamp: Date.now(),
      };
      this.recordMetric(metric);
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeMetric("layout-shift", (entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        const metric: WebVitalMetric = {
          name: "CLS",
          value: clsValue,
          rating: this.rateCLS(clsValue),
          timestamp: Date.now(),
        };
        this.recordMetric(metric);
      }
    });

    // Time to First Byte (TTFB)
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart;
      const metric: WebVitalMetric = {
        name: "TTFB",
        value: ttfb,
        rating: this.rateTTFB(ttfb),
        timestamp: Date.now(),
      };
      this.recordMetric(metric);
    }

    // First Contentful Paint (FCP)
    this.observeMetric("paint", (entry: any) => {
      if (entry.name === "first-contentful-paint") {
        const metric: WebVitalMetric = {
          name: "FCP",
          value: entry.startTime,
          rating: this.rateFCP(entry.startTime),
          timestamp: Date.now(),
        };
        this.recordMetric(metric);
      }
    });
  }

  /**
   * Track resource loading performance
   */
  private trackResources(): void {
    this.observeMetric("resource", (entry: any) => {
      const resource: ResourceTiming = {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: entry.initiatorType,
      };

      // Log slow resources
      if (resource.duration > 1000) {
        logger.warn("Slow resource detected", resource);
      }
    });
  }

  /**
   * Track long tasks (blocking main thread)
   */
  private trackLongTasks(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.warn("Long task detected", {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
      this.observers.push(observer);
    } catch (error) {
      // Long task API not supported
      logger.debug("Long task monitoring not supported");
    }
  }

  /**
   * Generic metric observer
   */
  private observeMetric(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ entryTypes: [type] });
      this.observers.push(observer);
    } catch (error) {
      logger.debug(`Performance observer for ${type} not supported`);
    }
  }

  /**
   * Record metric and notify listeners
   */
  private recordMetric(metric: WebVitalMetric): void {
    this.metrics.set(metric.name, metric);
    this.listeners.forEach(listener => listener(metric));

    logger.info(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  /**
   * Get current performance snapshot
   */
  getSnapshot(): PerformanceSnapshot {
    const resources: ResourceTiming[] = [];
    
    performance.getEntriesByType("resource").forEach((entry: any) => {
      resources.push({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: entry.initiatorType,
      });
    });

    const snapshot: PerformanceSnapshot = {
      webVitals: Object.fromEntries(this.metrics),
      resources,
      navigation: {
        loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0,
        domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart || 0,
        domInteractive: performance.timing?.domInteractive - performance.timing?.navigationStart || 0,
      },
    };

    // Add memory info if available
    if ((performance as any).memory) {
      snapshot.memory = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      };
    }

    return snapshot;
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(callback: (metric: WebVitalMetric) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Rating functions for Web Vitals
   */
  private rateLCP(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 2500) return "good";
    if (value <= 4000) return "needs-improvement";
    return "poor";
  }

  private rateFID(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 100) return "good";
    if (value <= 300) return "needs-improvement";
    return "poor";
  }

  private rateCLS(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs-improvement";
    return "poor";
  }

  private rateTTFB(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 600) return "good";
    if (value <= 1500) return "needs-improvement";
    return "poor";
  }

  private rateFCP(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 1800) return "good";
    if (value <= 3000) return "needs-improvement";
    return "poor";
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.listeners = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
