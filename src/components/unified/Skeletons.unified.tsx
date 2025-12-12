/**
import { useMemo, useCallback } from "react";;
 * UNIFIED Skeleton Loaders - Versão Consolidada Final
 * 
 * Este componente unifica TODAS as 14 versões de Skeleton encontradas:
 * - dashboard/DashboardSkeleton.tsx (connection-aware)
 * - RouteSkeletons.tsx (framer-motion)
 * - ui/enhanced-skeletons.tsx (shimmer)
 * - ui/skeleton.tsx (básico)
 * - ui/skeleton-loader.tsx (universal)
 * - ui/skeleton-loaders.tsx (PATCH 834)
 * - ui/loading-skeleton.tsx (deprecated)
 * - ui/adaptive-skeleton.tsx (bandwidth)
 * - ui/SkeletonPro.tsx (PATCH 753)
 * - ui/OptimizedSkeleton.tsx (CSS puro)
 * - ux/Skeletons.tsx (PATCH 838)
 * - performance/SkeletonCard.tsx (PATCH 800)
 * - performance/SkeletonLoader.tsx (fast)
 * - unified/SkeletonLoaders.unified.tsx (anterior)
 * 
 * @version 2.0.0
 * @created 2025-12-11
 */

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Anchor, Ship, Waves } from "lucide-react";

// ==================== INTERFACES ====================
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "spinner" | "maritime" | "offshore";
  fullScreen?: boolean;
  className?: string;
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  variant?: LoadingProps["variant"];
  size?: LoadingProps["size"];
}

export interface SkeletonCardProps {
  className?: string;
  variant?: "default" | "maritime" | "metric" | "simple";
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export interface SkeletonListProps {
  items?: number;
  variant?: "default" | "compact" | "avatar";
  className?: string;
}

export interface SkeletonChartProps {
  className?: string;
  height?: number | string;
  variant?: "bar" | "line" | "pie";
}

export interface SkeletonDashboardProps {
  className?: string;
  kpiCount?: number;
  chartCount?: number;
  tableRows?: number;
  connectionAware?: boolean; // Feature do dashboard/DashboardSkeleton.tsx
  withAnimation?: boolean; // Feature do RouteSkeletons.tsx
}

export interface SkeletonPageProps {
  className?: string;
  hasHeader?: boolean;
  hasSidebar?: boolean;
}

export interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

// ==================== HOOKS ADAPTATIVOS ====================
/**
 * Hook simplificado para detecção de conexão lenta
 * Baseado em: dashboard/DashboardSkeleton.tsx e adaptive-skeleton.tsx
 */
function useConnectionQuality() {
  // Em produção, isso deve usar o hook real do projeto
  // Por enquanto, retorna valores padrão
  return {
    isSlowConnection: false,
    isFastConnection: true,
    quality: "good" as "good" | "slow" | "offline",
    isLightMode: false,
    isLowBandwidth: false,
  };
}

// ==================== BASE SKELETON ====================
/**
 * Componente Skeleton base - unifica TODAS as versões básicas
 * Suporta todas as variações: default, text, circular, rectangular
 */
export const Skeleton = memo(function Skeleton({
  className,
  style,
  animate = true,
  variant = "default",
  width,
  height,
  lines = 1,
  ...props
}: SkeletonProps) {
  const { isLowBandwidth } = useConnectionQuality();

  // Simpler animation on slow connections (adaptive-skeleton.tsx)
  const animationClass = animate && !isLowBandwidth
    ? "animate-pulse"
    : isLowBandwidth
      ? "opacity-50"
      : "";

  const variantStyles = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  const inlineStyle: React.CSSProperties = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  // Multi-line support (OptimizedSkeleton.tsx)
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-muted",
              animationClass,
              variantStyles[variant],
              className
            )}
            style={{
              ...inlineStyle,
              width: i === lines - 1 ? "75%" : inlineStyle.width,
            }}
            aria-hidden="true"
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted",
        animationClass,
        variantStyles[variant],
        className
      )}
      style={inlineStyle}
      aria-hidden="true"
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

// ==================== LOADING SPINNER ====================
const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32
};

/**
 * Loading Spinner com variantes maritime/offshore
 * Baseado em: SkeletonLoaders.unified.tsx
 */
