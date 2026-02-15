/**
 * Sprint 5: Web Vitals Monitor
 * Real-time Core Web Vitals tracking with performance budgets
 */

export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface PerformanceBudget {
  LCP: number;  // ms
  FID: number;  // ms
  CLS: number;  // score
  FCP: number;  // ms
  TTFB: number; // ms
  INP: number;  // ms
}

const MARITIME_BUDGET: PerformanceBudget = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
  INP: 200,
};

const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  FID: [100, 300],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
  INP: [200, 500],
};

function getRating(name: string, value: number): WebVitalMetric['rating'] {
  const [good, poor] = THRESHOLDS[name] || [0, 0];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

class WebVitalsMonitor {
  private metrics: Map<string, WebVitalMetric> = new Map();
  private listeners: Set<(metrics: WebVitalMetric[]) => void> = new Set();
  private budget = MARITIME_BUDGET;
  private initialized = false;

  async init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      const { onLCP, onCLS, onFCP, onTTFB, onINP } = await import('web-vitals');

      const record = (name: WebVitalMetric['name']) => (entry: { value: number }) => {
        const metric: WebVitalMetric = {
          name,
          value: Math.round(name === 'CLS' ? entry.value * 1000 : entry.value) / (name === 'CLS' ? 1000 : 1),
          rating: getRating(name, entry.value),
          timestamp: Date.now(),
        };
        this.metrics.set(name, metric);
        this.notify();

        // Log budget violations
        if (entry.value > this.budget[name]) {
          console.warn(`[WebVitals] ${name} exceeded budget: ${entry.value} > ${this.budget[name]}`);
        }
      };

      onLCP(record('LCP'));
      onCLS(record('CLS'));
      onFCP(record('FCP'));
      onTTFB(record('TTFB'));
      onINP(record('INP'));
    } catch {
      // web-vitals not available, use Performance API fallback
      this.fallbackMeasure();
    }
  }

  private fallbackMeasure() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const m: WebVitalMetric = {
            name: 'LCP',
            value: Math.round(entry.startTime),
            rating: getRating('LCP', entry.startTime),
            timestamp: Date.now(),
          };
          this.metrics.set('LCP', m);
          this.notify();
        }
      }
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch { /* unsupported */ }

    // Measure TTFB from navigation timing
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      const ttfb = nav.responseStart - nav.requestStart;
      this.metrics.set('TTFB', {
        name: 'TTFB',
        value: Math.round(ttfb),
        rating: getRating('TTFB', ttfb),
        timestamp: Date.now(),
      });
    }
  }

  subscribe(listener: (metrics: WebVitalMetric[]) => void) {
    this.listeners.add(listener);
    // Immediately emit current state
    if (this.metrics.size > 0) listener(this.getAll());
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    const all = this.getAll();
    this.listeners.forEach(fn => fn(all));
  }

  getAll(): WebVitalMetric[] {
    return Array.from(this.metrics.values());
  }

  getScore(): number {
    const all = this.getAll();
    if (all.length === 0) return 100;
    const scores = all.map(m => m.rating === 'good' ? 100 : m.rating === 'needs-improvement' ? 60 : 20);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  getBudget() {
    return { ...this.budget };
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();
