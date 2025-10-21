/**
 * Performance Panel Component
 * Visual dashboard for real-time performance metrics
 * Part of Nautilus One v3.3 - Performance Telemetry Module
 */

import React from "react";
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

interface PerformancePanelProps {
  mqttClient?: any;
}

/**
 * Performance monitoring dashboard component
 * Displays real-time CPU, memory, and FPS metrics
 * 
 * @param mqttClient - Optional MQTT client for telemetry streaming
 */
export function PerformancePanel({ mqttClient }: PerformancePanelProps) {
  const metrics = usePerformanceMonitor(mqttClient);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-xl font-semibold text-blue-300 mb-4">
        Performance Monitor
      </h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <span className="block text-sm text-gray-400 mb-1">CPU</span>
          <span className="text-2xl font-bold text-blue-400">
            {metrics.cpu.toFixed(1)}%
          </span>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <span className="block text-sm text-gray-400 mb-1">MEMORY</span>
          <span className="text-2xl font-bold text-green-400">
            {metrics.memory.toFixed(1)} MB
          </span>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <span className="block text-sm text-gray-400 mb-1">FPS</span>
          <span className="text-2xl font-bold text-purple-400">
            {metrics.fps}
          </span>
        </div>
      </div>
      <p className="text-xs mt-4 text-gray-500 text-center">
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