export const Loading = memo(function Loading({
  message = "Carregando...",
  size = "md",
  variant = "default",
  fullScreen = false,
  className,
}: LoadingProps) {
  const renderIcon = () => {
    switch (variant) {
    case "maritime":
      return <Anchor className="animate-pulse text-blue-600" size={iconSizes[size]} />;
    case "offshore":
      return (
        <div className="relative">
          <Ship className="animate-bounce text-blue-700" size={iconSizes[size]} />
          <Waves
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-blue-400 animate-pulse"
            size={iconSizes[size] / 2}
          />
        </div>
      );
    case "spinner":
      return (
        <div
          className={cn(
            "animate-spin rounded-full border-b-2 border-primary",
            sizeClasses[size]
          )}
          role="status"
          aria-label="Carregando"
        />
      );
    default:
      return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />;
    }
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {renderIcon()}
      {message && (
        <p className="text-sm text-muted-foreground font-medium">
          {message}
        </p>
      )}
      {variant === "offshore" && (
        <>
          <p className="text-xs text-muted-foreground mt-1">
            Otimizado para uso offshore
          </p>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "100%" }} />
          </div>
        </>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return content;
});
Loading.displayName = "Loading";

// ==================== LOADING OVERLAY ====================
export const LoadingOverlay = memo(function LoadingOverlay({
  isLoading,
  message,
  children,
  variant = "default",
  size = "md",
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <Loading message={message} variant={variant} size={size} />
        </div>
      )}
    </div>
  );
});
LoadingOverlay.displayName = "LoadingOverlay";

// ==================== SKELETON CARD ====================
/**
 * Card Skeleton com variantes
 * Unifica: CardSkeleton de todas as versões
 */
