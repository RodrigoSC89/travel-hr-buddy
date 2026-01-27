/**
 * Loading States - Componentes de loading otimizados para UX fluida
 * PATCH v4.1: Estados de loading consistentes e performáticos
 */

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ============================================
// SPINNER VARIANTS
// ============================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export const Spinner = memo(function Spinner({ 
  size = "md", 
  className 
}: SpinnerProps) {
  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeMap[size], className)} 
    />
  );
});

// ============================================
// PAGE LOADING
// ============================================

export const PageLoading = memo(function PageLoading({ 
  message = "Carregando..." 
}: { 
  message?: string 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="xl" />
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  );
});

// ============================================
// INLINE LOADING
// ============================================

export const InlineLoading = memo(function InlineLoading({ 
  text = "Carregando" 
}: { 
  text?: string 
}) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Spinner size="sm" />
      <span>{text}</span>
    </span>
  );
});

// ============================================
// BUTTON LOADING
// ============================================

export const ButtonLoading = memo(function ButtonLoading({ 
  loading, 
  children 
}: { 
  loading: boolean; 
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <span className="flex items-center gap-2">
        <Spinner size="sm" />
        <span>Aguarde...</span>
      </span>
    );
  }
  return <>{children}</>;
});

// ============================================
// SKELETON VARIANTS (Otimizados)
// ============================================

export const SkeletonLine = memo(function SkeletonLine({ 
  width = "100%", 
  height = "1rem",
  className,
}: { 
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div 
      className={cn("animate-pulse bg-muted/60 rounded", className)}
      style={{ width, height }}
    />
  );
});

export const SkeletonCard = memo(function SkeletonCard({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div className={cn("p-4 space-y-3 border rounded-lg", className)}>
      <SkeletonLine height="1.5rem" width="60%" />
      <SkeletonLine height="2rem" width="40%" />
      <div className="space-y-2 pt-2">
        <SkeletonLine height="0.875rem" />
        <SkeletonLine height="0.875rem" width="80%" />
      </div>
    </div>
  );
});

export const SkeletonTable = memo(function SkeletonTable({ 
  rows = 5, 
  cols = 4 
}: { 
  rows?: number; 
  cols?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={`h-${i}`} height="1rem" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div 
          key={`r-${row}`} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, col) => (
            <SkeletonLine key={`c-${row}-${col}`} height="2rem" />
          ))}
        </div>
      ))}
    </div>
  );
});

export const SkeletonList = memo(function SkeletonList({ 
  count = 3 
}: { 
  count?: number;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <SkeletonLine height="2.5rem" width="2.5rem" className="rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine height="1rem" width="50%" />
            <SkeletonLine height="0.75rem" width="30%" />
          </div>
        </div>
      ))}
    </div>
  );
});

// ============================================
// PROGRESS INDICATOR
// ============================================

export const ProgressBar = memo(function ProgressBar({ 
  progress, 
  showLabel = true,
  className,
}: { 
  progress: number; 
  showLabel?: boolean;
  className?: string;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
});

// ============================================
// PULSE DOT (Para status)
// ============================================

export const PulseDot = memo(function PulseDot({ 
  status = "active",
  size = "md",
}: { 
  status?: "active" | "warning" | "error" | "inactive";
  size?: "sm" | "md" | "lg";
}) {
  const colors = {
    active: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    inactive: "bg-gray-400",
  };
  
  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span className="relative flex">
      <span 
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          colors[status]
        )} 
      />
      <span 
        className={cn(
          "relative inline-flex rounded-full",
          colors[status],
          sizes[size]
        )} 
      />
    </span>
  );
});

// ============================================
// EMPTY STATES
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = memo(function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
});

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = memo(function ErrorState({ 
  title = "Erro ao carregar",
  message = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  );
});

export default {
  Spinner,
  PageLoading,
  InlineLoading,
  ButtonLoading,
  SkeletonLine,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  ProgressBar,
  PulseDot,
  EmptyState,
  ErrorState,
};
