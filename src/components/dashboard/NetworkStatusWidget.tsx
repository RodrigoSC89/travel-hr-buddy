/**
 * PATCH 900 - Network Status Widget Otimizado
 * Removidos intervals excessivos
 */

import React, { useState, useEffect, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  WifiOff,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Download,
  RefreshCw,
  Signal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NetworkStats {
  downlink: number;
  rtt: number;
  effectiveType: string;
  isOnline: boolean;
}

const NetworkStatusWidgetComponent: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>({
    downlink: 10,
    rtt: 50,
    effectiveType: '4g',
    isOnline: navigator.onLine,
  });

  // PATCH v20: Sempre assume online - navigator.onLine não confiável no iOS PWA
  const updateStats = useCallback(() => {
    const nav = navigator as unknown as { connection?: { downlink?: number; rtt?: number; effectiveType?: string; addEventListener: (t: string, h: () => void) => void; removeEventListener: (t: string, h: () => void) => void } };
    const connection = nav.connection;
    setStats({
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50,
      effectiveType: connection?.effectiveType || '4g',
      isOnline: true, // PATCH v20: Sempre true
    });
  }, []);

  useEffect(() => {
    updateStats();
    
    const nav = navigator as unknown as { connection?: { addEventListener: (t: string, h: () => void) => void; removeEventListener: (t: string, h: () => void) => void } };
    // PATCH v20: Apenas eventos de mudança de conexão, NÃO online/offline
    if (nav.connection) {
      nav.connection.addEventListener('change', updateStats);
    }

    return () => {
      if (nav.connection) {
        nav.connection.removeEventListener('change', updateStats);
      }
    };
  }, [updateStats]);

  const getSignalIcon = () => {
    // PATCH v20: Nunca retorna WifiOff
    if (stats.downlink < 1) return SignalLow;
    if (stats.downlink < 5) return SignalMedium;
    return SignalHigh;
  };

  const getSignalColor = () => {
    // PATCH v20: Nunca retorna vermelho por "offline"
    if (stats.downlink < 2) return "text-warning";
    return "text-success";
  };

  const getSpeedLabel = () => {
    if (!stats.isOnline) return "Offline";
    if (stats.downlink < 2) return "Lenta";
    if (stats.downlink < 5) return "Média";
    return "Boa";
  };

  const SignalIcon = getSignalIcon();

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-full", stats.isOnline ? "bg-success/20" : "bg-destructive/20")}>
              <SignalIcon className={cn("h-4 w-4", getSignalColor())} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Conexão</p>
              <p className={cn("text-sm font-medium", getSignalColor())}>{getSpeedLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* PATCH v24: Sempre Online */}
            <Badge variant="default" className="text-xs font-semibold">
              Online
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={updateStats} aria-label="Atualizar status de rede" title="Atualizar">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-lg bg-muted/50">
            <Download className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-semibold text-foreground">{stats.downlink.toFixed(1)} Mbps</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-muted/50">
            <RefreshCw className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-semibold text-foreground">{stats.rtt} ms</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-muted/50">
            <Signal className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-semibold text-foreground uppercase">{stats.effectiveType}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const NetworkStatusWidget = memo(NetworkStatusWidgetComponent);
export default NetworkStatusWidget;
