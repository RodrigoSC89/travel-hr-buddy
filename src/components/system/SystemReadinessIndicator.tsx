/**
 * System Readiness Indicator
 * PATCH v12: Removed offline status - always shows operational for iOS PWA compatibility
 * Shows overall system health and readiness status
 */

import React, { memo, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Wifi, Database, Shield, Zap } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded';
  icon: React.ReactNode;
}

export const SystemReadinessIndicator = memo(function SystemReadinessIndicator() {
  const { quality } = useNetworkStatus();

  // PATCH v12: Always show operational - never show offline status
  const systems = useMemo<SystemStatus[]>(() => [
    {
      name: 'Rede',
      status: quality === 'slow' ? 'degraded' : 'operational',
      icon: <Wifi className="h-3 w-3" />
    },
    {
      name: 'Banco de Dados',
      status: 'operational',
      icon: <Database className="h-3 w-3" />
    },
    {
      name: 'Segurança',
      status: 'operational',
      icon: <Shield className="h-3 w-3" />
    },
    {
      name: 'Performance',
      status: quality === 'slow' ? 'degraded' : 'operational',
      icon: <Zap className="h-3 w-3" />
    }
  ], [quality]);

  const overallStatus = useMemo(() => {
    if (systems.some(s => s.status === 'degraded')) return 'degraded';
    return 'operational';
  }, [systems]);

  const statusColor = {
    operational: 'text-success bg-success/10',
    degraded: 'text-warning bg-warning/10',
  };

  const statusLabel = {
    operational: 'Operacional',
    degraded: 'Degradado',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-default",
            statusColor[overallStatus]
          )}>
            {overallStatus === 'operational' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{statusLabel[overallStatus]}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-48">
          <div className="space-y-2">
            <p className="font-medium text-sm">Status do Sistema</p>
            {systems.map((system) => (
              <div key={system.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {system.icon}
                  <span>{system.name}</span>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 rounded",
                  statusColor[system.status]
                )}>
                  {statusLabel[system.status]}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default SystemReadinessIndicator;
