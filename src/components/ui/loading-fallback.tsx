/**
 * Loading Fallback Components - PATCH 870
 * Used for React.lazy() Suspense boundaries
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingFallback({
  message = 'Carregando...',
  className,
  size = 'md',
  fullScreen = false,
}: LoadingFallbackProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullScreen ? 'min-h-screen' : 'min-h-[200px]',
      className
    )}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Page Loading Skeleton
 */
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="h-10 w-32 bg-muted rounded" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardLoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-muted rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table Loading Skeleton
 */
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 bg-muted rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex gap-4 border-t">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 flex-1 bg-muted rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Inline Loading Spinner
 */
export function InlineSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}