export const SkeletonCard = memo(function SkeletonCard({
  className,
  variant = "default"
}: SkeletonCardProps) {
  if (variant === "maritime") {
    return (
      <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (variant === "metric") {
    return (
      <div className={cn("rounded-xl border bg-card p-4", className)}>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <div className={cn("border rounded-lg p-4 space-y-3", className)}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  // Default variant
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
});
SkeletonCard.displayName = "SkeletonCard";

// ==================== SKELETON TABLE ====================
/**
 * Table Skeleton - unifica todas as versões de TableSkeleton
 */
export const SkeletonTable = memo(function SkeletonTable({
  rows = 5,
  columns = 4,
  className
}: SkeletonTableProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
});
SkeletonTable.displayName = "SkeletonTable";

// ==================== SKELETON LIST ====================
/**
 * List Skeleton com variantes
 */
export const SkeletonList = memo(function SkeletonList({
  items = 5,
  variant = "default",
  className
}: SkeletonListProps) {
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          {variant === "avatar" && (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
});
SkeletonList.displayName = "SkeletonList";

// ==================== SKELETON CHART ====================
/**
 * Chart Skeleton com variantes bar/line/pie
 */
export const SkeletonChart = memo(function SkeletonChart({
  className,
  height = 200,
  variant = "bar"
}: SkeletonChartProps) {
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <Skeleton className="h-5 w-32 mb-6" />
      {variant === "pie" ? (
        <div className="flex items-center justify-center" style={{ height: heightStyle }}>
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      ) : (
        <div className="flex items-end gap-2" style={{ height: heightStyle }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
});
SkeletonChart.displayName = "SkeletonChart";

// ==================== SKELETON DASHBOARD ====================
/**
 * Dashboard Skeleton completo
 * Inclui connection-aware features do dashboard/DashboardSkeleton.tsx
 */
export const SkeletonDashboard = memo(function SkeletonDashboard({
  className,
  kpiCount = 4,
  chartCount = 2,
  tableRows = 5,
  connectionAware = true,
}: SkeletonDashboardProps) {
  const { isSlowConnection, quality } = useConnectionQuality();

  // Minimal skeleton for slow connections (dashboard/DashboardSkeleton.tsx feature)
  if (connectionAware && (isSlowConnection || quality === "offline")) {
    return (
      <div className={cn("space-y-6 p-6", className)}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* KPI Cards - Minimal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: kpiCount }).map((_, i) => (
            <SkeletonCard key={i} variant="metric" />
          ))}
        </div>

        {/* Simple chart placeholder */}
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  // Full skeleton for normal connections
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Quick Access Panel (dashboard/DashboardSkeleton.tsx) */}
      <div className="bg-card border border-border rounded-lg p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: kpiCount }).map((_, i) => (
          <SkeletonCard key={i} variant="metric" />
        ))}
      </div>

      {/* Tabs (dashboard/DashboardSkeleton.tsx) */}
      <div className="bg-card/50 border border-border rounded-lg p-1 flex gap-1">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-md" />
        ))}
      </div>

      {/* Charts */}
      <div className={cn(
        "grid gap-4",
        chartCount === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {Array.from({ length: chartCount }).map((_, i) => (
          <SkeletonChart key={i} className="h-80" />
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-xl">
        <SkeletonTable rows={tableRows} />
      </div>
    </div>
  );
});
SkeletonDashboard.displayName = "SkeletonDashboard";

// ==================== SKELETON PAGE ====================
/**
 * Full Page Skeleton
 */
export const SkeletonPage = memo(function SkeletonPage({
  className,
  hasHeader = true,
  hasSidebar = false
}: SkeletonPageProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      {hasHeader && (
        <div className="h-16 border-b bg-card px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        {hasSidebar && (
          <div className="w-64 border-r bg-card p-4 hidden lg:block">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          <div className="border rounded-lg p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <SkeletonTable rows={5} />
          </div>
        </div>
      </div>
    </div>
  );
});
SkeletonPage.displayName = "SkeletonPage";

// ==================== SKELETON FORM ====================
/**
 * Form Skeleton
 */
export const SkeletonForm = memo(function SkeletonForm({
  fields = 4,
  className
}: SkeletonFormProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
});
SkeletonForm.displayName = "SkeletonForm";

// ==================== SKELETON PROFILE ====================
/**
 * Profile Skeleton
 */
export const SkeletonProfile = memo(function SkeletonProfile({
  className
}: { className?: string }) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between p-4 border rounded-lg">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
});
SkeletonProfile.displayName = "SkeletonProfile";

// ==================== SKELETON TEXT ====================
/**
 * Text Block Skeleton
 */
export const SkeletonText = memo(function SkeletonText({
  lines = 3,
  className
}: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
});
SkeletonText.displayName = "SkeletonText";

// ==================== SKELETON NAVIGATION ====================
/**
 * Navigation Skeleton
 */
export const SkeletonNav = memo(function SkeletonNav({
  items = 8,
  className
}: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-2 p-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
});
SkeletonNav.displayName = "SkeletonNav";

// ==================== SKELETON IMAGE ====================
/**
 * Image Skeleton with aspect ratio support
 */
export const SkeletonImage = memo(function SkeletonImage({
  aspectRatio = "16/9",
  className
}: { aspectRatio?: string; className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-muted", className)}
      style={{ aspectRatio }}
    >
      <Skeleton className="absolute inset-0" />
    </div>
  );
});
SkeletonImage.displayName = "SkeletonImage";

// ==================== SKELETON AVATAR ====================
/**
 * Avatar Skeleton
 */
export const SkeletonAvatar = memo(function SkeletonAvatar({
  size = "md",
  className
}: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  });

  return <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />;
});
SkeletonAvatar.displayName = "SkeletonAvatar";

// ==================== LEGACY ALIASES ====================
/**
 * Backward compatibility exports
 * Mantém compatibilidade com TODAS as versões antigas
 */
export const LoadingSkeleton = Skeleton;
export const LoadingCard = SkeletonCard;
export const LoadingDashboard = SkeletonDashboard;
export const LoadingState = Loading;
export const LoadingSpinner = Loading;
export const MaritimeLoading = Loading;
export const MaritimeCardSkeleton = SkeletonCard;
export const CardSkeleton = SkeletonCard;
export const TableSkeleton = SkeletonTable;
export const DashboardSkeleton = SkeletonDashboard;
export const PageSkeleton = SkeletonPage;
export const FormSkeleton = SkeletonForm;
export const ProfileSkeleton = SkeletonProfile;
export const ChartSkeleton = SkeletonChart;
export const KPICardSkeleton = SkeletonCard;
export const SkeletonBase = Skeleton;
export const SkeletonMetricCard = SkeletonCard;
export const OptimizedSkeleton = Skeleton;
export const AdaptiveSkeleton = Skeleton;
export const SkeletonCardLoader = SkeletonCard;
export const TableSkeletonLoader = SkeletonTable;
export const SkeletonLoader = Skeleton;
export const NavSkeleton = SkeletonNav;
export const NavigationSkeleton = SkeletonNav;
export const ListSkeleton = SkeletonList;
export const SkeletonPro = Skeleton;
export const SkeletonDashboardComplete = SkeletonDashboard;
export const SkeletonModule = SkeletonCard;
export const ModuleSkeleton = SkeletonCard;
export const ModulePageSkeleton = SkeletonPage;
export const FullPageSkeleton = SkeletonPage;
export const StatsSkeleton = SkeletonCard;
export const StatsGridSkeleton = SkeletonCard;
export const PageHeaderSkeleton = SkeletonPage;

// Module-specific exports
export const CardSkeletonLoader = SkeletonCard;
export const ListItemSkeleton = SkeletonList;
export const TableRowSkeleton = SkeletonTable;
export const TextBlockSkeleton = SkeletonText;
export const ImageSkeleton = SkeletonImage;
export const ConnectionAwareLoader = Loading;

/**
 * Default export com todos os componentes
 */
export default {
  // Core
  Skeleton,
  Loading,
  LoadingOverlay,

  // Specific
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonChart,
  SkeletonDashboard,
  SkeletonPage,
  SkeletonForm,
  SkeletonProfile,
  SkeletonText,
  SkeletonNav,
  SkeletonImage,
  SkeletonAvatar,

  // Legacy aliases
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  NavSkeleton,
  LoadingSkeleton,
  LoadingCard,
  LoadingDashboard,
  LoadingState,
  LoadingSpinner,
});
