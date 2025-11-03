/**
 * PATCH 596 - Console Error Auditor
 * Captures and analyzes console errors and warnings
 */

import { logger } from "@/lib/logger";
import type { SweepIssue } from "../types";

export class ConsoleErrorAuditor {
  private static capturedErrors: Array<{ message: string; timestamp: Date }> = [];
  private static isCapturing = false;

  /**
   * Start capturing console errors
   */
  static startCapture() {
    if (this.isCapturing) return;

    this.isCapturing = true;
    this.capturedErrors = [];

    // Intercept console.error
    const originalError = console.error;
    console.error = (...args: any[]) => {
      this.capturedErrors.push({
        message: args.join(" "),
        timestamp: new Date()
      });
      originalError.apply(console, args);
    };

    // Intercept console.warn
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      this.capturedErrors.push({
        message: `[WARN] ${args.join(" ")}`,
        timestamp: new Date()
      });
      originalWarn.apply(console, args);
    };
  }

  /**
   * Audit console errors
   */
  static async audit(): Promise<SweepIssue[]> {
    const issues: SweepIssue[] = [];
    
    logger.info("[Console Error Auditor] Starting console error validation...");

    try {
      // Get errors from the last capture period
      const recentErrors = this.capturedErrors.filter(
        e => Date.now() - e.timestamp.getTime() < 60000 // Last minute
      );

      if (recentErrors.length > 0) {
        // Group similar errors
        const errorGroups = this.groupErrors(recentErrors);

        for (const [errorMsg, count] of errorGroups.entries()) {
          const severity = count > 5 ? "high" : count > 2 ? "medium" : "low";
          
          issues.push({
            id: `console_${Date.now()}_${errorMsg.substring(0, 20).replace(/\s/g, "_")}`,
            category: "console_errors",
            severity,
            title: "Console Error Detected",
            description: `Error "${errorMsg}" occurred ${count} time(s)`,
            suggestion: "Review and fix the source of this console error",
            autoFixable: false,
            timestamp: new Date()
          });
        }
      }

      logger.info(`[Console Error Auditor] Found ${issues.length} console issues`);
    } catch (error) {
      logger.error("[Console Error Auditor] Audit failed:", error);
    }

    return issues;
  }

  /**
   * Group similar errors together
   */
  private static groupErrors(errors: Array<{ message: string; timestamp: Date }>): Map<string, number> {
    const groups = new Map<string, number>();

    for (const error of errors) {
      // Normalize error message to group similar ones
      const normalized = error.message.substring(0, 100).trim();
      groups.set(normalized, (groups.get(normalized) || 0) + 1);
    }

    return groups;
  }

  /**
   * Get captured errors
   */
  static getCapturedErrors() {
    return [...this.capturedErrors];
  }

  /**
   * Clear captured errors
   */
  static clearCapture() {
    this.capturedErrors = [];
  }
}
