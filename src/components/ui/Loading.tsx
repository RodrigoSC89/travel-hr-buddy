import React from "react";
import { Loader2, Anchor, Ship, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "spinner" | "maritime" | "offshore";
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

/**
 * Unified Loading component with multiple variants
 * Consolidates loading-state, loading-spinner, and maritime-loading
 */
export const Loading: React.FC<LoadingProps> = ({
  message = "Carregando...",
  size = "md",
  variant = "default",
  fullScreen = false,
  className,
}) => {
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
            className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size])}
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
      {message && <p className="text-sm text-muted-foreground font-medium">{message}</p>}
      {variant === "offshore" && (
        <>
          <p className="text-xs text-muted-foreground mt-1">Otimizado para uso offshore</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full animate-pulse"
              style={{ width: "100%" }}
            />
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
};

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  variant?: LoadingProps["variant"];
  size?: LoadingProps["size"];
}

/**
 * Loading overlay that wraps content and shows loading state
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  children,
  variant = "default",
  size = "md",
}) => {
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
};

export interface LoadingSkeletonProps {
  className?: string;
}

/**
 * Basic skeleton loading component for content placeholders
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden="true" />;
};

export interface LoadingCardProps {
  variant?: "default" | "maritime";
}

/**
 * Skeleton loader for card components
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({ variant = "default" }) => {
  if (variant === "maritime") {
    return (
      <div className="card-maritime p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-300 rounded w-24" />
          <div className="h-10 bg-gray-300 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-5/6" />
      <div className="flex gap-3 pt-4">
        <LoadingSkeleton className="h-10 flex-1" />
        <LoadingSkeleton className="h-10 flex-1" />
      </div>
    </div>
  );
};

/**
 * Dashboard skeleton loader with multiple card placeholders
 */
export const LoadingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b border-border h-16 shadow-sm" />

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton className="h-8 w-1/4 mb-2" />
        <LoadingSkeleton className="h-4 w-1/3 mb-8" />

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 space-y-4">
              <LoadingSkeleton className="h-4 w-1/2" />
              <LoadingSkeleton className="h-8 w-3/4" />
              <LoadingSkeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="space-y-4">
            <LoadingSkeleton className="h-6 w-1/3" />
            <LoadingSkeleton className="h-4 w-1/2 mb-6" />
            {[1, 2, 3].map(i => (
              <div key={i} className="py-4 border-b border-border last:border-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <LoadingSkeleton className="h-5 w-2/3" />
                    <LoadingSkeleton className="h-4 w-1/2" />
                  </div>
                  <LoadingSkeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export legacy names for backward compatibility
export const LoadingState = Loading;
export const Skeleton = LoadingSkeleton;
export const DashboardSkeleton = LoadingDashboard;
export const CardSkeleton = LoadingCard;
export const MaritimeLoading = Loading;
export const MaritimeCardSkeleton = LoadingCard;
export const LoadingSpinner = Loading;
