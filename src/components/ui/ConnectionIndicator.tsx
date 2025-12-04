/**
 * Connection Indicator - PATCH 754
 * Shows current connection quality to user
 */

import React from "react";
import { WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react";
import { useConnectionAdaptive } from "@/hooks/useConnectionAdaptive";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectionIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const labelSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  className,
  showLabel = false,
  size = "md",
}) => {
  const { quality, isOnline, isSlow, isModerate, isFast } = useConnectionAdaptive();

  const getIcon = () => {
    if (!isOnline) return WifiOff;
    if (isSlow) return SignalLow;
    if (isModerate) return SignalMedium;
    if (isFast) return SignalHigh;
    return Signal;
  };

  const getColor = () => {
    if (!isOnline) return "text-destructive";
    if (isSlow) return "text-warning";
    if (isModerate) return "text-info";
    if (isFast) return "text-success";
    return "text-muted-foreground";
  };

  const getLabel = () => {
    if (!isOnline) return "Offline";
    if (isSlow) return "Conexão lenta";
    if (isModerate) return "Conexão moderada";
    if (isFast) return "Conexão rápida";
    return "Verificando...";
  };

  const Icon = getIcon();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", className)}>
            <Icon className={cn(sizeClasses[size], getColor())} />
            {showLabel && (
              <span className={cn(labelSizeClasses[size], getColor())}>
                {getLabel()}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{getLabel()}</p>
            {!isOnline ? (
              <p className="text-xs text-muted-foreground">
                Sem conexão com a internet. Alguns recursos podem não funcionar.
              </p>
            ) : isSlow ? (
              <p className="text-xs text-muted-foreground">
                Modo economia ativado para melhor performance.
              </p>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionIndicator;
