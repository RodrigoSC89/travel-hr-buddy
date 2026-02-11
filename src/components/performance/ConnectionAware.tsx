/**
 * Connection-Aware Components - PATCH v12
 * PATCH v12: Removido navigator.onLine - sempre assume online
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';

// Connection types - removido 'offline' das opções
type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';
type EffectiveType = '4g' | '3g' | '2g' | 'slow-2g';

interface ConnectionInfo {
  isOnline: boolean;
  quality: ConnectionQuality;
  effectiveType?: EffectiveType;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface ConnectionContextValue extends ConnectionInfo {
  shouldReduceData: boolean;
  shouldDisableAnimations: boolean;
  shouldUseLowQuality: boolean;
  isSlowConnection: boolean;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

// Get connection info from Network Information API
// PATCH v12: Sempre retorna isOnline: true
function getConnectionInfo(): ConnectionInfo {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: EffectiveType;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const connection = nav.connection;

  // PATCH v12: Sempre online - nunca bloquear baseado em navigator.onLine
  if (!connection) {
    return { isOnline: true, quality: 'good' };
  }

  const { effectiveType, downlink, rtt, saveData } = connection;

  let quality: ConnectionQuality = 'good';

  if (effectiveType === '4g' && (rtt === undefined || rtt < 100)) {
    quality = 'excellent';
  } else if (effectiveType === '4g') {
    quality = rtt && rtt > 300 ? 'fair' : 'good';
  } else if (effectiveType === '3g') {
    quality = 'fair';
  } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
    quality = 'poor';
  }

  return {
    isOnline: true, // PATCH v12: Sempre true
    quality,
    effectiveType,
    downlink,
    rtt,
    saveData,
  };
}

// Provider component
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(getConnectionInfo);

  useEffect(() => {
    const updateConnection = () => {
      setConnectionInfo(getConnectionInfo());
    };

    // PATCH v12: Removido listeners de online/offline - não são confiáveis no iOS

    // Listen for connection changes only
    const nav = navigator as Navigator & {
      connection?: {
        addEventListener: (event: string, handler: () => void) => void;
        removeEventListener: (event: string, handler: () => void) => void;
      };
    };

    if (nav.connection) {
      nav.connection.addEventListener('change', updateConnection);
    }

    return () => {
      if (nav.connection) {
        nav.connection.removeEventListener('change', updateConnection);
      }
    };
  }, []);

  const value: ConnectionContextValue = {
    ...connectionInfo,
    shouldReduceData: connectionInfo.quality === 'poor' || connectionInfo.saveData || false,
    shouldDisableAnimations: connectionInfo.quality === 'poor',
    shouldUseLowQuality: connectionInfo.quality !== 'excellent' && connectionInfo.quality !== 'good',
    isSlowConnection: connectionInfo.quality === 'poor' || connectionInfo.quality === 'fair',
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

// Hook to use connection info
export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    // Return default values if not wrapped in provider
    return {
      isOnline: true, // PATCH v12: Sempre true
      quality: 'good' as ConnectionQuality,
      shouldReduceData: false,
      shouldDisableAnimations: false,
      shouldUseLowQuality: false,
      isSlowConnection: false,
    };
  }
  return context;
}

// Connection status indicator component
export function ConnectionIndicator({ 
  className,
  showLabel = false,
  size = 'sm',
}: { 
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { quality } = useConnection();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconClass = sizeClasses[size];

  const getIcon = () => {
    switch (quality) {
      case 'excellent':
        return <SignalHigh className={cn(iconClass, 'text-success')} />;
      case 'good':
        return <SignalMedium className={cn(iconClass, 'text-success/80')} />;
      case 'fair':
        return <SignalLow className={cn(iconClass, 'text-warning')} />;
      case 'poor':
        return <Signal className={cn(iconClass, 'text-warning')} />;
      default:
        return <Wifi className={cn(iconClass, 'text-muted-foreground')} />;
    }
  };

  const getLabel = () => {
    switch (quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'fair': return 'Regular';
      case 'poor': return 'Fraca';
      default: return 'Conectado';
    }
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {getIcon()}
      {showLabel && (
        <span className="text-xs text-muted-foreground">{getLabel()}</span>
      )}
    </div>
  );
}

// Offline banner component - PATCH v12: Nunca mostra "offline"
export function OfflineBanner({ className }: { className?: string }) {
  // PATCH v12: Nunca mostrar banner de offline
  return null;
}

// HOC for connection-aware components
export function withConnectionAware<P extends object>(
  Component: React.ComponentType<P & { connection: ConnectionContextValue }>,
  fallback?: React.ReactNode
) {
  return function ConnectionAwareComponent(props: P) {
    const connection = useConnection();
    // PATCH v12: Removido fallback para offline
    return <Component {...props} connection={connection} />;
  };
}

// Conditional rendering based on connection
export function ConnectionConditional({
  children,
  fallback,
  minQuality = 'poor',
}: {
  children: ReactNode;
  fallback?: ReactNode;
  minQuality?: ConnectionQuality;
}) {
  const { quality } = useConnection();

  const qualityOrder: ConnectionQuality[] = ['poor', 'fair', 'good', 'excellent'];
  const currentIndex = qualityOrder.indexOf(quality);
  const minIndex = qualityOrder.indexOf(minQuality);

  if (currentIndex < minIndex) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// Hook for adaptive data fetching
export function useAdaptiveFetch<T>(
  fetchFn: () => Promise<T>,
  options: {
    cacheKey?: string;
    staleTime?: number;
    onOffline?: () => T | null;
  } = {}
) {
  const { isSlowConnection } = useConnection();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  return {
    data,
    isLoading,
    error,
    fetch,
    isOnline: true, // PATCH v12: Sempre true
    isSlowConnection,
  };
}
