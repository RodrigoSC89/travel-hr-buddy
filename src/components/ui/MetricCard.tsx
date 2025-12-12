/**
 * MetricCard Component - PATCH 754
 * Enhanced with better contrast and accessibility
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
    type?: "increase" | "decrease";
  };
  variant?: "default" | "ocean" | "success" | "warning" | "danger";
  className?: string;
  iconClassName?: string;
  loading?: boolean;
}

// PATCH 754: Enhanced contrast styles
const variantStyles = {
  default: "bg-card border border-border/80 hover:shadow-md hover:border-border",
  ocean: "bg-gradient-ocean text-white border-0 hover:shadow-azure",
  success: "bg-success/15 border border-success/30 hover:shadow-lg hover:bg-success/20",
  warning: "bg-warning/15 border border-warning/30 hover:shadow-lg hover:bg-warning/20",
  danger: "bg-danger/15 border border-danger/30 hover:shadow-lg hover:bg-danger/20",
};

const iconVariantStyles = {
  default: "bg-primary/15 text-primary",
  ocean: "bg-white/20 text-white",
  success: "bg-success/25 text-success",
  warning: "bg-warning/25 text-warning",
  danger: "bg-danger/25 text-danger",
};

// PATCH 754: Improved text contrast
const valueVariantStyles = {
  default: "text-foreground font-bold",
  ocean: "text-white font-bold",
  success: "text-foreground font-bold",
  warning: "text-foreground font-bold",
  danger: "text-foreground font-bold",
};

const descriptionVariantStyles = {
  default: "text-foreground/70",
  ocean: "text-white/90",
  success: "text-foreground/70",
  warning: "text-foreground/70",
  danger: "text-foreground/70",
};

/**
 * Unified MetricCard/KPICard/StatsCard component
 * Consolidates kpi-cards.tsx, stats-card.tsx, and organization-stats-cards patterns
 * 
 * @example
 * // Basic usage
 * <MetricCard
 *   title="Total Users"
 *   value={150}
 *   icon={Users}
 *   description="Active users this month"
 * />
 * 
 * @example
 * // With trend
 * <MetricCard
 *   title="Revenue"
 *   value="$52,430"
 *   icon={DollarSign}
 *   trend={{ value: 12.5, isPositive: true, period: "last month" }}
 * />
 * 
 * @example
 * // Ocean variant
 * <MetricCard
 *   title="Fleet Status"
 *   value={24}
 *   icon={Ship}
 *   variant="ocean"
 *   trend={{ value: 8, isPositive: true }}
 * />
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className = "",
  iconClassName = ""
}) => {
  // For ocean variant, use a different layout
  if (variant === "ocean") {
    return (
      <div className={cn(
        "p-6 rounded-xl shadow-wave transition-all duration-300",
        variantStyles[variant],
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            iconVariantStyles[variant],
            iconClassName
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              trend.isPositive || trend.type === "increase" ? "text-azure-50/90" : "text-red-200",
            )}>
              <span className="mr-1">
                {(trend.isPositive || trend.type === "increase") ? "↗" : "↘"}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        <div>
          <p className={cn(
            "text-3xl font-bold mb-1",
            valueVariantStyles[variant]
          )}>
            {value}
          </p>
          <p className={cn(
            "text-sm",
            descriptionVariantStyles[variant]
          )}>
            {title}
          </p>
          {description && (
            <p className={cn(
              "text-xs mt-1",
              descriptionVariantStyles[variant]
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Standard Card variant
  return (
    <Card className={cn(
      "transition-all duration-200",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          valueVariantStyles[variant]
        )}>
          {value}
        </div>
        {description && (
          <p className={cn(
            "text-xs mt-1",
            descriptionVariantStyles[variant]
          )}>
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span 
              className={cn(
                "text-xs font-medium",
                trend.isPositive || trend.type === "increase" 
                  ? "text-success" 
                  : "text-destructive"
              )}
            >
              {(trend.isPositive || trend.type === "increase") ? "+" : ""}{trend.value}%
            </span>
            {trend.period && (
              <span className="text-xs text-muted-foreground ml-1">
                vs {trend.period}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export aliases for backward compatibility
export const KPICard = MetricCard;
export const StatsCard = MetricCard;

export default MetricCard;
