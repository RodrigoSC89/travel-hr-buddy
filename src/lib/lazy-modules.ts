/**
 * PATCH 190.0 - Lazy Module Loading System
 * 
 * Centralized code splitting with preloading strategies
 * Optimized for 2Mbps connections
 */

import { lazy, ComponentType } from "react";

// Module priority levels
type Priority = "critical" | "high" | "medium" | "low";

interface ModuleConfig {
  loader: () => Promise<{ default: ComponentType<any> }>;
  priority: Priority;
  preloadOn?: "hover" | "visible" | "idle" | "route";
  chunkName?: string;
}

// Module registry for intelligent preloading
const moduleRegistry = new Map<string, ModuleConfig>();
const loadedModules = new Set<string>();
const preloadQueue: string[] = [];

/**
 * Register a lazy module with metadata
 */
export function registerModule(name: string, config: ModuleConfig) {
  moduleRegistry.set(name, config);
  return lazy(config.loader);
}

/**
 * Preload a module by name
 */
export async function preloadModule(name: string): Promise<void> {
  if (loadedModules.has(name)) return;
  
  const config = moduleRegistry.get(name);
  if (!config) return;
  
  try {
    await config.loader();
    loadedModules.add(name);
  } catch (error) {
    console.error(`Failed to preload module: ${name}`, error);
  }
}

/**
 * Preload modules by priority during idle time
 */
export function preloadByPriority(priority: Priority): void {
  const modules = Array.from(moduleRegistry.entries())
    .filter(([name, config]) => config.priority === priority && !loadedModules.has(name))
    .map(([name]) => name);
  
  if ("requestIdleCallback" in window) {
    modules.forEach((name) => {
      requestIdleCallback(() => preloadModule(name), { timeout: 3000 });
    });
  } else {
    // Fallback for Safari
    setTimeout(() => {
      modules.forEach((name) => preloadModule(name));
    }, 1000);
  }
}

// ============================================
// LAZY ROUTE COMPONENTS
// ============================================

// Critical routes - load immediately after shell
export const LazyDashboard = registerModule("dashboard", {
  loader: () => import("@/pages/Index"),
  priority: "critical",
  preloadOn: "route",
});

// Placeholder component for missing modules
const PlaceholderComponent = () => null;

// High priority - preload on idle (with fallback)
export const LazyMissions = registerModule("missions", {
  loader: async () => ({ default: PlaceholderComponent }),
  priority: "high",
  preloadOn: "idle",
});

export const LazyChecklists = registerModule("checklists", {
  loader: async () => ({ default: PlaceholderComponent }),
  priority: "high",
  preloadOn: "idle",
});

// Medium priority - preload on hover
export const LazyReports = registerModule("reports", {
  loader: async () => ({ default: PlaceholderComponent }),
  priority: "medium",
  preloadOn: "hover",
});

export const LazyAnalytics = registerModule("analytics", {
  loader: async () => ({ default: PlaceholderComponent }),
  priority: "medium",
  preloadOn: "hover",
});

// Low priority - load on demand
export const LazySettings = registerModule("settings", {
  loader: async () => {
    try {
      return await import("@/pages/Settings");
    } catch {
      return { default: PlaceholderComponent };
    }
  },
  priority: "low",
  preloadOn: "visible",
});

export const LazyAdmin = registerModule("admin", {
  loader: async () => {
    try {
      return await import("@/pages/Admin");
    } catch {
      return { default: PlaceholderComponent };
    }
  },
  priority: "low",
  preloadOn: "visible",
});

// ============================================
// PRELOAD STRATEGIES
// ============================================

/**
 * Initialize preloading based on network conditions
 */
export function initializePreloading(): void {
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || "4g";
  
  // Adjust preloading based on network
  if (effectiveType === "4g") {
    // Fast connection - preload high priority immediately
    preloadByPriority("critical");
    setTimeout(() => preloadByPriority("high"), 2000);
    setTimeout(() => preloadByPriority("medium"), 5000);
  } else if (effectiveType === "3g") {
    // Medium connection - only critical and high
    preloadByPriority("critical");
    setTimeout(() => preloadByPriority("high"), 5000);
  } else {
    // Slow connection - only critical
    preloadByPriority("critical");
  }
}

/**
 * Preload modules on route hover (for navigation)
 */
export function preloadOnHover(moduleName: string): () => void {
  let timeoutId: number;
  
  return () => {
    timeoutId = window.setTimeout(() => {
      preloadModule(moduleName);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  };
}

/**
 * Preload modules when element becomes visible
 */
export function createVisibilityPreloader(moduleName: string): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          preloadModule(moduleName);
        }
      });
    },
    { rootMargin: "100px" }
  );
}
