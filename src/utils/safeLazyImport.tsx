import React from "react";

/**
 * safeLazyImport - carregamento dinâmico seguro para todos os módulos do Nautilus One
 */
export const safeLazyImport = (importer: () => Promise<any>, name: string) => {
  const Component = React.lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      console.error(`❌ Falha ao carregar ${name}:`, err);
      return {
        default: () => (
          <div style={{ padding: "2rem", color: "#ff4d4f" }}>
            ⚠️ Erro ao carregar o módulo <b>{name}</b>.  
            Atualize a página ou contate o suporte técnico.
          </div>
        ),
      };
    }
  });

  const SafeLazyComponent = (props: any) => (
    <React.Suspense fallback={<div>⏳ Carregando {name}...</div>}>
      <Component {...props} />
    </React.Suspense>
  );

  SafeLazyComponent.displayName = `SafeLazy(${name})`;
  
  return SafeLazyComponent;
};
