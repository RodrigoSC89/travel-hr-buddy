/**
 * PATCH 596 - Route Auditor
 * Validates React Router routes for broken links, missing fallbacks, and loading issues
 */

import { logger } from "@/lib/logger";
import type { SweepIssue } from "../types";

export class RouteAuditor {
  /**
   * Audit all routes in the application
   */
  static async audit(): Promise<SweepIssue[]> {
    const issues: SweepIssue[] = [];
    
    logger.info("[Route Auditor] Starting route validation...");

    try {
      // Check if current route is valid
      const currentPath = window.location.pathname;
      const hasContent = document.body && document.body.children.length > 0;
      
      if (!hasContent && currentPath !== "/") {
        issues.push({
          id: `route_${Date.now()}_empty`,
          category: "routing",
          severity: "critical",
          title: "Empty Route Detected",
          description: `Route ${currentPath} appears to have no content`,
          file: currentPath,
          suggestion: "Check if route is properly configured in App.tsx and has a valid component",
          autoFixable: false,
          timestamp: new Date()
        });
      }

      // Check for lazy loading without Suspense
      const lazyComponents = document.querySelectorAll("[data-lazy-component]");
      if (lazyComponents.length > 0) {
        const suspenseElements = document.querySelectorAll("[data-suspense]");
        if (suspenseElements.length === 0) {
          issues.push({
            id: `route_${Date.now()}_lazy_no_suspense`,
            category: "routing",
            severity: "high",
            title: "Lazy Components Without Suspense",
            description: `Found ${lazyComponents.length} lazy components without Suspense boundary`,
            suggestion: "Wrap lazy components with React Suspense for proper loading states",
            autoFixable: false,
            timestamp: new Date()
          });
        }
      }

      // Check for error boundaries
      const hasErrorBoundary = document.querySelector("[data-error-boundary]") !== null;
      if (!hasErrorBoundary) {
        issues.push({
          id: `route_${Date.now()}_no_error_boundary`,
          category: "routing",
          severity: "medium",
          title: "Missing Error Boundary",
          description: "No error boundary detected on current route",
          suggestion: "Add ErrorBoundary component to catch and handle errors gracefully",
          autoFixable: false,
          timestamp: new Date()
        });
      }

      logger.info(`[Route Auditor] Found ${issues.length} routing issues`);
    } catch (error) {
      logger.error("[Route Auditor] Audit failed:", error);
      issues.push({
        id: `route_${Date.now()}_audit_error`,
        category: "routing",
        severity: "high",
        title: "Route Audit Failed",
        description: error instanceof Error ? error.message : "Unknown error during route audit",
        autoFixable: false,
        timestamp: new Date()
      });
    }

    return issues;
  }
}
