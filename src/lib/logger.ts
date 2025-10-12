/**
 * Centralized Logger Utility
 * 
 * Environment-aware logging with structured context support.
 * - Debug/info logs only appear in development
 * - Errors are always logged
 * - Sentry-ready for production error tracking
 * - ESLint compatible
 */

const isDevelopment = import.meta.env.DEV;

interface LogContext {
  [key: string]: unknown;
}

/**
 * Type guard to safely handle error objects
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Centralized logger with context support
 */
export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      if (context) {
        console.info(`ℹ️ ${message}`, context);
      } else {
        console.info(`ℹ️ ${message}`);
      }
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      if (context) {
        console.debug(`🐛 ${message}`, context);
      } else {
        console.debug(`🐛 ${message}`);
      }
    }
  },

  /**
   * Log warning messages
   */
  warn: (message: string, context?: LogContext) => {
    if (context) {
      console.warn(`⚠️ ${message}`, context);
    } else {
      console.warn(`⚠️ ${message}`);
    }
  },

  /**
   * Log error messages (always logged)
   */
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorMessage = error ? getErrorMessage(error) : '';
    const fullContext = {
      ...context,
      ...(error && isError(error) ? { stack: error.stack } : {}),
    };

    if (Object.keys(fullContext).length > 0) {
      console.error(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ''}`, fullContext);
    } else {
      console.error(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ''}`);
    }

    // TODO: Send to Sentry in production
    // if (!isDevelopment && isError(error)) {
    //   Sentry.captureException(error, { extra: context });
    // }
  },

  /**
   * Log caught errors with proper type handling
   */
  logCaughtError: (message: string, error: unknown, context?: LogContext) => {
    const errorMessage = getErrorMessage(error);
    const fullContext = {
      ...context,
      ...(isError(error) ? { stack: error.stack } : {}),
    };

    if (Object.keys(fullContext).length > 0) {
      console.error(`❌ ${message}: ${errorMessage}`, fullContext);
    } else {
      console.error(`❌ ${message}: ${errorMessage}`);
    }

    // TODO: Send to Sentry in production
    // if (!isDevelopment && isError(error)) {
    //   Sentry.captureException(error, { extra: { message, ...context } });
    // }
  },
};

/* eslint-disable no-console */
// Note: console methods are intentionally used in this logger utility
/* eslint-enable no-console */
