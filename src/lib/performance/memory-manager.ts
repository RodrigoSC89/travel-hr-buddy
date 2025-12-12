/**
 * Memory Manager
 * Monitors and optimizes memory usage for low-end devices
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryStatus {
  available: boolean;
  usage: number; // 0-100 percentage
  isLow: boolean;
  recommendation: "normal" | "reduce" | "critical";
}

class MemoryManager {
  private cleanupCallbacks: Set<() => void> = new Set();
  private checkInterval: number | null = null;
  private lastStatus: MemoryStatus | null = null;

  /**
   * Get current memory status
   */
  getStatus(): MemoryStatus {
    const memory = (performance as any).memory as MemoryInfo | undefined;
    
    if (!memory) {
      return {
        available: false,
        usage: 0,
        isLow: false,
        recommendation: "normal",
      };
    }

    const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    const isLow = usage > 80;
    
    let recommendation: "normal" | "reduce" | "critical" = "normal";
    if (usage > 90) recommendation = "critical";
    else if (usage > 70) recommendation = "reduce";

    return {
      available: true,
      usage,
      isLow,
      recommendation,
    };
  }

  /**
   * Register cleanup callback for low memory situations
   */
  registerCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);
    return () => this.cleanupCallbacks.delete(callback);
  }

  /**
   * Trigger cleanup of non-essential resources
   */
  cleanup() {
    
    // Clear image caches
    if ("caches" in window) {
      caches.keys().then(names => {
        names.filter(n => n.includes("image")).forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Run registered cleanup callbacks
    this.cleanupCallbacks.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.warn("[MemoryManager] Cleanup callback failed:", e);
        console.warn("[MemoryManager] Cleanup callback failed:", e);
      }
    });

    // Suggest garbage collection (doesn't guarantee it runs)
    if ("gc" in window) {
      (window as any).gc();
    }
  }

  /**
   * Start monitoring memory usage
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.checkInterval) return;

    this.checkInterval = window.setInterval(() => {
      const status = this.getStatus();
      
      if (status.available && status.recommendation !== this.lastStatus?.recommendation) {
        
        if (status.recommendation === "critical") {
          this.cleanup();
        }
      }
      
      this.lastStatus = status;
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get recommendations for reducing memory usage
   */
  getOptimizationRecommendations(): string[] {
    const status = this.getStatus();
    const recommendations: string[] = [];

    if (!status.available) {
      recommendations.push("Memory API not available in this browser");
      return recommendations;
    }

    if (status.usage > 50) {
      recommendations.push("Consider lazy loading more components");
      recommendations.push("Reduce image quality on this device");
    }

    if (status.usage > 70) {
      recommendations.push("Disable animations to reduce memory");
      recommendations.push("Limit list virtualization window size");
    }

    if (status.usage > 85) {
      recommendations.push("Consider clearing cached data");
      recommendations.push("Reduce real-time update frequency");
    }

    return recommendations;
  }
}

export const memoryManager = new MemoryManager();

/**
 * Hook-friendly memory check
 */
export function shouldReduceMemory(): boolean {
  const status = memoryManager.getStatus();
  return status.recommendation !== "normal";
}

/**
 * Get optimal settings based on memory
 */
export function getMemoryAwareSettings() {
  const status = memoryManager.getStatus();
  
  return {
    enableAnimations: status.recommendation === "normal",
    imageQuality: status.recommendation === "critical" ? 40 : status.recommendation === "reduce" ? 60 : 80,
    virtualListOverscan: status.recommendation === "critical" ? 1 : status.recommendation === "reduce" ? 2 : 5,
    cacheSize: status.recommendation === "critical" ? 10 : status.recommendation === "reduce" ? 25 : 50,
    enablePrefetch: status.recommendation === "normal",
  };
}
