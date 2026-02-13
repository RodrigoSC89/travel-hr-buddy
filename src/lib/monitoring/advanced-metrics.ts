/**
 * Advanced Monitoring System - Nautilus One v3.2.0
 * Business metrics, SLA tracking, and user journey analytics
 */

import * as Sentry from '@sentry/react';
import { logger } from '@/lib/logger';

// Types
interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  mean?: number;
  stdDev?: number;
  action?: string;
}

interface SLAConfig {
  maxDuration: number; // ms
  alertThreshold: number; // ms
}

// PostHog-like tracking (can be replaced with real PostHog)
class AnalyticsTracker {
  private events: Array<{ event: string; properties: Record<string, unknown>; timestamp: Date }> = [];
  
  capture(params: { distinctId: string; event: string; properties?: Record<string, unknown> }) {
    const eventData = {
      event: params.event,
      properties: {
        distinctId: params.distinctId,
        ...params.properties,
      },
      timestamp: new Date(),
    };
    
    this.events.push(eventData);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Analytics]', eventData);
    }
    
    // Send to backend in batches
    if (this.events.length >= 10) {
      this.flush();
    }
  }
  
  async flush() {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    try {
      // Could send to analytics backend
      logger.debug('[Analytics] Flushing', { count: eventsToSend.length });
    } catch (error) {
      // Re-add events on failure
      this.events.unshift(...eventsToSend);
    }
  }
}

const analyticsTracker = new AnalyticsTracker();

export class AdvancedMonitoring {
  // Track business metrics
  static trackBusinessMetric(metric: Metric) {
    // Send to analytics
    analyticsTracker.capture({
      distinctId: 'system',
      event: `metric_${metric.name}`,
      properties: {
        value: metric.value,
        ...metric.tags,
      },
    });
    
    // Send to Sentry as custom metric
    try {
      Sentry.setMeasurement(metric.name, metric.value, 'none');
    } catch (error) {
      logger.warn('Sentry metrics not available:', error);
    }
    
    // Store locally for trend analysis
    this.storeMetricLocally(metric);
  }
  
  // Track operation with SLA
  static async trackSLA<T>(
    operation: string,
    fn: () => Promise<T>,
    config: SLAConfig = { maxDuration: 5000, alertThreshold: 3000 }
  ): Promise<T> {
    const start = Date.now();
    let success = false;
    
    try {
      const result = await fn();
      success = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      const duration = Date.now() - start;
      
      this.trackBusinessMetric({
        name: `sla_${operation}_duration`,
        value: duration,
        tags: {
          success: success.toString(),
          operation,
        },
      });
      
      // Alert if SLA violated
      if (duration > config.alertThreshold) {
        const severity = duration > config.maxDuration ? 'warning' : 'info';
        
        Sentry.captureMessage(
          `SLA ${severity}: ${operation} took ${duration}ms (threshold: ${config.alertThreshold}ms)`,
          severity
        );
        // SLA violations are captured by Sentry above
      }
    }
  }
  
  // Track user journey steps
  static trackUserJourney(step: string, metadata?: Record<string, unknown>) {
    analyticsTracker.capture({
      distinctId: String(metadata?.userId ?? 'anonymous'),
      event: `journey_${step}`,
      properties: {
        step,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
    
    // Also add breadcrumb to Sentry
    Sentry.addBreadcrumb({
      category: 'user_journey',
      message: step,
      level: 'info',
      data: metadata,
    });
  }
  
  // Track feature usage
  static trackFeatureUsage(feature: string, userId: string, metadata?: Record<string, unknown>) {
    analyticsTracker.capture({
      distinctId: userId,
      event: 'feature_used',
      properties: {
        feature,
        ...metadata,
      },
    });
  }
  
  // Track page views with performance
  static trackPageView(path: string, userId?: string) {
    const performance = typeof window !== 'undefined' ? window.performance : null;
    const timing = performance?.timing;
    
    const metrics: Record<string, number> = {};
    
    if (timing) {
      metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      metrics.firstByte = timing.responseStart - timing.navigationStart;
    }
    
    analyticsTracker.capture({
      distinctId: userId || 'anonymous',
      event: 'page_view',
      properties: {
        path,
        ...metrics,
      },
    });
  }
  
  // Track errors with context
  static trackError(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, {
      extra: context,
    });
    
    analyticsTracker.capture({
      distinctId: 'system',
      event: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }
  
  // Store metric locally for trend analysis
  private static storeMetricLocally(metric: Metric) {
    try {
      const storageKey = `metric_${metric.name}`;
      const existing = sessionStorage.getItem(storageKey);
      const history: Array<{ value: number; timestamp: string }> = existing 
        ? JSON.parse(existing) 
        : [];
      
      history.push({
        value: metric.value,
        timestamp: new Date().toISOString(),
      });
      
      // Keep last 100 entries
      if (history.length > 100) {
        history.shift();
      }
      
      sessionStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      // Ignore storage errors
    }
  }
  
  // Get metric history for analysis
  static getMetricHistory(metricName: string, days: number = 7): number[] {
    try {
      const storageKey = `metric_${metricName}`;
      const existing = sessionStorage.getItem(storageKey);
      if (!existing) return [];
      
      const history: Array<{ value: number; timestamp: string }> = JSON.parse(existing);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      
      return history
        .filter(h => new Date(h.timestamp) > cutoff)
        .map(h => h.value);
    } catch {
      return [];
    }
  }
  
  // Detect anomalies using z-score
  static detectAnomaly(metricName: string, currentValue: number): {
    isAnomaly: boolean;
    zScore: number;
    mean: number;
    stdDev: number;
  } {
    const history = this.getMetricHistory(metricName, 7);
    
    if (history.length < 5) {
      return { isAnomaly: false, zScore: 0, mean: 0, stdDev: 0 };
    }
    
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const stdDev = Math.sqrt(
      history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length
    );
    
    const zScore = stdDev > 0 ? Math.abs((currentValue - mean) / stdDev) : 0;
    
    return {
      isAnomaly: zScore > 3, // 3 standard deviations = anomaly
      zScore,
      mean,
      stdDev,
    };
  }
  
  // Predict trend using linear regression
  static predictTrend(metricName: string): {
    nextValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  } {
    const history = this.getMetricHistory(metricName, 7);
    
    if (history.length < 3) {
      return { nextValue: 0, trend: 'stable', confidence: 0 };
    }
    
    const n = history.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = history.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * history[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) {
      return { nextValue: history[history.length - 1], trend: 'stable', confidence: 0 };
    }
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    const nextValue = slope * n + intercept;
    
    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssTotal = history.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = history.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    
    const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;
    
    return {
      nextValue,
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      confidence: Math.max(0, Math.min(1, rSquared)),
    };
  }
  
  // Flush all pending analytics
  static async flush() {
    await analyticsTracker.flush();
  }
}

// React hook for page tracking
export function usePageTracking() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    AdvancedMonitoring.trackPageView(path);
  }
}

// Export for global access
export default AdvancedMonitoring;
