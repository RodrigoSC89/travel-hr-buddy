import { lazy, Suspense, createElement } from "react";
import type { ComponentType, FC } from "react";
import { logger } from '@/lib/logger';

/**
 * Utilitário de importação segura para módulos React,
 * com tratamento automático de erros de carregamento.
 */
export function safeLazyImport(
  importFn: () => Promise<{ default: ComponentType<any> }>
): FC<any> {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      logger.error("⚠️ Falha ao importar módulo:", error);
      return { 
        default: () => createElement("div", { className: "p-4 text-red-500" }, "Erro ao carregar módulo.") 
      };
    }
  });

  return (props: any) => createElement(
    Suspense,
    { fallback: createElement("div", { className: "p-4 text-gray-400" }, "⏳ Carregando...") },
    createElement(LazyComponent, props)
  );
}
