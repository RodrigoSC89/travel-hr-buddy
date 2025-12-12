/**
import { useCallback, useEffect, useState } from "react";;
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
    effectiveType: "4g",
    isOnline: navigator.onLine,
  });

  const updateStats = useCallback(() => {
    const connection = (navigator as unknown).connection;
    setStats({
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50,
      effectiveType: connection?.effectiveType || "4g",
      isOnline: navigator.onLine,
    });
  }, []);

  useEffect(() => {
    updateStats();
    
    // Apenas eventos, sem polling
    window.addEventListener("online", updateStats);
    window.addEventListener("offline", updateStats);
    
    if ("connection" in navigator) {
      (navigator as unknown).connection?.addEventListener("change", updateStats);
    }

    return () => {
      window.removeEventListener("online", updateStats);
      window.removeEventListener("offline", updateStats);
      if ("connection" in navigator) {
        (navigator as unknown).connection?.removeEventListener("change", updateStats);
      }
    };
  }, [updateStats]);

  const getSignalIcon = () => {
    if (!stats.isOnline) return WifiOff;
    if (stats.downlink < 1) return SignalLow;
    if (stats.downlink < 5) return SignalMedium;
    return SignalHigh;
  };

  const getSignalColor = () => {
    if (!stats.isOnline) return "text-red-500";
    if (stats.downlink < 2) return "text-amber-500";
    return "text-green-500";
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
            <div className={cn("p-2 rounded-full", stats.isOnline ? "bg-emerald-500/20" : "bg-red-500/20")}>
              <SignalIcon className={cn("h-4 w-4", getSignalColor())} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Conexão</p>
              <p className={cn("text-sm font-medium", getSignalColor())}>{getSpeedLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stats.isOnline ? "default" : "destructive"} className="text-xs font-semibold">
              {stats.isOnline ? "Online" : "Offline"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={updateStats}>
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
