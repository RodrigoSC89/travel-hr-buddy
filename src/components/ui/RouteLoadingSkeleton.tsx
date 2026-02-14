/**
 * RouteLoadingSkeleton - Lightweight skeleton for route transitions
 * Reduces CLS by matching the page layout structure
 */
import { memo } from "react";

export const RouteLoadingSkeleton = memo(() => (
  <div className="animate-pulse space-y-4 p-4 md:p-6" role="status" aria-label="Carregando página...">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-muted" />
        <div className="h-9 w-24 rounded-lg bg-muted" />
      </div>
    </div>
    {/* KPI cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-muted" />
      ))}
    </div>
    {/* Content skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 h-64 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
    </div>
    <span className="sr-only">Carregando...</span>
  </div>
));

RouteLoadingSkeleton.displayName = "RouteLoadingSkeleton";
