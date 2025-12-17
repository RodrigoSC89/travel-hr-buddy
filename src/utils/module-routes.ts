import React from "react";
import { getRoutableModules } from "@/modules/registry";

/**
 * PATCH 68.2/68.4/68.6 - Module Routes Loader
 *
 * Gera automaticamente as rotas a partir do MODULE_REGISTRY,
 * usando glob imports para compatibilidade com Vite.
 * 
 * PATCH 68.6: Fixed dynamic imports using Vite glob pattern
 */

export type ModuleRoute = {
  id: string;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
};

// Glob import all pages - Vite handles this correctly
const pageModules = import.meta.glob("../pages/**/*.tsx");
const moduleComponents = import.meta.glob("../modules/**/*.tsx");

// Combine all modules
const allModules = { ...pageModules, ...moduleComponents };

function resolveModulePath(registryPath: string): string {
  // Convert registry path to actual file path
  // e.g., "pages/Maritime" -> "../pages/Maritime.tsx"
  const possiblePaths = [
    `../${registryPath}.tsx`,
    `../${registryPath}/index.tsx`,
  ];
  
  for (const path of possiblePaths) {
    if (allModules[path]) {
      return path;
    }
  }
  
  return "";
}

export function getModuleRoutes(): ModuleRoute[] {
  const modules = getRoutableModules();

  return modules
    // Apenas módulos com rota definida e marcados como ativos
    .filter((m: any) => m.route && m.status === "active" && m.path)
    .map((m: any) => {
      const resolvedPath = resolveModulePath(m.path);
      
      if (!resolvedPath || !allModules[resolvedPath]) {
        console.warn(`[ModuleRoutes] Module not found: ${m.id} (path: ${m.path})`);
        return null;
      }

      const Component = React.lazy(() =>
        (allModules[resolvedPath]() as Promise<any>).then((mod): { default: React.ComponentType<any> } => {
          const exported = mod.default ?? Object.values(mod)[0];
          const Resolved = (exported ?? (() => null)) as React.ComponentType<any>;
          return { default: Resolved };
        }).catch((err) => {
          console.error(`[ModuleRoutes] Failed to load module: ${m.id}`, err);
          return { default: () => React.createElement('div', null, `Failed to load: ${m.id}`) };
        })
      );

      return {
        id: m.id,
        path: m.route as string,
        component: Component,
      };
    })
    .filter((route): route is ModuleRoute => route !== null);
}
