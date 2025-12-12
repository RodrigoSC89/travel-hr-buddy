/**
 * Adaptive Skeleton Components
 * Optimized loading placeholders that adapt to connection speed
 */

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  animate?: boolean;
}

export const AdaptiveSkeleton = memo(function AdaptiveSkeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  const { isLowBandwidth } = useBandwidthOptimizer();
  
  // Simpler animation on slow connections
  const animationClass = animate && !isLowBandwidth 
    ? "animate-pulse" 
    : isLowBandwidth 
      ? "opacity-50" 
      : "";

  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        animationClass,
        className
      )}
      {...props}
    />
  );
});

export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <AdaptiveSkeleton className="h-4 w-24" />
        <AdaptiveSkeleton className="h-8 w-8 rounded-full" />
      </div>
      <AdaptiveSkeleton className="h-8 w-32" />
      <AdaptiveSkeleton className="h-3 w-20" />
    </div>
  );
});

export const TableRowSkeleton = memo(function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b">
      <AdaptiveSkeleton className="h-4 w-4" />
      <AdaptiveSkeleton className="h-4 flex-1" />
      <AdaptiveSkeleton className="h-4 w-20" />
      <AdaptiveSkeleton className="h-4 w-16" />
      <AdaptiveSkeleton className="h-6 w-6 rounded" />
    </div>
  );
});

export const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <AdaptiveSkeleton className="h-5 w-32" />
        <AdaptiveSkeleton className="h-8 w-24" />
      </div>
      <div className="h-64 flex items-end gap-2 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <AdaptiveSkeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${20 + Math.random() * 80}%` } as React.CSSProperties} 
          />
        ))}
      </div>
    </div>
  );
  };

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <AdaptiveSkeleton className="h-8 w-48" />
          <AdaptiveSkeleton className="h-4 w-64" />
        </div>
        <AdaptiveSkeleton className="h-10 w-32" />
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <AdaptiveSkeleton className="h-6 w-40" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
  };

export const ListSkeleton = memo(function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <AdaptiveSkeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <AdaptiveSkeleton className="h-4 w-3/4" />
            <AdaptiveSkeleton className="h-3 w-1/2" />
          </div>
          <AdaptiveSkeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
});

export const FormSkeleton = memo(function FormSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <AdaptiveSkeleton className="h-4 w-20" />
        <AdaptiveSkeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <AdaptiveSkeleton className="h-4 w-24" />
        <AdaptiveSkeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <AdaptiveSkeleton className="h-4 w-28" />
        <AdaptiveSkeleton className="h-24 w-full" />
      </div>
      <div className="flex gap-2 pt-4">
        <AdaptiveSkeleton className="h-10 w-24" />
        <AdaptiveSkeleton className="h-10 w-20" />
      </div>
    </div>
  );
});

export const ModuleCardSkeleton = memo(function ModuleCardSkeleton() {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <AdaptiveSkeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <AdaptiveSkeleton className="h-4 w-28 mb-1" />
          <AdaptiveSkeleton className="h-3 w-36" />
        </div>
        <AdaptiveSkeleton className="h-5 w-14 rounded-full" />
      </div>
      <AdaptiveSkeleton className="h-8 w-full rounded" />
    </div>
  );
});

// Export all
export {
  AdaptiveSkeleton as Skeleton,
});
