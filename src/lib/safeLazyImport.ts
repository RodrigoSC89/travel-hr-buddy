/**
 * Safe Lazy Import – Prevents failures when loading dynamic modules
 * 
 * This utility wraps dynamic imports with comprehensive error handling and retry mechanism
 * to prevent "Failed to fetch dynamically imported module" errors.
 */

import React from "react";

export const safeLazyImport = (
  importPath: string,
  retries = 3,
  initialInterval = 1000
) => {
  const retryImport = async (
    retriesLeft = retries,
    interval = initialInterval
  ): Promise<{ default: React.ComponentType }> => {
    try {
      // Dynamic import based on path
      const module = await import(/* @vite-ignore */ importPath);
      return module;
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      console.warn(
        `⚠️ Falha ao carregar ${importPath}. Tentando novamente... (${retries - retriesLeft + 1}/${retries})`
      );
      
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, interval));
      
      return retryImport(retriesLeft - 1, interval * 2);
    }
  };

  return React.lazy(() => retryImport());
};
