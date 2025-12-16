/**
 * PATCH 186.0 - Structured Production Logger
 * 
 * Production-safe structured logging system:
 * - NO console.log/info/debug in production
 * - Structured log format for log aggregation
 * - Integration with monitoring systems
 * - Automatic error tracking with Sentry
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  environment: "development" | "production";
  session?: string;
}

interface StructuredLoggerConfig {
  enabledLevels: LogLevel[];
  sendToMonitoring: boolean;
  includeStack: boolean;
}

class StructuredLogger {
  private config: StructuredLoggerConfig;
  private sessionId: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      enabledLevels: isDevelopment 
        ? ["debug", "info", "warn", "error"] 
        : ["warn", "error"],
      sendToMonitoring: isProduction,
      includeStack: isDevelopment,
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: isDevelopment ? "development" : "production",
      session: this.sessionId,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message,
        name: error.name,
      };
      if (this.config.includeStack && error.stack) {
        entry.error.stack = error.stack;
      }
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabledLevels.includes(level);
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    if (!this.config.sendToMonitoring || !isProduction) return;

    try {
      // Send to Sentry for errors
      if (entry.level === "error" && typeof window !== "undefined") {
        const Sentry = (window as any).Sentry;
        if (Sentry && entry.error) {
          Sentry.captureMessage(entry.message, {
            level: "error",
            extra: {
              ...entry.context,
              timestamp: entry.timestamp,
              session: entry.session,
            },
          });
        }
      }

      // Could send to other monitoring services here
      // e.g., DataDog, LogRocket, etc.
    } catch (error) {
      // Fail silently - never throw from logger
      if (isDevelopment) {
        console.warn("[Logger] Failed to send to monitoring:", error);
      }
    }
  }

  private outputLog(entry: LogEntry): void {
    // In production, ONLY output errors and warnings to console
    // All other logs are completely suppressed
    if (isProduction && !["error", "warn"].includes(entry.level)) {
      return;
    }

    // In development, use console with colors
    if (isDevelopment) {
      const emoji = {
        debug: "🐛",
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
      }[entry.level];

      const consoleMethod = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
      }[entry.level];

      consoleMethod(`${emoji} [${entry.level.toUpperCase()}] ${entry.message}`);
      
      if (entry.context) {
        consoleMethod("Context:", JSON.stringify(entry.context, null, 2));
      }
      
      if (entry.error) {
        consoleMethod("Error:", JSON.stringify(entry.error, null, 2));
      }
    } else {
      // In production, use structured JSON format for log aggregation
      // Only for errors and warnings
      if (entry.level === "error" || entry.level === "warn") {
        console.error(JSON.stringify(entry));
      }
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;

    const entry = this.createLogEntry("debug", message, context);
    this.addToBuffer(entry);
    this.outputLog(entry);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;

    const entry = this.createLogEntry("info", message, context);
    this.addToBuffer(entry);
    this.outputLog(entry);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;

    const entry = this.createLogEntry("warn", message, context);
    this.addToBuffer(entry);
    this.outputLog(entry);
    this.sendToMonitoring(entry);
  }

  public error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (!this.shouldLog("error")) return;

    const errorObj = error instanceof Error ? error : undefined;
    const errorContext = error && !(error instanceof Error) ? { error } : context;

    const entry = this.createLogEntry("error", message, errorContext, errorObj);
    this.addToBuffer(entry);
    this.outputLog(entry);
    this.sendToMonitoring(entry);
  }

  /**
   * Get recent logs from buffer (useful for debugging)
   */
  public getRecentLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  public clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Create a timer for performance measurement
   */
  public startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  /**
   * Log with custom level
   */
  public log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    switch (level) {
    case "debug":
      this.debug(message, context);
      break;
    case "info":
      this.info(message, context);
      break;
    case "warn":
      this.warn(message, context);
      break;
    case "error":
      this.error(message, undefined, context);
      break;
    }
  }
}

// Export singleton instance
export const structuredLogger = new StructuredLogger();

// Export type for consumers
export type { LogEntry, LogLevel };
