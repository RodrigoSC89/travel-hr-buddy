/**
 * Performance Monitor - Monitoramento visual de performance
 */

import { useState, useEffect } from "react";
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
  Database
} from "lucide-react";
import { criticalPathOptimizer } from "@/lib/performance/critical-path-optimizer";

interface PerformanceData {
  fps: number;
  memory: number;
  latency: number;
  ttfb: number;
  domLoad: number;
  resourceCount: number;
  transferSize: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceData>({
    fps: 60,
    memory: 0,
    latency: 0,
    ttfb: 0,
    domLoad: 0,
    resourceCount: 0,
    transferSize: 0,
  });
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const perfMetrics = criticalPathOptimizer.getPerformanceMetrics();
        
        setMetrics({
          fps: frameCount,
          memory: (performance as any).memory?.usedJSHeapSize / 1048576 || 0,
          latency: Math.round(Math.random() * 50 + 20), // Simulado
          ttfb: perfMetrics.ttfb,
          domLoad: perfMetrics.domContentLoaded,
          resourceCount: perfMetrics.resourceCount,
          transferSize: perfMetrics.transferSize,
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Detectar tipo de conexão
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      setConnectionType(conn?.effectiveType || 'unknown');
      conn?.addEventListener('change', () => {
        setConnectionType(conn?.effectiveType || 'unknown');
      });
    }

    return () => cancelAnimationFrame(animationId);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "bg-green-500";
    if (value >= thresholds.warning) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return "text-green-500";
    if (latency < 300) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Monitor de Performance
          <Badge variant="outline" className="ml-auto text-xs">
            {connectionType.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* FPS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              FPS
            </span>
            <span className={metrics.fps >= 55 ? "text-green-500" : metrics.fps >= 30 ? "text-yellow-500" : "text-red-500"}>
              {metrics.fps}
            </span>
          </div>
          <Progress value={(metrics.fps / 60) * 100} className="h-1" />
        </div>

        {/* Memory */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              Memória
            </span>
            <span>{metrics.memory.toFixed(1)} MB</span>
          </div>
          <Progress value={Math.min((metrics.memory / 100) * 100, 100)} className="h-1" />
        </div>

        {/* Latency */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Latência
            </span>
            <span className={getLatencyColor(metrics.latency)}>
              {metrics.latency}ms
            </span>
          </div>
          <Progress value={Math.max(0, 100 - metrics.latency)} className="h-1" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div className="text-center p-2 rounded bg-muted/30">
            <Clock className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs font-medium">{metrics.ttfb.toFixed(0)}ms</div>
            <div className="text-[10px] text-muted-foreground">TTFB</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <TrendingUp className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs font-medium">{metrics.domLoad.toFixed(0)}ms</div>
            <div className="text-[10px] text-muted-foreground">DOM Load</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <Database className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs font-medium">{metrics.resourceCount}</div>
            <div className="text-[10px] text-muted-foreground">Recursos</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <HardDrive className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs font-medium">{formatBytes(metrics.transferSize)}</div>
            <div className="text-[10px] text-muted-foreground">Transfer</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
