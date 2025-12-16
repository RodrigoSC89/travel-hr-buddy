/**
 * System Health Indicator
 * PATCH 833: Compact system status display
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Wifi, 
  WifiOff,
  Database,
  Server,
  Clock
} from 'lucide-react';
import { usePWA } from '@/lib/pwa/service-worker-registration';
import { useWebVitals } from '@/lib/performance/web-vitals-monitor';

interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  realtime: 'connected' | 'disconnected';
}

interface SystemHealthIndicatorProps {
  status?: SystemStatus;
  compact?: boolean;
}

export function SystemHealthIndicator({ 
  status = { api: 'healthy', database: 'healthy', realtime: 'connected' },
  compact = true 
}: SystemHealthIndicatorProps) {
  const { isOffline } = usePWA();
  const { score } = useWebVitals();

  const getOverallStatus = () => {
    if (isOffline) return 'offline';
    if (status.api === 'down' || status.database === 'down') return 'critical';
    if (status.api === 'degraded' || status.database === 'degraded') return 'warning';
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    healthy: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Todos os sistemas operacionais',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Alguns serviços degradados',
    },
    critical: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Problemas detectados',
    },
    offline: {
      icon: WifiOff,
      color: 'text-gray-500',
      bg: 'bg-gray-500/10',
      label: 'Modo offline',
    },
  };

  const config = statusConfig[overallStatus];
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>
                {isOffline ? 'Offline' : score > 0 ? `${score}%` : 'OK'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="w-64">
            <div className="space-y-2">
              <p className="font-medium">{config.label}</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Server className="h-3 w-3" /> API
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {status.api}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" /> Database
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {status.database}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Realtime
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {status.realtime}
                  </Badge>
                </div>
                {score > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Performance
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {score}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${config.bg} space-y-2`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className="font-medium">{config.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <span>API: {status.api}</span>
        </div>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span>DB: {status.database}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-muted-foreground" />
          <span>RT: {status.realtime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Perf: {score}%</span>
        </div>
      </div>
    </div>
  );
}
