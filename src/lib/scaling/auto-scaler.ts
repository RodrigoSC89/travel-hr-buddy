/**
 * Auto Scaler - PROMPT 18
 * Scaling strategy for 10k→1M users
 */

import { logger } from "@/lib/logger";

interface ScalingConfig {
  maxConcurrentRequests: number;
  requestTimeout: number;
  cacheStrategy: "aggressive" | "moderate" | "minimal";
  compressionLevel: "high" | "medium" | "low";
  imageQuality: number;
  enableCDN: boolean;
  enableEdgeCaching: boolean;
}

interface LoadMetrics {
  activeConnections: number;
  requestsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

type ScaleLevel = "minimal" | "standard" | "high" | "extreme";

class AutoScaler {
  private config: ScalingConfig;
  private metrics: LoadMetrics = {
    activeConnections: 0,
    requestsPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  };
  private scaleLevel: ScaleLevel = "standard";
  private requestQueue: Array<() => Promise<void>> = [];
  private processing = false;

  constructor() {
    this.config = this.getConfigForLevel("standard");
    this.startMetricsCollection();
  }

  /**
   * Get configuration for scale level
   */
  private getConfigForLevel(level: ScaleLevel): ScalingConfig {
    const configs: Record<ScaleLevel, ScalingConfig> = {
      minimal: {
        maxConcurrentRequests: 50,
        requestTimeout: 30000,
        cacheStrategy: "minimal",
        compressionLevel: "low",
        imageQuality: 90,
        enableCDN: false,
        enableEdgeCaching: false,
      },
      standard: {
        maxConcurrentRequests: 100,
        requestTimeout: 15000,
        cacheStrategy: "moderate",
        compressionLevel: "medium",
        imageQuality: 80,
        enableCDN: true,
        enableEdgeCaching: false,
      },
      high: {
        maxConcurrentRequests: 200,
        requestTimeout: 10000,
        cacheStrategy: "aggressive",
        compressionLevel: "high",
        imageQuality: 70,
        enableCDN: true,
        enableEdgeCaching: true,
      },
      extreme: {
        maxConcurrentRequests: 500,
        requestTimeout: 5000,
        cacheStrategy: "aggressive",
        compressionLevel: "high",
        imageQuality: 60,
        enableCDN: true,
        enableEdgeCaching: true,
      },
    };

    return configs[level];
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
      this.adjustScaleLevel();
    }, 10000); // Every 10 seconds
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): void {
    // Memory usage
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
    if (perf.memory) {
      this.metrics.memoryUsage = (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100;
    }

    // Estimate CPU from frame rate
    let lastTime = performance.now();
    let frameCount = 0;
    const measureFrames = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = frameCount;
        this.metrics.cpuUsage = Math.max(0, 100 - (fps / 60) * 100);
        frameCount = 0;
        lastTime = now;
      } else {
        requestAnimationFrame(measureFrames);
      }
    };
    requestAnimationFrame(measureFrames);

    // Connection count (estimated from pending requests)
    this.metrics.activeConnections = this.requestQueue.length;
  }

  /**
   * Adjust scale level based on metrics
   */
  private adjustScaleLevel(): void {
    const { memoryUsage, cpuUsage, errorRate, averageLatency } = this.metrics;
    let newLevel: ScaleLevel = "standard";

    // High load indicators
    if (memoryUsage > 80 || cpuUsage > 70 || errorRate > 5 || averageLatency > 2000) {
      newLevel = "extreme";
    } else if (memoryUsage > 60 || cpuUsage > 50 || errorRate > 2 || averageLatency > 1000) {
      newLevel = "high";
    } else if (memoryUsage < 30 && cpuUsage < 30 && errorRate < 1 && averageLatency < 500) {
      newLevel = "minimal";
    }

    if (newLevel !== this.scaleLevel) {
      logger.info(`Auto-scaling: ${this.scaleLevel} → ${newLevel}`);
      this.scaleLevel = newLevel;
      this.config = this.getConfigForLevel(newLevel);
      this.applyConfig();
    }
  }

  /**
   * Apply current configuration
   */
  private applyConfig(): void {
    // Update document with current config hints
    document.documentElement.dataset.scaleLevel = this.scaleLevel;
    document.documentElement.dataset.cacheStrategy = this.config.cacheStrategy;
    
    // Emit event for components to react
    window.dispatchEvent(new CustomEvent("scaling-config-changed", {
      detail: this.config
    }));
  }

  /**
   * Execute request with scaling limits
   */
  async executeRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        const startTime = performance.now();
        
        try {
          const result = await Promise.race([
            request(),
            new Promise<never>((_, rej) => 
              setTimeout(() => rej(new Error("Request timeout")), this.config.requestTimeout)
            )
          ]);
          
          // Update latency metric
          const latency = performance.now() - startTime;
          this.metrics.averageLatency = 
            (this.metrics.averageLatency * 0.9) + (latency * 0.1);
          
          resolve(result);
        } catch (error) {
          this.metrics.errorRate = Math.min(100, this.metrics.errorRate + 0.1);
          reject(error);
        }
      };

      // Add to queue if at capacity
      if (this.metrics.activeConnections >= this.config.maxConcurrentRequests) {
        this.requestQueue.push(execute as () => Promise<void>);
        this.processQueue();
      } else {
        execute();
      }
    });
  }

  /**
   * Process request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    while (
      this.requestQueue.length > 0 && 
      this.metrics.activeConnections < this.config.maxConcurrentRequests
    ) {
      const request = this.requestQueue.shift();
      if (request) {
        this.metrics.activeConnections++;
        request().finally(() => {
          this.metrics.activeConnections--;
        });
      }
    }
    
    this.processing = false;
  }

  /**
   * Get image URL with quality adjustment
   */
  getOptimizedImageUrl(url: string, width?: number): string {
    const quality = this.config.imageQuality;
    
    if (url.includes("supabase")) {
      // Supabase Storage transformation
      return `${url}?quality=${quality}${width ? `&width=${width}` : ""}`;
    }
    
    return url;
  }

  /**
   * Should use lite mode
   */
  shouldUseLiteMode(): boolean {
    return this.scaleLevel === "extreme" || this.scaleLevel === "high";
  }

  /**
   * Get current config
   */
  getConfig(): ScalingConfig {
    return { ...this.config };
  }

  /**
   * Get current metrics
   */
  getMetrics(): LoadMetrics {
    return { ...this.metrics };
  }

  /**
   * Get scale level
   */
  getScaleLevel(): ScaleLevel {
    return this.scaleLevel;
  }

  /**
   * Force scale level
   */
  forceScaleLevel(level: ScaleLevel): void {
    this.scaleLevel = level;
    this.config = this.getConfigForLevel(level);
    this.applyConfig();
  }
}

export const autoScaler = new AutoScaler();
