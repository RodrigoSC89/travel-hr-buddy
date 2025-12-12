/**
 * Enhanced Skeleton Loaders
 * Network-aware loading states with shimmer effects
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/unified/Skeletons.unified";

interface SkeletonProps {
  className?: string;
}

// Card Skeleton with shimmer
export const CardSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number } & SkeletonProps> = ({ 
  columns = 5, 
  className 
}) => (
  <div className={cn("flex items-center gap-4 py-4 border-b", className)}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className="h-4 flex-1" />
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number } & SkeletonProps> = ({
  rows = 5,
  columns = 5,
  className
}) => (
  <div className={cn("rounded-lg border bg-card", className)}>
    {/* Header */}
    <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    <div className="p-4 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("rounded-lg border bg-card p-4", className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    {/* Stats Row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsSkeleton key={i} />
      ))}
    </div>
    
    {/* Chart Area */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton className="h-64" />
      <CardSkeleton className="h-64" />
    </div>
    
    {/* Table */}
    <TableSkeleton rows={5} columns={4} />
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number } & SkeletonProps> = ({
  fields = 4,
  className
}) => (
  <div className={cn("space-y-6", className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end gap-2 pt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("flex items-center gap-4 p-4 border-b", className)}>
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-8 w-8" />
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number } & SkeletonProps> = ({
  items = 5,
  className
}) => (
  <div className={cn("rounded-lg border bg-card divide-y", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-2 p-4", className)}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

// Module Page Skeleton - Generic for any module
export const ModulePageSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-6 p-6", className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
    
    {/* Content */}
    <DashboardSkeleton />
  </div>
);

export default {
  CardSkeleton,
  TableSkeleton,
  TableRowSkeleton,
  StatsSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ListSkeleton,
  ListItemSkeleton,
  ProfileSkeleton,
  NavigationSkeleton,
  ModulePageSkeleton
};
