/**
 * NAUTI ONE — EmptyState Component
 * Consistent empty state across all modules
 */

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`} data-testid="empty-state">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="empty-state-action">
          {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
