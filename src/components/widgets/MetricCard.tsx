/**
 * Metric Card Component
 * Displays a single metric with optional trend and sparkline
 */

import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  sparklineData?: number[];
  className?: string;
  variant?: 'default' | 'compact' | 'highlighted';
  status?: 'success' | 'warning' | 'error' | 'neutral';
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  sparklineData,
  className,
  variant = 'default',
  status = 'neutral'
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-muted-foreground';
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const statusColors = {
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    error: 'border-l-4 border-l-red-500',
    neutral: ''
  };

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-card border",
        statusColors[status],
        className
      )}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{value}</span>
          {trend !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-xs", getTrendColor())}>
              {getTrendIcon()}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      statusColors[status],
      variant === 'highlighted' && 'bg-primary/5 border-primary/20',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        {(trend !== undefined || sparklineData) && (
          <div className="mt-3 flex items-center justify-between">
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                {getTrendIcon()}
                <span>{trend > 0 ? '+' : ''}{trend}%</span>
                {trendLabel && (
                  <span className="text-muted-foreground text-xs ml-1">
                    {trendLabel}
                  </span>
                )}
              </div>
            )}
            
            {sparklineData && sparklineData.length > 1 && (
              <Sparkline data={sparklineData} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Simple sparkline component
const Sparkline = memo(function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const width = 60;
  const height = 20;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' L');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={`M${points}`}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export default MetricCard;
