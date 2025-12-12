/**
 * Loading Wrapper - PATCH 754
 * Connection-aware loading wrapper for pages
 */

import React, { Suspense, lazy, ComponentType } from "react";
import { DashboardSkeleton, KPICardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/unified/Skeletons.unified";
import { useLightMode } from "@/hooks/useConnectionAdaptive";
import { cn } from "@/lib/utils";

type SkeletonType = "dashboard" | "kpi" | "chart" | "table" | "minimal";

interface LoadingWrapperProps {
  children: React.ReactNode;
  skeleton?: SkeletonType;
  fallback?: React.ReactNode;
}

const skeletonComponents: Record<SkeletonType, React.FC> = {
  dashboard: DashboardSkeleton,
  kpi: () => <KPICardSkeleton count={4} />,
  chart: () => <ChartSkeleton />,
  table: () => <TableSkeleton rows={5} />,
  minimal: () => <MinimalSkeleton />,
};

// Minimal skeleton for light mode
const MinimalSkeleton: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  skeleton = "minimal",
  fallback,
}) => {
  const isLightMode = useLightMode();
  
  // For light mode (slow connections), always use minimal skeleton
  const actualSkeleton = isLightMode ? "minimal" : skeleton;
  const SkeletonComponent = skeletonComponents[actualSkeleton];

  return (
    <Suspense fallback={fallback || <SkeletonComponent />}>
      {children}
    </Suspense>
  );
});

/**
 * HOC for lazy loading components with connection-aware fallback
 */
export function withLoadingWrapper<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  skeleton: SkeletonType = "minimal"
) {
  const LazyComponent = lazy(importFn);
  
  return function WrappedComponent(props: React.ComponentProps<T>) {
    return (
      <LoadingWrapper skeleton={skeleton}>
        <LazyComponent {...props} />
      </LoadingWrapper>
    );
  });
}

/**
 * Page loading indicator - shows at top of page
 */
export const PageLoadingIndicator: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted overflow-hidden">
      <div className="h-full bg-primary animate-pulse w-1/3" 
        style={{ animation: "loading-bar 1.5s ease-in-out infinite" }} />
    </div>
  );
};

export default LoadingWrapper;
