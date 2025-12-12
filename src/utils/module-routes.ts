// PATCH 850.2 - Module Routes Loader (Simplified)
// FASE A2 - Enhanced with critical route tracking
import React from "react";
import { getRoutableModules } from "@/modules/registry";

export type ModuleRoute = {
  id: string;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<unknown>>;
  isCritical?: boolean;
};

// Lista de rotas críticas que requerem error boundary especial
const CRITICAL_ROUTES = new Set([
  "intelligence.ai-command",
  "intelligence.workflow-command",
  "features.alerts-command",
  "intelligence.bi-dashboard",
  "maintenance.command",
  "planning.voyage-command",
  "documents.reports-command",
  "intelligence.ai-modules-status",
  "intelligence.nautilus-command",
  "intelligence.nautilus-llm",
  "compliance.sgso",
  "compliance.sgso-workflow",
  "operations.fleet-command",
  "finance.command",
  "operations.maritime-command",
]);

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
    "div",
    { className: "p-8 text-center" },
    React.createElement("h2", { className: "text-xl font-bold text-destructive mb-2" }, "Erro ao carregar módulo"),
    React.createElement("p", { className: "text-muted-foreground" }, `Módulo: ${moduleId}`),
    React.createElement(
      "button",
      { 
        className: "mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md",
        onClick: () => window.location.reload()
      },
      "Recarregar"
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
        return null;
      }

      const Component = React.lazy(async () => {
        try {
          const mod = await (allModules[resolvedPath]() as Promise<Record<string, unknown>>);
          const exported = mod.default ?? Object.values(mod)[0];
          if (typeof exported === "function") {
            return { default: exported as React.ComponentType<unknown> };
          }
          throw new Error("Invalid module export");
        } catch (err) {
          console.error(`[ModuleRoutes] Failed to load module: ${m.id}`, err);
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
        isCritical: CRITICAL_ROUTES.has(m.id),
      };
    })
    .filter((route): route is ModuleRoute => route !== null);
}

/**
 * Get only critical routes for priority loading
 */
export function getCriticalRoutes(): ModuleRoute[] {
  return getModuleRoutes().filter(route => route.isCritical);
}
