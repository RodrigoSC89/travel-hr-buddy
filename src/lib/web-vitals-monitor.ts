/**
 * Web Vitals Monitoring Service
 * Real-time Core Web Vitals tracking with alerting
 */

import { onCLS, onLCP, onTTFB, onFCP, onINP, type Metric } from 'web-vitals';

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

export interface VitalsThresholds {
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  TTFB: { good: number; poor: number };
  FCP: { good: number; poor: number };
  INP: { good: number; poor: number };
}

const DEFAULT_THRESHOLDS: VitalsThresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 }
};

// 2Mbps network thresholds (more lenient)
const SLOW_NETWORK_THRESHOLDS: VitalsThresholds = {
  LCP: { good: 4500, poor: 6000 },
  FID: { good: 150, poor: 400 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 1500, poor: 3000 },
  FCP: { good: 3500, poor: 5000 },
  INP: { good: 300, poor: 600 }
};

export type VitalsCallback = (metric: VitalMetric) => void;
export type AlertCallback = (metric: VitalMetric, message: string) => void;

class WebVitalsMonitor {
  private metrics: Map<string, VitalMetric> = new Map();
  private callbacks: VitalsCallback[] = [];
  private alertCallbacks: AlertCallback[] = [];
  private thresholds: VitalsThresholds = DEFAULT_THRESHOLDS;
  private isSlowNetwork: boolean = false;
  private reportEndpoint: string | null = null;
  private batchQueue: VitalMetric[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  
  initialize(options: {
    reportEndpoint?: string;
    isSlowNetwork?: boolean;
    onMetric?: VitalsCallback;
    onAlert?: AlertCallback;
  } = {}): void {
    this.reportEndpoint = options.reportEndpoint || null;
    this.isSlowNetwork = options.isSlowNetwork || false;
    this.thresholds = this.isSlowNetwork ? SLOW_NETWORK_THRESHOLDS : DEFAULT_THRESHOLDS;
    
    if (options.onMetric) {
      this.callbacks.push(options.onMetric);
    }
    
    if (options.onAlert) {
      this.alertCallbacks.push(options.onAlert);
    }
    
    // Register all web vitals
    this.registerVitals();
  }
  
  private registerVitals(): void {
    const handleMetric = (metric: Metric) => {
      const vitalMetric: VitalMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType || 'unknown',
        timestamp: Date.now()
      };
      
      this.metrics.set(metric.name, vitalMetric);
      this.notifyCallbacks(vitalMetric);
      this.checkAlerts(vitalMetric);
      this.queueForReport(vitalMetric);
    };
    
    onCLS(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric); // INP replaced FID in web-vitals v4+
  }
  
  private notifyCallbacks(metric: VitalMetric): void {
    this.callbacks.forEach(cb => cb(metric));
  }
  
  private checkAlerts(metric: VitalMetric): void {
    const threshold = this.thresholds[metric.name as keyof VitalsThresholds];
    
    if (!threshold) return;
    
    if (metric.value > threshold.poor) {
      const message = `${metric.name} is POOR: ${metric.value.toFixed(2)} (threshold: ${threshold.poor})`;
      this.alertCallbacks.forEach(cb => cb(metric, message));
      console.warn(`[WebVitals Alert] ${message}`);
    }
  }
  
  private queueForReport(metric: VitalMetric): void {
    if (!this.reportEndpoint) return;
    
    this.batchQueue.push(metric);
    
    // Batch reports every 5 seconds
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.sendBatchReport();
      }, 5000);
    }
  }
  
  private async sendBatchReport(): Promise<void> {
    if (!this.reportEndpoint || this.batchQueue.length === 0) return;
    
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;
    
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: batch,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          isSlowNetwork: this.isSlowNetwork
        }),
        keepalive: true
      });
    } catch (error) {
      console.error('[WebVitals] Failed to report metrics:', error);
      // Re-queue failed metrics
      this.batchQueue.push(...batch);
    }
  }
  
  onMetric(callback: VitalsCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }
  
  onAlert(callback: AlertCallback): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) this.alertCallbacks.splice(index, 1);
    };
  }
  
  getMetrics(): Record<string, VitalMetric> {
    return Object.fromEntries(this.metrics);
  }
  
  getScore(): {
    score: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    details: Record<string, { value: number; rating: string }>;
  } {
    const details: Record<string, { value: number; rating: string }> = {};
    let goodCount = 0;
    let poorCount = 0;
    let totalCount = 0;
    
    this.metrics.forEach((metric, name) => {
      details[name] = {
        value: metric.value,
        rating: metric.rating
      };
      
      totalCount++;
      if (metric.rating === 'good') goodCount++;
      if (metric.rating === 'poor') poorCount++;
    });
    
    const score = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
    let rating: 'good' | 'needs-improvement' | 'poor' = 'needs-improvement';
    
    if (poorCount === 0 && goodCount === totalCount) {
      rating = 'good';
    } else if (poorCount >= totalCount / 2) {
      rating = 'poor';
    }
    
    return { score, rating, details };
  }
  
  setSlowNetworkMode(isSlowNetwork: boolean): void {
    this.isSlowNetwork = isSlowNetwork;
    this.thresholds = isSlowNetwork ? SLOW_NETWORK_THRESHOLDS : DEFAULT_THRESHOLDS;
  }
  
  // Force send any pending reports (useful before page unload)
  flush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.sendBatchReport();
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

// Export hook for React components
export const useWebVitals = () => {
  return {
    getMetrics: () => webVitalsMonitor.getMetrics(),
    getScore: () => webVitalsMonitor.getScore(),
    onMetric: (cb: VitalsCallback) => webVitalsMonitor.onMetric(cb),
    onAlert: (cb: AlertCallback) => webVitalsMonitor.onAlert(cb)
  };
};
