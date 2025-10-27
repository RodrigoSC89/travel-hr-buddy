/**
 * Centralized Logger Utility
 * 
 * Production-safe logging with structured context support.
 * - Debug/info logs only appear in development
 * - Errors are always logged and sent to monitoring
 * - Sentry integration for production error tracking
 * - Winston backend for structured logging
 * - Supabase edge function integration for persistent logs
 * - ESLint compatible
 */

import winston from 'winston';

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Type-safe environment variable
const getSentryDsn = (): string | undefined => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  return typeof dsn === "string" ? dsn : undefined;
};

interface LogContext {
  [key: string]: any;
}

// Winston logger instance
const winstonLogger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Send log to Supabase edge function for persistent storage
 */
async function sendLogToSupabase(level: string, message: string, context?: LogContext, error?: any) {
  // Only send error and warn logs to Supabase in production
  if (!isProduction || (level !== 'error' && level !== 'warn')) {
    return;
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return; // Silently fail if Supabase is not configured
    }

    await fetch(`${supabaseUrl}/functions/v1/logEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        level,
        message,
        context,
        error: error ? String(error) : undefined,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }),
    });
  } catch (err) {
    // Silently fail - we don't want logging to break the app
    if (isDevelopment) {
      console.warn('Failed to send log to Supabase:', err);
    }
  }
}

/**
 * Type guard to safely handle error objects
 */
function isError(error: any): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message from unknown error type
 */
function getErrorMessage(error: any): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

/**
 * Centralized logger with context support
 */
export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (message: string, context?: unknown) => {
    winstonLogger.info(message, context as any);
    if (isDevelopment) {
      if (context !== undefined) {
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
    winstonLogger.debug(message, context);
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
    winstonLogger.warn(message, context);
    sendLogToSupabase('warn', message, context);
    if (context) {
      console.warn(`⚠️ ${message}`, context);
    } else {
      console.warn(`⚠️ ${message}`);
    }
  },

  /**
   * Log error messages (always logged and sent to monitoring in production)
   */
  error: (message: string, error?: any, context?: LogContext) => {
    const errorMessage = error ? getErrorMessage(error) : "";
    const fullContext = {
      ...context,
      ...(error && isError(error) ? { stack: error.stack } : {}),
    };

    winstonLogger.error(message, { error: errorMessage, ...fullContext });
    sendLogToSupabase('error', message, fullContext, error);

    if (Object.keys(fullContext).length > 0) {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ""}`, fullContext);
    } else {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ""}`);
    }

    // Send to Sentry in production
    if (isProduction && isError(error) && typeof window !== "undefined") {
      try {
        const Sentry = (window as any).Sentry;
        if (Sentry && getSentryDsn()) {
          Sentry.captureException(error, { 
            extra: { message, ...context },
            tags: { source: "logger" }
          });
        }
      } catch (sentryError) {
        // Fail silently if Sentry is not available
        if (isDevelopment) {
          console.warn("Failed to send error to Sentry:", String(sentryError));
        }
      }
    }
  },

  /**
   * Log caught errors with proper type handling
   */
  logCaughtError: (message: string, error: any, context?: LogContext) => {
    const errorMessage = getErrorMessage(error);
    const fullContext = {
      ...context,
      ...(isError(error) ? { stack: error.stack } : {}),
    };

    winstonLogger.error(`${message}: ${errorMessage}`, fullContext);
    sendLogToSupabase('error', `${message}: ${errorMessage}`, fullContext, error);

    if (Object.keys(fullContext).length > 0) {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}: ${errorMessage}`, fullContext);
    } else {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}: ${errorMessage}`);
    }

    // Send to Sentry in production
    if (isProduction && isError(error) && typeof window !== "undefined") {
      try {
        const Sentry = (window as any).Sentry;
        if (Sentry && getSentryDsn()) {
          Sentry.captureException(error, { 
            extra: { message, ...context },
            tags: { source: "logger" }
          });
        }
      } catch (sentryError) {
        // Fail silently if Sentry is not available
        if (isDevelopment) {
          console.warn("Failed to send error to Sentry:", String(sentryError));
        }
      }
    }
  },

  /**
   * Log table (development only)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};
