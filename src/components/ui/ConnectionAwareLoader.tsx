/**
 * Connection-Aware Loader Component
 * PATCH v12: Removido bloqueio de offline - sempre mostra conteúdo
 */

import * as React from "react";
import { useConnectionAware } from '@/hooks/use-connection-aware';
import { Skeleton } from './skeleton';
import { Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionAwareLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  fallback?: React.ReactNode;
  showNetworkStatus?: boolean;
  className?: string;
}

export const ConnectionAwareLoader: React.FC<ConnectionAwareLoaderProps> = ({
  children,
  isLoading,
  fallback,
  showNetworkStatus = false,
  className
}) => {
  const { isSlowConnection, quality, shouldReduceData } = useConnectionAware();

  // PATCH v12: Removido bloqueio de isOffline - nunca mostrar "Sem Conexão"

  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        {fallback || <DefaultLoadingSkeleton />}
        {showNetworkStatus && isSlowConnection && (
          <NetworkQualityBadge quality={quality} />
        )}
      </div>
    );
  }

  return (
    <>
      {showNetworkStatus && shouldReduceData && (
        <NetworkQualityBadge quality={quality} />
      )}
      {children}
    </>
  );
};

const DefaultLoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid grid-cols-2 gap-4 mt-6">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  </div>
);

interface NetworkQualityBadgeProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
}

const NetworkQualityBadge: React.FC<NetworkQualityBadgeProps> = ({ quality }) => {
  const getIcon = () => {
    switch (quality) {
      case 'excellent':
        return <SignalHigh className="h-3 w-3" />;
      case 'good':
        return <SignalMedium className="h-3 w-3" />;
      case 'fair':
        return <SignalLow className="h-3 w-3" />;
      case 'poor':
      case 'offline':
        return <Signal className="h-3 w-3" />;
    }
  };

  const getColor = () => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return 'bg-success/10 text-success border-success/20';
      case 'fair':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'poor':
      case 'offline':
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getLabel = () => {
    switch (quality) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Boa';
      case 'fair':
        return 'Regular';
      case 'poor':
      case 'offline':
        return 'Lenta';
    }
  };

  if (quality === 'excellent' || quality === 'good') return null;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
      getColor()
    )}>
      {getIcon()}
      <span>Conexão {getLabel()}</span>
    </div>
  );
};

export { NetworkQualityBadge };
