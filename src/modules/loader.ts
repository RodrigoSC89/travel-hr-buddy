/**
 * Module Loader - PATCH 68.0
 * Centralized module loading with lazy loading support
 */

import { lazy, ComponentType } from 'react';
import { MODULE_REGISTRY, ModuleDefinition } from './registry';
import { logger } from '@/lib/logger';

/**
 * Load module component dynamically
 */
export function loadModule(moduleId: string): ComponentType<any> {
  const module = MODULE_REGISTRY[moduleId];
  
  if (!module) {
    logger.error(`Module not found in registry: ${moduleId}`);
    throw new Error(`Module ${moduleId} not found in registry`);
  }

  if (module.status === 'deprecated') {
    logger.warn(`Loading deprecated module: ${moduleId}`);
  }

  try {
    if (module.lazy === false) {
      // Eager loading (not recommended for large modules)
      logger.debug(`Eager loading module: ${moduleId}`);
      // Note: Eager import not directly supported in this pattern
      // Fall back to lazy loading
    }

    // Lazy loading (default)
    logger.debug(`Lazy loading module: ${moduleId}`);
    return lazy(() => 
      import(`@/${module.path}`).catch(error => {
        logger.error(`Failed to load module: ${moduleId}`, error);
        throw new Error(`Failed to load module ${moduleId}: ${error.message}`);
      })
    );
  } catch (error) {
    logger.error(`Error loading module: ${moduleId}`, error);
    throw error;
  }
}

/**
 * Load multiple modules
 */
export function loadModules(moduleIds: string[]): Record<string, ComponentType<any>> {
  const modules: Record<string, ComponentType<any>> = {};
  
  for (const id of moduleIds) {
    try {
      modules[id] = loadModule(id);
    } catch (error) {
      logger.error(`Failed to load module ${id}`, error);
    }
  }
  
  return modules;
}

/**
 * Preload module for better performance
 */
export async function preloadModule(moduleId: string): Promise<void> {
  const module = MODULE_REGISTRY[moduleId];
  
  if (!module) {
    logger.warn(`Cannot preload unknown module: ${moduleId}`);
    return;
  }

  try {
    logger.debug(`Preloading module: ${moduleId}`);
    await import(`@/${module.path}`);
    logger.debug(`Module preloaded: ${moduleId}`);
  } catch (error) {
    logger.error(`Failed to preload module: ${moduleId}`, error);
  }
}

/**
 * Preload multiple modules
 */
export async function preloadModules(moduleIds: string[]): Promise<void> {
  await Promise.all(moduleIds.map(id => preloadModule(id)));
}

/**
 * Get module metadata without loading component
 */
export function getModuleMetadata(moduleId: string): ModuleDefinition | null {
  return MODULE_REGISTRY[moduleId] || null;
}

/**
 * Check if module exists in registry
 */
export function moduleExists(moduleId: string): boolean {
  return moduleId in MODULE_REGISTRY;
}

/**
 * Validate module dependencies
 */
export function validateModuleDependencies(moduleId: string): boolean {
  const module = MODULE_REGISTRY[moduleId];
  
  if (!module || !module.dependencies) return true;

  const missingDeps = module.dependencies.filter(depId => !moduleExists(depId));
  
  if (missingDeps.length > 0) {
    logger.error(`Module ${moduleId} has missing dependencies:`, missingDeps);
    return false;
  }

  return true;
}

/**
 * Load module with dependencies
 */
export async function loadModuleWithDependencies(
  moduleId: string
): Promise<ComponentType<any>> {
  const module = MODULE_REGISTRY[moduleId];
  
  if (!module) {
    throw new Error(`Module ${moduleId} not found`);
  }

  // Validate dependencies
  if (!validateModuleDependencies(moduleId)) {
    throw new Error(`Module ${moduleId} has missing dependencies`);
  }

  // Preload dependencies
  if (module.dependencies && module.dependencies.length > 0) {
    logger.debug(`Preloading dependencies for ${moduleId}:`, module.dependencies);
    await preloadModules(module.dependencies);
  }

  // Load main module
  return loadModule(moduleId);
}
