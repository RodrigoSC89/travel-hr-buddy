/**
 * Lazy Load Utility
 * Enhanced lazy loading with retry and fallback support
 */

import React, { ComponentType, lazy, Suspense } from "react";
import { ModulePageSkeleton } from "@/components/unified/Skeletons.unified";

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  retries?: number;
  retryDelay?: number;
  chunkName?: string;
}

/**
 * Enhanced lazy load with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const { retries = 3, retryDelay = 1000 } = options;

  return lazy(() => {
    const load = async (attempt = 0): Promise<{ default: T }> => {
      try {
        return await importFn();
      } catch (error) {
        if (attempt < retries) {
          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          return load(attempt + 1);
        }
        
        // Log error and re-throw
        console.error(`Failed to load module after ${retries} retries:`, error);
        throw error;
      }
    };

    return load();
  });
}

/**
 * Create a lazy-loaded module with standardized loading state
 */
export function createLazyModule<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazyWithRetry(importFn, options);
  const fallback = options.fallback || React.createElement(ModulePageSkeleton);

  function WrappedComponent(props: React.ComponentProps<T>) {
    return React.createElement(
      Suspense,
      { fallback },
      React.createElement(LazyComponent, props)
    );
  }

  WrappedComponent.displayName = `Lazy(${options.chunkName || "Module"})`;

  return WrappedComponent;
}

/**
 * Preload a lazy component
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  importFn().catch(() => {
    // Silently fail - preload is optimization only
  });
}

/**
 * Common module lazy loaders
 */
export const LazyModules = {
  // Dashboard modules
  Dashboard: lazyWithRetry(() => import("@/pages/Dashboard"), { chunkName: "Dashboard" }),
  Analytics: lazyWithRetry(() => import("@/pages/Analytics"), { chunkName: "Analytics" }),
  
  // Admin modules
  Admin: lazyWithRetry(() => import("@/pages/Admin"), { chunkName: "Admin" }),
  Settings: lazyWithRetry(() => import("@/pages/Settings"), { chunkName: "Settings" }),
  
  // Error pages
  NotFound: lazyWithRetry(() => import("@/pages/NotFound"), { chunkName: "NotFound" }),
  Unauthorized: lazyWithRetry(() => import("@/pages/Unauthorized"), { chunkName: "Unauthorized" }),
};

export default {
  lazyWithRetry,
  createLazyModule,
  preloadComponent,
  LazyModules,
};
