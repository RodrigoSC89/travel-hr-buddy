/**
 * Code Splitting Utilities
 * Dynamic imports and lazy loading for heavy modules
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

type ModuleFactory<T> = () => Promise<{ default: T }>;

interface LazyModuleOptions {
  preload?: boolean;
  retries?: number;
  retryDelay?: number;
}

// Cache for preloaded modules
const moduleCache = new Map<string, Promise<any>>();

/**
 * Create lazy component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: ModuleFactory<T>,
  options: LazyModuleOptions = {}
): LazyExoticComponent<T> {
  const { retries = 3, retryDelay = 1000 } = options;

  return lazy(async () => {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await factory();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }

    throw lastError;
  });
}

/**
 * Preload a module without rendering
 */
export function preloadModule<T>(key: string, factory: ModuleFactory<T>): Promise<T> {
  if (!moduleCache.has(key)) {
    moduleCache.set(key, factory().then(m => m.default));
  }
  return moduleCache.get(key)!;
}

/**
 * Heavy module loaders with preload support
 */
export const HeavyModules = {
  // Charts
  Chart: () => import('chart.js').then(m => m.Chart),
  Recharts: () => import('recharts'),
  
  // PDF
  JsPDF: () => import('jspdf').then(m => m.default),
  
  // Excel
  XLSX: () => import('xlsx'),
  
  // Maps
  Mapbox: () => import('mapbox-gl'),
  
  // Rich Text
  TipTap: () => import('@tiptap/react'),
  
  // 3D
  Three: () => import('three'),
  
  // Date utilities
  DateFns: () => import('date-fns'),
};

/**
 * Preload modules based on route
 */
export function preloadRouteModules(route: string) {
  const routeModules: Record<string, (() => Promise<any>)[]> = {
    '/dashboard': [HeavyModules.Recharts],
    '/reports': [HeavyModules.JsPDF, HeavyModules.XLSX],
    '/map': [HeavyModules.Mapbox],
    '/editor': [HeavyModules.TipTap],
    '/analytics': [HeavyModules.Recharts, HeavyModules.DateFns],
  };

  const modules = routeModules[route];
  if (modules) {
    modules.forEach((loader, i) => preloadModule(`${route}-${i}`, loader));
  }
}

/**
 * Dynamic import with loading state
 */
export async function dynamicImport<T>(
  factory: () => Promise<T>,
  onLoadStart?: () => void,
  onLoadEnd?: () => void
): Promise<T> {
  onLoadStart?.();
  try {
    return await factory();
  } finally {
    onLoadEnd?.();
  }
}

/**
 * Lazy load component only when visible
 */
export function lazyOnVisible<T extends ComponentType<any>>(
  factory: ModuleFactory<T>,
  rootMargin = '200px'
): LazyExoticComponent<T> {
  let componentPromise: Promise<{ default: T }> | null = null;

  const preload = () => {
    if (!componentPromise) {
      componentPromise = factory();
    }
    return componentPromise;
  };

  // Preload on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Set up intersection observer for viewport-based preloading
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some(e => e.isIntersecting)) {
            preload();
            observer.disconnect();
          }
        },
        { rootMargin }
      );

      // Observe document body as fallback
      observer.observe(document.body);
    });
  }

  return lazy(preload);
}
