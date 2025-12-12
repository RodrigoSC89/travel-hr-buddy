/**
 * Web Vitals Monitor
 * PATCH 833: Real-time performance monitoring with Web Vitals
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

interface VitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

interface PerformanceReport {
  vitals: VitalMetric[];
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

type VitalCallback = (metric: VitalMetric) => void;

class WebVitalsMonitor {
  private metrics: Map<string, VitalMetric> = new Map();
  private callbacks: VitalCallback[] = [];
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const handleMetric = (metric: Metric) => {
      const vitalMetric: VitalMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };

      this.metrics.set(metric.name, vitalMetric);
      this.callbacks.forEach(cb => cb(vitalMetric));

      // Log to console in development
      if (import.meta.env.DEV) {
      }
    };

    // Register all Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }

  onMetric(callback: VitalCallback) {
    this.callbacks.push(callback);
    // Send existing metrics to new callback
    this.metrics.forEach(metric => callback(metric));
    
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }

  getMetrics(): VitalMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetric(name: string): VitalMetric | undefined {
    return this.metrics.get(name);
  }

  generateReport(): PerformanceReport {
    const connection = (navigator as any).connection;
    
    return {
      vitals: this.getMetrics(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      } : undefined,
    };
  }

  getPerformanceScore(): number {
    const weights = {
      LCP: 25,
      FID: 25,
      CLS: 25,
      INP: 25,
    };

    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      INP: { good: 200, poor: 500 },
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([name, weight]) => {
      const metric = this.metrics.get(name);
      const threshold = thresholds[name as keyof typeof thresholds];

      if (metric && threshold) {
        let score: number;
        if (metric.value <= threshold.good) {
          score = 100;
        } else if (metric.value >= threshold.poor) {
          score = 0;
        } else {
          score = 100 * (1 - (metric.value - threshold.good) / (threshold.poor - threshold.good));
        }
        totalScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  async sendToAnalytics(endpoint?: string) {
    const report = this.generateReport();
    
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
          keepalive: true,
        });
      } catch (error) {
        console.error("[Web Vitals] Failed to send report:", error);
        console.error("[Web Vitals] Failed to send report:", error);
      }
    }

    return report;
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

// React hook for Web Vitals
import { useState, useEffect } from "react";

export function useWebVitals() {
  const [metrics, setMetrics] = useState<VitalMetric[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    webVitalsMonitor.init();

    const unsubscribe = webVitalsMonitor.onMetric(() => {
      setMetrics(webVitalsMonitor.getMetrics());
      setScore(webVitalsMonitor.getPerformanceScore());
    });

    return unsubscribe;
  }, []);

  return {
    metrics,
    score,
    report: () => webVitalsMonitor.generateReport(),
    sendReport: (endpoint?: string) => webVitalsMonitor.sendToAnalytics(endpoint),
  };
}
