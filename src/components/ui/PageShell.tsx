/**
 * PageShell - Standardized page wrapper (Tier-1 UX)
 * 
 * Enforces consistent UX across ALL modules:
 * - Title + subtitle + breadcrumbs
 * - Action bar (Add, Import, Export, Refresh)
 * - Loading / Error / Empty states
 * - Last sync indicator
 * - Keyboard shortcuts hint
 * 
 * Inspired by: ServiceNow, SAP Fiori, Notion
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Download, Upload, RefreshCw, Search,
  AlertCircle, Inbox, ArrowLeft, ChevronRight, Wifi, WifiOff,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/* ─── Types ─── */

export interface PageAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  /** Only show on desktop */
  desktopOnly?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageShellProps {
  /** Page title (H1) */
  title: string;
  /** Brief description */
  subtitle?: string;
  /** Breadcrumb path */
  breadcrumbs?: BreadcrumbItem[];
  /** Primary actions (top-right) */
  actions?: PageAction[];
  /** Show search bar */
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Status badge */
  statusBadge?: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | string | null;
  onRetry?: () => void;
  /** Empty state (shown when no children and not loading) */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  /** Last sync time */
  lastSync?: Date;
  /** Online status */
  isOnline?: boolean;
  /** Children (page content) */
  children?: React.ReactNode;
  /** Additional class */
  className?: string;
  /** Help tooltip */
  helpText?: string;
}

/* ─── Loading skeleton ─── */

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

/* ─── Error state ─── */

function PageError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/* ─── Empty state ─── */

function PageEmpty({
  title = "Nenhum registro encontrado",
  description = "Comece criando o primeiro registro.",
  action,
}: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export function PageShell({
  title,
  subtitle,
  breadcrumbs,
  actions = [],
  searchable,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  statusBadge,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  lastSync,
  isOnline = true,
  children,
  className,
  helpText,
}: PageShellProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-6 p-4 md:p-6", className)}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, crumbIdx) => (
                <React.Fragment key={crumb.label}>
                  {crumbIdx > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumbIdx === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href || "#"}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Title block */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                {title}
              </h1>
              {statusBadge && (
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              )}
              {helpText && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Ajuda" title="Ajuda">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-sm">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {/* Sync info */}
            {(lastSync || !isOnline) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-success" />
                ) : (
                  <WifiOff className="h-3 w-3 text-destructive" />
                )}
                {lastSync && (
                  <span>
                    Última sync: {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {!isOnline && <span className="text-destructive">Offline</span>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-9 h-9 w-[200px] lg:w-[280px]"
                />
              </div>
            )}
            {actions.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className={cn(
                      "gap-2 h-9",
                      action.desktopOnly && "hidden sm:flex"
                    )}
                  >
                    {action.loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      action.icon
                    )}
                    <span className="hidden sm:inline">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                {action.tooltip && (
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Content area with states */}
        {isLoading ? (
          <PageSkeleton />
        ) : errorMessage ? (
          <PageError error={errorMessage} onRetry={onRetry} />
        ) : isEmpty ? (
          <PageEmpty
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        ) : (
          <div className="animate-fade-in">{children}</div>
        )}
      </div>
    </TooltipProvider>
  );
}

/* ─── Pre-built action factories ─── */

export const pageActions = {
  add: (onClick: () => void, label = "Adicionar"): PageAction => ({
    id: "add",
    label,
    icon: <Plus className="h-4 w-4" />,
    onClick,
    variant: "default",
    tooltip: `${label} novo registro`,
  }),
  export: (onClick: () => void, label = "Exportar"): PageAction => ({
    id: "export",
    label,
    icon: <Download className="h-4 w-4" />,
    onClick,
    variant: "outline",
    tooltip: "Exportar dados (CSV/Excel)",
  }),
  import: (onClick: () => void, label = "Importar"): PageAction => ({
    id: "import",
    label,
    icon: <Upload className="h-4 w-4" />,
    onClick,
    variant: "outline",
    tooltip: "Importar dados",
    desktopOnly: true,
  }),
  refresh: (onClick: () => void, loading = false): PageAction => ({
    id: "refresh",
    label: "Atualizar",
    icon: <RefreshCw className="h-4 w-4" />,
    onClick,
    variant: "ghost",
    loading,
    tooltip: "Atualizar dados",
  }),
};
