import { memo } from 'react';
/**
 * OptimizedSkeleton - Skeleton com performance otimizada
 * Usa CSS puro ao invés de animações JS para melhor performance
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const OptimizedSkeleton = memo(function({
  className,
  variant = "default",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-muted";
  
  const variantStyles = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, variantStyles[variant], className)}
            style={{
              ...style,
              width: i === lines - 1 ? "75%" : style.width, // Última linha menor
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  );
}

// Presets comuns para uso rápido
export const CardSkeleton = memo(function() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <OptimizedSkeleton height={24} width="60%" />
      <OptimizedSkeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <OptimizedSkeleton height={36} width={100} />
        <OptimizedSkeleton height={36} width={100} />
      </div>
    </div>
  );
}

export const TableSkeleton = memo(function({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b">
        <OptimizedSkeleton height={16} width="20%" />
        <OptimizedSkeleton height={16} width="30%" />
        <OptimizedSkeleton height={16} width="25%" />
        <OptimizedSkeleton height={16} width="15%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <OptimizedSkeleton height={14} width="20%" />
          <OptimizedSkeleton height={14} width="30%" />
          <OptimizedSkeleton height={14} width="25%" />
          <OptimizedSkeleton height={14} width="15%" />
        </div>
      ))}
    </div>
  );
}

export const DashboardSkeleton = memo(function() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <OptimizedSkeleton height={32} width={200} />
        <OptimizedSkeleton height={40} width={120} />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            <OptimizedSkeleton height={14} width="40%" />
            <OptimizedSkeleton height={28} width="60%" />
            <OptimizedSkeleton height={12} width="80%" />
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
});
