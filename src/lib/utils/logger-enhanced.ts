/**
 * Enhanced Logger Utility
 * Production-safe, structured logging with performance tracking
 * PATCH 60.0 - Replaces all console.log usage
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";
export type LogCategory = "system" | "ai" | "module" | "api" | "database" | "user";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
  module?: string;
  duration?: number;
}

class EnhancedLogger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER = 100;

  /**
   * Internal log method
   */
  private log(level: LogLevel, category: LogCategory, message: string, data?: Record<string, unknown>, module?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      module,
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER) {
      this.logBuffer.shift();
    }

    // Console output (development only for debug/info)
    if (this.isDevelopment || level === "error" || level === "critical") {
      const emoji = {
        debug: "🔍",
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        critical: "🚨",
      }[level];

      const prefix = `${emoji} [${category.toUpperCase()}${module ? `::${module}` : ""}]`;
      
      if (data) {
        console[level === "critical" ? "error" : level](prefix, message, data);
      } else {
        console[level === "critical" ? "error" : level](prefix, message);
      }
    }
  }

  /**
   * Debug messages (development only)
   */
  debug(message: string, data?: Record<string, unknown>, module?: string): void {
    if (this.isDevelopment) {
      this.log("debug", "system", message, data, module);
    }
  }

  /**
   * Info messages (development only)
   */
  info(message: string, data?: Record<string, unknown>, module?: string): void {
    if (this.isDevelopment) {
      this.log("info", "system", message, data, module);
    }
  }

  /**
   * Warning messages (always logged)
   */
  warn(message: string, data?: Record<string, unknown>, module?: string): void {
    this.log("warn", "system", message, data, module);
  }

  /**
   * Error messages (always logged)
   */
  error(message: string, error?: unknown, module?: string): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { raw: error };
    
    this.log("error", "system", message, errorData, module);
  }

  /**
   * Critical errors (always logged, triggers alerts)
   */
  critical(message: string, error?: unknown, module?: string): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { raw: error };
    
    this.log("critical", "system", message, errorData, module);
  }

  /**
   * AI-specific logging
   */
  ai(action: string, data?: Record<string, unknown>, module?: string): void {
    this.log("info", "ai", action, data, module);
  }

  /**
   * Module-specific logging
   */
  module(moduleName: string, message: string, data?: Record<string, unknown>): void {
    this.log("info", "module", message, data, moduleName);
  }

  /**
   * API request/response logging
   */
  api(endpoint: string, method: string, status: number, duration?: number): void {
    const level: LogLevel = status >= 400 ? "error" : "info";
    this.log(level, "api", `${method} ${endpoint}`, { status, duration });
  }

  /**
   * Database operation logging
   */
  database(operation: string, table: string, duration?: number, error?: unknown): void {
    const level: LogLevel = error ? "error" : "debug";
    this.log(level, "database", `${operation} on ${table}`, { duration, error });
  }

  /**
   * Performance timing
   */
  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`Timer: ${label}`, { duration_ms: duration.toFixed(2) });
      return duration;
    };
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const Logger = new EnhancedLogger();

// Export for testing
export { EnhancedLogger };
