/**
 * Edge Functions Logger Utility
 * Provides structured logging for Supabase Edge Functions
 * Production-safe with consistent formatting
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// In production, we only want warn and error logs
const MIN_LOG_LEVEL: LogLevel = Deno.env.get('EDGE_DEBUG') === 'true' ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatMessage(prefix: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${prefix} ${message}${contextStr}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

export const edgeLogger = {
  /**
   * Debug logging - only in development/debug mode
   */
  debug: (tag: string, message: string, context?: LogContext): void => {
    if (shouldLog('debug')) {
      console.log(formatMessage(`[${tag}] 🐛`, message, context));
    }
  },

  /**
   * Info logging - general operational messages
   */
  info: (tag: string, message: string, context?: LogContext): void => {
    if (shouldLog('info')) {
      console.log(formatMessage(`[${tag}] ℹ️`, message, context));
    }
  },

  /**
   * Warning logging - potential issues
   */
  warn: (tag: string, message: string, context?: LogContext): void => {
    if (shouldLog('warn')) {
      console.warn(formatMessage(`[${tag}] ⚠️`, message, context));
    }
  },

  /**
   * Error logging - always logged
   */
  error: (tag: string, message: string, error?: unknown, context?: LogContext): void => {
    const errorMessage = error ? getErrorMessage(error) : '';
    const fullMessage = errorMessage ? `${message}: ${errorMessage}` : message;
    const errorContext = error instanceof Error && error.stack 
      ? { ...context, stack: error.stack }
      : context;
    console.error(formatMessage(`[${tag}] ❌`, fullMessage, errorContext));
  },

  /**
   * Request logging - for tracking API calls
   */
  request: (tag: string, method: string, status: number, durationMs?: number): void => {
    if (shouldLog('info')) {
      const duration = durationMs ? ` (${durationMs}ms)` : '';
      console.log(formatMessage(`[${tag}] 📡`, `${method} → ${status}${duration}`));
    }
  },

  /**
   * Success logging - for completed operations
   */
  success: (tag: string, message: string, context?: LogContext): void => {
    if (shouldLog('info')) {
      console.log(formatMessage(`[${tag}] ✅`, message, context));
    }
  }
};

export default edgeLogger;
