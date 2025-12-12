/**
 * Performance Panel Component
 * Visual dashboard displaying real-time metrics
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";
import { MqttClient } from "mqtt";
import { Activity, Cpu, Database } from "lucide-react";

interface PerformancePanelProps {
  mqttClient?: MqttClient | null;
}

export const PerformancePanel = memo(function({ mqttClient }: PerformancePanelProps) {
  const metrics = usePerformanceMonitor(mqttClient);

  const getStatusColor = (value: number, thresholds: { yellow: number; red: number }) => {
    if (value >= thresholds.red) return "text-red-500";
    if (value >= thresholds.yellow) return "text-yellow-500";
    return "text-green-500";
  };

  const cpuColor = getStatusColor(metrics.cpu, { yellow: 60, red: 80 });
  const memoryColor = getStatusColor(metrics.memory, { yellow: 512, red: 1024 });
  const fpsColor = getStatusColor(60 - metrics.fps, { yellow: 15, red: 30 });

  const mqttStatus = mqttClient?.connected ? "Connected" : "Disconnected";
  const mqttStatusColor = mqttClient?.connected ? "text-green-500" : "text-gray-400";

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
        <p className="text-sm text-white/80">
          MQTT: <span className={mqttStatusColor}>{mqttStatus}</span>
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CPU Metric */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Cpu className={`h-8 w-8 mb-2 ${cpuColor}`} />
            <p className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">CPU Usage</p>
          </div>

          {/* Memory Metric */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Database className={`h-8 w-8 mb-2 ${memoryColor}`} />
            <p className="text-2xl font-bold">{metrics.memory.toFixed(1)} MB</p>
            <p className="text-sm text-muted-foreground">Memory</p>
          </div>

          {/* FPS Metric */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Activity className={`h-8 w-8 mb-2 ${fpsColor}`} />
            <p className="text-2xl font-bold">{metrics.fps}</p>
            <p className="text-sm text-muted-foreground">FPS</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
