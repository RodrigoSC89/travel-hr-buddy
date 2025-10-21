/**
 * Performance Panel Component
 * 
 * Visual dashboard component displaying real-time metrics with a clean, modern UI.
 * Shows CPU usage, memory consumption, and FPS in an easy-to-read format.
 * 
 * @module PerformancePanel
 * @version 1.0.0 (Nautilus v3.3)
 */

import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";
import { Card } from "@/components/ui/card";
import { Activity, Cpu, Gauge } from "lucide-react";
import type { MQTTClient } from "@/utils/mqttClient";

interface PerformancePanelProps {
  mqttClient?: typeof MQTTClient;
}

export function PerformancePanel({ mqttClient }: PerformancePanelProps) {
  const metrics = usePerformanceMonitor(mqttClient);

  const getStatusColor = (value: number, type: "cpu" | "memory" | "fps") => {
    if (type === "fps") {
      if (value >= 55) return "text-green-500";
      if (value >= 30) return "text-yellow-500";
      return "text-red-500";
    }
    
    // For CPU and memory
    if (value < 60) return "text-green-500";
    if (value < 80) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Performance Monitor</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Usage */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">CPU Usage</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(metrics.cpu, "cpu")}`}>
            {metrics.cpu.toFixed(1)}%
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Memory</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(metrics.memory, "memory")}`}>
            {metrics.memory} MB
          </div>
        </div>

        {/* FPS */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">FPS</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(metrics.fps, "fps")}`}>
            {metrics.fps}
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </span>
          {mqttClient && mqttClient.isConnected() && (
            <span className="flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              MQTT Connected
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
