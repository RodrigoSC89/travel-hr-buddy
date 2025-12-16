/**
 * Professional Skeleton Loaders
 * PATCH 753 - Otimizado para conexões lentas
 */

import React from "react";
import { cn } from "@/lib/utils";

// Base Skeleton com animação suave
export const SkeletonBase = React.memo(({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted/50",
      className
    )}
    {...props}
  />
));
SkeletonBase.displayName = "SkeletonBase";

// Skeleton para Cards de Métricas
export const SkeletonMetricCard = React.memo(() => (
  <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-4 w-24" />
      <SkeletonBase className="h-8 w-8 rounded-lg" />
    </div>
    <SkeletonBase className="h-8 w-32" />
    <SkeletonBase className="h-3 w-20" />
  </div>
));
SkeletonMetricCard.displayName = "SkeletonMetricCard";

// Skeleton para Tabelas
export const SkeletonTable = React.memo(({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
    {/* Header */}
    <div className="border-b border-border/50 bg-muted/30 p-4">
      <div className="flex gap-4">
        <SkeletonBase className="h-4 w-32" />
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-4 w-28" />
        <SkeletonBase className="h-4 w-20" />
      </div>
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="border-b border-border/30 p-4 last:border-0">
        <div className="flex gap-4 items-center">
          <SkeletonBase className="h-4 w-32" />
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-4 w-28" />
          <SkeletonBase className="h-6 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
));
SkeletonTable.displayName = "SkeletonTable";

// Skeleton para Charts
export const SkeletonChart = React.memo(({ height = 200 }: { height?: number }) => (
  <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-5 w-40" />
      <SkeletonBase className="h-8 w-24 rounded-lg" />
    </div>
    <SkeletonBase className="w-full rounded-lg" style={{ height }} />
  </div>
));
SkeletonChart.displayName = "SkeletonChart";

// Skeleton para Lista de Items
export const SkeletonList = React.memo(({ items = 4 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/30 bg-card">
        <SkeletonBase className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
        <SkeletonBase className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
));
SkeletonList.displayName = "SkeletonList";

// Skeleton para Dashboard completo
export const SkeletonDashboard = React.memo(() => (
  <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonBase className="h-8 w-48" />
        <SkeletonBase className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <SkeletonBase className="h-10 w-32 rounded-lg" />
        <SkeletonBase className="h-10 w-10 rounded-lg" />
      </div>
    </div>
    
    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>
    
    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart height={250} />
      <SkeletonChart height={250} />
    </div>
    
    {/* Table */}
    <SkeletonTable rows={5} />
  </div>
));
SkeletonDashboard.displayName = "SkeletonDashboard";

// Skeleton para Módulos
export const SkeletonModule = React.memo(() => (
  <div className="space-y-6 p-6">
    {/* Module Header */}
    <div className="flex items-center gap-4">
      <SkeletonBase className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-48" />
        <SkeletonBase className="h-4 w-32" />
      </div>
    </div>
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>
    
    {/* Main Content */}
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
      <SkeletonBase className="h-5 w-40" />
      <SkeletonList items={4} />
    </div>
  </div>
));
SkeletonModule.displayName = "SkeletonModule";

// Skeleton para Sidebar
export const SkeletonSidebar = React.memo(() => (
  <div className="w-64 h-full bg-card border-r border-border/50 p-4 space-y-4">
    {/* Logo */}
    <div className="flex items-center gap-3 p-2">
      <SkeletonBase className="h-8 w-8 rounded-lg" />
      <SkeletonBase className="h-5 w-24" />
    </div>
    
    {/* Nav Items */}
    <div className="space-y-2 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <SkeletonBase className="h-5 w-5 rounded" />
          <SkeletonBase className="h-4 w-28" />
        </div>
      ))}
    </div>
  </div>
));
SkeletonSidebar.displayName = "SkeletonSidebar";

// Skeleton para Formulários
export const SkeletonForm = React.memo(({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-6 p-6 rounded-xl border border-border/50 bg-card">
    <SkeletonBase className="h-6 w-48" />
    
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
    
    <div className="flex gap-3 pt-4">
      <SkeletonBase className="h-10 w-24 rounded-lg" />
      <SkeletonBase className="h-10 w-24 rounded-lg" />
    </div>
  </div>
));
SkeletonForm.displayName = "SkeletonForm";

// Connection-Aware Loading Message
export const ConnectionAwareLoader = React.memo(({ 
  isSlowConnection = false,
  message = "Carregando..."
}: { 
  isSlowConnection?: boolean;
  message?: string;
}) => (
  <div className="flex flex-col items-center justify-center gap-4 p-8">
    <div className="relative">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
    {isSlowConnection && (
      <p className="text-xs text-muted-foreground/70 max-w-xs text-center">
        Conexão lenta detectada. Os dados estão sendo carregados de forma otimizada.
      </p>
    )}
  </div>
));
ConnectionAwareLoader.displayName = "ConnectionAwareLoader";
