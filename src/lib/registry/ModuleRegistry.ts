/**
 * Module Registry
 * Central registry for all Nautilus One modules with status tracking
 */

import { systemWatchdog } from "@/lib/monitoring/SystemWatchdog";
import { logsEngine } from "@/lib/monitoring/LogsEngine";

export interface ModuleDefinition {
  id: string;
  name: string;
  path: string;
  category: string;
  aiEnabled: boolean;
  connectedTo: string[];
  fallbackAvailable: boolean;
  description?: string;
}

export interface ModuleRuntimeStatus extends ModuleDefinition {
  status: "active" | "degraded" | "offline";
  lastError: string | null;
  loadTime: number;
  lastAccessed: string;
}

class ModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map();
  private runtimeStatus: Map<string, ModuleRuntimeStatus> = new Map();

  /**
   * Register a module
   */
  register(module: ModuleDefinition) {
    this.modules.set(module.id, module);
    systemWatchdog.registerModule(module.id, module.name);
    
    logsEngine.info("registry", `Module registered: ${module.name}`, {
      id: module.id,
      category: module.category,
      aiEnabled: module.aiEnabled,
    });
  }

  /**
   * Register multiple modules
   */
  registerMany(modules: ModuleDefinition[]) {
    modules.forEach(module => this.register(module));
  }

  /**
   * Update module runtime status
   */
  updateStatus(id: string, status: Partial<ModuleRuntimeStatus>) {
    const module = this.modules.get(id);
    if (!module) {
      logsEngine.warning("registry", `Attempted to update unknown module: ${id}`);
      return;
    }

    const currentStatus = this.runtimeStatus.get(id) || {
      ...module,
      status: "offline",
      lastError: null,
      loadTime: 0,
      lastAccessed: new Date().toISOString(),
    };

    this.runtimeStatus.set(id, {
      ...currentStatus,
      ...status,
      lastAccessed: new Date().toISOString(),
    });

    systemWatchdog.updateModuleStatus(id, {
      status: status.status || currentStatus.status,
      errors: status.lastError ? [status.lastError] : [],
    });
  }

  /**
   * Mark module as loaded
   */
  markLoaded(id: string, loadTime: number) {
    this.updateStatus(id, {
      status: "active",
      loadTime,
      lastError: null,
    });
  }

  /**
   * Mark module as errored
   */
  markError(id: string, error: string) {
    this.updateStatus(id, {
      status: "offline",
      lastError: error,
    });

    logsEngine.error("registry", `Module error: ${id}`, { error });
  }

  /**
   * Get module definition
   */
  getModule(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  /**
   * Get module runtime status
   */
  getStatus(id: string): ModuleRuntimeStatus | undefined {
    return this.runtimeStatus.get(id);
  }

  /**
   * Get all modules
   */
  getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all modules with runtime status
   */
  getAllStatuses(): ModuleRuntimeStatus[] {
    return Array.from(this.runtimeStatus.values());
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): ModuleDefinition[] {
    return Array.from(this.modules.values()).filter(m => m.category === category);
  }

  /**
   * Get active modules count
   */
  getActiveCount(): number {
    return Array.from(this.runtimeStatus.values()).filter(m => m.status === "active").length;
  }

  /**
   * Get modules with AI enabled
   */
  getAIEnabledModules(): ModuleDefinition[] {
    return Array.from(this.modules.values()).filter(m => m.aiEnabled);
  }

  /**
   * Check if module exists
   */
  hasModule(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Get registry summary
   */
  getSummary() {
    const all = this.getAllStatuses();
    const active = all.filter(m => m.status === "active").length;
    const degraded = all.filter(m => m.status === "degraded").length;
    const offline = all.filter(m => m.status === "offline").length;
    const aiEnabled = this.getAIEnabledModules().length;

    return {
      total: this.modules.size,
      active,
      degraded,
      offline,
      aiEnabled,
      health: offline === 0 && degraded === 0 ? "healthy" : degraded > 0 ? "degraded" : "critical",
    };
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistry();
