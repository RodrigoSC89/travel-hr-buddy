/**
 * FASE 3.3 - Error Tracking Service
 * Sistema centralizado de tracking de erros com suporte a Sentry
 */

import { 
  ErrorLog, 
  ErrorStats, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext,
  ErrorTrackingConfig 
} from "./types";

class ErrorTrackingService {
  private errors: ErrorLog[] = [];
  private listeners: Set<(error: ErrorLog) => void> = new Set();
  private config: ErrorTrackingConfig = {
    enabled: true,
    environment: (import.meta.env.MODE as any) || "development",
    sampleRate: 1.0,
    maxErrors: 100,
    enableConsoleLogging: true,
  };
  private sentryInitialized = false;

  /**
   * Initialize error tracking service
   */
  initialize(config: Partial<ErrorTrackingConfig> = {}): void {
    this.config = { ...this.config, ...config };

    // Initialize Sentry if DSN is provided
    if (this.config.sentryDsn && !this.sentryInitialized) {
      this.initializeSentry();
    }

    // Initialize global error handlers
    this.initializeGlobalHandlers();

    // Expose to window for debugging
    if (typeof window !== "undefined") {
      (window as any).__NAUTILUS_ERROR_TRACKER__ = this;
    }
  }

  /**
   * Initialize Sentry SDK
   */
  private async initializeSentry(): Promise<void> {
    try {
      // Dynamic import of Sentry (only if needed)
      const Sentry = await import("@sentry/react");

      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        sampleRate: this.config.sampleRate,
        tracesSampleRate: 0.1,
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        beforeSend(event, hint) {
          // Filter out non-critical errors in development
          if (
            process.env.NODE_ENV === "development" &&
            hint.originalException instanceof Error &&
            hint.originalException.message?.includes("ResizeObserver")
          ) {
            return null;
          }
          return event;
        },
      });

