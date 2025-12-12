/**
 * Performance Monitor - PATCH 850
 * Real-time performance monitoring component
 */

import { useEffect, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, Wifi, Battery, Gauge } from "lucide-react";

interface PerformanceMetrics {
  memory: { used: number; total: number; percent: number } | null;
  fps: number;
  connection: { type: string; downlink: number; rtt: number } | null;
  battery: { level: number; charging: boolean } | null;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: null,
    fps: 60,
    connection: null,
    battery: null,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Memory monitoring
    const memoryInterval = setInterval(() => {
      const mem = (performance as any).memory;
      if (mem) {
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: mem.usedJSHeapSize,
            total: mem.jsHeapSizeLimit,
            percent: (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100,
          },
        }));
      }
    }, 2000);

    // Connection monitoring
    const updateConnection = () => {
      const conn = (navigator as any).connection;
      if (conn) {
        setMetrics(prev => ({
          ...prev,
          connection: {
            type: conn.effectiveType,
            downlink: conn.downlink,
            rtt: conn.rtt,
          },
        }));
      }
    };

    updateConnection();
    (navigator as any).connection?.addEventListener("change", updateConnection);

    // Battery monitoring
    const initBattery = async () => {
      if ("getBattery" in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          const updateBattery = () => {
            setMetrics(prev => ({
              ...prev,
              battery: {
                level: battery.level * 100,
                charging: battery.charging,
              },
            }));
          };
          updateBattery();
          battery.addEventListener("levelchange", updateBattery);
          battery.addEventListener("chargingchange", updateBattery);
        } catch {}
      }
    };
    initBattery();

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500";
    if (value >= thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Monitor de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">FPS</span>
          </div>
          <Badge variant={metrics.fps >= 50 ? "default" : metrics.fps >= 30 ? "secondary" : "destructive"}>
            {metrics.fps}
          </Badge>
        </div>

        {/* Memory */}
        {metrics.memory && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Memória</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.memory.percent, { warning: 70, critical: 90 })}`}>
                {metrics.memory.percent.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.memory.percent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatBytes(metrics.memory.used)}</span>
              <span>{formatBytes(metrics.memory.total)}</span>
            </div>
          </div>
        )}

        {/* Connection */}
        {metrics.connection && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Conexão</span>
            </div>
            <div className="text-right">
              <Badge variant="outline">{metrics.connection.type.toUpperCase()}</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.connection.downlink} Mbps • {metrics.connection.rtt}ms
              </p>
            </div>
          </div>
        )}

        {/* Battery */}
        {metrics.battery && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Bateria</span>
              </div>
              <div className="flex items-center gap-2">
                {metrics.battery.charging && (
                  <Badge variant="outline" className="text-xs">Carregando</Badge>
                )}
                <span className={`text-sm font-medium ${getStatusColor(100 - metrics.battery.level, { warning: 80, critical: 90 })}`}>
                  {metrics.battery.level.toFixed(0)}%
                </span>
              </div>
            </div>
            <Progress value={metrics.battery.level} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
