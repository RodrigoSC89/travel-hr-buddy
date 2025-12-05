/**
 * PATCH 801 - Network Status Widget
 * Exibe status da conexão e otimizações ativas
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Zap,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bandwidthOptimizer, useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";

interface NetworkStats {
  downlink: number;
  rtt: number;
  effectiveType: string;
  isOnline: boolean;
  saveData: boolean;
}

export const NetworkStatusWidget: React.FC = () => {
  const { config, connectionType, isLowBandwidth } = useBandwidthOptimizer();
  const [stats, setStats] = useState<NetworkStats>({
    downlink: 10,
    rtt: 50,
    effectiveType: '4g',
    isOnline: true,
    saveData: false,
  });

  useEffect(() => {
    const updateStats = () => {
      const connection = (navigator as any).connection;
      setStats({
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 50,
        effectiveType: connectionType || '4g',
        isOnline: navigator.onLine,
        saveData: connection?.saveData || false,
      });
    };

    updateStats();
    
    // Update on connection change
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateStats);
    }
    
    window.addEventListener('online', updateStats);
    window.addEventListener('offline', updateStats);

    const interval = setInterval(updateStats, 5000);

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateStats);
      }
      window.removeEventListener('online', updateStats);
      window.removeEventListener('offline', updateStats);
      clearInterval(interval);
    };
  }, [connectionType]);

  const getSignalIcon = () => {
    if (!stats.isOnline) return WifiOff;
    if (stats.downlink < 1) return SignalLow;
    if (stats.downlink < 5) return SignalMedium;
    return SignalHigh;
  };

  const getSignalColor = () => {
    if (!stats.isOnline) return "text-red-500";
    if (stats.downlink < 1) return "text-red-500";
    if (stats.downlink < 2) return "text-amber-500";
    if (stats.downlink < 5) return "text-yellow-500";
    return "text-green-500";
  };

  const getSpeedLabel = () => {
    if (!stats.isOnline) return "Offline";
    if (stats.downlink < 0.5) return "Muito Lenta";
    if (stats.downlink < 2) return "Lenta";
    if (stats.downlink < 5) return "Média";
    if (stats.downlink < 10) return "Boa";
    return "Excelente";
  };

  const SignalIcon = getSignalIcon();

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-full", stats.isOnline ? "bg-green-500/10" : "bg-red-500/10")}>
              <SignalIcon className={cn("h-4 w-4", getSignalColor())} />
            </div>
            <div>
              <p className="text-sm font-medium">Conexão</p>
              <p className={cn("text-xs", getSignalColor())}>{getSpeedLabel()}</p>
            </div>
          </div>
          <Badge variant={stats.isOnline ? "default" : "destructive"} className="text-xs">
            {stats.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Download className="h-3 w-3 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Download</p>
            <p className="text-sm font-medium">{stats.downlink.toFixed(1)} Mbps</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <RefreshCw className="h-3 w-3 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Latência</p>
            <p className="text-sm font-medium">{stats.rtt} ms</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Signal className="h-3 w-3 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="text-sm font-medium uppercase">{stats.effectiveType}</p>
          </div>
        </div>

        {/* Otimizações Ativas */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Otimizações Ativas</p>
          <div className="flex flex-wrap gap-1">
            {config.maxImageSize > 0 && (
              <Badge variant="outline" className="text-[10px]">📷 Max: {Math.round(config.maxImageSize/1000)}KB</Badge>
            )}
            <Badge variant="outline" className="text-[10px]">⏳ Lazy Load</Badge>
            {config.batchSize < 10 && (
              <Badge variant="outline" className="text-[10px]">📦 Batch: {config.batchSize}</Badge>
            )}
            {config.compressionLevel === 'high' && (
              <Badge variant="outline" className="text-[10px]">🗜️ Compressão Alta</Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              🖼️ Qualidade: {config.imageQuality}%
            </Badge>
          </div>
        </div>

        {/* Save Data Mode */}
        {stats.saveData && (
          <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Modo Economia de Dados Ativo
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkStatusWidget;
