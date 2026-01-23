/**
 * Skeleton Variants - Extended skeleton components
 * PATCH: Audit Sprint 4 - UI/UX Consistency
 */

import type { FC } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted/60",
      className
    )}
  />
);

// Profile Card Skeleton
export const ProfileSkeleton: FC = () => (
  <div className="flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  </div>
);

// Crew Member Card Skeleton
export const CrewCardSkeleton: FC = () => (
  <div className="p-4 border rounded-lg space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

// Vessel Card Skeleton
export const VesselCardSkeleton: FC = () => (
  <div className="p-4 border rounded-lg space-y-4">
    <Skeleton className="h-32 w-full rounded-md" />
    <Skeleton className="h-5 w-3/4" />
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
    <Skeleton className="h-9 w-full" />
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: FC = () => (
  <div className="p-6 border rounded-lg space-y-3">
    <div className="flex justify-between items-start">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
);

// Chart Skeleton
export const ChartSkeleton: FC = () => (
  <div className="p-6 border rounded-lg space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

// Navigation Skeleton
export const NavSkeleton: FC = () => (
  <div className="flex items-center justify-between p-4 border-b">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

// Module Page Skeleton
export const ModulePageSkeleton: FC = () => (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Content Area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartSkeleton />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CrewCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

// AI Chat Skeleton
export const AIChatSkeleton: FC = () => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
    
    <div className="flex-1 p-4 space-y-4">
      {/* Assistant message */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      
      {/* User message */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-12 w-48 rounded-lg" />
      </div>
      
      {/* Assistant typing */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
    
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  </div>
);

// Compliance Check Skeleton
export const ComplianceCheckSkeleton: FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);
