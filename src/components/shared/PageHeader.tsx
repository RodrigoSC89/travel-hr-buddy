/**
 * NAUTI ONE — PageHeader Component
 * Consistent page header with title, description, and action bar
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
    <div className={`flex flex-col gap-4 pb-4 ${className}`} data-testid="page-header">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {emoji && <span className="text-2xl">{emoji}</span>}
          {Icon && !emoji && <Icon className="h-6 w-6 text-primary" />}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
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