      this.sentryInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Sentry:", error);
    }
  }

  /**
   * Track an error
   */
  track(
    error: Error | string,
    severity: ErrorSeverity = "error",
    category: ErrorCategory = "unknown",
    context?: ErrorContext
  ): ErrorLog {
    if (!this.config.enabled) {
      return this.createErrorLog(error, severity, category, context);
    }

    const errorLog = this.createErrorLog(error, severity, category, context);

    // Add to internal storage
    this.addError(errorLog);

    // Log to console (if enabled)
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorLog);
    }

    // Send to Sentry (if initialized)
    if (this.sentryInitialized) {
      this.sendToSentry(errorLog);
    }

    // Notify listeners
    this.notifyListeners(errorLog);

    return errorLog;
  }

  /**
   * Track network error
   */
  trackNetworkError(error: Error | string, context?: ErrorContext): ErrorLog {
    return this.track(error, "error", "network", context);
  }

  /**
   * Track validation error
   */
  trackValidationError(error: Error | string, context?: ErrorContext): ErrorLog {
    return this.track(error, "warning", "validation", context);
  }

  /**
   * Track authentication error
   */
  trackAuthError(error: Error | string, context?: ErrorContext): ErrorLog {
    return this.track(error, "error", "authentication", context);
  }

  /**
   * Track API error
   */
  trackAPIError(error: Error | string, statusCode?: number, context?: ErrorContext): ErrorLog {
    const severity: ErrorSeverity = statusCode && statusCode >= 500 ? "critical" : "error";
    return this.track(error, severity, "api", {
      ...context,
      metadata: { ...context?.metadata, statusCode },
    });
  }

  /**
   * Track runtime error
   */
  trackRuntimeError(error: Error | string, context?: ErrorContext): ErrorLog {
    return this.track(error, "critical", "runtime", context);
  }

  /**
   * Create error log object
   */
  private createErrorLog(
    error: Error | string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context?: ErrorContext
  ): ErrorLog {
    const errorObj = typeof error === "string" ? new Error(error) : error;
    const isRetryable = this.isRetryableError(errorObj, category);

    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message: errorObj.message,
      stack: errorObj.stack,
      severity,
      category,
      context: {
        ...context,
        timestamp: Date.now(),
        route: typeof window !== "undefined" ? window.location.pathname : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      },
      isRetryable,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, category: ErrorCategory): boolean {
    if (category === "network") return true;
    if (category === "api") {
      // Check for retryable HTTP status codes in error message/context
      const retryablePatterns = ["408", "429", "500", "502", "503", "504"];
      return retryablePatterns.some(pattern => error.message?.includes(pattern));
    }
    return false;
  }

  /**
   * Add error to internal storage
   */
  private addError(errorLog: ErrorLog): void {
    this.errors.push(errorLog);

    // Maintain max size
    if (this.errors.length > this.config.maxErrors) {
      this.errors.shift();
    }

    // Store in window for debugging
    if (typeof window !== "undefined") {
      (window as any).__NAUTILUS_ERRORS__ = this.errors;
    }
  }

  /**
   * Log to console
   */
  private logToConsole(error: ErrorLog): void {
    const prefix = `[ErrorTracker][${error.severity.toUpperCase()}][${error.category}]`;
    const message = `${prefix} ${error.message}`;

    switch (error.severity) {
    case "critical":
    case "error":
      console.error(message, error);
      break;
    case "warning":
      console.warn(message, error);
      break;
    case "info":
      break;
    }
  }

  /**
   * Send to Sentry
   */
  private async sendToSentry(errorLog: ErrorLog): Promise<void> {
    try {
      const Sentry = await import("@sentry/react");
      
      const sentryError = new Error(errorLog.message);
      if (errorLog.stack) {
        sentryError.stack = errorLog.stack;
      }

      Sentry.captureException(sentryError, {
        level: this.mapSeverityToSentryLevel(errorLog.severity),
        tags: {
          category: errorLog.category,
          isRetryable: errorLog.isRetryable.toString(),
        },
        extra: {
          ...errorLog.context,
          errorId: errorLog.id,
        },
      });
    } catch (error) {
      // Fail silently if Sentry is not available
    }
  }

  /**
   * Map severity to Sentry level
   */
  private mapSeverityToSentryLevel(severity: ErrorSeverity): any {
    switch (severity) {
    case "critical":
      return "fatal";
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "info";
    default:
      return "error";
    }
  }

  /**
   * Initialize global error handlers
   */
  private initializeGlobalHandlers(): void {
    if (typeof window === "undefined") return;

    // Handle uncaught errors
    window.addEventListener("error", (event) => {
      this.track(
        event.error || event.message,
        "critical",
        "runtime",
        {
          component: "window",
          action: "uncaughtError",
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.track(
        error,
        "critical",
        "runtime",
        {
          component: "window",
          action: "unhandledRejection",
        }
      );
    });
  }

  /**
   * Add error listener
   */
  addListener(listener: (error: ErrorLog) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(error: ErrorLog): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error("Error in error listener:", err);
      }
    });
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
      authorization: 0,
      runtime: 0,
      api: 0,
      unknown: 0,
    };

    const bySeverity: Record<ErrorSeverity, number> = {
      info: 0,
      warning: 0,
      error: 0,
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
      recent: this.errors.slice(-10).reverse(),
      lastError: this.errors[this.errors.length - 1],
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
    if (typeof window !== "undefined") {
      (window as any).__NAUTILUS_ERRORS__ = [];
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(user: { id: string; email?: string; name?: string }): void {
    if (this.sentryInitialized) {
      import("@sentry/react").then(Sentry => {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.name,
        });
      });
    }
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    if (this.sentryInitialized) {
      import("@sentry/react").then(Sentry => {
        Sentry.setUser(null);
      });
    }
  }
}

// Singleton instance
export const errorTrackingService = new ErrorTrackingService();

// Auto-initialize with environment variables
if (typeof window !== "undefined") {
  errorTrackingService.initialize({
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    environment: (import.meta.env.MODE as any) || "development",
  });
}
