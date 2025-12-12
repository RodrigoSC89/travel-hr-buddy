/**
 * Error Tracker - PATCH 67.5
 * Centralized error tracking with categorization and Sentry integration
 */

import { logger } from "@/lib/logger";

export type ErrorCategory = "network" | "runtime" | "syntax" | "resource" | "unknown";
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

export interface TrackedError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  stack?: string;
  context: ErrorContext;
  timestamp: number;
  count: number;
}

class ErrorTracker {
  private errors: Map<string, TrackedError> = new Map();
  private errorRate: number[] = [];
  private maxErrorHistory = 100;
  private listeners: Array<(error: TrackedError) => void> = [];

  /**
   * Initialize error tracking
   */
  initialize(): void {
    if (typeof window === "undefined") return;

    // Global error handler
    window.addEventListener("error", (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: "global",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError(
        new Error(event.reason?.message || "Unhandled Promise Rejection"),
        { type: "unhandled-rejection", reason: event.reason }
      );
    });

    // Resource error handler
    window.addEventListener("error", (event) => {
      if (event.target && (event.target as HTMLElement).tagName) {
        this.captureError(new Error("Resource loading failed"), {
          category: "resource",
          element: (event.target as HTMLElement).tagName,
          src: (event.target as any).src || (event.target as any).href,
        });
      }
    }, true);

    logger.info("Error tracking initialized");
  }

  /**
   * Capture and categorize error
   */
  captureError(error: Error | string, context: ErrorContext = {}): string {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = typeof error === "string" ? undefined : error.stack;
    
    const category = this.categorizeError(error, context);
    const severity = this.determineSeverity(category, errorMessage);
    const errorId = this.generateErrorId(errorMessage, category);

    const existingError = this.errors.get(errorId);
    
    if (existingError) {
      // Increment count for duplicate errors
      existingError.count++;
      existingError.timestamp = Date.now();
    } else {
      const trackedError: TrackedError = {
        id: errorId,
        message: errorMessage,
        category,
        severity,
        stack: errorStack,
        context,
        timestamp: Date.now(),
        count: 1,
      });

      this.errors.set(errorId, trackedError);
      
      // Keep only recent errors
      if (this.errors.size > this.maxErrorHistory) {
        const oldestKey = Array.from(this.errors.keys())[0];
        this.errors.delete(oldestKey);
      }

      // Notify listeners
      this.listeners.forEach(listener => listener(trackedError));

      // Log based on severity
      if (severity === "critical" || severity === "high") {
        logger.error(`[${category.toUpperCase()}] ${errorMessage}`, error, context);
      } else {
        logger.warn(`[${category.toUpperCase()}] ${errorMessage}`, context);
      }

      // Send to Sentry in production
      this.sendToSentry(trackedError, error);
    }

    // Update error rate
    this.updateErrorRate();

    return errorId;
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error | string, context: ErrorContext): ErrorCategory {
    const message = typeof error === "string" ? error : error.message;
    
    if (context.category) {
      return context.category as ErrorCategory;
    }

    if (message.includes("fetch") || message.includes("network") || message.includes("NetworkError")) {
      return "network";
    }

    if (message.includes("SyntaxError") || message.includes("parsing")) {
      return "syntax";
    }

    if (message.includes("Resource") || message.includes("loading")) {
      return "resource";
    }

    if (typeof error !== "string" && error.name === "TypeError") {
      return "runtime";
    }

    return "unknown";
  }

  /**
   * Determine error severity
   */
  private determineSeverity(category: ErrorCategory, message: string): ErrorSeverity {
    // Critical errors
    if (message.includes("authentication") || message.includes("security")) {
      return "critical";
    }

    // High severity
    if (category === "runtime" || message.includes("crash")) {
      return "high";
    }

    // Medium severity
    if (category === "network" || category === "syntax") {
      return "medium";
    }

    // Low severity
    return "low";
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(message: string, category: ErrorCategory): string {
    const hash = message.substring(0, 50) + category;
    return btoa(hash).substring(0, 16);
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(trackedError: TrackedError, originalError: Error | string): void {
    if (import.meta.env.PROD && typeof window !== "undefined") {
      try {
        const Sentry = (window as any).Sentry;
        if (Sentry) {
          Sentry.captureException(
            typeof originalError === "string" ? new Error(originalError) : originalError,
            {
              level: this.mapSeverityToSentryLevel(trackedError.severity),
              tags: {
                category: trackedError.category,
                errorId: trackedError.id,
              },
              extra: {
                ...trackedError.context,
                count: trackedError.count,
              },
            }
          );
        }
      } catch (error) {
        // Fail silently
      }
    }
  }

  /**
   * Map severity to Sentry level
   */
  private mapSeverityToSentryLevel(severity: ErrorSeverity): string {
    const map: Record<ErrorSeverity, string> = {
      low: "info",
      medium: "warning",
      high: "error",
      critical: "fatal",
    });
    return map[severity];
  }

  /**
   * Update error rate tracking
   */
  private updateErrorRate(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    // Add current timestamp
    this.errorRate.push(now);
    
    // Remove old entries
    this.errorRate = this.errorRate.filter(timestamp => timestamp > oneHourAgo);
  }

  /**
   * Get error statistics
   */
  getStats() {
    const errors = Array.from(this.errors.values());
    
    return {
      total: errors.reduce((sum, e) => sum + e.count, 0),
      unique: errors.length,
      byCategory: this.groupBy(errors, "category"),
      bySeverity: this.groupBy(errors, "severity"),
      errorRate: this.errorRate.length, // Errors per hour
      recent: errors.slice(-10).reverse(),
    });
  }

  /**
   * Get all tracked errors
   */
  getErrors(): TrackedError[] {
    return Array.from(this.errors.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Subscribe to new errors
   */
  subscribe(callback: (error: TrackedError) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    });
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors.clear();
    this.errorRate = [];
  }

  /**
   * Helper to group errors
   */
  private groupBy(errors: TrackedError[], key: keyof TrackedError): Record<string, number> {
    return errors.reduce((acc, error) => {
      const value = String(error[key]);
      acc[value] = (acc[value] || 0) + error.count;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const errorTracker = new ErrorTracker();
