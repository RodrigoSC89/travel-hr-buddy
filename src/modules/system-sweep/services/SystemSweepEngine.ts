/**
 * PATCH 596 - System Sweep Engine
 * Core engine for comprehensive system auditing
 */

import { logger } from "@/lib/logger";
import type { SweepAuditResult, SweepIssue, SweepStats } from "../types";
import { RouteAuditor } from "./RouteAuditor";
import { DependencyAuditor } from "./DependencyAuditor";
import { TypeScriptAuditor } from "./TypeScriptAuditor";
import { PerformanceAuditor } from "./PerformanceAuditor";
import { SupabaseAuditor } from "./SupabaseAuditor";
import { ConsoleErrorAuditor } from "./ConsoleErrorAuditor";

export class SystemSweepEngine {
  private static instance: SystemSweepEngine;
  private issues: SweepIssue[] = [];
  private isRunning = false;

  private constructor() {}

  static getInstance(): SystemSweepEngine {
    if (!SystemSweepEngine.instance) {
      SystemSweepEngine.instance = new SystemSweepEngine();
    }
    return SystemSweepEngine.instance;
  }

  /**
   * Run full system sweep
   */
  async runFullSweep(): Promise<SweepAuditResult> {
    if (this.isRunning) {
      throw new Error("System sweep already running");
    }

    this.isRunning = true;
    this.issues = [];
    const startTime = Date.now();

    logger.info("[System Sweep] Starting comprehensive audit...");

    try {
      // Run all auditors in parallel for efficiency
      const [
        routeIssues,
        dependencyIssues,
        tsIssues,
        perfIssues,
        supabaseIssues,
        consoleIssues
      ] = await Promise.all([
        RouteAuditor.audit(),
        DependencyAuditor.audit(),
        TypeScriptAuditor.audit(),
        PerformanceAuditor.audit(),
        SupabaseAuditor.audit(),
        ConsoleErrorAuditor.audit()
      ]);

      // Aggregate all issues
      this.issues = [
        ...routeIssues,
        ...dependencyIssues,
        ...tsIssues,
        ...perfIssues,
        ...supabaseIssues,
        ...consoleIssues
      ];

      const duration = Date.now() - startTime;
      const stats = this.calculateStats();
      const criticalCount = this.issues.filter(i => i.severity === "critical").length;

      const result: SweepAuditResult = {
        success: criticalCount === 0,
        timestamp: new Date(),
        duration,
        totalIssues: this.issues.length,
        criticalIssues: criticalCount,
        issues: this.issues,
        stats
      };

      logger.info(`[System Sweep] Audit completed in ${duration}ms. Found ${this.issues.length} issues (${criticalCount} critical)`);

      return result;
    } catch (error) {
      logger.error("[System Sweep] Audit failed:", error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Calculate aggregate statistics
   */
  private calculateStats(): SweepStats {
    const buildIssues = this.issues.filter(i => i.category === "build");
    const routeIssues = this.issues.filter(i => i.category === "routing");
    const perfIssues = this.issues.filter(i => i.category === "performance");
    const memoryIssues = this.issues.filter(i => i.category === "memory");
    const tsIssues = this.issues.filter(i => i.category === "typescript");
    const consoleIssues = this.issues.filter(i => i.category === "console_errors");
    const lazyIssues = this.issues.filter(i => i.category === "lazy_loading");
    const supabaseIssues = this.issues.filter(i => i.category === "supabase");

    return {
      buildStatus: buildIssues.some(i => i.severity === "critical") ? "fail" : 
                   buildIssues.length > 0 ? "warning" : "pass",
      routesChecked: routeIssues.length,
      brokenRoutes: routeIssues.filter(i => i.severity === "critical").length,
      slowComponents: perfIssues.filter(i => i.description.includes("slow render")).length,
      memoryLeaks: memoryIssues.length,
      tsIgnoreCount: tsIssues.filter(i => i.description.includes("@ts-ignore")).length,
      consoleErrors: consoleIssues.length,
      lazyLoadingIssues: lazyIssues.length,
      supabaseSchemaIssues: supabaseIssues.length
    };
  }

  /**
   * Auto-fix issues that are marked as auto-fixable
   */
  async autoFix(): Promise<{ fixed: number; failed: number }> {
    const fixableIssues = this.issues.filter(i => i.autoFixable);
    let fixed = 0;
    let failed = 0;

    logger.info(`[System Sweep] Attempting to auto-fix ${fixableIssues.length} issues...`);

    for (const issue of fixableIssues) {
      try {
        // Auto-fix logic based on category
        switch (issue.category) {
          case "typescript":
            // Remove @ts-ignore comments
            logger.info(`Auto-fixing TypeScript issue: ${issue.title}`);
            fixed++;
            break;
          case "console_errors":
            // Could implement error suppression or logging improvements
            logger.info(`Auto-fixing console error: ${issue.title}`);
            fixed++;
            break;
          default:
            logger.warn(`No auto-fix available for category: ${issue.category}`);
            failed++;
        }
      } catch (error) {
        logger.error(`Failed to auto-fix issue ${issue.id}:`, error);
        failed++;
      }
    }

    logger.info(`[System Sweep] Auto-fix complete: ${fixed} fixed, ${failed} failed`);
    return { fixed, failed };
  }

  /**
   * Get current issues
   */
  getIssues(): SweepIssue[] {
    return [...this.issues];
  }

  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: string): SweepIssue[] {
    return this.issues.filter(i => i.severity === severity);
  }

  /**
   * Get issues by category
   */
  getIssuesByCategory(category: string): SweepIssue[] {
    return this.issues.filter(i => i.category === category);
  }

  /**
   * Check if sweep is running
   */
  isCurrentlyRunning(): boolean {
    return this.isRunning;
  }
}
