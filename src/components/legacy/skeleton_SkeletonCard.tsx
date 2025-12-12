import { memo } from 'react';
/**
 * PATCH 800: Skeleton Loading Components
 * Provides visual feedback during data loading
 */
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = memo(function({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded-md",
        className
      )}
      style={style}
    />
  );
}

export const SkeletonCard = memo(function({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export const SkeletonTable = memo(function({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export const SkeletonList = memo(function({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const SkeletonChart = memo(function({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export const SkeletonDashboard = memo(function() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart className="h-80" />
        <SkeletonChart className="h-80" />
      </div>
      
      {/* Table */}
      <div className="border rounded-xl">
        <SkeletonTable rows={5} />
      </div>
    </div>
  );
}
