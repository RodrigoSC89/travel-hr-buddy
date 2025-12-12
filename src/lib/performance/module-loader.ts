/**
 * Module Loader - PATCH 975
 * Dynamic module loading with isolation and resource management
 */

import { lazy, ComponentType, LazyExoticComponent } from "react";

interface ModuleConfig {
  id: string;
  name: string;
  path: string;
  priority: "critical" | "high" | "normal" | "low";
  preload?: boolean;
  dependencies?: string[];
  estimatedSizeKB?: number;
  lastUsed?: number;
  enabled: boolean;
}

interface LoadedModule {
  component: LazyExoticComponent<ComponentType<any>>;
  loadedAt: number;
  useCount: number;
  sizeKB: number;
}

class ModuleLoader {
  private modules: Map<string, ModuleConfig> = new Map();
  private loadedModules: Map<string, LoadedModule> = new Map();
  private preloadQueue: string[] = [];
  private isPreloading = false;
  private readonly MAX_LOADED_MODULES = 20;
  
  /**
   * Register a module
   */
  register(config: ModuleConfig): void {
    this.modules.set(config.id, {
      ...config,
      lastUsed: config.lastUsed || 0
    });
    
    if (config.preload && config.enabled) {
      this.preloadQueue.push(config.id);
    }
  }
  
  /**
   * Register multiple modules
   */
  registerMany(configs: ModuleConfig[]): void {
    configs.forEach(config => this.register(config));
  }
  
  /**
   * Get lazy component for a module
   */
  getComponent(moduleId: string): LazyExoticComponent<ComponentType<any>> | null {
    const config = this.modules.get(moduleId);
    if (!config || !config.enabled) {
      return null;
    }
    
    // Check if already loaded
    const loaded = this.loadedModules.get(moduleId);
    if (loaded) {
      loaded.useCount++;
      config.lastUsed = Date.now();
      return loaded.component;
    }
    
    // Create lazy component
    const component = lazy(() => this.loadModule(moduleId));
    
    this.loadedModules.set(moduleId, {
      component,
      loadedAt: Date.now(),
      useCount: 1,
      sizeKB: config.estimatedSizeKB || 50
    });
    
    config.lastUsed = Date.now();
    this.checkMemory();
    
    return component;
  }
  
  /**
   * Load module dynamically
   */
  private async loadModule(moduleId: string): Promise<{ default: ComponentType<any> }> {
    const config = this.modules.get(moduleId);
    if (!config) {
      throw new Error(`Module "${moduleId}" not registered`);
    }
    
    // Load dependencies first
    if (config.dependencies?.length) {
      await Promise.all(
        config.dependencies.map(depId => this.preloadModule(depId))
      );
    }
    
    
    // Dynamic import based on path
    try {
      const module = await import(/* @vite-ignore */ config.path);
      return module;
    } catch (e) {
      console.error(`[ModuleLoader] Failed to load "${moduleId}":`, e);
      console.error(`[ModuleLoader] Failed to load "${moduleId}":`, e);
      throw e;
    }
  }
  
  /**
   * Preload a module in background
   */
  async preloadModule(moduleId: string): Promise<void> {
    const config = this.modules.get(moduleId);
    if (!config || !config.enabled || this.loadedModules.has(moduleId)) {
      return;
    }
    
    try {
      await this.loadModule(moduleId);
    } catch (e) {
      console.warn(`[ModuleLoader] Preload failed for "${moduleId}":`, e);
      console.warn(`[ModuleLoader] Preload failed for "${moduleId}":`, e);
    }
  }
  
  /**
   * Start preloading queue
   */
  async startPreloading(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    
    // Sort by priority
    const sorted = this.preloadQueue.sort((a, b) => {
      const configA = this.modules.get(a);
      const configB = this.modules.get(b);
      const priorities = { critical: 4, high: 3, normal: 2, low: 1 };
      return (priorities[configB?.priority || "low"] || 0) - (priorities[configA?.priority || "low"] || 0);
    });
    
    for (const moduleId of sorted) {
      if ("requestIdleCallback" in window) {
        await new Promise<void>(resolve => {
          requestIdleCallback(() => {
            this.preloadModule(moduleId).finally(resolve);
          });
        });
      } else {
        await this.preloadModule(moduleId);
      }
    }
    
    this.preloadQueue = [];
    this.isPreloading = false;
  }
  
  /**
   * Enable/disable a module
   */
  setEnabled(moduleId: string, enabled: boolean): void {
    const config = this.modules.get(moduleId);
    if (config) {
      config.enabled = enabled;
      
      if (!enabled) {
        this.unloadModule(moduleId);
      }
    }
  }
  
