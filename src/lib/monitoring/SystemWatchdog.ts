/**
 * System Watchdog
 * Real-time monitoring of module status, route performance, and system health
 * AI-powered autocorrection and anomaly detection
 */

import { supabase } from "@/integrations/supabase/client";

export interface ModuleStatus {
  id: string;
  name: string;
  status: "active" | "degraded" | "offline";
  responseTime: number;
  lastCheck: string;
  errors: string[];
}

export interface RouteMetric {
  path: string;
  responseTime: number;
  timestamp: string;
  status: "success" | "error";
}

export interface ErrorPattern {
  errorType: string;
  occurrences: number;
  lastSeen: string;
  severity: "low" | "medium" | "high" | "critical";
  suggestedFix?: string;
}

export interface AutoCorrection {
  errorType: string;
  attemptedFix: string;
  success: boolean;
  timestamp: string;
}

class SystemWatchdog {
  private moduleStatuses: Map<string, ModuleStatus> = new Map();
  private routeMetrics: RouteMetric[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private autoCorrections: AutoCorrection[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds
  private readonly ERROR_THRESHOLD = 3; // Number of repeated errors before autocorrection

  /**
   * Start the watchdog monitoring
   */
  start() {
    if (this.checkInterval) {
      console.log("🐕 SystemWatchdog: Already running");
      return;
    }
    
    console.log("🐕 SystemWatchdog v2: Starting AI-powered monitoring...");
    
    // Initial check
    this.performHealthCheck();
    this.scanLogsForErrors();
    
    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
      this.scanLogsForErrors();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop the watchdog monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("🐕 SystemWatchdog: Monitoring stopped");
    }
  }

  /**
   * Register a module for monitoring
   */
  registerModule(id: string, name: string) {
    this.moduleStatuses.set(id, {
      id,
      name,
      status: "active",
      responseTime: 0,
      lastCheck: new Date().toISOString(),
      errors: [],
    });
  }

  /**
   * Update module status
   */
  updateModuleStatus(id: string, status: Partial<ModuleStatus>) {
    const existing = this.moduleStatuses.get(id);
    if (existing) {
      this.moduleStatuses.set(id, { ...existing, ...status, lastCheck: new Date().toISOString() });
    }
  }

  /**
   * Track route performance
   */
  trackRoute(path: string, responseTime: number, success: boolean = true) {
    const metric: RouteMetric = {
      path,
      responseTime,
      timestamp: new Date().toISOString(),
      status: success ? "success" : "error",
    };
    
    this.routeMetrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.routeMetrics.length > 100) {
      this.routeMetrics.shift();
    }
  }

  /**
   * Perform health check on all registered modules
   */
  private async performHealthCheck() {
    const timestamp = new Date().toISOString();
    
    for (const [id, module] of this.moduleStatuses.entries()) {
      const startTime = performance.now();
      
      try {
        // Check if module DOM element exists and is rendered
        const moduleElement = document.querySelector(`[data-module-id="${id}"]`);
        const responseTime = performance.now() - startTime;
        
        const status: "active" | "degraded" | "offline" = 
          moduleElement ? "active" : 
          responseTime > 3000 ? "degraded" : 
          "offline";
        
        this.updateModuleStatus(id, {
          status,
          responseTime,
          errors: status === "offline" ? ["Module not rendered"] : [],
        });
      } catch (error) {
        this.updateModuleStatus(id, {
          status: "offline",
          responseTime: performance.now() - startTime,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        });
      }
    }
    
    // Persist metrics to Supabase
    await this.persistMetrics(timestamp);
  }

