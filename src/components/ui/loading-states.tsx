import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

/**
 * Loading spinner com tamanhos configuráveis
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

/**
 * Overlay de loading que cobre o conteúdo
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Carregando...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton loader para placeholders
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-md bg-muted',
            className
          )}
        />
      ))}
    </>
  );
};

interface LoadingCardProps {
  rows?: number;
}

/**
 * Card skeleton com múltiplas linhas
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({ rows = 3 }) => {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Button com estado de loading
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ isLoading = false, children, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

/**
 * Barra de progresso
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showPercentage = true,
  className,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-primary">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
