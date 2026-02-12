/**
 * UX States Components - P1 IMPLEMENTATION
 * Padronização de estados de UI para todo o sistema
 * 
 * - LoadingState: Skeleton loading
 * - ErrorState: Error with retry
 * - EmptyState: Empty with CTA
 * - SuccessState: Success feedback
 */

import React from 'react';
import { AlertCircle, RefreshCw, Inbox, CheckCircle2, Loader2, FileX, Database, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============ LOADING STATE ============

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'skeleton' | 'spinner' | 'dots';
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  variant = 'skeleton',
  rows = 3,
  className,
}) => {
  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={`dot-${i}`}
              className="h-3 w-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`ux-skeleton-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
};

// ============ ERROR STATE ============

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'default' | 'network' | 'database' | 'permission';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erro ao carregar dados',
  message,
  error,
  onRetry,
  retryLabel = 'Tentar novamente',
  variant = 'default',
  className,
}) => {
  const errorMessage = message || (typeof error === 'string' ? error : error?.message);
  
  const IconMap = {
    default: AlertCircle,
    network: Wifi,
    database: Database,
    permission: AlertCircle,
  };
  
  const Icon = IconMap[variant];

  return (
    <Card className={cn('border-destructive/50 bg-destructive/5', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-destructive/10 p-3">
          <Icon className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
        {errorMessage && (
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            {errorMessage}
          </p>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-6">
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// ============ EMPTY STATE ============

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'filter' | 'data';
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: CustomIcon,
  title = 'Nenhum dado encontrado',
  message = 'Não há registros para exibir.',
  actionLabel,
  onAction,
  variant = 'default',
  className,
  children,
}) => {
  const IconMap = {
    default: Inbox,
    search: FileX,
    filter: FileX,
    data: Database,
  };
  
  const Icon = CustomIcon || IconMap[variant];

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          {message}
        </p>
        {(actionLabel && onAction) && (
          <Button onClick={onAction} className="mt-6">
            {actionLabel}
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

// ============ SUCCESS STATE ============

interface SuccessStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'Operação concluída!',
  message,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full bg-primary/10 p-3">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-primary">{title}</h3>
        {message && (
          <p className="mt-2 text-sm text-primary/80 text-center max-w-md">
            {message}
          </p>
        )}
        {(actionLabel && onAction) && (
          <Button onClick={onAction} variant="outline" className="mt-6 border-primary/30">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// ============ DATA STATE WRAPPER ============

interface DataStateWrapperProps<T> {
  data: T | null | undefined;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
  loadingRows?: number;
  children: (data: T) => React.ReactNode;
  className?: string;
}

export function DataStateWrapper<T>({
  data,
  isLoading,
  error,
  onRetry,
  emptyTitle,
  emptyMessage,
  emptyAction,
  loadingRows = 5,
  children,
  className,
}: DataStateWrapperProps<T>) {
  if (isLoading) {
    return <LoadingState rows={loadingRows} className={className} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  // Check if data is empty (array or null/undefined)
  const isEmpty = data === null || data === undefined || 
    (Array.isArray(data) && data.length === 0);

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
        className={className}
      />
    );
  }

  return <>{children(data)}</>;
}

export default DataStateWrapper;
