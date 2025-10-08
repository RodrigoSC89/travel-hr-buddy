import React from 'react';
import { Loader2, Anchor, Ship, Waves } from 'lucide-react';

interface MaritimeLoadingProps {
  message?: string;
  variant?: 'default' | 'maritime' | 'offshore';
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Maritime-themed loading component with high visibility for offshore use
 */
export const MaritimeLoading: React.FC<MaritimeLoadingProps> = ({
  message = 'Carregando...',
  variant = 'default',
  size = 'md',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSize = {
    sm: 24,
    md: 32,
    lg: 48
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex items-center justify-center py-8';

  const getIcon = () => {
    switch (variant) {
      case 'maritime':
        return <Anchor className="animate-pulse text-blue-600" size={iconSize[size]} />;
      case 'offshore':
        return <Ship className="animate-bounce text-blue-700" size={iconSize[size]} />;
      default:
        return <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />;
    }
  };

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {getIcon()}
          {variant === 'offshore' && (
            <Waves className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-blue-400 animate-pulse" size={iconSize[size] / 2} />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 offshore-text">
            {message}
          </p>
          {variant === 'offshore' && (
            <p className="text-xs text-muted-foreground mt-1">
              Otimizado para uso offshore
            </p>
          )}
        </div>
        
        {/* Progress indicator for offshore */}
        {variant === 'offshore' && (
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        )}
      </div>
      
      {/* Screen reader only text */}
      <span className="sr-only">{message}</span>
    </div>
  );
};

/**
 * Skeleton loader for maritime cards
 */
export const MaritimeCardSkeleton: React.FC = () => {
  return (
    <div className="card-maritime p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-300 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-300 rounded w-24" />
        <div className="h-10 bg-gray-300 rounded w-24" />
      </div>
    </div>
  );
};

/**
 * Loading button state
 */
export const LoadingButton: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
  variant?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, loading, variant = 'default', className = '', onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`btn ${variant} ${className} min-h-[44px] relative`}
    >
      {loading && (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="sr-only">Carregando...</span>
        </>
      )}
      {children}
    </button>
  );
};

export default MaritimeLoading;
