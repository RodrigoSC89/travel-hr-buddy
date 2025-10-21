// @ts-nocheck
import React, { lazy, Suspense } from "react";

/**
 * Utilitário de importação segura para módulos React,
 * com tratamento automático de erros de carregamento.
 */
export function safeLazyImport(importFn) {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error("⚠️ Falha ao importar módulo:", error);
      return { 
        default: () => React.createElement("div", { className: "p-4 text-red-500" }, "Erro ao carregar módulo.") 
      };
    }
  });

  return (props) => React.createElement(
    Suspense,
    { fallback: React.createElement("div", { className: "p-4 text-gray-400" }, "⏳ Carregando...") },
    React.createElement(LazyComponent, props)
  );
}
