/**
 * LoadingSkeleton - Premium Maritime Loading States
 * World-class contextual skeletons for all module types
 */
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Base shimmer block */
export function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className
      )}
      style={style}
      {...props}
    />
  );
}

/** KPI Cards skeleton - for dashboard stat rows */
export function KPICardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 p-4 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton - for data grids */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 px-4 py-2 border-b border-border/40">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ flex: i === 0 ? 2 : 1 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 px-4 py-3 border-b border-border/20">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className="h-4"
              style={{
                flex: col === 0 ? 2 : 1,
                opacity: 1 - row * 0.1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Chart skeleton */
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-border/40 p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="relative overflow-hidden rounded-lg" style={{ height }}>
        <Skeleton className="absolute inset-0" />
        {/* Fake bar chart lines */}
        <div className="absolute bottom-0 inset-x-4 flex items-end gap-2 h-3/4">
          {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/10 rounded-t-sm animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Timeline skeleton */
export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {i < items - 1 && <div className="w-0.5 flex-1 bg-border/30 mt-2" />}
          </div>
          <div className="flex-1 pb-4 space-y-2">
            <Skeleton className="h-4 w-3/4" style={{ opacity: 1 - i * 0.12 }} />
            <Skeleton className="h-3 w-1/2" style={{ opacity: 0.6 - i * 0.08 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Module page wrapper skeleton */
export function ModulePageSkeleton() {
  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      {/* KPIs */}
      <KPICardsSkeleton count={4} />
      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton height={200} />
        <div className="rounded-xl border border-border/40 p-4 space-y-3 bg-card">
          <Skeleton className="h-5 w-32" />
          <TableSkeleton rows={4} cols={3} />
        </div>
      </div>
    </div>
  );
}

/** Sidebar loading skeleton */
export function SidebarItemsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-9 rounded-md"
          style={{ opacity: 1 - i * 0.08, width: `${75 + Math.sin(i) * 20}%` }}
        />
      ))}
    </div>
  );
}

/** Card grid skeleton */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 p-4 space-y-3 bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-7 flex-1 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
