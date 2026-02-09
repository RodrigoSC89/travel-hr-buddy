/**
 * NAUTI ONE — Observability Helper v2.0
 * Centralized instrumentation for Supabase queries and mutations
 */

import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/react';

interface QueryMetrics {
  module: string;
  operation: string;
  table: string;
  duration: number;
  success: boolean;
  error?: string;
  rowCount?: number;
}

/**
 * Log and track a Supabase query/mutation with full context
 */
export function trackQuery(metrics: QueryMetrics) {
  const { module, operation, table, duration, success, error, rowCount } = metrics;

  if (success) {
    logger.info(`[Query] ${module}/${operation} on ${table}: ${duration}ms (${rowCount ?? '?'} rows)`);
  } else {
    logger.error(`[Query] ${module}/${operation} on ${table} FAILED: ${error} (${duration}ms)`);
    
    // Report to Sentry
    if (typeof Sentry?.captureMessage === 'function') {
      Sentry.captureMessage(`Query failed: ${module}/${operation}`, {
        level: 'error',
        extra: { table, duration, error },
        tags: { module, operation, table },
      });
    }
  }

  // Track timing via breadcrumb (Sentry metrics API may vary by version)
  if (typeof Sentry?.addBreadcrumb === 'function') {
    Sentry.addBreadcrumb({
      category: 'query.timing',
      message: `${module}/${operation} on ${table}: ${duration}ms`,
      level: success ? 'info' : 'error',
      data: { module, operation, table, duration, success },
    });
  }
}

/**
 * Wrap a Supabase query with automatic timing and error tracking
 */
export async function instrumentQuery<T>(
  module: string,
  operation: string,
  table: string,
  queryFn: () => Promise<{ data: T | null; error: { message: string } | null }>
): Promise<{ data: T | null; error: { message: string } | null }> {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const duration = Math.round(performance.now() - start);
    
    trackQuery({
      module,
      operation,
      table,
      duration,
      success: !result.error,
      error: result.error?.message,
      rowCount: Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0,
    });
    
    return result;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    const errorMsg = err instanceof Error ? err.message : String(err);
    
    trackQuery({
      module,
      operation,
      table,
      duration,
      success: false,
      error: errorMsg,
    });
    
    return { data: null, error: { message: errorMsg } };
  }
}

/**
 * Track user actions for breadcrumb context
 */
export function trackUserAction(action: string, module: string, details?: Record<string, unknown>) {
  if (typeof Sentry?.addBreadcrumb === 'function') {
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: `${module}: ${action}`,
      level: 'info',
      data: details,
    });
  }
  logger.info(`[Action] ${module}: ${action}`, details);
}

/**
 * Track page performance
 */
export function trackPageLoad(pageName: string, loadTime: number) {
  if (typeof Sentry?.addBreadcrumb === 'function') {
    Sentry.addBreadcrumb({
      category: 'page.load',
      message: `${pageName} loaded in ${loadTime}ms`,
      level: 'info',
      data: { pageName, loadTime },
    });
  }
  logger.info(`[Perf] ${pageName} loaded in ${loadTime}ms`);
}
