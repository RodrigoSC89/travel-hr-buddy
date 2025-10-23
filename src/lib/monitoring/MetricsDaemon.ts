/**
 * Metrics Daemon
 * Collects and sends system metrics to Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import { systemWatchdog } from "./SystemWatchdog";
import { logsEngine } from "./LogsEngine";

export interface SystemMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  fps: number;
  active_modules: number;
  error_rate: number;
  avg_response_time: number;
}

class MetricsDaemon {
  private metricsInterval: NodeJS.Timeout | null = null;
  private readonly METRICS_INTERVAL_MS = 60000; // 1 minute
  private frameCount = 0;
  private lastFrameTime = performance.now();

  /**
   * Start collecting metrics
   */
  start() {
    console.log("📊 MetricsDaemon: Starting metrics collection...");
    
    // Track FPS
    this.trackFPS();
    
    // Collect metrics periodically
    this.metricsInterval = setInterval(() => {
      this.collectAndSendMetrics();
    }, this.METRICS_INTERVAL_MS);
    
    // Initial collection
    this.collectAndSendMetrics();
  }

  /**
   * Stop collecting metrics
   */
  stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      console.log("📊 MetricsDaemon: Stopped");
    }
  }

  /**
   * Track FPS using requestAnimationFrame
   */
  private trackFPS() {
    const trackFrame = () => {
      this.frameCount++;
      requestAnimationFrame(trackFrame);
    };
    requestAnimationFrame(trackFrame);
  }

  /**
   * Calculate current FPS
   */
  private calculateFPS(): number {
    const now = performance.now();
    const elapsed = (now - this.lastFrameTime) / 1000;
    const fps = Math.round(this.frameCount / elapsed);
    
    this.frameCount = 0;
    this.lastFrameTime = now;
    
    return fps;
  }

  /**
   * Estimate CPU usage (simplified)
   */
  private estimateCPU(): number {
    const fps = this.calculateFPS();
    const targetFPS = 60;
    
    // Simplified: lower FPS = higher CPU usage
    return Math.max(0, Math.min(100, 100 - (fps / targetFPS) * 100));
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  /**
   * Calculate error rate from logs
   */
  private calculateErrorRate(): number {
    const recentLogs = logsEngine.getRecentLogs(100);
    const errors = recentLogs.filter(log => log.level === "error" || log.level === "critical").length;
    return recentLogs.length > 0 ? (errors / recentLogs.length) * 100 : 0;
  }

  /**
   * Calculate average response time
   */
  private calculateAvgResponseTime(): number {
    const routeMetrics = systemWatchdog.getRouteMetrics();
    if (routeMetrics.length === 0) return 0;
    
    const sum = routeMetrics.reduce((acc, metric) => acc + metric.responseTime, 0);
    return Math.round(sum / routeMetrics.length);
  }

  /**
   * Collect and send metrics to Supabase
   */
  private async collectAndSendMetrics() {
    try {
      const systemStatus = systemWatchdog.getSystemStatus();
      
      const metrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        cpu_usage: this.estimateCPU(),
        memory_usage: this.getMemoryUsage(),
        fps: this.calculateFPS(),
        active_modules: systemStatus.active,
        error_rate: this.calculateErrorRate(),
        avg_response_time: this.calculateAvgResponseTime(),
      };

      await supabase.from("system_metrics").insert({
        timestamp: metrics.timestamp,
        metric_type: "performance",
        data: metrics,
      });

      logsEngine.debug("metrics", "Metrics collected and sent", metrics);
    } catch (error) {
      logsEngine.error("metrics", "Failed to collect/send metrics", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics(): SystemMetrics {
    const systemStatus = systemWatchdog.getSystemStatus();
    
    return {
      timestamp: new Date().toISOString(),
      cpu_usage: this.estimateCPU(),
      memory_usage: this.getMemoryUsage(),
      fps: this.calculateFPS(),
      active_modules: systemStatus.active,
      error_rate: this.calculateErrorRate(),
      avg_response_time: this.calculateAvgResponseTime(),
    };
  }
}

// Singleton instance
export const metricsDaemon = new MetricsDaemon();
