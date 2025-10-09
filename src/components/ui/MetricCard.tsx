import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
    type?: 'increase' | 'decrease';
  };
  variant?: 'default' | 'ocean' | 'success' | 'warning' | 'danger';
  className?: string;
  iconClassName?: string;
}

const variantStyles = {
  default: 'bg-card border border-border hover:shadow-md',
  ocean: 'gradient-ocean text-azure-50 border-0 hover:shadow-nautical',
  success: 'bg-success/10 border border-success/20 hover:shadow-lg',
  warning: 'bg-warning/10 border border-warning/20 hover:shadow-lg',
  danger: 'bg-danger/10 border border-danger/20 hover:shadow-lg',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  ocean: 'bg-azure-100/20 text-azure-50',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/20 text-danger',
};

const valueVariantStyles = {
  default: 'text-foreground',
  ocean: 'text-azure-50',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-danger-foreground',
};

const descriptionVariantStyles = {
  default: 'text-muted-foreground',
  ocean: 'text-azure-50/80',
  success: 'text-success-foreground/80',
  warning: 'text-warning-foreground/80',
  danger: 'text-danger-foreground/80',
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
  variant = 'default',
  className = '',
  iconClassName = ''
}) => {
  // For ocean variant, use a different layout
  if (variant === 'ocean') {
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
              trend.isPositive || trend.type === 'increase' ? 'text-azure-50/90' : 'text-red-200',
            )}>
              <span className="mr-1">
                {(trend.isPositive || trend.type === 'increase') ? '↗' : '↘'}
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
                trend.isPositive || trend.type === 'increase' 
                  ? 'text-success' 
                  : 'text-destructive'
              )}
            >
              {(trend.isPositive || trend.type === 'increase') ? '+' : ''}{trend.value}%
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
