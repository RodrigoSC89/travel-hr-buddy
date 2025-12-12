/**
 * Performance Monitor - Versão otimizada
 * PATCH 900: Removido requestAnimationFrame constante para evitar travamentos
 */

import { memo, useCallback, useEffect, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap,
  TrendingUp,
  Clock,
  Database,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PerformanceData {
  fps: number;
  memory: number;
  latency: number;
  ttfb: number;
  domLoad: number;
  resourceCount: number;
  transferSize: number;
}

function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<PerformanceData>({
    fps: 60,
    memory: 0,
    latency: 0,
    ttfb: 0,
    domLoad: 0,
    resourceCount: 0,
    transferSize: 0,
  });
  const [connectionType, setConnectionType] = useState("unknown");
  const [isExpanded, setIsExpanded] = useState(false);

  // Coletar métricas apenas uma vez no mount e sob demanda
  const collectMetrics = useCallback(() => {
    const perfEntries = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType("resource");
    
    const totalTransfer = resources.reduce((acc, r: unknown: unknown: unknown) => acc + (r.transferSize || 0), 0);
    
    setMetrics({
      fps: 60,
      memory: (performance as unknown).memory?.usedJSHeapSize / 1048576 || 0,
      latency: Math.round((navigator as unknown).connection?.rtt || 50),
      ttfb: perfEntries?.responseStart - perfEntries?.requestStart || 0,
      domLoad: perfEntries?.domContentLoadedEventEnd - perfEntries?.startTime || 0,
      resourceCount: resources.length,
      transferSize: totalTransfer,
    });
  }, []);

  useEffect(() => {
    // Coletar métricas iniciais após o DOM estar pronto
    const timer = setTimeout(collectMetrics, 1000);

    // Detectar tipo de conexão
    if ("connection" in navigator) {
      const conn = (navigator as unknown).connection;
      setConnectionType(conn?.effectiveType || "unknown");
    }

    return () => clearTimeout(timer);
  }, [collectMetrics]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return "text-emerald-400";
    if (latency < 300) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="h-4 w-4 text-primary" />
          Performance
          <Badge variant="outline" className="ml-auto text-xs font-semibold border-primary/50 text-primary">
            {connectionType.toUpperCase()}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={collectMetrics}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Memory */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-foreground font-bold">
              <Cpu className="h-4 w-4 text-blue-400" />
              Memória
            </span>
            <span className="font-bold text-white">{metrics.memory.toFixed(1)} MB</span>
          </div>
          <Progress value={Math.min((metrics.memory / 100) * 100, 100)} className="h-2" />
        </div>

        {/* Latency */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-foreground font-bold">
              <Wifi className="h-4 w-4 text-blue-400" />
              Latência
            </span>
            <span className={cn("font-bold text-base", getLatencyColor(metrics.latency))}>
              {metrics.latency}ms
            </span>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div className="text-center p-3 rounded-lg bg-slate-800/80">
            <div className="text-base font-bold text-white">{metrics.ttfb.toFixed(0)}ms</div>
            <div className="text-sm font-bold text-slate-300">TTFB</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/80">
            <div className="text-base font-bold text-white">{formatBytes(metrics.transferSize)}</div>
            <div className="text-sm font-bold text-slate-300">Transfer</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const PerformanceMonitor = memo(PerformanceMonitorComponent);
