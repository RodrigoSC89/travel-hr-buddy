/**
 * Enhanced Skeleton Components for UX
 * PATCH 838: Skeletons e loading states melhorados
 */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Card Skeleton
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-lg border">
    <div className="border-b p-4">
      <div className="flex gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="border-b last:border-0 p-4">
        <div className="flex gap-4">
          {[...Array(6)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <TableSkeleton rows={5} />
  </div>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="rounded-lg border bg-card p-6">
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <div className="mt-4 flex items-end justify-between gap-2" style={{ height }}>
      {[...Array(12)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 rounded-t" 
          style={{ height: `${Math.random() * 80 + 20}%` }} 
        />
      ))}
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-4">
    {[...Array(fields)].map((_, i) => (
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

// List Skeleton
export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Navigation Skeleton
export const NavSkeleton = () => (
  <div className="space-y-2">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// Stats Grid Skeleton
export const StatsGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(count)].map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton = () => (
  <div className="flex items-center justify-between pb-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-10" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

// Full Page Skeleton
export const FullPageSkeleton = () => (
  <div className="container mx-auto py-6 animate-pulse">
    <PageHeaderSkeleton />
    <StatsGridSkeleton />
    <div className="mt-6">
      <TableSkeleton />
    </div>
  </div>
);

export default {
  Card: CardSkeleton,
  Table: TableSkeleton,
  Dashboard: DashboardSkeleton,
  Chart: ChartSkeleton,
  Form: FormSkeleton,
  List: ListSkeleton,
  Nav: NavSkeleton,
  Profile: ProfileSkeleton,
  StatsGrid: StatsGridSkeleton,
  PageHeader: PageHeaderSkeleton,
  FullPage: FullPageSkeleton,
};
