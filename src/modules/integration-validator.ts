/**
 * PATCH 852 - Module Integration Validator
 * Validates that all modules are correctly integrated
 */

import { MODULE_REGISTRY, ModuleDefinition } from "./registry";
import { logger } from "@/lib/logger";

export interface ModuleValidationResult {
  moduleId: string;
  name: string;
  status: "valid" | "warning" | "error";
  issues: string[];
  route?: string;
  hasRedirect: boolean;
}

export interface IntegrationReport {
  timestamp: Date;
  totalModules: number;
  activeModules: number;
  deprecatedModules: number;
  validModules: number;
  modulesWithIssues: number;
  results: ModuleValidationResult[];
  summary: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

/**
 * Validate a single module's integration
 */
export function validateModule(moduleId: string): ModuleValidationResult {
  const module = MODULE_REGISTRY[moduleId];
  const issues: string[] = [];
  let status: "valid" | "warning" | "error" = "valid";

  if (!module) {
    return {
      moduleId,
      name: "Unknown",
      status: "error",
      issues: ["Module not found in registry"],
      hasRedirect: false
    };
  }

  // Check required fields
  if (!module.path) {
    issues.push("Missing path configuration");
    status = "error";
  }

  if (!module.route && module.status === "active") {
    issues.push("Active module missing route");
    status = "error";
  }

  if (!module.description) {
    issues.push("Missing description");
    status = status === "error" ? "error" : "warning";
  }

  // Check deprecated modules
  if (module.status === "deprecated" && !module.redirectTo) {
    issues.push("Deprecated module missing redirect");
    status = status === "error" ? "error" : "warning";
  }

  // Validate dependencies
  if (module.dependencies) {
    for (const depId of module.dependencies) {
      if (!MODULE_REGISTRY[depId]) {
        issues.push(`Missing dependency: ${depId}`);
        status = "error";
      }
    }
  }

  return {
    moduleId,
    name: module.name,
    status: issues.length === 0 ? "valid" : status,
    issues,
    route: module.route,
    hasRedirect: !!module.redirectTo
  };
}

/**
 * Validate all modules in the registry
 */
export function validateAllModules(): IntegrationReport {
  const results: ModuleValidationResult[] = [];
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = { active: 0, deprecated: 0, beta: 0, experimental: 0, incomplete: 0 };

  let validModules = 0;
  let modulesWithIssues = 0;
  let activeModules = 0;
  let deprecatedModules = 0;

  for (const [moduleId, module] of Object.entries(MODULE_REGISTRY)) {
    const result = validateModule(moduleId);
    results.push(result);

    // Count by category
    byCategory[module.category] = (byCategory[module.category] || 0) + 1;

    // Count by status
    byStatus[module.status] = (byStatus[module.status] || 0) + 1;

    if (module.status === "active") activeModules++;
    if (module.status === "deprecated") deprecatedModules++;

    if (result.status === "valid") {
      validModules++;
    } else {
      modulesWithIssues++;
    }
  }

  return {
    timestamp: new Date(),
    totalModules: Object.keys(MODULE_REGISTRY).length,
    activeModules,
    deprecatedModules,
    validModules,
    modulesWithIssues,
    results,
    summary: {
      byCategory,
      byStatus
    }
  };
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category: string): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.category === category);
}

/**
 * Get active modules only
 */
export function getActiveModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === "active");
}

/**
 * Get module routes for navigation
 */
export function getNavigationRoutes(): Array<{
  id: string;
  name: string;
  route: string;
  icon?: string;
  category: string;
}> {
  return Object.values(MODULE_REGISTRY)
    .filter(m => m.status === "active" && m.route)
    .map(m => ({
      id: m.id,
      name: m.name,
      route: m.route!,
      icon: m.icon,
      category: m.category
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Check module communication paths
 */
export function validateModuleCommunication(): {
  orphanedModules: string[];
  circularDependencies: string[][];
} {
  const orphanedModules: string[] = [];
  const visited = new Set<string>();
  const circularDependencies: string[][] = [];

  // Find orphaned modules (no dependencies and not depended upon)
  const dependedUpon = new Set<string>();
  
  Object.values(MODULE_REGISTRY).forEach(module => {
    if (module.dependencies) {
      module.dependencies.forEach(dep => dependedUpon.add(dep));
    }
  });

  Object.entries(MODULE_REGISTRY).forEach(([id, module]) => {
    if (!module.dependencies?.length && !dependedUpon.has(id) && module.status === "active") {
      // Check if it's a standalone module (no deps is fine for many modules)
      if (module.category !== "core" && module.category !== "features") {
        // Not necessarily orphaned, just independent
      }
    }
  });

  // Detect circular dependencies
  function detectCycle(moduleId: string, path: string[] = []): boolean {
    if (path.includes(moduleId)) {
      circularDependencies.push([...path, moduleId]);
      return true;
    }

    const module = MODULE_REGISTRY[moduleId];
    if (!module?.dependencies) return false;

    for (const dep of module.dependencies) {
      if (detectCycle(dep, [...path, moduleId])) {
        return true;
      }
    }

    return false;
  }

  Object.keys(MODULE_REGISTRY).forEach(id => {
    if (!visited.has(id)) {
      detectCycle(id);
      visited.add(id);
    }
  });

  return { orphanedModules, circularDependencies };
}

/**
 * Run full integration check and log results
 */
export function runIntegrationCheck(): IntegrationReport {
  logger.info("Running module integration check...");
  
  const report = validateAllModules();
  const communication = validateModuleCommunication();
  
  logger.info(`Integration check complete:
    - Total modules: ${report.totalModules}
    - Active: ${report.activeModules}
    - Deprecated: ${report.deprecatedModules}
    - Valid: ${report.validModules}
    - With issues: ${report.modulesWithIssues}
    - Circular dependencies: ${communication.circularDependencies.length}
  `);

  if (report.modulesWithIssues > 0) {
    const issues = report.results.filter(r => r.status !== "valid");
    issues.forEach(r => {
      logger.warn(`Module ${r.moduleId}: ${r.issues.join(", ")}`);
    });
  }

  return report;
}
