// PATCH 850.2 - Module Routes Loader (Simplified)
import React from "react";
import { getRoutableModules } from "@/modules/registry";

export type ModuleRoute = {
  id: string;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<unknown>>;
};

// Glob import all pages - Vite handles this correctly
const pageModules = import.meta.glob("../pages/**/*.tsx");
const moduleComponents = import.meta.glob("../modules/**/*.tsx");

// Combine all modules
const allModules = { ...pageModules, ...moduleComponents };

function resolveModulePath(registryPath: string): string {
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

// Fallback component for failed module loads
const ModuleLoadError: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  return React.createElement(
    'div',
    { className: 'p-8 text-center' },
    React.createElement('h2', { className: 'text-xl font-bold text-destructive mb-2' }, 'Erro ao carregar módulo'),
    React.createElement('p', { className: 'text-muted-foreground' }, `Módulo: ${moduleId}`),
    React.createElement(
      'button',
      { 
        className: 'mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md',
        onClick: () => window.location.reload()
      },
      'Recarregar'
    )
  );
};

export function getModuleRoutes(): ModuleRoute[] {
  const modules = getRoutableModules();

  return modules
    .filter((m) => m.route && m.status === "active" && m.path)
    .map((m) => {
      const resolvedPath = resolveModulePath(m.path);
      
      if (!resolvedPath || !allModules[resolvedPath]) {
        console.warn(`[ModuleRoutes] Module not found: ${m.id} (path: ${m.path})`);
        return null;
      }

      const Component = React.lazy(async () => {
        try {
          const mod = await (allModules[resolvedPath]() as Promise<Record<string, unknown>>);
          const exported = mod.default ?? Object.values(mod)[0];
          if (typeof exported === 'function') {
            return { default: exported as React.ComponentType<unknown> };
          }
          throw new Error('Invalid module export');
        } catch (err) {
          console.error(`[ModuleRoutes] Failed to load module: ${m.id}`, err);
          return { 
            default: () => React.createElement(ModuleLoadError, { moduleId: m.id })
          };
        }
      });

      return {
        id: m.id,
        path: m.route as string,
        component: Component,
      };
    })
    .filter((route): route is ModuleRoute => route !== null);
}
