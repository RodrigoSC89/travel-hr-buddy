/**
 * System Watchdog v2 - Optimized
 * Lightweight error monitoring (disabled by default)
 */

import { Logger } from "@/lib/utils/logger";

interface WatchdogError {
  id: string;
  type: "import" | "runtime" | "blank_screen" | "api_failure" | "logic_error";
  message: string;
  stack?: string;
  module?: string;
  timestamp: Date;
  count: number;
  lastOccurrence: Date;
}

class SystemWatchdog {
  private errors: Map<string, WatchdogError> = new Map();
  private errorThreshold = 5;
  private checkInterval: NodeJS.Timeout | null = null;
  private isActive = false;
  private originalConsoleError: typeof console.error | null = null;

  start() {
    // Disabled by default to prevent performance issues
    const ENABLE = import.meta.env.VITE_ENABLE_WATCHDOG === "true";
    if (!ENABLE) {
      Logger.info("Watchdog disabled", undefined, "Watchdog");
      return;
    }

    if (this.isActive) return;
    this.isActive = true;

    Logger.info("Watchdog starting", undefined, "Watchdog");
    this.attachErrorHandlers();

    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // 1 minute (increased from 30s)
  }

  stop() {
    this.isActive = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Restore original console.error
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
      this.originalConsoleError = null;
    }
  }

  private attachErrorHandlers() {
    // Only attach basic error handlers, don't intercept console.error
    window.addEventListener("error", (event) => {
      this.handleError({
        type: "runtime",
        message: event.message,
        stack: event.error?.stack,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.handleError({
        type: "runtime",
        message: event.reason?.message || "Unhandled Promise Rejection",
        stack: event.reason?.stack,
      });
    });
  }

  private handleError(errorInfo: Partial<WatchdogError>) {
    if (!this.isActive) return;
    
    const errorId = this.generateErrorId(errorInfo);
    const existingError = this.errors.get(errorId);

    if (existingError) {
      existingError.count++;
      existingError.lastOccurrence = new Date();
    } else {
      this.errors.set(errorId, {
        id: errorId,
        type: errorInfo.type || "runtime",
        message: errorInfo.message || "Unknown error",
        stack: errorInfo.stack,
        module: errorInfo.module,
        timestamp: new Date(),
        count: 1,
        lastOccurrence: new Date(),
      });
    }
  }

  private generateErrorId(error: Partial<WatchdogError>): string {
    const key = `${error.type}-${error.message?.substring(0, 50)}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 12);
  }

  private performHealthCheck() {
    if (!this.isActive) return;

    // Clear old errors (more than 30 minutes)
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    for (const [id, error] of this.errors.entries()) {
      if (error.lastOccurrence < cutoff) {
        this.errors.delete(id);
      }
    }
  }

  getStats() {
    const errorsByType: Record<string, number> = {};
    for (const error of this.errors.values()) {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    }
    
    return {
      isActive: this.isActive,
      totalErrors: this.errors.size,
      criticalErrors: Array.from(this.errors.values())
        .filter(e => e.count >= this.errorThreshold).length,
      errorsByType,
    };
  }
}

export const systemWatchdog = new SystemWatchdog();
