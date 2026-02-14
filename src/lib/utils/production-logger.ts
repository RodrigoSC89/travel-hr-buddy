/**
 * Production Logger - Replaces console.log with structured logging
 * PATCH: Console Log Cleanup - Production-safe logging
 */
import * as Sentry from '@sentry/react';

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  sendToRemote: boolean;
  remoteEndpoint?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class ProductionLogger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  constructor() {
    const isDev = import.meta.env.DEV;
    
    this.config = {
      enabled: true,
      minLevel: isDev ? "debug" : "warn",
      sendToRemote: !isDev,
      remoteEndpoint: undefined,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.sendToRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently fail for remote logging
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > this.MAX_BUFFER_SIZE) {
      this.buffer.shift();
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;

    const entry = this.formatMessage("debug", message, context);
    this.addToBuffer(entry);

    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;

    const entry = this.formatMessage("info", message, context);
    this.addToBuffer(entry);

    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, context || "");
    }

    this.sendToRemote(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;

    const entry = this.formatMessage("warn", message, context);
    this.addToBuffer(entry);

    console.warn(`[WARN] ${message}`, context || "");
    this.sendToRemote(entry);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (!this.shouldLog("error")) return;

    const entry = this.formatMessage("error", message, {
      ...context,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error) {
      entry.stack = error.stack;
    }

    this.addToBuffer(entry);

    console.error(`[ERROR] ${message}`, error, context || "");
    this.sendToRemote(entry);

    // Send to Sentry
    if (error instanceof Error) {
      try {
        Sentry.captureException(error, { extra: context });
      } catch {
        // Sentry not initialized
      }
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.buffer.slice(-count);
  }

  // Clear buffer
  clearBuffer(): void {
    this.buffer = [];
  }

  // Configure logger
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Create child logger with context
  child(defaultContext: Record<string, unknown>): {
    debug: (message: string, context?: Record<string, unknown>) => void;
    info: (message: string, context?: Record<string, unknown>) => void;
    warn: (message: string, context?: Record<string, unknown>) => void;
    error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => void;
  } {
    return {
      debug: (message, context) => this.debug(message, { ...defaultContext, ...context }),
      info: (message, context) => this.info(message, { ...defaultContext, ...context }),
      warn: (message, context) => this.warn(message, { ...defaultContext, ...context }),
      error: (message, error, context) => this.error(message, error, { ...defaultContext, ...context }),
    };
  }
}

// Singleton instance
export const logger = new ProductionLogger();

// Convenience exports
export const { debug, info, warn, error } = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
  error: (message: string, err?: Error | unknown, context?: Record<string, unknown>) => logger.error(message, err, context),
};

export default logger;
