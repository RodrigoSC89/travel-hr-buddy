/**
 * System Status Indicator - PATCH 750
 * Visual indicator of system health
 */

import { memo } from 'react';
import { useSystemHealth, getHealthColor, formatBytes, formatMs } from '@/hooks/use-system-health';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const SystemStatusIndicator = memo(function SystemStatusIndicator({
  showDetails = false,
  className
}: SystemStatusIndicatorProps) {
  const health = useSystemHealth();

  const StatusIcon = health.isHealthy ? CheckCircle : AlertTriangle;
  const ConnectionIcon = health.connection.type === 'unknown' || !navigator.onLine ? WifiOff : Wifi;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            <div className="relative">
              <Activity className={cn(
                'h-4 w-4 transition-colors',
                getHealthColor(health.isHealthy, health.issues)
              )} />
              {!health.isHealthy && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            
            {showDetails && (
              <span className={cn(
                'text-xs font-medium',
                getHealthColor(health.isHealthy, health.issues)
              )}>
                {health.isHealthy ? 'Sistema OK' : `${health.issues.length} alertas`}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-72 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Status do Sistema</span>
              <StatusIcon className={cn(
                'h-5 w-5',
                health.isHealthy ? 'text-green-500' : 'text-yellow-500'
              )} />
            </div>

            {/* Connection */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ConnectionIcon className="h-4 w-4 text-muted-foreground" />
                <span>Conexão</span>
              </div>
              <span className="font-medium uppercase">
                {health.connection.type}
                {health.connection.saveData && ' (Eco)'}
              </span>
            </div>

            {/* Memory */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Memória</span>
                <span className="font-medium">
                  {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all rounded-full',
                    health.memory.percentage > 80 ? 'bg-red-500' :
                    health.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                  style={{ width: `${health.memory.percentage}%` }}
                />
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">FCP:</span>
                <span>{formatMs(health.performance.fcp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LCP:</span>
                <span>{formatMs(health.performance.lcp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FID:</span>
                <span>{formatMs(health.performance.fid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CLS:</span>
                <span>{health.performance.cls?.toFixed(3) || 'N/A'}</span>
              </div>
            </div>

            {/* Issues */}
            {health.issues.length > 0 && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-medium text-yellow-600">Alertas:</span>
                <ul className="mt-1 space-y-1">
                  {health.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-yellow-500">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default SystemStatusIndicator;
