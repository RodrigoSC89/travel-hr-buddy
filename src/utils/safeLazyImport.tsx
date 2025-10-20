import React from "react";

// Log global message to indicate safeLazyImport is active
console.log("✅ safeLazyImport ativo – fallback global configurado");

/**
 * Safe Lazy Import – Prevents failures when loading dynamic modules
 * and displays a user-friendly fallback in case of error.
 * 
 * This utility wraps React.lazy() with comprehensive error handling to prevent
 * "Failed to fetch dynamically imported module" errors that can occur during
 * production deployments when users have outdated cached chunks.
 * 
 * @param importer - Function that returns a Promise of the module to import
 * @param name - Human-readable name of the module for debugging and user feedback
 * @returns A React component that handles loading, error states, and renders the imported component
 * 
 * @example
 * const Dashboard = safeLazyImport(() => import("@/pages/Dashboard"), "Dashboard");
 */
export const safeLazyImport = (
  importer: () => Promise<{ default: React.ComponentType<unknown> }>,
  name: string
) => {
  const Component = React.lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      console.error(`❌ Erro ao carregar módulo ${name}:`, err);
      
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
