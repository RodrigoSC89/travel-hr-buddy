/**
 * CardV2 - Cards Padronizados V2
 * ETAPA 2: Componentes V2 - NÃO SUBSTITUI cards existentes
 */

import React, { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// ============= Stat Card V2 =============
export interface StatCardV2Props {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  onClick?: () => void;
}

export function StatCardV2({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
  onClick,
}: StatCardV2Props) {
  const variantStyles = {
    default: 'border-border/50',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={cn('flex items-center text-xs', trendColors[trend])}>
                <TrendIcon className="h-3 w-3 mr-0.5" />
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Content Card V2 =============
export interface ContentCardV2Props {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function ContentCardV2({
  title,
  description,
  children,
  footer,
  icon: Icon,
  actions,
  variant = 'default',
  className,
  headerClassName,
  contentClassName,
}: ContentCardV2Props) {
  const variantStyles = {
    default: 'border-border/50',
    elevated: 'border-border/50 shadow-lg',
    bordered: 'border-2 border-border',
    ghost: 'border-transparent bg-transparent shadow-none',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      {(title || description || actions) && (
        <CardHeader className={cn('flex flex-row items-start justify-between', headerClassName)}>
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              {title && <CardTitle className="text-base">{title}</CardTitle>}
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

// ============= Grid Card V2 =============
export interface GridCardV2Props {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GridCardV2({
  children,
  columns = 3,
  gap = 'md',
  className,
}: GridCardV2Props) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapStyles = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', columnStyles[columns], gapStyles[gap], className)}>
      {children}
    </div>
  );
}

export default { StatCardV2, ContentCardV2, GridCardV2 };
