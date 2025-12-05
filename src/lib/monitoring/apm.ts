/**
 * PATCH 839: Application Performance Monitoring (APM)
 * Production-grade monitoring for Nautilus One
 */

import { logger } from '@/lib/logger';

export interface APMMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface APMTransaction {
  id: string;
  name: string;
  type: 'page-load' | 'api-call' | 'user-action' | 'background';
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'in-progress' | 'success' | 'error';
  spans: APMSpan[];
  metadata?: Record<string, unknown>;
}

export interface APMSpan {
  id: string;
  name: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
}

export interface APMError {
  id: string;
  message: string;
  stack?: string;
  type: string;
  timestamp: number;
  transactionId?: string;
  metadata?: Record<string, unknown>;
}

class APMService {
  private transactions: Map<string, APMTransaction> = new Map();
  private metrics: APMMetric[] = [];
  private errors: APMError[] = [];
  private maxStoredItems = 100;
  private flushInterval: number | null = null;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupPerformanceObserver();
    this.startFlushInterval();
  }

  /**
   * Start a new transaction
   */
  startTransaction(name: string, type: APMTransaction['type'] = 'user-action'): string {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: APMTransaction = {
      id,
      name,
      type,
      startTime: performance.now(),
      status: 'in-progress',
      spans: [],
    };
    
    this.transactions.set(id, transaction);
    logger.debug(`[APM] Transaction started: ${name}`, { id, type });
    
    return id;
  }

  /**
   * End a transaction
   */
  endTransaction(id: string, status: 'success' | 'error' = 'success', metadata?: Record<string, unknown>) {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      logger.warn(`[APM] Transaction not found: ${id}`);
      return;
    }

    transaction.endTime = performance.now();
    transaction.duration = transaction.endTime - transaction.startTime;
    transaction.status = status;
    transaction.metadata = metadata;

    logger.debug(`[APM] Transaction ended: ${transaction.name}`, {
      id,
      duration: transaction.duration,
      status,
    });

    // Store metric
    this.recordMetric(`transaction.${transaction.type}.duration`, transaction.duration, 'ms', {
      name: transaction.name,
      status,
    });

    // Clean up old transactions
    if (this.transactions.size > this.maxStoredItems) {
      const oldest = Array.from(this.transactions.keys())[0];
      this.transactions.delete(oldest);
    }
  }

  /**
   * Add a span to a transaction
   */
  startSpan(transactionId: string, name: string, type: string): string {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      logger.warn(`[APM] Transaction not found for span: ${transactionId}`);
      return '';
    }

    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    transaction.spans.push({
      id: spanId,
      name,
      type,
      startTime: performance.now(),
    });

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(transactionId: string, spanId: string) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    const span = transaction.spans.find(s => s.id === spanId);
    if (span) {
      span.endTime = performance.now();
      span.duration = span.endTime - span.startTime;
    }
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, unit: string = 'count', tags?: Record<string, string>) {
    const metric: APMMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Trim old metrics
    if (this.metrics.length > this.maxStoredItems * 10) {
      this.metrics = this.metrics.slice(-this.maxStoredItems * 5);
    }
  }

  /**
   * Record an error
   */
  recordError(error: Error | string, type: string = 'unknown', transactionId?: string, metadata?: Record<string, unknown>) {
    const apmError: APMError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type,
      timestamp: Date.now(),
      transactionId,
      metadata,
    };

    this.errors.push(apmError);
    logger.error(`[APM] Error recorded: ${apmError.message}`, { type, transactionId });

    // Trim old errors
    if (this.errors.length > this.maxStoredItems) {
      this.errors = this.errors.slice(-this.maxStoredItems / 2);
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { values: number[] }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = { values: [] };
      }
      summary[metric.name].values.push(metric.value);
    }

    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [name, data] of Object.entries(summary)) {
      const values = data.values;
      result[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return result;
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit: number = 20): APMTransaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 20): APMError[] {
    return this.errors.slice(-limit).reverse();
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      errorRate: number;
      avgResponseTime: number;
      transactionCount: number;
    };
  } {
    const recentTransactions = this.getRecentTransactions(50);
    const errorCount = recentTransactions.filter(t => t.status === 'error').length;
    const errorRate = recentTransactions.length > 0 ? errorCount / recentTransactions.length : 0;
    
    const completedTransactions = recentTransactions.filter(t => t.duration);
    const avgResponseTime = completedTransactions.length > 0
      ? completedTransactions.reduce((acc, t) => acc + (t.duration || 0), 0) / completedTransactions.length
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorRate > 0.1 || avgResponseTime > 3000) {
      status = 'degraded';
    }
    if (errorRate > 0.3 || avgResponseTime > 5000) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: {
        errorRate,
        avgResponseTime,
        transactionCount: recentTransactions.length,
      },
    };
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.recordError(event.error || event.message, 'uncaught', undefined, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(
        event.reason instanceof Error ? event.reason : String(event.reason),
        'unhandled-rejection'
      );
    });
  }

  /**
   * Setup performance observer for web vitals
   */
  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('web-vitals.lcp', lastEntry.startTime, 'ms');
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Observe FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('web-vitals.fid', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Observe CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric('web-vitals.cls', clsValue, 'score');
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            this.recordMetric('resource.api.duration', entry.duration, 'ms', {
              url: entry.name.split('?')[0],
            });
          }
        });
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (e) {
      logger.warn('[APM] Failed to setup performance observer:', { error: String(e) });
    }
  }

  /**
   * Start flush interval for metrics
   */
  private startFlushInterval() {
    if (typeof window === 'undefined') return;

    this.flushInterval = window.setInterval(() => {
      const health = this.getHealthStatus();
      logger.debug('[APM] Health check:', health);
      
      // Record system metrics
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMetric('system.memory.used', memory.usedJSHeapSize / 1024 / 1024, 'MB');
        this.recordMetric('system.memory.total', memory.totalJSHeapSize / 1024 / 1024, 'MB');
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

// Singleton instance
export const apm = new APMService();

/**
 * Higher-order function to track async operations
 */
export function withAPM<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  type: APMTransaction['type'] = 'api-call'
): T {
  return (async (...args: Parameters<T>) => {
    const txnId = apm.startTransaction(name, type);
    try {
      const result = await fn(...args);
      apm.endTransaction(txnId, 'success');
      return result;
    } catch (error) {
      apm.endTransaction(txnId, 'error', { error: String(error) });
      apm.recordError(error as Error, 'api-error', txnId);
      throw error;
    }
  }) as T;
}

/**
 * React hook for tracking component performance
 */
export function useAPMTransaction(name: string, type: APMTransaction['type'] = 'user-action') {
  const txnIdRef = { current: '' };

  const start = () => {
    txnIdRef.current = apm.startTransaction(name, type);
    return txnIdRef.current;
  };

  const end = (status: 'success' | 'error' = 'success', metadata?: Record<string, unknown>) => {
    if (txnIdRef.current) {
      apm.endTransaction(txnIdRef.current, status, metadata);
    }
  };

  const addSpan = (spanName: string, spanType: string) => {
    if (txnIdRef.current) {
      return apm.startSpan(txnIdRef.current, spanName, spanType);
    }
    return '';
  };

  const endSpan = (spanId: string) => {
    if (txnIdRef.current && spanId) {
      apm.endSpan(txnIdRef.current, spanId);
    }
  };

  return { start, end, addSpan, endSpan };
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).__apm = apm;
}