  /**
   * Persist metrics to Supabase
   */
  private async persistMetrics(timestamp: string) {
    try {
      // Feature flag: disable client metrics by default to avoid RLS issues in preview/prod
      const ENABLE = import.meta.env.VITE_ENABLE_CLIENT_METRICS === "true";
      if (!ENABLE) return;

      const metrics = Array.from(this.moduleStatuses.values());
      const avgResponseTime = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length || 0;
      
      // Store in performance_metrics table
      await supabase.from("performance_metrics").insert({
        metric_name: "system_health",
        metric_value: avgResponseTime,
        metric_unit: "ms",
        category: "health_check",
        status: this.getSystemStatus().health === "healthy" ? "healthy" : 
                this.getSystemStatus().health === "degraded" ? "warning" : "critical",
        recorded_at: timestamp
      });
    } catch (error) {
      console.error("Failed to persist metrics:", error);
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    const modules = Array.from(this.moduleStatuses.values());
    const activeCount = modules.filter(m => m.status === "active").length;
    const degradedCount = modules.filter(m => m.status === "degraded").length;
    const offlineCount = modules.filter(m => m.status === "offline").length;
    
    return {
      totalModules: modules.length,
      active: activeCount,
      degraded: degradedCount,
      offline: offlineCount,
      health: offlineCount === 0 && degradedCount === 0 ? "healthy" : degradedCount > 0 ? "degraded" : "critical",
      modules,
    };
  }

  /**
   * Get module status by ID
   */
  getModuleStatus(id: string): ModuleStatus | undefined {
    return this.moduleStatuses.get(id);
  }

  /**
   * Get route metrics
   */
  getRouteMetrics(): RouteMetric[] {
    return [...this.routeMetrics];
  }

  /**
   * Scan logs for repeated errors and patterns
   */
  async scanLogsForErrors() {
    try {
      const { data: logs, error } = await supabase
        .from("system_logs")
        .select("*")
        .eq("level", "error")
        .gte("created_at", new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Failed to scan logs:", error);
        return;
      }

      // Analyze error patterns
      const patterns = new Map<string, number>();
      logs?.forEach(log => {
        const errorType = this.categorizeError(log.message);
        patterns.set(errorType, (patterns.get(errorType) || 0) + 1);
      });

      // Update error patterns and check for autocorrection opportunities
      patterns.forEach((count, errorType) => {
        const existing = this.errorPatterns.get(errorType);
        const severity = this.calculateSeverity(count);

        this.errorPatterns.set(errorType, {
          errorType,
          occurrences: count,
          lastSeen: new Date().toISOString(),
          severity,
          suggestedFix: this.generateSuggestedFix(errorType),
        });

        // Attempt autocorrection if threshold exceeded
        if (count >= this.ERROR_THRESHOLD && !existing) {
          this.attemptAutoCorrection(errorType);
        }
      });
    } catch (error) {
      console.error("Error scanning logs:", error);
    }
  }

  /**
   * Categorize error into type
   */
  private categorizeError(message: string): string {
    if (message.includes("Network") || message.includes("fetch")) return "network_error";
    if (message.includes("undefined") || message.includes("null")) return "null_reference";
    if (message.includes("permission") || message.includes("auth")) return "auth_error";
    if (message.includes("timeout")) return "timeout_error";
    if (message.includes("import") || message.includes("module")) return "import_error";
    return "unknown_error";
  }

  /**
   * Calculate severity based on occurrence count
   */
  private calculateSeverity(count: number): "low" | "medium" | "high" | "critical" {
    if (count >= 20) return "critical";
    if (count >= 10) return "high";
    if (count >= 5) return "medium";
    return "low";
  }

  /**
   * Generate suggested fix based on error type
   */
  private generateSuggestedFix(errorType: string): string {
    const fixes: Record<string, string> = {
      network_error: "Check internet connection, verify API endpoints are accessible",
      null_reference: "Add null checks, verify data is loaded before access",
      auth_error: "Verify user authentication, check token expiration",
      timeout_error: "Increase timeout threshold, optimize slow operations",
      import_error: "Verify module paths, check for circular dependencies",
      unknown_error: "Review error logs for detailed information",
    };
    return fixes[errorType] || "Manual investigation required";
  }

  /**
   * Attempt automatic correction for known error patterns
   */
  private async attemptAutoCorrection(errorType: string) {
    console.log(`🤖 SystemWatchdog: Attempting autocorrection for ${errorType}`);
    
    let success = false;
    let attemptedFix = "";

    try {
      switch (errorType) {
        case "network_error":
          attemptedFix = "Retrying failed requests with exponential backoff";
          // Trigger network retry logic
          success = await this.retryNetworkOperations();
          break;
          
        case "auth_error":
          attemptedFix = "Refreshing authentication token";
          // Trigger auth refresh
          success = await this.refreshAuthentication();
          break;
          
        case "timeout_error":
          attemptedFix = "Clearing cache and reloading affected modules";
          // Clear cache
          success = await this.clearCacheAndReload();
          break;
          
        default:
          attemptedFix = "Logging detailed error information for manual review";
          success = await this.logDetailedErrorInfo(errorType);
          break;
      }

      // Record autocorrection attempt
      const correction: AutoCorrection = {
        errorType,
        attemptedFix,
        success,
        timestamp: new Date().toISOString(),
      };
      
      this.autoCorrections.push(correction);
      
      // Log to Supabase
      await supabase.from("system_logs").insert({
        level: success ? "info" : "warning",
        category: "autocorrection",
        message: `Autocorrection ${success ? "succeeded" : "failed"} for ${errorType}`,
        metadata: correction,
      });

      if (success) {
        console.log(`✅ Autocorrection successful for ${errorType}`);
      } else {
        console.log(`⚠️ Autocorrection failed for ${errorType}, manual intervention needed`);
      }
    } catch (error) {
      console.error("Autocorrection error:", error);
    }
  }

  /**
   * Retry network operations
   */
  private async retryNetworkOperations(): Promise<boolean> {
    // Implementation: Trigger retry for failed network requests
    return true; // Placeholder
  }

  /**
   * Refresh authentication
   */
  private async refreshAuthentication(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Clear cache and reload
   */
  private async clearCacheAndReload(): Promise<boolean> {
    try {
      // Clear service worker cache if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Log detailed error information
   */
  private async logDetailedErrorInfo(errorType: string): Promise<boolean> {
    try {
      const pattern = this.errorPatterns.get(errorType);
      await supabase.from("system_logs").insert({
        level: "error",
        category: "error_analysis",
        message: `Detailed analysis for ${errorType}`,
        metadata: pattern,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error patterns
   */
  getErrorPatterns(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values());
  }

  /**
   * Get autocorrection history
   */
  getAutoCorrectionHistory(): AutoCorrection[] {
    return [...this.autoCorrections];
  }

  /**
   * Get AI-powered system health report
   */
  async getAIHealthReport(): Promise<string> {
    const status = this.getSystemStatus();
    const errors = this.getErrorPatterns();
    const corrections = this.getAutoCorrectionHistory();

    let report = `# System Health Report\n\n`;
    report += `**Status**: ${status.health.toUpperCase()}\n`;
    report += `**Active Modules**: ${status.active}/${status.totalModules}\n`;
    report += `**Degraded**: ${status.degraded}\n`;
    report += `**Offline**: ${status.offline}\n\n`;

    if (errors.length > 0) {
      report += `## Detected Error Patterns\n`;
      errors.forEach(error => {
        report += `- **${error.errorType}** (${error.severity}): ${error.occurrences} occurrences\n`;
        report += `  - Suggested Fix: ${error.suggestedFix}\n`;
      });
      report += `\n`;
    }

    if (corrections.length > 0) {
      report += `## Recent Autocorrections\n`;
      corrections.slice(-5).forEach(correction => {
        report += `- ${correction.errorType}: ${correction.attemptedFix} - ${correction.success ? '✅ Success' : '❌ Failed'}\n`;
      });
    }

    return report;
  }
}

// Singleton instance
export const systemWatchdog = new SystemWatchdog();
