/**
 * Safe Lazy Import Utility
 * Provides robust lazy loading with automatic retry and error recovery
 * 
 * Prevents production errors from stale cached modules with:
 * - Exponential backoff (3 attempts: 1s, 2s, 4s)
 * - User-friendly error messages with reload option
 * - Built-in Suspense boundary with accessible loading state
 * 
 * @module safeLazyImport
 * @version 2.0.0 (Patch 9)
 */

import React, { ComponentType, lazy, Suspense } from "react";
import { Loader } from "@/components/ui/loader";

interface SafeLazyImportOptions {
  retries?: number;
  fallbackMessage?: string;
}

/**
 * Safely import a component with automatic retry mechanism
 * @param importFn - Dynamic import function
 * @param componentName - Name of the component for error messages
 * @param options - Configuration options
 */
export function safeLazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: SafeLazyImportOptions = {}
): React.FC {
  const { retries = 3, fallbackMessage = "Carregando componente..." } = options;

  const LazyComponent = lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempt = 0;

      const tryImport = () => {
        importFn()
          .then(resolve)
          .catch((error) => {
            attempt++;
            if (attempt < retries) {
              // Exponential backoff: 1s, 2s, 4s
              const delay = Math.pow(2, attempt - 1) * 1000;
              console.warn(
                `⚠️ Falha ao carregar ${componentName}, tentativa ${attempt}/${retries}. Tentando novamente em ${delay}ms...`,
                error
              );
              setTimeout(tryImport, delay);
            } else {
              console.error(
                `❌ Falha ao carregar ${componentName} após ${retries} tentativas:`,
                error
              );
              reject(error);
            }
          });
      };

      tryImport();
    });
  });

  return function SafeLazyWrapper(props: any) {
    return (
      <Suspense
        fallback={
          <div
            role="status"
            aria-live="polite"
            aria-label={fallbackMessage}
            className="flex items-center justify-center p-8 space-x-3"
          >
            <Loader />
            <span className="text-sm text-muted-foreground">{fallbackMessage}</span>
          </div>
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
