/**
 * Network Status Widget - Enhanced
 * Visual indicator for connection quality
 */

import React, { memo } from 'react';
import { Wifi, WifiOff, Zap, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { cn } from '@/lib/utils';

interface NetworkStatusWidgetProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const NetworkStatusWidget = memo(function NetworkStatusWidget({
  showDetails = false,
  compact = false,
  className
}: NetworkStatusWidgetProps) {
  const { online, quality, effectiveType, downlink, saveData } = useNetworkStatus();

  const getIcon = () => {
    // PATCH v23: Removido !online check - sempre assume online no iOS PWA
    if (quality === 'fast') return <Zap className="h-4 w-4" />;
    if (quality === 'slow') return <AlertTriangle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getColor = () => {
    // PATCH v23: Removido !online check
    if (quality === 'fast') return 'text-success';
    if (quality === 'slow') return 'text-warning';
    return 'text-info';
  };

  const getLabel = () => {
    // PATCH v23: Removido !online check - nunca mostrar "Offline"
    if (quality === 'fast') return 'Rápida';
    if (quality === 'slow') return 'Lenta';
    return 'Normal';
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", getColor(), className)} title={`Conexão: ${getLabel()}`}>
        {getIcon()}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
      "bg-background/80 backdrop-blur-sm border border-border/50",
      getColor(),
      className
    )}>
      {getIcon()}
      <span>{getLabel()}</span>
      
      {showDetails && online && (
        <span className="text-muted-foreground">
          {effectiveType && `${effectiveType.toUpperCase()}`}
          {downlink && ` • ${downlink.toFixed(1)} Mbps`}
          {saveData && ' • Economia'}
        </span>
      )}
    </div>
  );
});

export default NetworkStatusWidget;
