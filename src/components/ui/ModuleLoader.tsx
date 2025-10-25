/**
 * ModuleLoader Component
 * Custom loading indicator for lazy-loaded modules
 * PATCH 128.0 - Suspense, Loaders & Lazy Loading
 */

import { Loader2 } from 'lucide-react';

interface ModuleLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * ModuleLoader component
 * Displays a loading spinner with optional message
 * 
 * @param message - Optional loading message
 * @param fullScreen - Whether to display in full screen mode
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<ModuleLoader message="Carregando módulo..." />}>
 *   <LazyComponent />
 * </Suspense>
 * ```
 */
export const ModuleLoader = ({ 
  message = 'Carregando módulo...', 
  fullScreen = true 
}: ModuleLoaderProps) => {
  const containerClasses = fullScreen
    ? 'flex justify-center items-center h-screen bg-background'
    : 'flex justify-center items-center h-full py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

/**
 * Compact loader for inline usage
 */
export const CompactLoader = ({ message }: { message?: string }) => (
  <div className="flex items-center gap-2 py-4">
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    {message && <span className="text-sm text-muted-foreground">{message}</span>}
  </div>
);

/**
 * Skeleton loader for content placeholders
 */
export const SkeletonLoader = () => (
  <div className="space-y-4 p-4 animate-pulse">
    <div className="h-8 bg-muted rounded w-1/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="h-4 bg-muted rounded w-4/6"></div>
    </div>
    <div className="h-32 bg-muted rounded"></div>
  </div>
);

/**
 * Card skeleton loader
 */
export const CardSkeletonLoader = () => (
  <div className="border rounded-lg p-6 space-y-4 animate-pulse">
    <div className="h-6 bg-muted rounded w-1/2"></div>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded"></div>
      <div className="h-4 bg-muted rounded w-4/5"></div>
    </div>
  </div>
);

/**
 * Table skeleton loader
 */
export const TableSkeletonLoader = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2 animate-pulse">
    <div className="h-10 bg-muted rounded"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-muted/50 rounded"></div>
    ))}
  </div>
);

export default ModuleLoader;
