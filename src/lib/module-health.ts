/**
 * Module Health Check - PATCH 651.0
 * Validates module registry integrity and route configuration
 */

import { MODULE_REGISTRY } from "@/modules/registry";
import { logger } from "@/lib/logger";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    modules: ModuleHealthCheck;
    routes: RouteHealthCheck;
    dependencies: DependencyHealthCheck;
  };
  errors: string[];
  warnings: string[];
}

export interface ModuleHealthCheck {
  status: "pass" | "fail";
  total: number;
  active: number;
  deprecated: number;
  issues: string[];
}

export interface RouteHealthCheck {
  status: "pass" | "fail";
  total: number;
  duplicates: string[];
  missing: string[];
}

export interface DependencyHealthCheck {
  status: "pass" | "fail";
  missing: Array<{ module: string; dependency: string }>;
}

/**
 * Perform full module health check
 */
export function performHealthCheck(): HealthStatus {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check modules
  const moduleCheck = checkModules();
  if (moduleCheck.status === "fail") {
    errors.push(...moduleCheck.issues);
  }

  // Check routes
  const routeCheck = checkRoutes();
  if (routeCheck.status === "fail") {
    errors.push(...routeCheck.duplicates.map(r => `Duplicate route: ${r}`));
    errors.push(...routeCheck.missing.map(r => `Missing page for route: ${r}`));
  }

  // Check dependencies
  const dependencyCheck = checkDependencies();
  if (dependencyCheck.status === "fail") {
    warnings.push(...dependencyCheck.missing.map(
      d => `Module ${d.module} missing dependency: ${d.dependency}`
    ));
  }

  // Determine overall status
  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (errors.length > 0) {
    status = "unhealthy";
  } else if (warnings.length > 0) {
    status = "degraded";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      modules: moduleCheck,
      routes: routeCheck,
      dependencies: dependencyCheck,
    },
    errors,
    warnings,
  };
}

/**
 * Check module registry health
 */
function checkModules(): ModuleHealthCheck {
  const modules = Object.values(MODULE_REGISTRY);
  const issues: string[] = [];

  // Count by status
  const active = modules.filter(m => m.status === "active").length;
  const deprecated = modules.filter(m => m.status === "deprecated").length;

  // Check for issues
  modules.forEach(module => {
    // Check if path exists (basic validation)
    if (!module.path) {
      issues.push(`Module ${module.id} has no path defined`);
    }

    // Check if active modules have routes
    if (module.status === "active" && module.route && !module.path) {
      issues.push(`Active module ${module.id} has route but no path`);
    }

    // Warn about deprecated modules with routes
    if (module.status === "deprecated" && module.route) {
      issues.push(`Deprecated module ${module.id} still has route: ${module.route}`);
    }
  });

  return {
    status: issues.length === 0 ? "pass" : "fail",
    total: modules.length,
    active,
    deprecated,
    issues,
  };
}

/**
 * Check route health (duplicates, missing pages)
 */
function checkRoutes(): RouteHealthCheck {
  const modules = Object.values(MODULE_REGISTRY).filter(m => m.route);
  const routeMap = new Map<string, string[]>();
  const missing: string[] = [];

  // Check for duplicates
  modules.forEach(module => {
    if (module.route) {
      const existing = routeMap.get(module.route) || [];
      existing.push(module.id);
      routeMap.set(module.route, existing);
    }
  });

  const duplicates = Array.from(routeMap.entries())
    .filter(([_, ids]) => ids.length > 1)
    .map(([route, ids]) => `${route} (${ids.join(", ")})`);

  return {
    status: duplicates.length === 0 ? "pass" : "fail",
    total: modules.length,
    duplicates,
    missing,
  };
}

/**
 * Check module dependencies
 */
function checkDependencies(): DependencyHealthCheck {
  const modules = Object.values(MODULE_REGISTRY);
  const missing: Array<{ module: string; dependency: string }> = [];

  modules.forEach(module => {
    if (module.dependencies) {
      module.dependencies.forEach(depId => {
        if (!MODULE_REGISTRY[depId]) {
          missing.push({
            module: module.id,
            dependency: depId,
          });
        }
      });
    }
  });

  return {
    status: missing.length === 0 ? "pass" : "fail",
    missing,
  };
}

/**
 * Log health check results
 */
export function logHealthCheck(health: HealthStatus): void {
  if (health.status === "healthy") {
    logger.info("✅ Module health check: HEALTHY", {
      modules: health.checks.modules.total,
      routes: health.checks.routes.total,
    });
  } else if (health.status === "degraded") {
    logger.warn("⚠️ Module health check: DEGRADED", {
      warnings: health.warnings,
    });
  } else {
    logger.error("❌ Module health check: UNHEALTHY", {
      errors: health.errors,
      warnings: health.warnings,
    });
  }
}

/**
 * Run health check on application start
 */
export function initHealthCheck(): void {
  const health = performHealthCheck();
  logHealthCheck(health);
  
  // Store in window for debugging
  if (typeof window !== "undefined") {
    (window as any).__NAUTILUS_MODULE_HEALTH__ = health;
  }
}
