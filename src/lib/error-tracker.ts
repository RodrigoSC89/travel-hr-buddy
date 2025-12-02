/**
 * PATCH 652 - Error Tracking System
 * Centralized error tracking and logging
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'validation' | 'authentication' | 'runtime' | 'unknown';

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
  componentStack?: string;
}

export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  recent: ErrorLog[];
  lastError?: ErrorLog;
}

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private maxErrors = 100; // Keep last 100 errors
  private listeners: Set<(error: ErrorLog) => void> = new Set();

  /**
   * Track a new error
   */
  track(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'unknown',
    context?: Record<string, unknown>
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      severity,
      category,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Add to errors array
    this.errors.push(errorLog);

    // Maintain max size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(errorLog));

    // Store in window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__NAUTILUS_ERRORS__ = this.errors;
    }

    // Log to console based on severity
    this.logToConsole(errorLog);

    return errorLog;
  }

  /**
   * Track network error
   */
  trackNetworkError(error: Error | string, context?: Record<string, unknown>): ErrorLog {
    return this.track(error, 'medium', 'network', context);
  }

  /**
   * Track validation error
   */
  trackValidationError(error: Error | string, context?: Record<string, unknown>): ErrorLog {
    return this.track(error, 'low', 'validation', context);
  }

  /**
   * Track authentication error
   */
  trackAuthError(error: Error | string, context?: Record<string, unknown>): ErrorLog {
    return this.track(error, 'high', 'authentication', context);
  }

  /**
   * Track runtime error
   */
  trackRuntimeError(error: Error | string, context?: Record<string, unknown>): ErrorLog {
    return this.track(error, 'high', 'runtime', context);
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.errors.filter(e => e.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    const byCategory: Record<ErrorCategory, number> = {
      network: 0,
      validation: 0,
      authentication: 0,
      runtime: 0,
      unknown: 0,
    };

    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    this.errors.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
    });

    return {
      total: this.errors.length,
      byCategory,
      bySeverity,
      recent: this.errors.slice(-10).reverse(), // Last 10 errors
      lastError: this.errors[this.errors.length - 1],
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
    if (typeof window !== 'undefined') {
      (window as any).__NAUTILUS_ERRORS__ = [];
    }
  }

  /**
   * Add error listener
   */
  addListener(listener: (error: ErrorLog) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Log error to console
   */
  private logToConsole(error: ErrorLog): void {
    const prefix = `[ErrorTracker][${error.severity.toUpperCase()}][${error.category}]`;
    
    switch (error.severity) {
      case 'critical':
      case 'high':
        console.error(prefix, error.message, error);
        break;
      case 'medium':
        console.warn(prefix, error.message, error);
        break;
      case 'low':
        console.info(prefix, error.message, error);
        break;
    }
  }

  /**
   * Initialize global error handlers
   */
  initGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.track(
        event.error || event.message,
        'high',
        'runtime',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track(
        event.reason instanceof Error ? event.reason : String(event.reason),
        'high',
        'runtime',
        {
          type: 'unhandledRejection',
        }
      );
    });
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Initialize global handlers
if (typeof window !== 'undefined') {
  errorTracker.initGlobalHandlers();
}

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).__NAUTILUS_ERROR_TRACKER__ = errorTracker;
}
