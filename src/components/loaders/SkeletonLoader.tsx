/**
 * SkeletonLoader - FASE A.4
 * 
 * Loading state com skeleton para conteúdo
 */

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  /** Tipo de layout */
  variant?: 'card' | 'list' | 'table' | 'chart';
  /** Número de items */
  count?: number;
  /** Classe CSS adicional */
  className?: string;
}

export function SkeletonLoader({
  variant = 'card',
  count = 3,
  className,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return items.map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ));

      case 'list':
        return items.map((i) => (
          <div key={i} className="flex items-center gap-3 border-b py-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-2 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ));

      case 'table':
        return (
          <div className="rounded-lg border">
            <div className="border-b bg-muted/50 p-4">
              <div className="flex gap-4">
                {items.map((i) => (
                  <div
                    key={i}
                    className="h-3 w-24 animate-pulse rounded bg-muted"
                  />
                ))}
              </div>
            </div>
            {items.map((i) => (
              <div key={i} className="border-b p-4">
                <div className="flex gap-4">
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded bg-muted" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {renderSkeleton()}
    </div>
  );
}
