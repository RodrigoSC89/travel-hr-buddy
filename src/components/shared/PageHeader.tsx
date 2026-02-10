/**
 * NAUTI ONE — PageHeader Component
 * Premium page header with title, description, and action bar
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  emoji,
  title,
  description,
  badge,
  badgeVariant = 'secondary',
  actions,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 pb-6 animate-fade-in ${className}`} data-testid="page-header">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {emoji && <span className="text-2xl">{emoji}</span>}
          {Icon && !emoji && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              {badge && <Badge variant={badgeVariant} className="text-[10px] font-semibold">{badge}</Badge>}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0" data-testid="page-header-actions">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
