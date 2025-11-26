import React, { ComponentType } from "react";

/**
 * Safe Lazy Import – Prevents failures when loading dynamic modules
 * and displays a user-friendly fallback in case of error.
 * 
 * This utility wraps React.lazy() with comprehensive error handling and retry mechanism
 * to prevent "Failed to fetch dynamically imported module" errors that can occur during
 * production deployments when users have outdated cached chunks.
 * 
 * Features:
 * - Automatic retry with exponential backoff (3 attempts by default)
 * - Visual fallback component for errors
 * - Controlled logging for audit trail
 * - React 18+ compatible
 * 
 * @param importer - Function that returns a Promise of the module to import
 * @param name - Human-readable name of the module for debugging and user feedback
 * @param retries - Number of retry attempts (default: 3)
 * @param initialInterval - Initial retry interval in milliseconds (default: 1000)
 * @returns A React component that handles loading, error states, and renders the imported component
 * 
 * @example
 * const Dashboard = safeLazyImport(() => React.lazy(() => import(import("@/pages/Dashboard"), "Dashboard")));
 */
export const safeLazyImport = (
  importer: () => Promise<{ default: React.ComponentType<any> }>,
  name = "Módulo",
  retries = 3,
  initialInterval = 1000,
  // timeout in ms for each import attempt to avoid hanging Promises
  timeoutMs = 10000
) => {
  /**
   * Retry function with exponential backoff
   */
  const retryImport = async (
    fn: () => Promise<{ default: React.ComponentType<any> }>,
    retriesLeft = retries,
    interval = initialInterval
  ): Promise<{ default: React.ComponentType<any> }> => {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      console.warn(
        `⚠️ Falha ao carregar ${name}. Tentando novamente... (${retries - retriesLeft + 1}/${retries})`
      );
      
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, interval));
      
      return retryImport(fn, retriesLeft - 1, interval * 2);
    }
  };

  const Component = React.lazy(async () => {
    try {
      // Wrap importer with a timeout so a stalled import doesn't leave Suspense forever
      const importerWithTimeout = () => Promise.race([
        importer(),
        new Promise((_res, rej) => setTimeout(() => rej(new Error("Import timeout")), timeoutMs)),
      ] as [Promise<{ default: ComponentType<any> }>, Promise<never>]);

      return await retryImport(importerWithTimeout as () => Promise<{ default: React.ComponentType<any> }>);
    } catch (err) {
      console.error(`❌ Erro ao carregar módulo ${name} após ${retries} tentativas:`, err);
      
      // Save detailed error info for debugging
      const errorInfo = {
        module: name,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        retries: retries,
        timeout: timeoutMs
      };
      
      try {
        localStorage.setItem('safeLazyImport:lastError', JSON.stringify(errorInfo));
        console.warn('🔍 Debug info salvo em localStorage["safeLazyImport:lastError"]', errorInfo);
      } catch (storageErr) {
        console.warn('Não foi possível salvar debug info no localStorage', storageErr);
      }
      
      // Return a fallback component that displays an error message
      return {
        default: () => (
          <div 
            className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-6 w-6 text-red-600 dark:text-red-400" 
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
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                    ⚠️ Falha ao carregar o módulo
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p className="font-semibold">{name}</p>
                    <p className="mt-2">
                      Não foi possível carregar este módulo. Isso pode acontecer após atualizações do sistema.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      🔄 Atualizar página
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
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

  // Set display name for better debugging in React DevTools
  // @ts-ignore - displayName is not in type but works at runtime
  Component.displayName = `SafeLazy(${name})`;

  // Return a component that wraps the lazy-loaded component with Suspense
  const SafeComponent = (props: unknown) => (
    <React.Suspense 
      fallback={
        <div 
          className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4" aria-hidden="true"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              ⏳ Carregando {name}...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
