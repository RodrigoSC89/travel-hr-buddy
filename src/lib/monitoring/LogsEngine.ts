/**
 * Logs Engine
 * Centralized logging system for errors, AI executions, and system events
 */

import { supabase } from "@/integrations/supabase/client";

export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

export interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  module?: string;
  userId?: string;
}

class LogsEngine {
  private logs: LogEntry[] = [];
  private readonly MAX_LOCAL_LOGS = 500;
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL_MS = 60000; // 1 minute

  constructor() {
    this.startFlushInterval();
  }

  /**
   * Start periodic flush to Supabase
   */
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Log a debug message
   */
  debug(category: string, message: string, data?: Record<string, any>, module?: string) {
    this.log("debug", category, message, data, module);
  }

  /**
   * Log an info message
   */
  info(category: string, message: string, data?: Record<string, any>, module?: string) {
    this.log("info", category, message, data, module);
  }

  /**
   * Log a warning
   */
  warning(category: string, message: string, data?: Record<string, any>, module?: string) {
    this.log("warning", category, message, data, module);
  }

  /**
   * Log an error
   */
  error(category: string, message: string, data?: Record<string, any>, module?: string) {
    this.log("error", category, message, data, module);
    console.error(`[${category}] ${message}`, data);
  }

  /**
   * Log a critical error
   */
  critical(category: string, message: string, data?: Record<string, any>, module?: string) {
    this.log("critical", category, message, data, module);
    console.error(`[CRITICAL] [${category}] ${message}`, data);
    
    // Immediately flush critical errors
    this.flush();
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, category: string, message: string, data?: Record<string, any>, module?: string) {
    const entry: LogEntry = {
      level,
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
      module,
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.MAX_LOCAL_LOGS) {
      this.logs.shift();
    }

    // Console output for development
    if (import.meta.env.DEV) {
      const emoji = {
        debug: "🔍",
        info: "ℹ️",
        warning: "⚠️",
        error: "❌",
        critical: "🚨",
      }[level];

      console.log(`${emoji} [${category}] ${message}`, data || "");
    }
  }

  /**
   * Log AI execution
   */
  logAI(module: string, action: string, duration: number, success: boolean, data?: Record<string, any>) {
    this.log(
      success ? "info" : "error",
      "ai_execution",
      `AI ${action} in ${module}`,
      {
        ...data,
        duration_ms: duration,
        success,
      },
      module
    );
  }

  /**
   * Log preview attempt
   */
  logPreview(route: string, success: boolean, loadTime: number, error?: string) {
    this.log(
      success ? "info" : "error",
      "preview",
      `Preview ${route}`,
      {
        route,
        success,
        load_time_ms: loadTime,
        error,
      }
    );
  }

  /**
   * Log fallback activation
   */
  logFallback(module: string, reason: string, fallbackType: string) {
    this.log(
      "warning",
      "fallback",
      `Fallback activated in ${module}`,
      {
        reason,
        fallback_type: fallbackType,
      },
      module
    );
  }

  /**
   * Flush logs to Supabase (using localStorage as fallback)
   */
  async flush() {
    if (this.logs.length === 0) return;

    const logsToFlush = [...this.logs];
    this.logs = [];

    try {
      // Store in localStorage as primary storage since system_logs table doesn't exist yet
      const storedLogs = JSON.parse(localStorage.getItem('nautilus_system_logs') || '[]');
      const combinedLogs = [...storedLogs, ...logsToFlush].slice(-1000); // Keep last 1000
      localStorage.setItem('nautilus_system_logs', JSON.stringify(combinedLogs));
      
      // Optional: Could be adapted to use ai_insights or another table if needed
      // For now, keeping logs client-side until proper table is created
    } catch (error) {
      console.error("Failed to flush logs:", error);
      // Add logs back to queue
      this.logs = [...logsToFlush, ...this.logs];
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50, level?: LogLevel): LogEntry[] {
    let filtered = [...this.logs];
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    return filtered.slice(-limit);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string, limit: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-limit);
  }

  /**
   * Get logs by module
   */
  getLogsByModule(module: string, limit: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.module === module)
      .slice(-limit);
  }

  /**
   * Clear local logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Stop the flush interval
   */
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

// Singleton instance
export const logsEngine = new LogsEngine();
