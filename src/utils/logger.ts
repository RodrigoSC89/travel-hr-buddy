/**
 * Production-Safe Logger Utility
 * Conditionally logs based on environment to avoid console pollution in production
 * Integrates with Sentry for error tracking
 */

import * as Sentry from "@sentry/react";

const isDevelopment = import.meta.env.MODE === "development" || import.meta.env.DEV;

interface LogMetadata {
  [key: string]: unknown;
}

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  /**
   * Log informational messages (only in development)
   * Sends breadcrumb to Sentry
   */
  info: (message: string, meta?: LogMetadata) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(message, meta);
    }
    
    Sentry.addBreadcrumb({
      category: "info",
      message,
      level: "info",
      data: meta,
    });
  },

  /**
   * Log warnings (always shown)
   * Sends breadcrumb to Sentry
   */
  warn: (message: string, meta?: LogMetadata) => {
    // eslint-disable-next-line no-console
    console.warn(message, meta);
    
    Sentry.addBreadcrumb({
      category: "warning",
      message,
      level: "warning",
      data: meta,
    });
  },

  /**
   * Log errors (always shown)
   * Sends error to Sentry
   */
  error: (message: string, error?: Error | unknown, meta?: LogMetadata) => {
    const errorData = { ...meta };
    
    if (error instanceof Error) {
      errorData.errorName = error.name;
      errorData.errorMessage = error.message;
      errorData.errorStack = error.stack;
    } else if (error) {
      errorData.error = String(error);
    }
    
    // eslint-disable-next-line no-console
    console.error(message, error, meta);
    
    // Send to Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(message), {
      level: "error",
      tags: { source: "logger" },
      extra: { message, ...errorData },
    });
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },

  /**
   * Log table (only in development)
   */
  table: (data: unknown) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.table(data);
    }
  },

  /**
   * Create a scoped logger for a specific module
   */
  createLogger: (scope: string) => {
    return {
      info: (message: string, meta?: LogMetadata) => logger.info(`[${scope}] ${message}`, meta),
      warn: (message: string, meta?: LogMetadata) => logger.warn(`[${scope}] ${message}`, meta),
      error: (message: string, error?: Error | unknown, meta?: LogMetadata) => 
        logger.error(`[${scope}] ${message}`, error, meta),
      debug: (...args: unknown[]) => logger.debug(`[${scope}]`, ...args),
    };
  },
};

