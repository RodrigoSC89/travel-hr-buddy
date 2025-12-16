/**
 * Memory Leak Monitor
 * PATCH 541 Phase 3 - Memory validation
 */

export interface MemorySnapshot {
  timestamp: Date;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  percentUsed: number;
}

export interface MemoryLeakReport {
  hasLeak: boolean;
  severity: "none" | "low" | "medium" | "high" | "critical";
  growthRate: number; // MB per minute
  snapshots: MemorySnapshot[];
  recommendation: string;
}

class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private monitoringInterval: number | null = null;

  /**
   * Start monitoring memory usage
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.monitoringInterval) {
      console.warn("Memory monitoring already started");
      return;
    }

    this.snapshots = [];
    this.takeSnapshot();

    this.monitoringInterval = window.setInterval(() => {
      this.takeSnapshot();
    }, intervalMs);

    console.log("Memory monitoring started");
  }

  /**
   * Stop monitoring and generate report
   */
  stopMonitoring(): MemoryLeakReport {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    return this.generateReport();
  }

  /**
   * Take memory snapshot
   */
  private takeSnapshot(): void {
    if (!(performance as any).memory) {
      console.warn("Performance.memory API not available");
      return;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: new Date(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };

    this.snapshots.push(snapshot);

    // Keep only last 50 snapshots
    if (this.snapshots.length > 50) {
      this.snapshots.shift();
    }
  }

  /**
   * Generate memory leak report
   */
  private generateReport(): MemoryLeakReport {
    if (this.snapshots.length < 2) {
      return {
        hasLeak: false,
        severity: "none",
        growthRate: 0,
        snapshots: this.snapshots,
        recommendation: "Insufficient data to detect memory leaks"
      };
    }

    // Calculate memory growth rate
    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    
    const memoryGrowthBytes = lastSnapshot.usedJSHeapSize - firstSnapshot.usedJSHeapSize;
    const timeElapsedMs = lastSnapshot.timestamp.getTime() - firstSnapshot.timestamp.getTime();
    const timeElapsedMin = timeElapsedMs / 1000 / 60;
    
    const growthRateMBPerMin = (memoryGrowthBytes / 1024 / 1024) / timeElapsedMin;

    // Detect leak
    const hasLeak = growthRateMBPerMin > 1; // More than 1MB/min growth
    const severity = this.calculateSeverity(growthRateMBPerMin, lastSnapshot.percentUsed);
    const recommendation = this.getRecommendation(severity, growthRateMBPerMin);

    return {
      hasLeak,
      severity,
      growthRate: Math.round(growthRateMBPerMin * 100) / 100,
      snapshots: this.snapshots,
      recommendation
    };
  }

  /**
   * Calculate leak severity
   */
  private calculateSeverity(
    growthRate: number,
    percentUsed: number
  ): "none" | "low" | "medium" | "high" | "critical" {
    if (percentUsed > 90) return "critical";
    if (growthRate > 10) return "critical";
    if (growthRate > 5) return "high";
    if (growthRate > 2) return "medium";
    if (growthRate > 1) return "low";
    return "none";
  }

  /**
   * Get recommendation based on severity
   */
  private getRecommendation(severity: string, growthRate: number): string {
    switch (severity) {
    case "critical":
      return "CRITICAL: Immediate action required. Memory usage is extremely high or growing rapidly. Check for uncleaned intervals, event listeners, or large data accumulation.";
    case "high":
      return "HIGH: Memory leak detected. Growing at " + growthRate.toFixed(2) + " MB/min. Review component cleanup and data management.";
    case "medium":
      return "MEDIUM: Moderate memory growth detected. Monitor closely and optimize data handling.";
    case "low":
      return "LOW: Slight memory increase detected. Normal for complex applications but worth monitoring.";
    default:
      return "No significant memory issues detected. Memory usage is stable.";
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemory(): MemorySnapshot | null {
    if (!(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      timestamp: new Date(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }

  /**
   * Clear snapshots
   */
  clear(): void {
    this.snapshots = [];
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const memoryMonitor = new MemoryMonitor();
