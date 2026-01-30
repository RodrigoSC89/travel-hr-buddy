/**
 * Metrics Daemon - Optimized
 * Lightweight metrics collection (disabled by default)
 */

import { Logger } from "@/lib/utils/logger";

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
  private animationFrameId: number | null = null;
  private isRunning = false;
  private readonly METRICS_INTERVAL_MS = 60000;
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private lastFPS = 60;

  start() {
    // Disabled by default to prevent memory issues
    const ENABLE = import.meta.env.VITE_ENABLE_CLIENT_METRICS === "true";
    if (!ENABLE) {
      Logger.info("MetricsDaemon disabled", undefined, "MetricsDaemon");
      return;
    }

    if (this.isRunning) return;
    this.isRunning = true;
    
    Logger.info("MetricsDaemon starting", undefined, "MetricsDaemon");
    this.trackFPS();
    
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.METRICS_INTERVAL_MS);
  }

  stop() {
    this.isRunning = false;
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private trackFPS() {
    if (!this.isRunning) return;
    
    const trackFrame = () => {
      if (!this.isRunning) return;
      
      this.frameCount++;
      this.animationFrameId = requestAnimationFrame(trackFrame);
    };
    
    this.animationFrameId = requestAnimationFrame(trackFrame);
  }

  private calculateFPS(): number {
    const now = performance.now();
    const elapsed = (now - this.lastFrameTime) / 1000;
    
    if (elapsed > 0) {
      this.lastFPS = Math.round(this.frameCount / elapsed);
    }
    
    this.frameCount = 0;
    this.lastFrameTime = now;
    
    return this.lastFPS;
  }

  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  private collectMetrics() {
    if (!this.isRunning) return;
    
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      cpu_usage: 0,
      memory_usage: this.getMemoryUsage(),
      fps: this.calculateFPS(),
      active_modules: 0,
      error_rate: 0,
      avg_response_time: 0,
    };

    Logger.debug("Metrics collected", metrics, "MetricsDaemon");
  }

  getCurrentMetrics(): SystemMetrics {
    return {
      timestamp: new Date().toISOString(),
      cpu_usage: 0,
      memory_usage: this.getMemoryUsage(),
      fps: this.lastFPS,
      active_modules: 0,
      error_rate: 0,
      avg_response_time: 0,
    };
  }
}

export const metricsDaemon = new MetricsDaemon();
