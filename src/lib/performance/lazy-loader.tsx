/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 800: Enhanced Lazy Loading System for Low Bandwidth
 * Provides optimized lazy loading with retry, timeout, and fallback support
 */
import React, { Suspense, ComponentType, lazy } from "react";
import { OffshoreLoader } from "@/components/LoadingStates";

interface LazyConfig {
  /** Timeout in ms before showing error (default: 10000) */
  timeout?: number;
  /** Number of retry attempts (default: 3) */
  retries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Custom fallback component */
  fallback?: React.ReactNode;
  /** Preload on hover/focus */
  preload?: boolean;
}

/**
 * Creates a lazy-loaded component with retry logic for slow connections
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyConfig = {}
): React.LazyExoticComponent<T> {
  const { retries = 3, retryDelay = 1000 } = config;

  const retryImport = async (): Promise<{ default: T }> => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  });

  return lazy(retryImport);
}

/**
 * Wrapper component for lazy-loaded components with loading state
 */
export const LazyWrapper = memo(function({
  children,
  fallback = <OffshoreLoader />,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Preload a lazy component (call on hover/focus for better UX)
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  importFn().catch(() => {
    // Silently fail - it will retry when actually needed
  });
}

/**
 * Hook to track if component is in viewport for conditional loading
 */
export function useInViewport(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isInViewport, setIsInViewport] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isInViewport;
}
