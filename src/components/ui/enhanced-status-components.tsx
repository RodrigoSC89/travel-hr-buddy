/**
 * @deprecated This file contains multiple deprecated components. 
 * Import individual components from their new locations:
 * - StatusBadge, StatusIndicator from '@/components/ui/StatusBadge'
 * - LoadingState from '@/components/ui/Loading'
 * - EmptyState from '@/components/ui/EmptyState'
 * - InfoCard from '@/components/ui/InfoCard'
 * - ActionButton: use Button from '@/components/ui/button' with loading prop instead
 * This file is kept for backward compatibility only.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Re-export from new unified components
export { StatusBadge, StatusIndicator, type StatusBadgeProps, type StatusIndicatorProps } from './StatusBadge';
export { Loading as LoadingState, type LoadingProps as LoadingStateProps } from './Loading';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { InfoCard, type InfoCardProps } from './InfoCard';

// ActionButton - kept here for backward compatibility, but use Button component with loading prop instead
export interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  variant = 'default',
  disabled = false,
  loading = false,
  className,
  ariaLabel
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled || loading}
      loading={loading}
      className={cn("min-h-10 px-4", className)}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
};