/**
 * Optimized Skeleton - Performance-first loading states
 * Adapts to connection quality for minimal CPU/GPU usage
 */
import { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { cn } from "@/lib/utils";

interface OptimizedSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function OptimizedSkeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
}: OptimizedSkeletonProps) {
  const { isLowBandwidth, shouldAnimate } = useBandwidthOptimizer();

  const baseStyles = cn(
    "bg-muted rounded",
    shouldAnimate && !isLowBandwidth && "animate-pulse",
    isLowBandwidth && "opacity-60",
    className
  );

  const getVariantStyles = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full";
      case "circular":
        return "rounded-full aspect-square";
      case "card":
        return "h-32 w-full";
      default:
        return "";
    }
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, getVariantStyles())}
            style={{
              ...style,
              width: i === lines - 1 ? "60%" : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, getVariantStyles())}
      style={style}
    />
  );
}

// Presets for common use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
      <OptimizedSkeleton variant="rectangular" height={120} />
      <OptimizedSkeleton variant="text" />
      <OptimizedSkeleton variant="text" width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <OptimizedSkeleton height={40} className="rounded-md" />
      {Array.from({ length: rows }).map((_, i) => (
        <OptimizedSkeleton key={i} height={52} className="rounded-md" />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  const { isLowBandwidth } = useBandwidthOptimizer();
  
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <OptimizedSkeleton width={200} height={32} />
        <OptimizedSkeleton width={120} height={36} className="rounded-md" />
      </div>
      
      {/* Stats Grid - Reduced for low bandwidth */}
      <div className={cn(
        "grid gap-4",
        isLowBandwidth ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
      )}>
        {Array.from({ length: isLowBandwidth ? 2 : 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <OptimizedSkeleton variant="card" height={300} />
        {!isLowBandwidth && (
          <OptimizedSkeleton variant="card" height={300} />
        )}
      </div>
    </div>
  );
}
