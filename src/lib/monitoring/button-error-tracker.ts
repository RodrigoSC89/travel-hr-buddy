/**
 * Button Error Tracker - Sentry Integration
 * Monitors button click errors in production for real-time alerts
 */

import * as Sentry from "@sentry/react";

export interface ButtonErrorContext {
  buttonId?: string;
  buttonText?: string;
  componentName?: string;
  moduleName?: string;
  action?: string;
  userId?: string;
  route?: string;
}

/**
 * Track button click error with Sentry
 */
export function trackButtonError(
  error: Error,
  context: ButtonErrorContext
): void {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    console.warn('[ButtonErrorTracker] Sentry not configured, logging locally:', {
      error: error.message,
      ...context
    });
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'button_click');
    scope.setTag('module', context.moduleName || 'unknown');
    scope.setTag('component', context.componentName || 'unknown');
    scope.setTag('action', context.action || 'unknown');
    scope.setLevel('error');
    
    scope.setContext('button_context', {
      buttonId: context.buttonId,
      buttonText: context.buttonText,
      componentName: context.componentName,
      moduleName: context.moduleName,
      action: context.action,
      route: context.route || window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    Sentry.captureException(error);
  });
}

/**
 * Track non-functional button (button without handler)
 */
export function trackNonFunctionalButton(context: ButtonErrorContext): void {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    console.warn('[ButtonErrorTracker] Non-functional button detected:', context);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'non_functional_button');
    scope.setTag('module', context.moduleName || 'unknown');
    scope.setLevel('warning');
    
    scope.setContext('button_context', {
      ...context,
      route: context.route || window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    Sentry.captureMessage(
      `Non-functional button: ${context.buttonText || context.buttonId || 'unknown'}`,
      'warning'
    );
  });
}

/**
 * Create safe button click handler with error tracking
 */
export function createTrackedHandler(
  handler: () => void | Promise<void>,
  context: ButtonErrorContext
): () => void {
  return async () => {
    try {
      await handler();
    } catch (error) {
      trackButtonError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error; // Re-throw to allow error boundaries to catch
    }
  };
}

/**
 * HOC to wrap button handlers with error tracking
 */
export function withButtonTracking<T extends (...args: any[]) => any>(
  handler: T,
  context: ButtonErrorContext
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = handler(...args);
      
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          trackButtonError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      trackButtonError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error;
    }
  }) as T;
}

/**
 * Button performance tracker
 */
export function trackButtonPerformance(
  buttonId: string,
  startTime: number,
  moduleName?: string
): void {
  const duration = performance.now() - startTime;
  
  // Only track if performance is significantly slow (>1000ms)
  if (duration > 1000) {
    Sentry.addBreadcrumb({
      category: 'button_performance',
      message: `Slow button action: ${buttonId}`,
      level: 'warning',
      data: {
        buttonId,
        duration: Math.round(duration),
        moduleName,
        route: window.location.pathname,
      },
    });
  }
}

export default {
  trackButtonError,
  trackNonFunctionalButton,
  createTrackedHandler,
  withButtonTracking,
  trackButtonPerformance,
};
