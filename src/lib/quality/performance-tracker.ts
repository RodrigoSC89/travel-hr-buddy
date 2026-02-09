/**
 * Performance Tracking System
 * PATCH: QUALITY-10/10 - Real-time performance monitoring
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percent";
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface WebVitals {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitals = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    inp: null,
  };
  private observers: Set<(metrics: PerformanceMetric[]) => void> = new Set();
  private readonly MAX_METRICS = 1000;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // Performance Observer for various metrics
    if ("PerformanceObserver" in window) {
      // LCP Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.webVitals.lcp = lastEntry.startTime;
            this.recordMetric("lcp", lastEntry.startTime, "ms");
          }
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // LCP observer not supported
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if ("processingStart" in entry) {
              const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
              this.webVitals.fid = fid;
              this.recordMetric("fid", fid, "ms");
            }
          });
        });
        fidObserver.observe({ type: "first-input", buffered: true });
      } catch {
        // FID observer not supported
      }

      // CLS Observer
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const layoutEntry = entry as unknown as { hadRecentInput: boolean; value: number };
            if ("hadRecentInput" in entry && !layoutEntry.hadRecentInput) {
              clsValue += layoutEntry.value || 0;
              this.webVitals.cls = clsValue;
              this.recordMetric("cls", clsValue, "count");
            }
          });
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });
      } catch {
        // CLS observer not supported
      }
    }

    // Navigation timing for TTFB
    if (window.performance?.timing) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const ttfb = timing.responseStart - timing.requestStart;
          if (ttfb > 0) {
            this.webVitals.ttfb = ttfb;
            this.recordMetric("ttfb", ttfb, "ms");
          }
        }, 0);
      });
    }
  }

  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric["unit"],
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Limit stored metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Notify observers
    this.observers.forEach((callback) => callback([metric]));
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().then((result) => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, "ms");
      return result;
    });
  }

  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordMetric(name, duration, "ms");
    return result;
  }

  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  getMetrics(filter?: { name?: string; since?: number }): PerformanceMetric[] {
    let result = [...this.metrics];

    if (filter?.name) {
      result = result.filter((m) => m.name === filter.name);
    }

    if (filter?.since !== undefined) {
      const sinceTimestamp = filter.since;
      result = result.filter((m) => m.timestamp >= sinceTimestamp);
    }

    return result;
  }

  getAverageMetric(name: string, windowMs: number = 60000): number | null {
    const since = Date.now() - windowMs;
    const metrics = this.getMetrics({ name, since });

    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  subscribe(callback: (metrics: PerformanceMetric[]) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  getScore(): { score: number; grade: string; details: Record<string, string> } {
    const vitals = this.getWebVitals();
    let score = 100;
    const details: Record<string, string> = {};

    // LCP scoring (good: <2.5s, needs improvement: <4s, poor: >4s)
    if (vitals.lcp !== null) {
      if (vitals.lcp <= 2500) {
        details.lcp = "Excelente";
      } else if (vitals.lcp <= 4000) {
        score -= 15;
        details.lcp = "Precisa melhorar";
      } else {
        score -= 30;
        details.lcp = "Ruim";
      }
    }

    // FID scoring (good: <100ms, needs improvement: <300ms, poor: >300ms)
    if (vitals.fid !== null) {
      if (vitals.fid <= 100) {
        details.fid = "Excelente";
      } else if (vitals.fid <= 300) {
        score -= 10;
        details.fid = "Precisa melhorar";
      } else {
        score -= 25;
        details.fid = "Ruim";
      }
    }

    // CLS scoring (good: <0.1, needs improvement: <0.25, poor: >0.25)
    if (vitals.cls !== null) {
      if (vitals.cls <= 0.1) {
        details.cls = "Excelente";
      } else if (vitals.cls <= 0.25) {
        score -= 10;
        details.cls = "Precisa melhorar";
      } else {
        score -= 25;
        details.cls = "Ruim";
      }
    }

    // TTFB scoring (good: <800ms, needs improvement: <1800ms, poor: >1800ms)
    if (vitals.ttfb !== null) {
      if (vitals.ttfb <= 800) {
        details.ttfb = "Excelente";
      } else if (vitals.ttfb <= 1800) {
        score -= 10;
        details.ttfb = "Precisa melhorar";
      } else {
        score -= 20;
        details.ttfb = "Ruim";
      }
    }

    score = Math.max(0, Math.min(100, score));

    let grade = "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";

    return { score, grade, details };
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceTracker = new PerformanceTracker();
