/**
 * ConnectionStatusBadge - Visual indicator for connection quality
 * PATCH v12: Removed offline status - always shows connected for iOS PWA compatibility
 * Optimized for maritime environments
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, Satellite, Signal, SignalLow, SignalMedium, SignalHigh, RefreshCw, Clock } from 'lucide-react';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { cn } from '@/lib/utils';

interface ConnectionStatusBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatusBadge({ showDetails = true, className }: ConnectionStatusBadgeProps) {
  const {
    connectionQuality,
    isMaritime,
    pendingCount,
    isSyncing,
    estimatedSyncSeconds,
    triggerSync,
  } = useOfflineSync();

  // PATCH v12: Always show connected status
  const getConnectionIcon = () => {
    if (isMaritime) return <Satellite className="h-4 w-4" />;
    
    const effectiveType = connectionQuality?.effectiveType;
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return <SignalLow className="h-4 w-4" />;
      case '3g':
        return <SignalMedium className="h-4 w-4" />;
      case '4g':
        return <SignalHigh className="h-4 w-4" />;
      default:
        return <Signal className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (isMaritime) return 'bg-amber-500 text-white';
    
    const effectiveType = connectionQuality?.effectiveType;
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'bg-orange-500 text-white';
      case '3g':
        return 'bg-yellow-500 text-black';
      case '4g':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = () => {
    if (isMaritime) return 'Satélite';
    
    const effectiveType = connectionQuality?.effectiveType;
    switch (effectiveType) {
      case 'slow-2g':
        return 'Muito Lento';
      case '2g':
        return '2G';
      case '3g':
        return '3G';
      case '4g':
        return '4G/LTE';
      default:
        return 'Conectado';
    }
  };

  const formatSyncTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                'flex items-center gap-1.5 cursor-default transition-colors',
                getStatusColor()
              )}
            >
              {getConnectionIcon()}
              <span className="text-xs font-medium">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2 text-sm">
              <p className="font-medium">Conectado</p>
              {connectionQuality && (
                <>
                  <p>Velocidade: {connectionQuality.downlink.toFixed(1)} Mbps</p>
                  <p>Latência: {connectionQuality.rtt}ms</p>
                  {isMaritime && (
                    <p className="text-amber-400">
                      ⚠️ Conexão via satélite detectada. Modo otimizado ativado.
                    </p>
                  )}
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {showDetails && pendingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1.5 cursor-pointer hover:bg-accent"
                onClick={() => !isSyncing && triggerSync()}
              >
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                </span>
                {estimatedSyncSeconds > 0 && (
                  <span className="text-xs text-muted-foreground">
                    (~{formatSyncTime(estimatedSyncSeconds)})
                  </span>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isSyncing 
                  ? 'Sincronizando...' 
                  : 'Clique para sincronizar agora'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
