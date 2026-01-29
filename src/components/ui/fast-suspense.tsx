/**
 * Fast Suspense Wrapper - Optimized loading with instant feedback
 * Provides better UX than default Suspense with:
 * - Instant skeleton display (no minimum delay)
 * - Smart timeout handling
 * - Memory-efficient implementation
 */

import { Suspense, ComponentType, lazy, memo, useState, useEffect } from "react";
import { PageSkeleton, CompactSkeleton } from "./optimized-skeleton";
import { ErrorBoundary } from "react-error-boundary";

interface FastSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: "page" | "compact" | "minimal";
}

/**
 * Fast Suspense with optimized fallback
 */
export const FastSuspense = memo(function FastSuspense({
  children,
  fallback,
  variant = "page",
}: FastSuspenseProps) {
  const defaultFallback = variant === "page" ? <PageSkeleton /> : 
                          variant === "compact" ? <CompactSkeleton /> :
                          <MinimalLoader />;

  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        console.error("[FastSuspense] Component failed to load:", error);
      }}
    >
      <Suspense fallback={fallback ?? defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

/**
 * Minimal loader for small components
 */
const MinimalLoader = memo(function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div 
        className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
        style={{ contain: "strict" }}
      />
    </div>
  );
});

/**
 * Error fallback component
 */
const ErrorFallback = memo(function ErrorFallback() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    
    // Clear module cache if possible
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.includes('chunk')).map(k => caches.delete(k)));
      } catch {}
    }
    
    // Reload page
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-destructive mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-semibold text-lg mb-2">Erro ao carregar componente</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Houve um problema ao carregar esta seção.
      </p>
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {retrying ? "Recarregando..." : "Tentar novamente"}
      </button>
    </div>
  );
});

/**
 * Lazy load with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | undefined;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await factory();
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retry with exponential backoff
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  });
}

/**
 * Prefetch a lazy component
 */
export function prefetchComponent(factory: () => Promise<any>) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      factory().catch(() => {
        // Silently fail - prefetch is optional
      });
    });
  }
}

/**
 * Hook for component visibility-based prefetch
 */
export function usePrefetchOnVisible(
  ref: React.RefObject<Element>,
  factory: () => Promise<any>
) {
  useEffect(() => {
    if (!ref.current || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          prefetchComponent(factory);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, factory]);
}

export default FastSuspense;
