/**
 * System Watchdog - Optimized
 * Lightweight module monitoring (disabled by default)
 */

import { Logger } from "@/lib/utils/logger";

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
  private isRunning = false;
  private readonly CHECK_INTERVAL_MS = 60000; // 1 minute (increased from 30s)

  start() {
    // Disabled by default
    const ENABLE = import.meta.env.VITE_ENABLE_CLIENT_METRICS === "true";
    if (!ENABLE) {
      Logger.info("SystemWatchdog disabled", undefined, "SystemWatchdog");
      return;
    }

    if (this.isRunning) return;
    this.isRunning = true;
    
    Logger.info("SystemWatchdog starting", undefined, "SystemWatchdog");
    
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.CHECK_INTERVAL_MS);
  }

  stop() {
    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

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

  updateModuleStatus(id: string, status: Partial<ModuleStatus>) {
    const existing = this.moduleStatuses.get(id);
    if (existing) {
      this.moduleStatuses.set(id, { 
        ...existing, 
        ...status, 
        lastCheck: new Date().toISOString() 
      });
    }
  }

  trackRoute(path: string, responseTime: number, success: boolean = true) {
    const metric: RouteMetric = {
      path,
      responseTime,
      timestamp: new Date().toISOString(),
      status: success ? "success" : "error",
    };
    
    this.routeMetrics.push(metric);
    
    if (this.routeMetrics.length > 50) {
      this.routeMetrics.shift();
    }
  }

  private performHealthCheck() {
    if (!this.isRunning) return;
    
    for (const [id] of this.moduleStatuses.entries()) {
      const startTime = performance.now();
      const responseTime = performance.now() - startTime;
      
      this.updateModuleStatus(id, {
        status: "active",
        responseTime,
      });
    }
  }

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
      health: offlineCount === 0 && degradedCount === 0 ? "healthy" : "degraded",
      modules,
    };
  }

  getModuleStatus(id: string): ModuleStatus | undefined {
    return this.moduleStatuses.get(id);
  }

  getRouteMetrics(): RouteMetric[] {
    return [...this.routeMetrics];
  }
}

export const systemWatchdog = new SystemWatchdog();
