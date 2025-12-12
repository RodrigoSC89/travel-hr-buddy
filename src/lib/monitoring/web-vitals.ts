/**
 * Web Vitals Monitoring
 * Track Core Web Vitals in production
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from "web-vitals";

interface VitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

type VitalsCallback = (metric: VitalMetric) => void;

class WebVitalsMonitor {
  private metrics: Map<string, VitalMetric> = new Map();
  private callbacks: Set<VitalsCallback> = new Set();
  private isInitialized = false;

  /**
   * Initialize Web Vitals tracking
   */
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
        navigationType: metric.navigationType || "unknown",
      };

      this.metrics.set(metric.name, vitalMetric);
      this.callbacks.forEach(cb => cb(vitalMetric));

      // Log in development
      if (import.meta.env.DEV) {
      }
    };

    // Track all Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback: VitalsCallback): () => void {
    this.callbacks.add(callback);
    // Send existing metrics
    this.metrics.forEach(metric => callback(metric));
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): VitalMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): VitalMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get performance score (0-100)
   */
  getScore(): number {
    const weights: Record<string, number> = {
      LCP: 33,
      CLS: 33,
      INP: 34,
    };

    const scores: Record<string, Record<string, number>> = {
      LCP: { good: 100, "needs-improvement": 50, poor: 0 },
      CLS: { good: 100, "needs-improvement": 50, poor: 0 },
      INP: { good: 100, "needs-improvement": 50, poor: 0 },
    };

    let totalWeight = 0;
    let totalScore = 0;

    Object.keys(weights).forEach(name => {
      const metric = this.metrics.get(name);
      if (metric) {
        totalWeight += weights[name];
        totalScore += weights[name] * (scores[name][metric.rating] || 0);
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Send metrics to analytics endpoint
   */
  async sendToAnalytics(endpoint: string) {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return;

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics,
          score: this.getScore(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      });
    } catch (error) {
      console.warn("[WebVitals] Failed to send metrics:", error);
      console.warn("[WebVitals] Failed to send metrics:", error);
    }
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

/**
 * React hook for Web Vitals
 */
import { useState, useEffect } from "react";

export function useWebVitals() {
  const [metrics, setMetrics] = useState<VitalMetric[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    webVitalsMonitor.init();

    const unsubscribe = webVitalsMonitor.subscribe(() => {
      setMetrics(webVitalsMonitor.getMetrics());
      setScore(webVitalsMonitor.getScore());
    });

    return unsubscribe;
  }, []);

  return { metrics, score };
}

/**
 * Performance budget thresholds
 */
export const PERFORMANCE_BUDGETS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  CLS: { good: 0.1, poor: 0.25 }, // score
  INP: { good: 200, poor: 500 }, // ms
  TTFB: { good: 800, poor: 1800 }, // ms
  FCP: { good: 1800, poor: 3000 }, // ms
};

/**
 * Check if metric exceeds budget
 */
export function checkBudget(metric: VitalMetric): boolean {
  const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS];
  if (!budget) return true;
  return metric.value <= budget.poor;
}
