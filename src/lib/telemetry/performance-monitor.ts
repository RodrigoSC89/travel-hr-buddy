/**
 * Performance Monitor Hook
 * 
 * React hook that tracks CPU usage, memory consumption, and FPS
 * using browser APIs. Metrics are calculated once per second to minimize overhead.
 * 
 * @module PerformanceMonitor
 * @version 1.0.0 (Nautilus v3.3)
 */

import { useState, useEffect, useRef } from "react";

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  fps: number;
  timestamp: number;
}

interface MQTTClient {
  publish: (topic: string, message: string, options?: any) => void;
  isConnected: () => boolean;
}

/**
 * Custom hook for monitoring application performance metrics
 * 
 * @param mqttClient - Optional MQTT client for publishing metrics
 * @returns Current performance metrics
 */
export function usePerformanceMonitor(mqttClient?: MQTTClient): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    fps: 0,
    timestamp: Date.now(),
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number>();

  useEffect(() => {
    let isActive = true;

    // FPS tracking using requestAnimationFrame
    const measureFps = () => {
      if (!isActive) return;

      frameCountRef.current++;
      rafIdRef.current = requestAnimationFrame(measureFps);
    };

    // Start FPS measurement
    rafIdRef.current = requestAnimationFrame(measureFps);

    // Update metrics every second
    const intervalId = setInterval(() => {
      if (!isActive) return;

      const now = performance.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      const fps = Math.round(frameCountRef.current / deltaTime);

      // Reset frame counter
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Measure memory (if available)
      let memory = 0;
      if (performance.memory) {
        memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }

      // Estimate CPU usage based on frame timing
      // This is a rough approximation - actual CPU usage would require native APIs
      const cpu = Math.min(100, Math.max(0, 100 - (fps / 60) * 100));

      const newMetrics: PerformanceMetrics = {
        cpu: Math.round(cpu * 10) / 10,
        memory,
        fps,
        timestamp: Date.now(),
      };

      setMetrics(newMetrics);

      // Publish to MQTT if client is provided and connected
      if (mqttClient && mqttClient.isConnected()) {
        try {
          mqttClient.publish(
            "nautilus/telemetry/performance",
            JSON.stringify(newMetrics),
            { qos: 0 }
          );
        } catch (error) {
          console.error("Failed to publish metrics to MQTT:", error);
        }
      }
    }, 1000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [mqttClient]);

  return metrics;
}
