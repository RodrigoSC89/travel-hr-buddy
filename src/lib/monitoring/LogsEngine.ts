/**
 * Logs Engine - Optimized
 * Lightweight logging system (no auto-flush)
 */

import { Logger } from "@/lib/utils/logger";

export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

export interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  module?: string;
  userId?: string;
}

class LogsEngine {
  private logs: LogEntry[] = [];
  private readonly MAX_LOCAL_LOGS = 200;
  private flushInterval: NodeJS.Timeout | null = null;

  debug(category: string, message: string, data?: Record<string, unknown>, module?: string) {
    this.log("debug", category, message, data, module);
  }

  info(category: string, message: string, data?: Record<string, unknown>, module?: string) {
    this.log("info", category, message, data, module);
  }

  warning(category: string, message: string, data?: Record<string, unknown>, module?: string) {
    this.log("warning", category, message, data, module);
  }

  error(category: string, message: string, data?: Record<string, unknown>, module?: string) {
    this.log("error", category, message, data, module);
  }

  critical(category: string, message: string, data?: Record<string, unknown>, module?: string) {
    this.log("critical", category, message, data, module);
  }

  private log(level: LogLevel, category: string, message: string, data?: Record<string, unknown>, module?: string) {
    const entry: LogEntry = {
      level,
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
      module,
    };

    this.logs.push(entry);

    if (this.logs.length > this.MAX_LOCAL_LOGS) {
      this.logs.shift();
    }

    // Forward critical errors to main logger
    if (level === "error" || level === "critical") {
      Logger.error(`[${category}] ${message}`, data, module || "LogsEngine");
    }
  }

  logAI(module: string, action: string, duration: number, success: boolean, data?: Record<string, unknown>) {
    this.log(
      success ? "info" : "error",
      "ai_execution",
      `AI ${action} in ${module}`,
      { ...data, duration_ms: duration, success },
      module
    );
  }

  logPreview(route: string, success: boolean, loadTime: number, error?: string) {
    this.log(
      success ? "info" : "error",
      "preview",
      `Preview ${route}`,
      { route, success, load_time_ms: loadTime, error }
    );
  }

  logFallback(module: string, reason: string, fallbackType: string) {
    this.log(
      "warning",
      "fallback",
      `Fallback activated in ${module}`,
      { reason, fallback_type: fallbackType },
      module
    );
  }

  getRecentLogs(limit: number = 50, level?: LogLevel): LogEntry[] {
    let filtered = [...this.logs];
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    return filtered.slice(-limit);
  }

  getLogsByCategory(category: string, limit: number = 50): LogEntry[] {
    return this.logs.filter(log => log.category === category).slice(-limit);
  }

  getLogsByModule(module: string, limit: number = 50): LogEntry[] {
    return this.logs.filter(log => log.module === module).slice(-limit);
  }

  clear() {
    this.logs = [];
  }

  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

export const logsEngine = new LogsEngine();
