/**
 * Hub Monitor - Real-time Status Tracking
 * Monitors all operational modules and reports their status
 */

import { ModuleState, ModuleStatus } from "./types";
import config from "./hub_config.json";

export class HubMonitor {
  private modules: Map<string, ModuleState> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize monitoring for all configured modules
   */
  async initialize(): Promise<void> {
    const moduleConfigs = Object.entries(config.modules);
    
    for (const [key, moduleConfig] of moduleConfigs) {
      this.modules.set(key, {
        name: moduleConfig.name,
        status: "offline",
        uptime: 0,
        lastCheck: new Date(),
        errors: 0,
        performance: 0,
      });

      // Start monitoring interval for each module
      const interval = setInterval(
        () => this.checkModule(key),
        moduleConfig.checkInterval
      );
      this.monitoringIntervals.set(key, interval);

      // Initial check
      await this.checkModule(key);
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    for (const interval of this.monitoringIntervals.values()) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();
  }

  /**
   * Check status of a specific module
   */
  async checkModule(moduleKey: string): Promise<void> {
    const moduleConfig = config.modules[moduleKey as keyof typeof config.modules];
    if (!moduleConfig) return;

    const state = this.modules.get(moduleKey);
    if (!state) return;

    try {
      const startTime = Date.now();
      const response = await fetch(moduleConfig.endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        // Update module state
        this.modules.set(moduleKey, {
          ...state,
          status: this.determineStatus(data, responseTime),
          uptime: data.uptime || state.uptime + 1,
          lastCheck: new Date(),
          performance: responseTime,
          errors: 0,
        });
      } else {
        this.handleModuleError(moduleKey, `HTTP ${response.status}`);
      }
    } catch (error) {
      this.handleModuleError(moduleKey, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Get current state of all modules
   */
  getModulesState(): Record<string, ModuleState> {
    const result: Record<string, ModuleState> = {};
    for (const [key, state] of this.modules.entries()) {
      result[key] = state;
    }
    return result;
  }

  /**
   * Get state of a specific module
   */
  getModuleState(moduleKey: string): ModuleState | undefined {
    return this.modules.get(moduleKey);
  }

  /**
   * Get overall system status
   */
  getSystemStatus(): ModuleStatus {
    const states = Array.from(this.modules.values());
    
    if (states.length === 0) return "offline";
    
    const hasError = states.some(s => s.status === "error");
    const hasOffline = states.some(s => s.status === "offline");
    const hasDegraded = states.some(s => s.status === "degraded");
    
    if (hasError) return "error";
    if (hasOffline) return "degraded";
    if (hasDegraded) return "degraded";
    
    return "operational";
  }

  /**
   * Determine module status based on response data and performance
   */
  private determineStatus(data: any, responseTime: number): ModuleStatus {
    // Check if module reports its own status
    if (data.status) {
      return data.status as ModuleStatus;
    }

    // Determine based on performance
    if (responseTime > 5000) {
      return "degraded";
    }

    return "operational";
  }

  /**
   * Handle module error
   */
  private handleModuleError(moduleKey: string, error: string): void {
    const state = this.modules.get(moduleKey);
    if (!state) return;

    const errorCount = state.errors + 1;
    
    // Determine status based on error count
    let status: ModuleStatus = "degraded";
    if (errorCount >= 3) {
      status = "error";
    }

    this.modules.set(moduleKey, {
      ...state,
      status,
      lastCheck: new Date(),
      errors: errorCount,
    });

  }
}

export const hubMonitor = new HubMonitor();
