/**
 * Performance Status Component
 * Shows current network and performance status for users
 */

import { memo, useEffect, useState } from "react";
import { Wifi, WifiOff, Gauge, Zap, Signal, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PerformanceMetrics {
  connectionType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  isOnline: boolean;
  effectiveType: string;
}

function getConnectionInfo(): PerformanceMetrics {
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  return {
    connectionType: connection?.type || "unknown",
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 50,
    saveData: connection?.saveData || false,
    isOnline: true, // PATCH v19: Sempre online - navigator.onLine não confiável no iOS PWA
    effectiveType: connection?.effectiveType || "4g",
  };
}

function getStatusColor(effectiveType: string, isOnline: boolean): string {
  // PATCH v19: Removida verificação !isOnline - sempre assumir online
  switch (effectiveType) {
    case "4g":
      return "bg-green-500/20 text-green-500 border-green-500/30";
    case "3g":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "2g":
    case "slow-2g":
      return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusLabel(effectiveType: string, isOnline: boolean): string {
  // PATCH v19: Removida verificação !isOnline - sempre assumir online
  switch (effectiveType) {
    case "4g":
      return "Conexão Rápida";
    case "3g":
      return "Conexão Moderada";
    case "2g":
      return "Conexão Lenta";
    case "slow-2g":
      return "Conexão Muito Lenta";
    default:
      return "Verificando...";
  }
}

function getStatusIcon(effectiveType: string, isOnline: boolean) {
  // PATCH v19: Removida verificação !isOnline - sempre assumir online
  switch (effectiveType) {
    case "4g":
      return <Zap className="h-3 w-3" />;
    case "3g":
      return <Signal className="h-3 w-3" />;
    case "2g":
    case "slow-2g":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Wifi className="h-3 w-3" />;
  }
}

export const PerformanceStatus = memo(function PerformanceStatus({
  className,
  showDetails = false,
}: {
  className?: string;
  showDetails?: boolean;
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(getConnectionInfo);

  useEffect(() => {
    const updateMetrics = () => setMetrics(getConnectionInfo());
    
    // Listen for connection changes only (not online/offline)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateMetrics);
    }
    
    // PATCH v37: REMOVIDO listeners online/offline - causam falsos positivos no iOS PWA
    
    return () => {
      if (connection) {
        connection.removeEventListener("change", updateMetrics);
      }
    };
  }, []);

  const statusColor = getStatusColor(metrics.effectiveType, metrics.isOnline);
  const statusLabel = getStatusLabel(metrics.effectiveType, metrics.isOnline);
  const StatusIcon = () => getStatusIcon(metrics.effectiveType, metrics.isOnline);

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 px-2 py-0.5 text-xs font-normal cursor-default",
                statusColor,
                className
              )}
            >
              <StatusIcon />
              <span className="hidden sm:inline">{statusLabel}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p><strong>Velocidade:</strong> {metrics.downlink.toFixed(1)} Mbps</p>
              <p><strong>Latência:</strong> {metrics.rtt}ms</p>
              <p><strong>Tipo:</strong> {metrics.effectiveType.toUpperCase()}</p>
              {metrics.saveData && (
                <p className="text-yellow-500">Modo economia ativo</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 p-3 rounded-lg border bg-card", className)}>
      <div className={cn("p-2 rounded-full", statusColor)}>
        <Gauge className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{statusLabel}</span>
          <Badge variant="outline" className="text-xs">
            {metrics.effectiveType.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            {metrics.downlink.toFixed(1)} Mbps
          </span>
          <span>RTT: {metrics.rtt}ms</span>
          {metrics.saveData && (
            <Badge variant="secondary" className="text-xs">
              Economia
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

export default PerformanceStatus;
