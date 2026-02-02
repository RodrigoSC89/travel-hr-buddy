/**
 * PageTemplate - Template Padrão para Páginas de Módulo
 * UX SYSTEM v1.0 - NAUTI ONE
 * 
 * Fornece estrutura consistente:
 * - Header com título, breadcrumbs e ações
 * - Body com filtros e conteúdo
 * - States: loading, error, empty
 * - Toast feedback automático
 */

import React from "react";
import { LucideIcon, RefreshCw, Plus, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export interface PageAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  loading?: boolean;
}

export interface PageTemplateProps {
  // Header
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  
  // Actions
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  
  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterable?: boolean;
  onFilter?: () => void;
  activeFilters?: number;
  
  // Refresh
  refreshable?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefresh?: Date;
  
  // Export
  exportable?: boolean;
  onExport?: () => void;
  
  // States
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  
  // Content
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

// Loading skeleton for page content
const PageLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-96 rounded-xl" />
  </div>
);

export const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = "secondary",
  primaryAction,
  secondaryActions = [],
  searchable = false,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  filterable = false,
  onFilter,
  activeFilters = 0,
  refreshable = true,
  onRefresh,
  isRefreshing = false,
  lastRefresh,
  exportable = false,
  onExport,
  isLoading = false,
  error,
  onRetry,
  isEmpty = false,
  emptyIcon,
  emptyTitle = "Nenhum item encontrado",
  emptyDescription = "Comece adicionando um novo item.",
  emptyActionLabel,
  onEmptyAction,
  children,
  className,
  contentClassName,
}) => {
  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <PageLoadingSkeleton />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          badge={badge}
          badgeVariant={badgeVariant}
        />
        <ErrorState
          error={error}
          onRetry={onRetry || onRefresh}
          className="py-16"
        />
      </div>
    );
  }

  // Render empty state
  if (isEmpty && !isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          badge={badge}
          badgeVariant={badgeVariant}
          actions={
            <>
              {refreshable && onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                  Atualizar
                </Button>
              )}
            </>
          }
        />
        <div className="bg-card rounded-xl border p-8">
          <EmptyState
            icon={emptyIcon || Icon || Plus}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel || primaryAction?.label}
            onAction={onEmptyAction || primaryAction?.onClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          badge={badge}
          badgeVariant={badgeVariant}
        />
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          {refreshable && onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              title={lastRefresh ? `Última atualização: ${lastRefresh.toLocaleTimeString()}` : "Atualizar"}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
          
          {/* Export */}
          {exportable && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
          
          {/* Secondary Actions */}
          {secondaryActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}
          
          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || "default"}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters Bar */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
          
          {filterable && onFilter && (
            <Button variant="outline" onClick={onFilter} className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFilters > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={cn("", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

// Sub-component for header
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant,
  actions,
}) => (
  <div className="flex items-start gap-4">
    {Icon && (
      <div className="p-3 rounded-xl bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold truncate">{title}</h1>
        {badge && (
          <Badge variant={badgeVariant}>{badge}</Badge>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    {actions}
  </div>
);

export default PageTemplate;
