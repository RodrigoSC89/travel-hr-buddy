/**
 * Module Routes Helper - PATCH 68.2
 * Generates routes automatically from MODULE_REGISTRY
 */

import { ComponentType } from "react";
import { loadModule } from "@/modules/loader";
import { MODULE_REGISTRY, ModuleDefinition } from "@/modules/registry";
import { logger } from "@/lib/logger";

export interface ModuleRoute {
  id: string;
  path: string;
  component: ComponentType<any>;
  metadata: ModuleDefinition;
}

// Cache to prevent infinite re-loading
let cachedRoutes: ModuleRoute[] | null = null;

/**
 * Get all routes from MODULE_REGISTRY
 * Only includes modules with defined routes
 * PATCH 547: Added cache to prevent infinite loops
 */
export function getModuleRoutes(): ModuleRoute[] {
  // Return cached routes if available
  if (cachedRoutes !== null) {
    return cachedRoutes;
  }

  const routes: ModuleRoute[] = [];

  try {
    for (const [id, module] of Object.entries(MODULE_REGISTRY)) {
      // Skip modules without routes
      if (!module.route) {
        continue;
      }

      // Skip deprecated modules unless explicitly enabled
      if (module.status === "deprecated") {
        logger.warn(`Skipping deprecated module route: ${id}`);
        continue;
      }

      try {
        routes.push({
          id,
          path: module.route,
          component: loadModule(id),
          metadata: module
        });
      } catch (error) {
        logger.error(`Failed to load route for module: ${id}`, error);
      }
    }

    logger.info(`Loaded ${routes.length} module routes from registry`);
    
    // Cache the results
    cachedRoutes = routes;
    return routes;
  } catch (error) {
    logger.error("Failed to generate module routes", error);
    return [];
  }
}

/**
 * Clear route cache (for testing or hot reload)
 */
export function clearModuleRoutesCache(): void {
  cachedRoutes = null;
  logger.info("Module routes cache cleared");
}

/**
 * Get routes by category
 */
export function getModuleRoutesByCategory(category: string): ModuleRoute[] {
  return getModuleRoutes().filter(route => 
    route.metadata.category === category
  );
}

/**
 * Get route metadata by path
 */
export function getRouteMetadata(path: string): ModuleDefinition | null {
  const route = getModuleRoutes().find(r => r.path === path);
  return route?.metadata || null;
}

/**
 * Validate all module routes
 * Useful for testing and debugging
 */
export function validateModuleRoutes(): {
  valid: string[];
  invalid: string[];
  total: number;
  } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const [id, module] of Object.entries(MODULE_REGISTRY)) {
    if (!module.route) continue;

    try {
      loadModule(id);
      valid.push(id);
    } catch (error) {
      invalid.push(id);
      logger.error(`Invalid module route: ${id}`, error);
    }
  }

  return {
    valid,
    invalid,
    total: valid.length + invalid.length
  };
}
