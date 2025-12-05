/**
 * Error Tracking System
 * PATCH 833: Comprehensive error tracking and reporting
 */

import { supabase } from '@/integrations/supabase/client';

interface ErrorReport {
  type: 'error' | 'warning' | 'unhandled_rejection' | 'network_error';
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  user_id?: string;
  url?: string;
  timestamp: string;
}

interface ErrorTrackerConfig {
  enabled: boolean;
  sampleRate: number;
  ignorePatterns: RegExp[];
  maxErrors: number;
  flushInterval: number;
  debug: boolean;
}

class ErrorTracker {
  private queue: ErrorReport[] = [];
  private config: ErrorTrackerConfig = {
    enabled: true,
    sampleRate: 1.0,
    ignorePatterns: [
      /ResizeObserver loop/i,
      /Loading chunk/i,
      /Network request failed/i,
    ],
    maxErrors: 50,
    flushInterval: 60000,
    debug: import.meta.env.DEV,
  };
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private errorCount = 0;

  init() {
    this.setupGlobalHandlers();
    this.startAutoFlush();
  }

  private setupGlobalHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled_rejection',
      });
    });

    // Network errors (fetch)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          this.captureError(new Error(`HTTP ${response.status}`), {
            type: 'network_error',
            url: args[0]?.toString(),
            status: response.status,
          });
        }
        return response;
      } catch (error) {
        this.captureError(error as Error, {
          type: 'network_error',
          url: args[0]?.toString(),
        });
        throw error;
      }
    };
  }

  private startAutoFlush() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  configure(config: Partial<ErrorTrackerConfig>) {
    this.config = { ...this.config, ...config };
  }

  captureError(
    error: Error | string,
    context?: Record<string, any>
  ) {
    if (!this.config.enabled) return;
    if (this.errorCount >= this.config.maxErrors) return;

    // Sample rate
    if (Math.random() > this.config.sampleRate) return;

    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Check ignore patterns
    if (this.config.ignorePatterns.some((pattern) => 
      pattern.test(errorObj.message) || pattern.test(errorObj.stack || '')
    )) {
      return;
    }

    const report: ErrorReport = {
      type: context?.type || 'error',
      message: errorObj.message,
      stack: errorObj.stack,
      component: context?.component,
      action: context?.action,
      metadata: {
        ...context,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        } : undefined,
      },
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(report);
    this.errorCount++;

    if (this.config.debug) {
      console.error('[ErrorTracker] Captured:', report);
    }

    // Flush immediately for critical errors
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  captureWarning(message: string, context?: Record<string, any>) {
    this.captureError(new Error(message), { ...context, type: 'warning' });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (level === 'error') {
      this.captureError(new Error(message));
    } else if (level === 'warning') {
      this.captureWarning(message);
    } else if (this.config.debug) {
      console.log('[ErrorTracker] Message:', message);
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      // Store errors in database
      const { error } = await supabase.from('error_logs').insert(
        errors.map((e) => ({
          error_message: e.message,
          error_stack: e.stack,
          component_stack: e.component,
          metadata: {
            type: e.type,
            action: e.action,
            ...e.metadata,
          },
          user_id: e.user_id,
          url: e.url,
          timestamp: e.timestamp,
        }))
      );

      if (error) {
        // Re-queue on failure
        this.queue = [...errors, ...this.queue].slice(0, this.config.maxErrors);
        
        if (this.config.debug) {
          console.error('[ErrorTracker] Flush failed:', error);
        }
      } else if (this.config.debug) {
        console.log('[ErrorTracker] Flushed', errors.length, 'errors');
      }
    } catch (err) {
      this.queue = [...errors, ...this.queue].slice(0, this.config.maxErrors);
    }
  }

  setUser(userId: string) {
    // Add user context to future errors
    this.queue.forEach((e) => {
      if (!e.user_id) e.user_id = userId;
    });
  }

  clearUser() {
    // Remove user context
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  reset() {
    this.queue = [];
    this.errorCount = 0;
  }
}

export const errorTracker = new ErrorTracker();

// React hook
import { useEffect, useCallback } from 'react';

export function useErrorTracking(componentName?: string) {
  useEffect(() => {
    // Component mount tracking for debugging
  }, []);

  const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
    errorTracker.captureError(error, { ...context, component: componentName });
  }, [componentName]);

  const trackWarning = useCallback((message: string, context?: Record<string, any>) => {
    errorTracker.captureWarning(message, { ...context, component: componentName });
  }, [componentName]);

  return { trackError, trackWarning };
}
