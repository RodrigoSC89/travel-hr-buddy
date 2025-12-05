/**
 * Bandwidth Indicator
 * Shows current connection quality to users
 */

import React, { memo } from 'react';
import { useBandwidthOptimizer } from '@/lib/performance/low-bandwidth-optimizer';
import { Wifi, WifiOff, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BandwidthIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

const connectionIcons = {
  '4g': SignalHigh,
  '3g': SignalMedium,
  '2g': SignalLow,
  'slow-2g': SignalLow,
  'offline': WifiOff,
};

const connectionColors = {
  '4g': 'text-green-500',
  '3g': 'text-yellow-500',
  '2g': 'text-orange-500',
  'slow-2g': 'text-red-500',
  'offline': 'text-gray-500',
};

const connectionLabels = {
  '4g': 'Conexão rápida',
  '3g': 'Conexão moderada',
  '2g': 'Conexão lenta',
  'slow-2g': 'Conexão muito lenta',
  'offline': 'Sem conexão',
};

export const BandwidthIndicator = memo(function BandwidthIndicator({
  showLabel = false,
  className,
}: BandwidthIndicatorProps) {
  const { connectionType, isLowBandwidth } = useBandwidthOptimizer();
  
  const Icon = connectionIcons[connectionType as keyof typeof connectionIcons] || Wifi;
  const color = connectionColors[connectionType as keyof typeof connectionColors] || 'text-green-500';
  const label = connectionLabels[connectionType as keyof typeof connectionLabels] || 'Conectado';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1.5', className)}>
            <Icon className={cn('h-4 w-4', color)} />
            {showLabel && (
              <span className={cn('text-xs', color)}>{label}</span>
            )}
            {isLowBandwidth && (
              <span className="text-[10px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded-full">
                Modo Leve
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
          {isLowBandwidth && (
            <p className="text-xs text-muted-foreground mt-1">
              Otimizações ativas para economia de dados
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

BandwidthIndicator.displayName = 'BandwidthIndicator';
