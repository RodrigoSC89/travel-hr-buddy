/**
 * Quick Stats Component
 * Displays key metrics in a compact format
 */

import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

interface QuickStatsProps {
  stats: StatItem[];
  className?: string;
  compact?: boolean;
}

export const QuickStats = memo(function QuickStats({
  stats,
  className,
  compact = false
}: QuickStatsProps) {
  const getTrendIcon = (change?: number) => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-success" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = (change?: number) => {
    if (change === undefined) return '';
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <span className="text-muted-foreground">{stat.label}:</span>
            <span className="font-medium">{stat.value}</span>
            {stat.change !== undefined && (
              <span className={cn("flex items-center gap-0.5", getTrendColor(stat.change))}>
                {getTrendIcon(stat.change)}
                <span className="text-xs">{Math.abs(stat.change)}%</span>
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      stats.length <= 2 ? "grid-cols-2" : 
      stats.length === 3 ? "grid-cols-3" : 
      "grid-cols-2 sm:grid-cols-4",
      className
    )}>
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="bg-card border border-border rounded-lg p-3 space-y-1"
        >
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold">{stat.value}</span>
            {stat.change !== undefined && (
              <div className={cn("flex items-center gap-0.5 text-xs", getTrendColor(stat.change))}>
                {getTrendIcon(stat.change)}
                <span>{stat.change > 0 ? '+' : ''}{stat.change}%</span>
              </div>
            )}
          </div>
          {stat.changeLabel && (
            <p className="text-xs text-muted-foreground">{stat.changeLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
});

export default QuickStats;
