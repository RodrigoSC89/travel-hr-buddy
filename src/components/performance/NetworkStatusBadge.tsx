/**
 * Network Status Badge - PATCH 950
 * Visual indicator for network quality with detailed tooltip
 */

import React, { memo } from 'react';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh, Zap, Battery } from 'lucide-react';
import { useNetworkQuality, NetworkQuality } from '@/lib/performance/network-quality-monitor';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface NetworkStatusBadgeProps {
  variant?: 'minimal' | 'compact' | 'detailed';
  showSpeed?: boolean;
  className?: string;
}

const QUALITY_CONFIG: Record<NetworkQuality['type'], {
  icon: typeof Wifi;
  color: string;
  label: string;
  description: string;
}> = {
  '4g': {
    icon: SignalHigh,
    color: 'text-green-500',
    label: 'Excelente',
    description: 'Conexão rápida - todas as funcionalidades disponíveis',
  },
  '3g': {
    icon: SignalMedium,
    color: 'text-blue-500',
    label: 'Boa',
    description: 'Conexão estável - algumas funcionalidades podem ser limitadas',
  },
  '2g': {
    icon: SignalLow,
    color: 'text-yellow-500',
    label: 'Lenta',
    description: 'Conexão lenta - modo otimizado ativado',
  },
  'slow-2g': {
    icon: Signal,
    color: 'text-orange-500',
    label: 'Muito Lenta',
    description: 'Conexão muito lenta - modo ultra-leve ativado',
  },
  'unknown': {
    icon: Wifi,
    color: 'text-muted-foreground',
    label: 'Desconhecida',
    description: 'Qualidade da conexão não detectada',
  },
  'offline': {
    icon: WifiOff,
    color: 'text-destructive',
    label: 'Offline',
    description: 'Sem conexão - usando dados em cache',
  },
};

export const NetworkStatusBadge = memo(function NetworkStatusBadge({
  variant = 'compact',
  showSpeed = true,
  className,
}: NetworkStatusBadgeProps) {
  const quality = useNetworkQuality();
  const config = QUALITY_CONFIG[quality.type];
  const Icon = config.icon;

  // Minimal variant - just icon
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center', className)}>
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant - icon + label
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1.5 border-border/50',
                quality.isLowBandwidth && 'animate-pulse',
                className
              )}
            >
              <Icon className={cn('h-3 w-3', config.color)} />
              <span className={cn('text-xs', config.color)}>{config.label}</span>
              {quality.saveData && (
                <Battery className="h-3 w-3 text-yellow-500" />
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="w-64">
            <NetworkTooltipContent quality={quality} config={config} showSpeed={showSpeed} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant - full info
  return (
    <div className={cn(
      'p-3 rounded-lg border bg-card',
      quality.isLowBandwidth && 'border-yellow-500/50',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-5 w-5', config.color)} />
        <span className={cn('font-medium', config.color)}>{config.label}</span>
        {quality.saveData && (
          <Badge variant="secondary" className="text-xs">
            <Battery className="h-3 w-3 mr-1" />
            Economia
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">{config.description}</p>
      
      {showSpeed && quality.isOnline && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Velocidade</span>
            <span className="font-mono">{quality.downlink.toFixed(1)} Mbps</span>
          </div>
          <Progress 
            value={Math.min(quality.downlink * 10, 100)} 
            className="h-1.5"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Latência</span>
            <span className="font-mono">{quality.rtt.toFixed(0)} ms</span>
          </div>
        </div>
      )}
      
      {quality.isLowBandwidth && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
            <Zap className="h-3 w-3" />
            <span>Modo otimizado ativo</span>
          </div>
        </div>
      )}
    </div>
  );
});

// Tooltip content component
function NetworkTooltipContent({
  quality,
  config,
  showSpeed,
}: {
  quality: ReturnType<typeof useNetworkQuality>;
  config: typeof QUALITY_CONFIG['4g'];
  showSpeed: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium">{config.label}</p>
      <p className="text-xs text-muted-foreground">{config.description}</p>
      
      {showSpeed && quality.isOnline && (
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-xs">
            <span>Download:</span>
            <span className="font-mono">{quality.downlink.toFixed(1)} Mbps</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Latência:</span>
            <span className="font-mono">{quality.rtt.toFixed(0)} ms</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Batch size:</span>
            <span className="font-mono">{quality.recommendedBatchSize}</span>
          </div>
        </div>
      )}
      
      {quality.saveData && (
        <div className="flex items-center gap-1 text-xs text-yellow-600">
          <Battery className="h-3 w-3" />
          <span>Modo economia ativo</span>
        </div>
      )}
    </div>
  );
}

export default NetworkStatusBadge;
