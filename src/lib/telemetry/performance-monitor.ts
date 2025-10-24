/**
 * Performance Monitor Hook
 * Real-time application performance tracking with minimal overhead
 */

import { useState, useEffect, useRef } from "react";
import { MqttClient } from "mqtt";
import { logger } from "@/lib/logger";

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  fps: number;
}

export function usePerformanceMonitor(mqttClient?: MqttClient | null): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    fps: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number>();

  useEffect(() => {
    // Track FPS using requestAnimationFrame
    const trackFPS = () => {
      frameCountRef.current++;
      rafIdRef.current = requestAnimationFrame(trackFPS);
    };
    rafIdRef.current = requestAnimationFrame(trackFPS);

    // Measure metrics once per second
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - lastTimeRef.current) / 1000;

      // Calculate FPS
      const fps = Math.round(frameCountRef.current / elapsed);
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Get memory usage (if available)
      let memory = 0;
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        memory = memoryInfo.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }

      // Estimate CPU usage (simplified metric based on frame consistency)
      const targetFPS = 60;
      const cpuEstimate = Math.min(100, Math.max(0, 100 - (fps / targetFPS) * 100));

      const newMetrics = {
        cpu: parseFloat(cpuEstimate.toFixed(1)),
        memory: parseFloat(memory.toFixed(1)),
        fps,
      };

      setMetrics(newMetrics);

      // Publish to MQTT if client is available
      if (mqttClient && mqttClient.connected) {
        try {
          mqttClient.publish(
            "nautilus/telemetry/performance",
            JSON.stringify({
              timestamp: new Date().toISOString(),
              ...newMetrics,
            }),
            { qos: 0 }
          );
        } catch (error) {
          logger.error("Failed to publish performance metrics:", error);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [mqttClient]);

  return metrics;
}
