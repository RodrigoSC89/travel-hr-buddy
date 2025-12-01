import React from "react";
import { getRoutableModules } from "@/modules/registry";

/**
 * PATCH 68.2/68.4 - Module Routes Loader
 *
 * Gera automaticamente as rotas a partir do MODULE_REGISTRY,
 * garantindo lazy-loading por módulo e evitando imports diretos
 * pesados no App.tsx.
 */

export type ModuleRoute = {
  id: string;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export function getModuleRoutes(): ModuleRoute[] {
  const modules = getRoutableModules();

  return modules
    // Apenas módulos com rota definida e marcados como ativos
    .filter((m: any) => m.route && m.status === "active" && m.path)
    .map((m: any) => {
      const Component = React.lazy(() =>
        import(`@/${m.path}`).then((mod): { default: React.ComponentType<any> } => {
          const exported = (mod as any).default ?? Object.values(mod)[0];
          const Resolved = (exported ?? (() => null)) as React.ComponentType<any>;
          return { default: Resolved };
        })
      );

      return {
        id: m.id,
        path: m.route as string,
        component: Component,
      };
    });
}
