/**
 * Data Loader Component
 * PATCH 834: Optimized data loading with skeleton states
 */

import React, { Suspense, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  ListSkeleton,
  DashboardSkeleton,
  FormSkeleton
} from "@/components/unified/Skeletons.unified";

// Skeleton type options
type SkeletonType = "card" | "table" | "list" | "dashboard" | "form" | "custom";

interface DataLoaderProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  skeleton?: SkeletonType;
  customSkeleton?: ReactNode;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  // Table-specific props
  tableRows?: number;
  tableColumns?: number;
  // List-specific props
  listItems?: number;
}

// Error Fallback Component
function ErrorFallback({ 
  error, 
  resetErrorBoundary,
  isOffline 
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
  isOffline: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className={cn(
        "p-3 rounded-full",
        isOffline ? "bg-yellow-500/10" : "bg-destructive/10"
      )}>
        {isOffline ? (
          <WifiOff className="h-6 w-6 text-yellow-500" />
        ) : (
          <AlertCircle className="h-6 w-6 text-destructive" />
        )}
      </div>
      <div>
        <p className="font-medium">
          {isOffline ? "Você está offline" : "Erro ao carregar dados"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isOffline 
            ? "Verifique sua conexão e tente novamente"
            : error.message || "Ocorreu um erro inesperado"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  message = "Nenhum dado encontrado",
  icon
}: { 
  message?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon || (
        <div className="text-4xl mb-2">📭</div>
      )}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Get skeleton component by type
function getSkeletonComponent(
  type: SkeletonType,
  props: { rows?: number; columns?: number; items?: number }
): ReactNode {
  switch (type) {
  case "card":
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  case "table":
    return <TableSkeleton rows={props.rows || 5} columns={props.columns || 5} />;
  case "list":
    return <ListSkeleton items={props.items || 5} />;
  case "dashboard":
    return <DashboardSkeleton />;
  case "form":
    return <FormSkeleton />;
  default:
    return <Skeleton className="h-48 w-full" />;
  }
}

export function DataLoader({
  children,
  isLoading = false,
  error = null,
  isEmpty = false,
  skeleton = "card",
  customSkeleton,
  emptyMessage,
  emptyIcon,
  onRetry,
  retryLabel = "Tentar novamente",
  className,
  tableRows,
  tableColumns,
  listItems,
}: DataLoaderProps) {
  const { connectionType } = useBandwidthOptimizer();
  const isOffline = connectionType === "offline";

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        {customSkeleton || getSkeletonComponent(skeleton, { 
          rows: tableRows, 
          columns: tableColumns,
          items: listItems 
        })}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <ErrorFallback 
          error={error} 
          resetErrorBoundary={onRetry || (() => window.location.reload())}
          isOffline={isOffline}
        />
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={className}>
        <EmptyState message={emptyMessage} icon={emptyIcon} />
      </div>
    );
  }

  // Content
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback 
          error={error} 
          resetErrorBoundary={resetErrorBoundary}
          isOffline={isOffline}
        />
      )}
      onReset={onRetry}
    >
      <div className={cn("animate-in fade-in duration-300", className)}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

// Suspense wrapper with skeleton
export function SuspenseLoader({
  children,
  skeleton = "card",
  customSkeleton,
  className,
}: {
  children: ReactNode;
  skeleton?: SkeletonType;
  customSkeleton?: ReactNode;
  className?: string;
}) {
  const fallback = customSkeleton || getSkeletonComponent(skeleton, {});

  return (
    <Suspense fallback={<div className={className}>{fallback}</div>}>
      <ErrorBoundary fallback={<div className="p-4 text-destructive">Erro ao carregar</div>}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

// Inline loading indicator
export function InlineLoader({ 
  size = "sm",
  text 
}: { 
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <RefreshCw className={cn(sizeClasses[size], "animate-spin")} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
