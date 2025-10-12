/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels and optional Sentry integration
 * 
 * Note: This extends the existing logger in src/utils/logger.ts
 * Use this for new code with structured logging support
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log informational messages (only in development)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message, context));
    }
  }

  /**
   * Log warning messages (always shown)
   */
  warn(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('warn', message, context));
  }

  /**
   * Log error messages and optionally send to Sentry
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = this.formatMessage('error', message, context);
    // eslint-disable-next-line no-console
    console.error(errorMessage, error);

    // In production, you can add Sentry integration here
    if (!this.isDevelopment && error instanceof Error) {
      // Sentry.captureException(error, { extra: context });
    }
  }

  /**
   * Log a caught error with proper type handling
   */
  logCaughtError(message: string, error: unknown, context?: LogContext): void {
    if (error instanceof Error) {
      this.error(message, error, { ...context, stack: error.stack });
    } else {
      this.error(message, undefined, { ...context, error: String(error) });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for context
export type { LogContext };
