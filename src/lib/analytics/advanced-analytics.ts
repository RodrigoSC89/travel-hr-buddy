/**
 * PATCH 839: Advanced Analytics System
 * Comprehensive analytics for maritime operations
 */

import { useState, useEffect, useCallback } from 'react';

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  pages: string[];
  events: AnalyticsEvent[];
  device: {
    type: string;
    os: string;
    browser: string;
  };
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  sampleRate: number;
  batchSize: number;
  flushInterval: number;
}

class AdvancedAnalytics {
  private config: AnalyticsConfig;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private flushTimer: number | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      sampleRate: 1.0, // 100%
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.initSession();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initSession(): void {
    // Track session start
    this.track('session_start', 'system', {
      referrer: document.referrer,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Track page views
    this.trackPageView();

    // Listen for page changes
    window.addEventListener('popstate', () => this.trackPageView());

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.track('session_end', 'system', {
        duration: Date.now() - this.getSessionStartTime(),
      });
      this.flush();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('tab_hidden', 'engagement');
      } else {
        this.track('tab_visible', 'engagement');
      }
    });
  }

  private getSessionStartTime(): number {
    const stored = sessionStorage.getItem('session_start');
    if (stored) return parseInt(stored, 10);
    const now = Date.now();
    sessionStorage.setItem('session_start', now.toString());
    return now;
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Track custom event
  track(name: string, category: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;
    if (Math.random() > this.config.sampleRate) return;

    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);

    if (this.config.debug) {
      console.log('[Analytics] Event:', event);
    }

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Track page view
  trackPageView(path?: string): void {
    const currentPath = path || window.location.pathname;
    this.track('page_view', 'navigation', {
      path: currentPath,
      title: document.title,
      referrer: document.referrer,
    });
  }

  // Track user interaction
  trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
    this.track('interaction', 'engagement', {
      element,
      action,
      ...properties,
    });
  }

  // Track error
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', 'system', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  // Track performance metric
  trackMetric(name: string, value: number, unit: string = 'ms'): void {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
    };

    this.metricsQueue.push(metric);

    if (this.config.debug) {
      console.log('[Analytics] Metric:', metric);
    }
  }

  // Track Web Vitals
  trackWebVitals(): void {
    if ('performance' in window) {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
      if (fcp) {
        this.trackMetric('FCP', fcp.startTime);
      }

      // Time to First Byte
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
        this.trackMetric('TTFB', ttfb);
      }

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackMetric('LCP', lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          this.trackMetric('FID', entry.processingStart - entry.startTime);
        });
      }).observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.trackMetric('CLS', clsValue, 'score');
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }

  // Get analytics data
  getAnalytics(): {
    events: AnalyticsEvent[];
    metrics: PerformanceMetric[];
    session: { id: string; duration: number };
  } {
    return {
      events: [...this.eventQueue],
      metrics: [...this.metricsQueue],
      session: {
        id: this.sessionId,
        duration: Date.now() - this.getSessionStartTime(),
      },
    };
  }

  // Flush queued data
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0 && this.metricsQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    const metrics = [...this.metricsQueue];

    this.eventQueue = [];
    this.metricsQueue = [];

    try {
      // In production, this would send to analytics backend
      if (this.config.debug) {
        console.log('[Analytics] Flushing:', { events, metrics });
      }

      // Store locally for now
      const stored = JSON.parse(localStorage.getItem('analytics_history') || '[]');
      stored.push({ events, metrics, timestamp: new Date().toISOString() });
      
      // Keep only last 100 entries
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem('analytics_history', JSON.stringify(stored));
    } catch (error) {
      // Re-queue on failure
      this.eventQueue = [...events, ...this.eventQueue];
      this.metricsQueue = [...metrics, ...this.metricsQueue];
    }
  }

  // Enable/disable
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  // Destroy instance
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const analytics = new AdvancedAnalytics({ debug: false });

// Initialize web vitals tracking
if (typeof window !== 'undefined') {
  analytics.trackWebVitals();
}

// React hooks
export function useAnalytics() {
  const track = useCallback((name: string, category: string, properties?: Record<string, any>) => {
    analytics.track(name, category, properties);
  }, []);

  const trackInteraction = useCallback((element: string, action: string, properties?: Record<string, any>) => {
    analytics.trackInteraction(element, action, properties);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, []);

  return { track, trackInteraction, trackError };
}

export function usePageTracking() {
  useEffect(() => {
    analytics.trackPageView();
  }, []);
}

export function useAnalyticsData() {
  const [data, setData] = useState(analytics.getAnalytics());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(analytics.getAnalytics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
