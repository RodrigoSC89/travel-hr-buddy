/**
 * Network Status Indicator
 * PATCH v12: Removed offline status - always shows connected for iOS PWA compatibility
 */

import { Wifi, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { useNetworkStatus, ConnectionQuality } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const qualityLabels: Record<Exclude<ConnectionQuality, 'offline'>, string> = {
  fast: 'Conexão excelente',
  medium: 'Conexão boa',
  slow: 'Conexão lenta',
};

const qualityColors: Record<Exclude<ConnectionQuality, 'offline'>, string> = {
  fast: 'text-success',
  medium: 'text-warning',
  slow: 'text-warning',
};

export function NetworkStatusIndicator({
  className,
  showLabel = false,
  size = 'md',
}: NetworkStatusIndicatorProps) {
  const { quality, effectiveType, downlink } = useNetworkStatus();

  // PATCH v12: Map quality to non-offline value
  const safeQuality = quality === 'offline' ? 'slow' : quality;

  const IconComponent = () => {
    switch (safeQuality) {
      case 'fast':
        return <SignalHigh className={cn(sizeClasses[size], qualityColors.fast)} />;
      case 'medium':
        return <SignalMedium className={cn(sizeClasses[size], qualityColors.medium)} />;
      case 'slow':
        return <SignalLow className={cn(sizeClasses[size], qualityColors.slow)} />;
      default:
        return <Wifi className={cn(sizeClasses[size], qualityColors.medium)} />;
    }
  };

  const tooltipContent = (
    <div className="text-xs space-y-1">
      <p className="font-medium">{qualityLabels[safeQuality]}</p>
      {effectiveType && <p>Tipo: {effectiveType.toUpperCase()}</p>}
      {downlink && <p>Velocidade: ~{downlink} Mbps</p>}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1.5', className)}>
            <IconComponent />
            {showLabel && (
              <span className={cn('text-xs', qualityColors[safeQuality])}>
                {qualityLabels[safeQuality]}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default NetworkStatusIndicator;
