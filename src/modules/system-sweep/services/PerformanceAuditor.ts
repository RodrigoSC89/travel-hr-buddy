/**
 * PATCH 596 - Performance Auditor
 * Detects slow components, excessive re-renders, and performance bottlenecks
 */

import { logger } from "@/lib/logger";
import type { SweepIssue } from "../types";

export class PerformanceAuditor {
  private static performanceEntries: PerformanceEntry[] = [];

  /**
   * Audit application performance
   */
  static async audit(): Promise<SweepIssue[]> {
    const issues: SweepIssue[] = [];
    
    logger.info("[Performance Auditor] Starting performance validation...");

    try {
      // Check for slow renders using Performance API
      this.performanceEntries = performance.getEntriesByType("measure");
      
      const slowRenders = this.checkSlowRenders();
      issues.push(...slowRenders);

      // Check for excessive lazy loading
      const lazyLoadingIssues = this.checkLazyLoading();
      if (lazyLoadingIssues) {
        issues.push(lazyLoadingIssues);
      }

      // Check memory usage
      const memoryIssue = this.checkMemoryUsage();
      if (memoryIssue) {
        issues.push(memoryIssue);
      }

      logger.info(`[Performance Auditor] Found ${issues.length} performance issues`);
    } catch (error) {
      logger.error("[Performance Auditor] Audit failed:", error);
    }

    return issues;
  }

  /**
   * Check for slow component renders
   */
  private static checkSlowRenders(): SweepIssue[] {
    const issues: SweepIssue[] = [];
    const slowThreshold = 2000; // 2 seconds

    const slowEntries = this.performanceEntries.filter(
      entry => entry.duration > slowThreshold
    );

    for (const entry of slowEntries) {
      issues.push({
        id: `perf_${Date.now()}_slow_render_${entry.name}`,
        category: "performance",
        severity: "high",
        title: "Slow Component Render",
        description: `Component "${entry.name}" took ${entry.duration.toFixed(2)}ms to render (threshold: ${slowThreshold}ms)`,
        suggestion: "Consider optimizing component with React.memo, useMemo, or code splitting",
        autoFixable: false,
        timestamp: new Date()
      });
    }

    return issues;
  }

  /**
   * Check for excessive lazy loading
   */
  private static checkLazyLoading(): SweepIssue | null {
    const lazyComponents = document.querySelectorAll("[data-lazy-component]");
    
    if (lazyComponents.length > 20) {
      return {
        id: `perf_${Date.now()}_excessive_lazy`,
        category: "lazy_loading",
        severity: "medium",
        title: "Excessive Lazy Loading",
        description: `Found ${lazyComponents.length} lazy-loaded components on this route`,
        suggestion: "Consider bundling frequently used components together",
        autoFixable: false,
        timestamp: new Date()
      };
    }

    return null;
  }

  /**
   * Check memory usage
   */
  private static checkMemoryUsage(): SweepIssue | null {
    // Check if Performance Memory API is available
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      const usedMemoryMB = memory.usedJSHeapSize / 1048576;
      const totalMemoryMB = memory.jsHeapSizeLimit / 1048576;
      const usagePercent = (usedMemoryMB / totalMemoryMB) * 100;

      if (usagePercent > 80) {
        return {
          id: `perf_${Date.now()}_high_memory`,
          category: "memory",
          severity: "high",
          title: "High Memory Usage",
          description: `Memory usage at ${usagePercent.toFixed(2)}% (${usedMemoryMB.toFixed(2)}MB / ${totalMemoryMB.toFixed(2)}MB)`,
          suggestion: "Check for memory leaks, large cached data, or excessive component state",
          autoFixable: false,
          timestamp: new Date()
        };
      }
    }

    return null;
  }
}
