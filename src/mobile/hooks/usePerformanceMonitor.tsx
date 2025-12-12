/**
 * PATCH 190.0 - Mobile Performance Monitor
 * 
 * Real-time performance monitoring for mobile apps
 * Tracks metrics and provides optimization recommendations
 */

import { useEffect, useRef, useCallback, useState } from "react";

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  } | null;
  networkType: string;
  renderTime: number;
  jsHeapGrowth: number;
}

interface PerformanceAlert {
  type: "fps" | "memory" | "render" | "network";
  severity: "warning" | "critical";
  message: string;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  fpsThreshold?: number;
  memoryThreshold?: number;
  renderTimeThreshold?: number;
  onAlert?: (alert: PerformanceAlert) => void;
  sampleInterval?: number;
}

/**
 * Hook for monitoring mobile app performance
 */
export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    fpsThreshold = 30,
    memoryThreshold = 80,
    renderTimeThreshold = 16,
    onAlert,
    sampleInterval = 1000,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: null,
    networkType: "unknown",
    renderTime: 0,
    jsHeapGrowth: 0,
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const lastHeapSize = useRef(0);
  const rafId = useRef<number>();

  // FPS measurement
  const measureFPS = useCallback(() => {
    frameCount.current++;
    rafId.current = requestAnimationFrame(measureFPS);
  }, []);

  // Add alert
  const addAlert = useCallback((alert: Omit<PerformanceAlert, "timestamp">) => {
    const fullAlert = { ...alert, timestamp: Date.now() };
    setAlerts((prev) => [...prev.slice(-9), fullAlert]);
    onAlert?.(fullAlert);
  }, [onAlert]);

  // Sample metrics periodically
  useEffect(() => {
    // Start FPS measurement
    rafId.current = requestAnimationFrame(measureFPS);

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastFrameTime.current;
      const fps = Math.round((frameCount.current / elapsed) * 1000);
      
      // Reset counters
      frameCount.current = 0;
      lastFrameTime.current = now;

      // Get memory info (Chrome only)
      const memory = (performance as any).memory;
      const memoryInfo = memory
        ? {
          used: memory.usedJSHeapSize,
          total: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        }
        : null;

      // Calculate heap growth
      const heapGrowth = memory
        ? memory.usedJSHeapSize - lastHeapSize.current
        : 0;
      lastHeapSize.current = memory?.usedJSHeapSize || 0;

      // Get network type
      const connection = (navigator as any).connection;
      const networkType = connection?.effectiveType || "unknown";

      // Get render timing
      const paintEntries = performance.getEntriesByType("paint");
      const lastPaint = paintEntries[paintEntries.length - 1];
      const renderTime = lastPaint?.startTime || 0;

      const newMetrics: PerformanceMetrics = {
        fps,
        memory: memoryInfo,
        networkType,
        renderTime,
        jsHeapGrowth: heapGrowth,
      };

      setMetrics(newMetrics);

      // Check for issues and create alerts
      if (fps < fpsThreshold) {
        addAlert({
          type: "fps",
          severity: fps < 20 ? "critical" : "warning",
          message: `Low FPS: ${fps}fps (threshold: ${fpsThreshold})`,
        });
      }

      if (memoryInfo && memoryInfo.percentage > memoryThreshold) {
        addAlert({
          type: "memory",
          severity: memoryInfo.percentage > 90 ? "critical" : "warning",
          message: `High memory: ${memoryInfo.percentage.toFixed(1)}% (threshold: ${memoryThreshold}%)`,
        });
      }

      if (heapGrowth > 5 * 1024 * 1024) { // 5MB growth
        addAlert({
          type: "memory",
          severity: "warning",
          message: `Rapid heap growth: ${(heapGrowth / 1024 / 1024).toFixed(1)}MB`,
        });
      }

    }, sampleInterval);

    return () => {
      clearInterval(interval);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [measureFPS, fpsThreshold, memoryThreshold, addAlert, sampleInterval]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get optimization suggestions
  const getSuggestions = useCallback((): string[] => {
    const suggestions: string[] = [];

    if (metrics.fps < fpsThreshold) {
      suggestions.push("Reduce DOM complexity or use virtualization");
      suggestions.push("Optimize animations with CSS transforms");
      suggestions.push("Debounce scroll and resize handlers");
    }

    if (metrics.memory && metrics.memory.percentage > memoryThreshold) {
      suggestions.push("Check for memory leaks in useEffect cleanups");
      suggestions.push("Use React.memo for expensive components");
      suggestions.push("Implement pagination for large data sets");
    }

    if (metrics.networkType === "2g" || metrics.networkType === "slow-2g") {
      suggestions.push("Enable aggressive caching");
      suggestions.push("Compress images and use WebP format");
      suggestions.push("Reduce API payload sizes");
    }

    return suggestions;
  }, [metrics, fpsThreshold, memoryThreshold]);

  return {
    metrics,
    alerts,
    clearAlerts,
    getSuggestions,
    isHealthy: metrics.fps >= fpsThreshold && 
      (!metrics.memory || metrics.memory.percentage < memoryThreshold),
  };
}

/**
 * Component to display performance metrics (debug only)
 */
export function PerformanceOverlay() {
  const { metrics, alerts, isHealthy } = usePerformanceMonitor();

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        padding: 8,
        fontSize: 10,
        fontFamily: "monospace",
        backgroundColor: isHealthy ? "rgba(0,128,0,0.8)" : "rgba(255,0,0,0.8)",
        color: "white",
        borderRadius: 4,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div>FPS: {metrics.fps}</div>
      {metrics.memory && (
        <div>MEM: {metrics.memory.percentage.toFixed(0)}%</div>
      )}
      <div>NET: {metrics.networkType}</div>
      {alerts.length > 0 && (
        <div style={{ color: "yellow" }}>⚠ {alerts.length} alerts</div>
      )}
    </div>
  );
}
