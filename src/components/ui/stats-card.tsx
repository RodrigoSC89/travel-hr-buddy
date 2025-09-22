import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
  variant?: 'default' | 'ocean' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card border border-border',
  ocean: 'gradient-ocean text-white border-0',
  success: 'bg-success/10 border border-success/20',
  warning: 'bg-warning/10 border border-warning/20',
  danger: 'bg-danger/10 border border-danger/20',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  ocean: 'bg-white/20 text-white',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/20 text-danger',
};

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  className,
  variant = 'default'
}: StatsCardProps) => {
  return (
    <div className={cn(
      "p-6 rounded-xl shadow-wave transition-all duration-300 hover:shadow-nautical",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-lg",
          iconVariantStyles[variant]
        )}>
          <Icon size={24} />
        </div>
        {change && (
          <div className={cn(
            "flex items-center text-sm font-medium",
            change.type === 'increase' ? 'text-success' : 'text-danger',
            variant === 'ocean' && 'text-white/90'
          )}>
            <span className="mr-1">
              {change.type === 'increase' ? '↗' : '↘'}
            </span>
            {Math.abs(change.value)}%
          </div>
        )}
      </div>
      
      <div>
        <p className={cn(
          "text-3xl font-bold mb-1",
          variant === 'ocean' ? 'text-white' : 'text-foreground'
        )}>
          {value}
        </p>
        <p className={cn(
          "text-sm",
          variant === 'ocean' ? 'text-white/80' : 'text-muted-foreground'
        )}>
          {title}
        </p>
      </div>
    </div>
  );
};