  /**
   * Unload a module to free memory
   */
  unloadModule(moduleId: string): void {
    this.loadedModules.delete(moduleId);
  }
  
  /**
   * Check memory and unload unused modules
   */
  private checkMemory(): void {
    if (this.loadedModules.size <= this.MAX_LOADED_MODULES) return;
    
    // Find least recently used modules
    const entries = Array.from(this.loadedModules.entries())
      .map(([id, module]) => ({
        id,
        module,
        config: this.modules.get(id)
      }))
      .filter(e => e.config?.priority !== "critical")
      .sort((a, b) => {
        // Sort by last used, then by use count
        const lastUsedDiff = (a.config?.lastUsed || 0) - (b.config?.lastUsed || 0);
        if (lastUsedDiff !== 0) return lastUsedDiff;
        return a.module.useCount - b.module.useCount;
      });
    
    // Unload oldest modules
    const toUnload = this.loadedModules.size - this.MAX_LOADED_MODULES + 5;
    for (let i = 0; i < toUnload && i < entries.length; i++) {
      this.unloadModule(entries[i].id);
    }
  }
  
  /**
   * Get all registered modules
   */
  getModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }
  
  /**
   * Get enabled modules
   */
  getEnabledModules(): ModuleConfig[] {
    return this.getModules().filter(m => m.enabled);
  }
  
  /**
   * Get loaded modules stats
   */
  getStats(): {
    registered: number;
    enabled: number;
    loaded: number;
    totalSizeKB: number;
    byPriority: Record<string, number>;
    } {
    const loaded = Array.from(this.loadedModules.values());
    const byPriority: Record<string, number> = { critical: 0, high: 0, normal: 0, low: 0 };
    
    this.modules.forEach(config => {
      byPriority[config.priority]++;
    });
    
    return {
      registered: this.modules.size,
      enabled: this.getEnabledModules().length,
      loaded: this.loadedModules.size,
      totalSizeKB: loaded.reduce((sum, m) => sum + m.sizeKB, 0),
      byPriority
    };
  }
  
  /**
   * Clear all loaded modules
   */
  clear(): void {
    this.loadedModules.clear();
    this.preloadQueue = [];
  }
}

export const moduleLoader = new ModuleLoader();

// Pre-register core modules
moduleLoader.registerMany([
  {
    id: "dashboard",
    name: "Dashboard",
    path: "@/pages/Dashboard",
    priority: "critical",
    preload: true,
    enabled: true,
    estimatedSizeKB: 150
  },
  {
    id: "maintenance",
    name: "Manutenção",
    path: "@/pages/Maintenance",
    priority: "high",
    enabled: true,
    estimatedSizeKB: 200
  },
  {
    id: "fleet",
    name: "Frota",
    path: "@/pages/Fleet",
    priority: "high",
    enabled: true,
    estimatedSizeKB: 180
  },
  {
    id: "compliance",
    name: "Compliance",
    path: "@/pages/Compliance",
    priority: "normal",
    enabled: true,
    estimatedSizeKB: 120
  },
  {
    id: "reports",
    name: "Relatórios",
    path: "@/pages/Reports",
    priority: "normal",
    enabled: true,
    estimatedSizeKB: 100
  },
  {
    id: "hr",
    name: "Recursos Humanos",
    path: "@/pages/HR",
    priority: "normal",
    enabled: true,
    estimatedSizeKB: 150
  },
  {
    id: "inventory",
    name: "Estoque",
    path: "@/pages/Inventory",
    priority: "normal",
    enabled: true,
    estimatedSizeKB: 130
  },
  {
    id: "ai-insights",
    name: "IA Insights",
    path: "@/pages/AIInsights",
    priority: "low",
    enabled: true,
    estimatedSizeKB: 200
  },
  {
    id: "settings",
    name: "Configurações",
    path: "@/pages/Settings",
    priority: "low",
    enabled: true,
    estimatedSizeKB: 80
  }
]);

/**
 * Hook to use module loader
 */
export function useModuleLoader() {
  return {
    getComponent: (id: string) => moduleLoader.getComponent(id),
    setEnabled: (id: string, enabled: boolean) => moduleLoader.setEnabled(id, enabled),
    getModules: () => moduleLoader.getModules(),
    getEnabledModules: () => moduleLoader.getEnabledModules(),
    getStats: () => moduleLoader.getStats(),
    preload: () => moduleLoader.startPreloading()
  };
}
