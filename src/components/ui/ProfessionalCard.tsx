/**
 * Professional Card Components
 * Enterprise-grade cards with consistent styling
 */

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ============================================
// METRIC CARD - Para métricas e KPIs
// ============================================

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
  variant?: "green" | "blue" | "purple" | "orange" | "default";
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  icon: Icon,
  variant = "default",
  className
}) => {
  const variantClasses = {
    green: "card-metric--green",
    blue: "card-metric--blue",
    purple: "card-metric--purple",
    orange: "card-metric--orange",
    default: "bg-card border-border"
  };

  return (
    <div className={cn(
      "card-metric",
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="card-metric__label text-label mb-2">{label}</p>
          <p className="card-metric__value text-metric">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                change.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {change.value >= 0 ? "+" : ""}{change.value}%
              </span>
              {change.label && (
                <span className="text-xs text-muted-foreground">{change.label}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-background/50">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// PROFESSIONAL CARD - Card base profissional
// ============================================

interface ProfessionalCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  elevated?: boolean;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  title,
  subtitle,
  action,
  className,
  padding = "md",
  elevated = false
}) => {
  const paddingClasses = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6"
  };

  return (
    <div className={cn(
      "card-professional",
      paddingClasses[padding],
      elevated && "shadow-elevated",
      className
    )}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-heading text-base text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

// ============================================
// STATUS BADGE - Badges de status
// ============================================

interface StatusBadgeProps {
  status: "success" | "warning" | "danger" | "info" | "neutral";
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  dot = true,
  className
}) => {
  const statusClasses = {
    success: "status-badge--success",
    warning: "status-badge--warning",
    danger: "status-badge--danger",
    info: "status-badge--info",
    neutral: "bg-muted text-muted-foreground"
  };

  return (
    <span className={cn("status-badge", statusClasses[status], className)}>
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "success" && "bg-green-500",
          status === "warning" && "bg-amber-500",
          status === "danger" && "bg-red-500",
          status === "info" && "bg-cyan-500",
          status === "neutral" && "bg-gray-500"
        )} />
      )}
      {children}
    </span>
  );
};

// ============================================
// MODULE HEADER - Cabeçalho de módulos
// ============================================

interface ModuleHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  description,
  action,
  breadcrumb,
  className
}) => {
  return (
    <div className={cn("module-header", className)}>
      <div>
        {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
        <h1 className="module-header__title">{title}</h1>
        {description && (
          <p className="module-header__description">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
});

// ============================================
// EMPTY STATE - Estado vazio profissional
// ============================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("empty-state", className)}>
      {Icon && <Icon className="empty-state__icon" />}
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
});

// ============================================
// STAT GRID - Grid de estatísticas
// ============================================

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({
  children,
  columns = 4,
  className
}) => {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
});

// ============================================
// DIVIDER - Divisor profissional
// ============================================

interface DividerProps {
  className?: string;
  subtle?: boolean;
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  className,
  subtle = false,
  label
}) => {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4 my-6", className)}>
        <div className={cn("flex-1 h-px", subtle ? "bg-border/50" : "bg-border")} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={cn("flex-1 h-px", subtle ? "bg-border/50" : "bg-border")} />
      </div>
    );
  }

  return (
    <div className={cn(
      "divider",
      subtle && "divider--subtle",
      className
    )} />
  );
});

// ============================================
// CHART CONTAINER - Container para gráficos
// ============================================

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  action,
  children,
  className
}) => {
  return (
    <div className={cn("chart-container", className)}>
      <div className="chart-container__header">
        <div>
          <h3 className="chart-container__title">{title}</h3>
          {subtitle && (
            <p className="chart-container__subtitle">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
});

export default {
  MetricCard,
  ProfessionalCard,
  StatusBadge,
  ModuleHeader,
  EmptyState,
  StatGrid,
  Divider,
  ChartContainer
};
