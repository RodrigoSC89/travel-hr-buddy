import React from "react";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

export function PerformancePanel({ mqttClient }: { mqttClient?: any }) {
  const metrics = usePerformanceMonitor(mqttClient);

  return (
    <div className="p-4 bg-gray-900 text-gray-200 rounded-2xl shadow-lg w-full">
      <h2 className="text-xl font-semibold text-blue-300 mb-2">Performance Monitor</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <span className="block text-sm text-gray-400">CPU</span>
          <span className="text-lg font-bold">{metrics.cpu.toFixed(1)}%</span>
        </div>
        <div>
          <span className="block text-sm text-gray-400">MEM</span>
          <span className="text-lg font-bold">{metrics.memory.toFixed(1)} MB</span>
        </div>
        <div>
          <span className="block text-sm text-gray-400">FPS</span>
          <span className="text-lg font-bold">{metrics.fps}</span>
        </div>
      </div>
      <p className="text-xs mt-2 text-gray-500">Atualizado: {metrics.timestamp}</p>
    </div>
  );
}
