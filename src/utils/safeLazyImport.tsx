import React, { ComponentType } from "react";
import { logger } from "@/lib/logger";

/**
 * Safe Lazy Import – Prevents failures when loading dynamic modules
 */
export const safeLazyImport = (
  importer: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
  name = "Módulo",
  retries = 3,
  initialInterval = 1000,
  timeoutMs = 10000
) => {
  const retryImport = async (
    fn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
    retriesLeft = retries,
    interval = initialInterval
  ): Promise<{ default: React.ComponentType<Record<string, unknown>> }> => {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft === 0) throw error;
      logger.debug(`Retry loading module ${name}`, { attempt: retries - retriesLeft + 1, total: retries });
      await new Promise((resolve) => setTimeout(resolve, interval));
      return retryImport(fn, retriesLeft - 1, interval * 2);
    }
  };

  const Component = React.lazy(async () => {
    try {
      const importerWithTimeout = () => Promise.race([
        importer(),
        new Promise((_res, rej) => setTimeout(() => rej(new Error("Import timeout")), timeoutMs)),
      ] as [Promise<{ default: ComponentType<Record<string, unknown>> }>, Promise<never>]);

      return await retryImport(importerWithTimeout as () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>);
    } catch (err) {
      logger.error(`Module load failed: ${name}`, {
        error: err instanceof Error ? err.message : String(err),
        retries,
        timeout: timeoutMs
      });

      const errorInfo = {
        module: name,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        retries,
        timeout: timeoutMs
      };

      try {
        sessionStorage.setItem('safeLazyImport:lastError', JSON.stringify(errorInfo));
      } catch {
        // Silent fail
      }

      return {
        default: () => (
          <div
            className="flex items-center justify-center min-h-screen bg-background p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 border border-destructive/30">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-destructive">
                    ⚠️ Falha ao carregar o módulo
                  </h3>
                  <div className="mt-2 text-sm text-destructive/80">
                    <p className="font-semibold">{name}</p>
                    <p className="mt-2">
                      Não foi possível carregar este módulo. Isso pode acontecer após atualizações do sistema.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive transition-colors"
                    >
                      🔄 Atualizar página
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Se o problema persistir, entre em contato com o suporte técnico.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      };
    }
  });

  (Component as unknown as { displayName: string }).displayName = `SafeLazy(${name})`;

  const SafeComponent = (props: unknown) => (
    <React.Suspense
      fallback={
        <div
          className="flex items-center justify-center min-h-screen bg-background"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" aria-hidden="true"></div>
            <p className="text-lg font-medium text-foreground">
              ⏳ Carregando {name}...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde um momento
            </p>
          </div>
        </div>
      }
    >
      <Component {...(props as object)} />
    </React.Suspense>
  );

  SafeComponent.displayName = `SafeLazyWrapper(${name})`;
  return SafeComponent;
};
