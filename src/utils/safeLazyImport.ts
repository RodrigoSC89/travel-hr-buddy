/**
 * Safe Lazy Import Utility
 * 
 * Provides error boundaries and fallback mechanisms for lazy-loaded components
 * Replaces React.lazy with enhanced error handling
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

interface SafeLazyOptions {
  retries?: number;
  delay?: number;
  fallback?: ComponentType<any>;
}

/**
 * Creates a lazy-loaded component with automatic retry and error handling
 * 
 * @param importFn - Dynamic import function
 * @param options - Configuration options for retry behavior
 * @returns LazyExoticComponent with enhanced error handling
 */
export function safeLazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: SafeLazyOptions = {}
): LazyExoticComponent<T> {
  const { retries = 3, delay = 1000 } = options;

  const retryImport = async (
    fn: () => Promise<{ default: T }>,
    retriesLeft: number
  ): Promise<{ default: T }> => {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft <= 0) {
        console.error('[safeLazyImport] Failed to load component after retries:', error);
        throw error;
      }

      console.warn(
        `[safeLazyImport] Failed to load component, retrying... (${retriesLeft} retries left)`
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      return retryImport(fn, retriesLeft - 1);
    }
  };

  return lazy(() => retryImport(importFn, retries));
}

/**
 * Default export for convenience
 */
export default safeLazyImport;
