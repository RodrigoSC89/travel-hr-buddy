/**
 * Centralized Logger Utility
 * 
 * Production-safe logging with structured context support.
 * - Debug/info logs only appear in development
 * - Errors are always logged and sent to monitoring
 * - Sentry integration for production error tracking
 * - ESLint compatible
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

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
        logger.debug(`🐛 ${message}`, context);
      } else {
        logger.debug(`🐛 ${message}`);
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
   * Log error messages (always logged and sent to monitoring in production)
   */
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorMessage = error ? getErrorMessage(error) : '';
    const fullContext = {
      ...context,
      ...(error && isError(error) ? { stack: error.stack } : {}),
    };

    if (Object.keys(fullContext).length > 0) {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ''}`, fullContext);
    } else {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ''}`);
    }

    // Send to Sentry in production
    if (isProduction && isError(error) && typeof window !== 'undefined') {
      try {
        // @ts-expect-error Sentry is loaded globally
        if (window.Sentry) {
          // @ts-expect-error Sentry is loaded globally
          window.Sentry.captureException(error, { extra: { message, ...context } });
        }
      } catch {
        // Fail silently if Sentry is not available
      }
    }
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
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}: ${errorMessage}`, fullContext);
    } else {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}: ${errorMessage}`);
    }

    // Send to Sentry in production
    if (isProduction && isError(error) && typeof window !== 'undefined') {
      try {
        // @ts-expect-error Sentry is loaded globally
        if (window.Sentry) {
          // @ts-expect-error Sentry is loaded globally
          window.Sentry.captureException(error, { extra: { message, ...context } });
        }
      } catch {
        // Fail silently if Sentry is not available
      }
    }
  },
};
