/**
 * Health Monitor - Continuous system health monitoring
 * Detects issues, tracks module health, and triggers healing
 */

import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";
import type {
  ModuleHealth,
  SystemDiagnostic,
  SystemIssue,
  HealthStatus,
  ModuleType,
  IssueType,
  SystemMetrics,
} from "./types";

class HealthMonitor {
  private modules: Map<string, ModuleHealth> = new Map();
  private issues: SystemIssue[] = [];
  private listeners: Set<(diagnostic: SystemDiagnostic) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private startTime: number = Date.now();
  private totalErrors: number = 0;
  private errorsResolved: number = 0;

  /**
   * Register a module for monitoring
   */
  registerModule(
    id: string,
    name: string,
    type: ModuleType,
    dependencies: string[] = []
  ): void {
    this.modules.set(id, {
      id,
      name,
      type,
      status: "healthy",
      lastCheck: Date.now(),
      errorCount: 0,
      responseTime: 0,
      dependencies,
    });
    Logger.debug(`Module registered: ${name}`, { id, type }, "HealthMonitor");
  }

  /**
   * Start continuous health monitoring
   */
  start(intervalMs: number = 30000): void {
    if (this.checkInterval) return;

    Logger.info("Health monitoring started", { interval: intervalMs }, "HealthMonitor");

    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    // Initial check
    this.performHealthCheck();
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      Logger.info("Health monitoring stopped", undefined, "HealthMonitor");
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<SystemDiagnostic> {
    const startTime = performance.now();

    // Check each registered module
    for (const [id, module] of this.modules) {
      await this.checkModuleHealth(id, module);
    }

    // Check database connectivity
    await this.checkDatabaseHealth();

    // Check API endpoints
    await this.checkAPIHealth();

    // Calculate overall health
    const diagnostic = this.generateDiagnostic();

    // Notify listeners
    this.notifyListeners(diagnostic);

    const duration = performance.now() - startTime;
    Logger.debug(`Health check completed in ${duration.toFixed(0)}ms`, undefined, "HealthMonitor");

    return diagnostic;
  }

  /**
   * Check individual module health
   */
  private async checkModuleHealth(id: string, module: ModuleHealth): Promise<void> {
    const startTime = performance.now();

    try {
      // Check if dependencies are healthy
      const unhealthyDeps = module.dependencies.filter((depId) => {
        const dep = this.modules.get(depId);
        return dep && dep.status !== "healthy";
      });

      if (unhealthyDeps.length > 0) {
        this.updateModuleStatus(id, "degraded", {
          message: `Unhealthy dependencies: ${unhealthyDeps.join(", ")}`,
        });
        return;
      }

      // Module is healthy
      const responseTime = performance.now() - startTime;
      this.modules.set(id, {
        ...module,
        status: "healthy",
        lastCheck: Date.now(),
        responseTime,
        errorCount: Math.max(0, module.errorCount - 1), // Decay errors over time
      });
    } catch (error) {
      this.reportIssue({
        type: "component_crash",
        module: id,
        description: `Module ${module.name} health check failed`,
        error,
      });
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseHealth(): Promise<void> {
    const moduleId = "database-connection";

    if (!this.modules.has(moduleId)) {
      this.registerModule(moduleId, "Database Connection", "database");
    }

    try {
      const startTime = performance.now();
      const { error } = await supabase.auth.getSession();
      const responseTime = performance.now() - startTime;

      if (error) {
        this.updateModuleStatus(moduleId, "degraded", { error: error.message });
      } else {
        this.updateModuleStatus(moduleId, "healthy", { responseTime });
      }
    } catch (error) {
      this.updateModuleStatus(moduleId, "critical", { error });
      this.reportIssue({
        type: "database_error",
        module: moduleId,
        description: "Database connection failed",
        error,
      });
    }
  }

  /**
   * Check API endpoint health
   */
  private async checkAPIHealth(): Promise<void> {
    const moduleId = "api-gateway";

    if (!this.modules.has(moduleId)) {
      this.registerModule(moduleId, "API Gateway", "integration");
    }

    try {
      const startTime = performance.now();
      
      // Check Supabase functions endpoint
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || ""}/rest/v1/`,
        {
          method: "HEAD",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          },
        }
      );

      const responseTime = performance.now() - startTime;

      if (response.ok || response.status === 400) {
        this.updateModuleStatus(moduleId, "healthy", { responseTime });
      } else {
        this.updateModuleStatus(moduleId, "degraded", {
          status: response.status,
          responseTime,
        });
      }
    } catch (error) {
      this.updateModuleStatus(moduleId, "offline", { error });
    }
  }

  /**
   * Update module status
   */
  private updateModuleStatus(
    id: string,
    status: HealthStatus,
    metadata?: Record<string, unknown>
  ): void {
    const module = this.modules.get(id);
    if (!module) return;

    const wasHealthy = module.status === "healthy";
    const isNowUnhealthy = status !== "healthy";

    this.modules.set(id, {
      ...module,
      status,
      lastCheck: Date.now(),
      errorCount: isNowUnhealthy ? module.errorCount + 1 : module.errorCount,
      metadata: { ...module.metadata, ...metadata },
    });

    if (wasHealthy && isNowUnhealthy) {
      Logger.warn(`Module ${module.name} became ${status}`, metadata, "HealthMonitor");
    }
  }

  /**
   * Report a system issue
   */
  reportIssue(params: {
    type: IssueType;
    module: string;
    description: string;
    error?: unknown;
    severity?: SystemIssue["severity"];
  }): SystemIssue {
    const issue: SystemIssue = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: params.type,
      severity: params.severity || this.determineSeverity(params.type),
      module: params.module,
      description: params.description,
      stackTrace: params.error instanceof Error ? params.error.stack : undefined,
      autoFixable: this.isAutoFixable(params.type),
    };

    this.issues.push(issue);
    this.totalErrors++;

    // Keep only recent issues
    if (this.issues.length > 100) {
      this.issues = this.issues.slice(-100);
    }

    Logger.error(`Issue detected: ${params.description}`, { issue }, "HealthMonitor");

    return issue;
  }

  /**
   * Mark issue as resolved
   */
  resolveIssue(issueId: string): void {
    const index = this.issues.findIndex((i) => i.id === issueId);
    if (index !== -1) {
      this.issues.splice(index, 1);
      this.errorsResolved++;
    }
  }

  /**
   * Determine issue severity based on type
   */
  private determineSeverity(type: IssueType): SystemIssue["severity"] {
    const severityMap: Record<IssueType, SystemIssue["severity"]> = {
      route_error: "medium",
      component_crash: "high",
      api_failure: "high",
      database_error: "critical",
      memory_leak: "high",
      performance_degradation: "medium",
      dependency_missing: "high",
      type_error: "low",
      network_timeout: "medium",
      auth_failure: "high",
    };
    return severityMap[type] || "medium";
  }

  /**
   * Check if issue type is auto-fixable
   */
  private isAutoFixable(type: IssueType): boolean {
    const autoFixable: IssueType[] = [
      "route_error",
      "network_timeout",
      "performance_degradation",
    ];
    return autoFixable.includes(type);
  }

  /**
   * Generate system diagnostic report
   */
  private generateDiagnostic(): SystemDiagnostic {
    const modules = Array.from(this.modules.values());
    const criticalCount = modules.filter((m) => m.status === "critical").length;
    const degradedCount = modules.filter((m) => m.status === "degraded").length;
    const offlineCount = modules.filter((m) => m.status === "offline").length;

    let overallHealth: HealthStatus = "healthy";
    if (criticalCount > 0 || offlineCount > 0) {
      overallHealth = "critical";
    } else if (degradedCount > 0) {
      overallHealth = "degraded";
    }

    const metrics: SystemMetrics = {
      uptime: Date.now() - this.startTime,
      totalErrors: this.totalErrors,
      errorsResolved: this.errorsResolved,
      autoFixRate: this.totalErrors > 0 ? this.errorsResolved / this.totalErrors : 1,
      avgResponseTime: this.calculateAvgResponseTime(),
      memoryUsage: this.getMemoryUsage(),
      activeConnections: modules.filter((m) => m.status === "healthy").length,
    };

    return {
      timestamp: Date.now(),
      overallHealth,
      modules,
      activeIssues: [...this.issues],
      recentFixes: [], // Populated by AutoHealer
      metrics,
    };
  }

  /**
   * Calculate average response time across modules
   */
  private calculateAvgResponseTime(): number {
    const modules = Array.from(this.modules.values());
    if (modules.length === 0) return 0;
    const total = modules.reduce((sum, m) => sum + m.responseTime, 0);
    return total / modules.length;
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1048576; // MB
    }
    return 0;
  }

  /**
   * Subscribe to diagnostic updates
   */
  subscribe(callback: (diagnostic: SystemDiagnostic) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(diagnostic: SystemDiagnostic): void {
    this.listeners.forEach((callback) => {
      try {
        callback(diagnostic);
      } catch (error) {
        Logger.error("Listener callback failed", { error }, "HealthMonitor");
      }
    });
  }

  /**
   * Get current issues
   */
  getIssues(): SystemIssue[] {
    return [...this.issues];
  }

  /**
   * Get module by ID
   */
  getModule(id: string): ModuleHealth | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all modules
   */
  getModules(): ModuleHealth[] {
    return Array.from(this.modules.values());
  }
}

export const healthMonitor = new HealthMonitor();
