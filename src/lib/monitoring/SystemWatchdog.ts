/**
 * System Watchdog
 * Real-time monitoring of module status, route performance, and system health
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

class SystemWatchdog {
  private moduleStatuses: Map<string, ModuleStatus> = new Map();
  private routeMetrics: RouteMetric[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Start the watchdog monitoring
   */
  start() {
    console.log("🐕 SystemWatchdog: Starting monitoring...");
    
    // Initial check
    this.performHealthCheck();
    
    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
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
        recorded_at: timestamp,
        metadata: {
          modules: metrics,
          routes: this.routeMetrics.slice(-10),
          source: "system_watchdog"
        }
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
}

// Singleton instance
export const systemWatchdog = new SystemWatchdog();
