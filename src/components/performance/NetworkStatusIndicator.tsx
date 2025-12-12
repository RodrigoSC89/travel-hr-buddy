import { memo } from 'react';
/**
 * Network Status Indicator
 * Shows current connection quality and offline status
 */

import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react";
import { useNetworkStatus, ConnectionQuality } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const qualityLabels: Record<ConnectionQuality, string> = {
  fast: "Conexão excelente",
  medium: "Conexão boa",
  slow: "Conexão lenta",
  offline: "Offline",
};

const qualityColors: Record<ConnectionQuality, string> = {
  fast: "text-green-500",
  medium: "text-yellow-500",
  slow: "text-orange-500",
  offline: "text-destructive",
};

export const NetworkStatusIndicator = memo(function({
  className,
  showLabel = false,
  size = "md",
}: NetworkStatusIndicatorProps) {
  const { quality, online, effectiveType, downlink } = useNetworkStatus();

  const IconComponent = () => {
    if (!online) return <WifiOff className={cn(sizeClasses[size], qualityColors.offline)} />;
    
    switch (quality) {
    case "fast":
      return <SignalHigh className={cn(sizeClasses[size], qualityColors.fast)} />;
    case "medium":
      return <SignalMedium className={cn(sizeClasses[size], qualityColors.medium)} />;
    case "slow":
      return <SignalLow className={cn(sizeClasses[size], qualityColors.slow)} />;
    default:
      return <Wifi className={cn(sizeClasses[size], qualityColors.medium)} />;
    }
  };

  const tooltipContent = (
    <div className="text-xs space-y-1">
      <p className="font-medium">{qualityLabels[quality]}</p>
      {effectiveType && <p>Tipo: {effectiveType.toUpperCase()}</p>}
      {downlink && <p>Velocidade: ~{downlink} Mbps</p>}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", className)}>
            <IconComponent />
            {showLabel && (
              <span className={cn("text-xs", qualityColors[quality])}>
                {qualityLabels[quality]}
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
