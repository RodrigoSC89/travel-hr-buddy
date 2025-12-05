/**
 * Resilience Indicator Component - PATCH 901
 * Visual indicator for system resilience status
 * Uses semantic design tokens
 */

import React, { useCallback } from 'react';
import { useResilience } from '@/hooks/use-resilience';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/offline/storage-quota';

interface ResilienceIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ResilienceIndicator({
  compact = false,
  showDetails = true,
  showActions = false,
  className,
}: ResilienceIndicatorProps) {
  const { status, actions } = useResilience();

  const getStatusColor = useCallback(() => {
    switch (status.healthStatus) {
      case 'healthy':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  }, [status.healthStatus]);

  const getStatusIcon = useCallback(() => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-destructive" />;
    }
    if (status.healthStatus === 'critical') {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (status.healthStatus === 'degraded') {
      return <Activity className="h-4 w-4 text-amber-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  }, [status.isOnline, status.healthStatus]);

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
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className={status.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
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
              <Cloud className="h-3.5 w-3.5 text-primary animate-pulse" />
            ) : status.pendingSync > 0 ? (
              <CloudOff className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Cloud className="h-3.5 w-3.5 text-emerald-500" />
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
                  status.isStorageLow ? 'text-amber-500' : 'text-emerald-500'
                )}
              />
              <span className={status.isStorageLow ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>
                {formatBytes(status.storageQuota.usage)} / {formatBytes(status.storageQuota.quota)}
              </span>
            </div>
          )}

          {/* Circuits */}
          <div className="flex items-center gap-1.5">
            <Database
              className={cn(
                'h-3.5 w-3.5',
                status.hasOpenCircuit ? 'text-destructive' : 'text-emerald-500'
              )}
            />
            <span className={status.hasOpenCircuit ? 'text-destructive' : 'text-muted-foreground'}>
              {status.hasOpenCircuit ? 'Circuit Aberto' : 'Circuits OK'}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.forceSyncNow}
            disabled={!status.isOnline || status.isSyncing}
            className="flex-1 h-7 text-xs"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', status.isSyncing && 'animate-spin')} />
            Sincronizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={actions.clearStorage}
            className="h-7 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            status.healthStatus === 'healthy'
              ? 'bg-emerald-500'
              : status.healthStatus === 'degraded'
              ? 'bg-amber-500'
              : 'bg-destructive'
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
        status.healthStatus === 'critical' && 'border-destructive text-destructive',
        status.healthStatus === 'degraded' && 'border-amber-500 text-amber-500',
        className
      )}
    >
      <div
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status.healthStatus === 'healthy' && 'bg-emerald-500',
          status.healthStatus === 'degraded' && 'bg-amber-500',
          status.healthStatus === 'critical' && 'bg-destructive'
        )}
      />
      {status.healthScore}%
    </Badge>
  );
}
