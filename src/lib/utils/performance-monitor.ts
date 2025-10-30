/**
 * Performance Monitor
 * Track operation timing with automatic warnings and errors
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  warning?: boolean;
  error?: boolean;
}

const WARN_THRESHOLD_MS = 300;
const ERROR_THRESHOLD_MS = 1000;

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  /**
   * Start measuring an operation
   */
  start(name: string): void {
    this.metrics.set(name, performance.now());
  }

  /**
   * End measuring an operation and log if needed
   */
  end(name: string): PerformanceMetric | null {
    const startTime = this.metrics.get(name);
    if (!startTime) {
      console.warn(`[Performance] No start time found for: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      warning: duration > WARN_THRESHOLD_MS,
      error: duration > ERROR_THRESHOLD_MS,
    };

    // Log based on threshold
    if (metric.error) {
      console.error(`[Performance ERROR] ${name} took ${duration.toFixed(2)}ms (> ${ERROR_THRESHOLD_MS}ms)`);
    } else if (metric.warning) {
      console.warn(`[Performance WARNING] ${name} took ${duration.toFixed(2)}ms (> ${WARN_THRESHOLD_MS}ms)`);
    } else {
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }

    return metric;
  }

  /**
   * Measure a synchronous function
   */
  measureSync<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure an asynchronous function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
