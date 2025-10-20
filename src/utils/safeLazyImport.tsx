import React from "react";

/**
 * Safe Lazy Import – evita falhas de carregamento em módulos dinâmicos
 * e mostra uma mensagem de fallback amigável em caso de erro.
 * 
 * Este utilitário envolve importações dinâmicas do React.lazy com tratamento
 * de erro robusto, evitando problemas de "Failed to fetch dynamically imported module"
 * comuns em deployments de SPA.
 */
export const safeLazyImport = (importer: () => Promise<{ default: React.ComponentType<unknown> }>, name: string) => {
  const Component = React.lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      console.error(`❌ Erro ao carregar módulo ${name}:`, err);
      return {
        default: () => (
          <div
            style={{
              padding: "2rem",
              color: "#ff4d4f",
              fontWeight: 500,
              fontFamily: "monospace",
              textAlign: "center",
              maxWidth: "600px",
              margin: "2rem auto",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
            <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Falha ao carregar o módulo <b>{name}</b>
            </div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              Tente atualizar a página ou contate o suporte técnico.
            </div>
          </div>
        ),
      };
    }
  });

  const SafeLazyComponent = (props: Record<string, unknown>) => (
    <React.Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            color: "#666",
          }}
        >
          ⏳ Carregando {name}...
        </div>
      }
    >
      <Component {...props} />
    </React.Suspense>
  );

  SafeLazyComponent.displayName = `SafeLazy(${name})`;

  return SafeLazyComponent;
};
