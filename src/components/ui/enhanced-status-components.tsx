import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getStatusColor, getStatusDot, getPriorityColor, getVesselStatusColor } from '@/lib/status-utils';

// Enhanced Status Badge with semantic colors
interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'priority' | 'vessel';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'default', 
  className 
}) => {
  const getColorClass = () => {
    switch (type) {
      case 'priority':
        return getPriorityColor(status);
      case 'vessel':
        return getVesselStatusColor(status);
      default:
        return getStatusColor(status);
    }
  };

  return (
    <Badge 
      className={cn(getColorClass(), className)}
      variant="secondary"
    >
      {status}
    </Badge>
  );
};

// Enhanced Status Indicator with dot
interface StatusIndicatorProps {
  status: string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showDot = true,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showDot && (
        <div className={cn("w-2 h-2 rounded-full", getStatusDot(status))} />
      )}
      <span className="text-sm font-medium">
        {label || status}
      </span>
    </div>
  );
};

// Enhanced Action Button with proper accessibility
interface ActionButtonProps {
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
      className={cn("min-h-10 px-4", className)}
      aria-label={ariaLabel}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Enhanced Information Card with proper contrast
interface InfoCardProps {
  title: string;
  description?: string;
  status?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  status,
  children,
  variant = 'default',
  className
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'border-success/50 bg-success/5';
      case 'warning':
        return 'border-warning/50 bg-warning/5';
      case 'error':
        return 'border-destructive/50 bg-destructive/5';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <Card className={cn(getVariantClasses(), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {status && <StatusBadge status={status} />}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// Enhanced Loading State Component
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center gap-3 p-4", className)}>
      <div 
        className={cn(
          "border-2 border-primary border-t-transparent rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};

// Enhanced Empty State Component
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {icon && (
        <div className="mb-4 p-3 rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <ActionButton
          onClick={action.onClick}
          variant="default"
          ariaLabel={action.label}
        >
          {action.label}
        </ActionButton>
      )}
    </div>
  );
};