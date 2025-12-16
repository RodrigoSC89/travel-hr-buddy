/**
 * Dashboard Skeleton - PATCH 754
 * Optimized loading skeleton for dashboard pages
 * Lightweight and connection-aware
 */

import React from "react";
import { cn } from "@/lib/utils";
import { useLightMode, useConnectionAdaptive } from "@/hooks/useConnectionAdaptive";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, style }) => (
  <div className={cn("bg-muted/60 rounded animate-pulse", className)} style={style} />
);

// KPI Card Skeleton - lightweight version
export const KPICardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  const isLightMode = useLightMode();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "bg-card border border-border rounded-lg p-4",
            !isLightMode && "animate-pulse"
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
};

// Chart Skeleton - minimal version
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = "h-64" }) => {
  const isLightMode = useLightMode();
  
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-4",
      !isLightMode && "animate-pulse"
    )}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className={cn(height, "flex items-end gap-2 pt-4")}>
        {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t" 
            style={{ height: `${h}%` }} 
          />
        ))}
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const isLightMode = useLightMode();
  
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg overflow-hidden",
      !isLightMode && "animate-pulse"
    )}>
      {/* Header */}
      <div className="bg-muted/30 p-3 border-b border-border flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3 border-b border-border/50 flex gap-4">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Full Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => {
  const { quality, isSlow } = useConnectionAdaptive();
  const isLightMode = useLightMode();
  
  // For slow connections, show minimal skeleton
  if (isSlow || quality === 'offline') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <KPICardSkeleton count={4} />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      {/* Quick Access Panel */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* KPIs */}
      <KPICardSkeleton count={4} />
      
      {/* Tabs */}
      <div className="bg-card/50 border border-border rounded-lg p-1 flex gap-1">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-md" />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
