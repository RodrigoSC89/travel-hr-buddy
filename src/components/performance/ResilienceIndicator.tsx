/**
 * Resilience Indicator Component - PATCH 900
 * Visual indicator for system resilience status
 */

import React from 'react';
import { useResilience } from '@/hooks/use-resilience';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Wifi,
  WifiOff,
  Database,
  AlertTriangle,
  CheckCircle,
  Cloud,
  CloudOff,
  HardDrive,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/offline/storage-quota';

interface ResilienceIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function ResilienceIndicator({
  compact = false,
  showDetails = true,
  className,
}: ResilienceIndicatorProps) {
  const { status, actions } = useResilience();

  const getStatusColor = () => {
    switch (status.healthStatus) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    if (status.healthStatus === 'critical') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (status.healthStatus === 'degraded') {
      return <Activity className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1', className)}>
              <div className={cn('h-2 w-2 rounded-full animate-pulse', getStatusColor())} />
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">Sistema: {status.healthStatus}</p>
              <p className="text-xs text-muted-foreground">
                Score: {status.healthScore}% | Sync: {status.pendingSync} pendente(s)
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('space-y-2 p-3 rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', getStatusColor())} />
          <span className="font-medium text-sm">
            Resiliência: {status.healthScore}%
          </span>
        </div>
        <Badge
          variant={
            status.healthStatus === 'healthy'
              ? 'default'
              : status.healthStatus === 'degraded'
              ? 'secondary'
              : 'destructive'
          }
        >
          {status.healthStatus === 'healthy' && 'Saudável'}
          {status.healthStatus === 'degraded' && 'Degradado'}
          {status.healthStatus === 'critical' && 'Crítico'}
        </Badge>
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Connection */}
          <div className="flex items-center gap-1.5">
            {status.isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
              {status.isOnline
                ? status.isSlowConnection
                  ? 'Lenta'
                  : 'Online'
                : 'Offline'}
            </span>
          </div>

          {/* Sync */}
          <div className="flex items-center gap-1.5">
            {status.isSyncing ? (
              <Cloud className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            ) : status.pendingSync > 0 ? (
              <CloudOff className="h-3.5 w-3.5 text-yellow-500" />
            ) : (
              <Cloud className="h-3.5 w-3.5 text-green-500" />
            )}
            <span>
              {status.isSyncing
                ? 'Sincronizando...'
                : `${status.pendingSync} pendente(s)`}
            </span>
          </div>

          {/* Storage */}
          {status.storageQuota && (
            <div className="flex items-center gap-1.5">
              <HardDrive
                className={cn(
                  'h-3.5 w-3.5',
                  status.isStorageLow ? 'text-yellow-500' : 'text-green-500'
                )}
              />
              <span className={status.isStorageLow ? 'text-yellow-600' : ''}>
                {formatBytes(status.storageQuota.usage)} / {formatBytes(status.storageQuota.quota)}
              </span>
            </div>
          )}

          {/* Circuits */}
          <div className="flex items-center gap-1.5">
            <Database
              className={cn(
                'h-3.5 w-3.5',
                status.hasOpenCircuit ? 'text-red-500' : 'text-green-500'
              )}
            />
            <span className={status.hasOpenCircuit ? 'text-red-600' : ''}>
              {status.hasOpenCircuit ? 'Circuit Aberto' : 'Circuits OK'}
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            status.healthStatus === 'healthy'
              ? 'bg-green-500'
              : status.healthStatus === 'degraded'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          )}
          style={{ width: `${status.healthScore}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Minimal badge version
 */
export function ResilienceBadge({ className }: { className?: string }) {
  const { status } = useResilience();

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        status.healthStatus === 'critical' && 'border-red-500 text-red-500',
        status.healthStatus === 'degraded' && 'border-yellow-500 text-yellow-500',
        className
      )}
    >
      <div
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status.healthStatus === 'healthy' && 'bg-green-500',
          status.healthStatus === 'degraded' && 'bg-yellow-500',
          status.healthStatus === 'critical' && 'bg-red-500'
        )}
      />
      {status.healthScore}%
    </Badge>
  );
}
