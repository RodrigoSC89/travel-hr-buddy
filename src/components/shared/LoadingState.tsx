/**
 * NAUTI ONE — LoadingState Component
 * Consistent loading/skeleton state across all modules
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShipLoader } from '@/components/ui/ship-loader';

interface LoadingStateProps {
  /** Type of skeleton to render */
  variant?: 'table' | 'cards' | 'detail' | 'spinner' | 'inline';
  /** Number of skeleton rows/cards */
  count?: number;
  className?: string;
}

export function LoadingState({ variant = 'spinner', count = 3, className = '' }: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <ShipLoader size="md" className={className} />
    );
  }

  if (variant === 'inline') {
    return (
      <ShipLoader size="sm" label="Carregando..." className={className} />
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`} data-testid="loading-state">
        {/* Header row */}
        <div className="flex gap-4">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        {/* Data rows */}
        {Array.from({ length: count }).map((_, i) => (
          <div key={`load-tbl-row-${i}`} className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} data-testid="loading-state">
        {Array.from({ length: count }).map((_, i) => (
          <div key={`load-card-${i}`} className="rounded-lg border bg-card p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Detail view
  return (
    <div className={`space-y-6 ${className}`} data-testid="loading-state">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: count * 2 }).map((_, i) => (
          <div key={`load-detail-${i}`} className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
