/**
 * Connection-Aware Loader Component
 * Shows appropriate loading states based on network quality
 */

import React from 'react';
import { useConnectionAware } from '@/hooks/use-connection-aware';
import { Skeleton } from './skeleton';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
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
  const { isSlowConnection, isOffline, quality, shouldReduceData } = useConnectionAware();

  if (isOffline) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Sem Conexão</h3>
        <p className="text-sm text-muted-foreground">
          Verifique sua conexão com a internet e tente novamente.
        </p>
      </div>
    );
  }

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
        return <Signal className="h-3 w-3" />;
      case 'offline':
        return <WifiOff className="h-3 w-3" />;
    }
  };

  const getColor = () => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'fair':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'poor':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'offline':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
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
        return 'Lenta';
      case 'offline':
        return 'Offline';
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
