/**
 * Skeleton Loader Components
 * Fast loading placeholders
 */

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export const Skeleton = memo(function Skeleton({ 
  className, 
  animate = true 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted rounded",
        animate && "skeleton-loading",
        className
      )}
    />
  );
});

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
});

export const SkeletonTable = memo(function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 pb-2 border-b">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
  };

export const SkeletonDashboard = memo(function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48" />
        </div>
        <div className="border rounded-lg p-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48" />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-4 w-40 mb-4" />
        <SkeletonTable rows={3} />
      </div>
    </div>
  );
});

export const SkeletonList = memo(function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
});

Skeleton.displayName = "Skeleton";
SkeletonCard.displayName = "SkeletonCard";
SkeletonTable.displayName = "SkeletonTable";
SkeletonDashboard.displayName = "SkeletonDashboard";
SkeletonList.displayName = "SkeletonList";
