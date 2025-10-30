/**
 * Performance Monitoring Utilities
 * PATCH 621: Monitor and log performance metrics
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly warningThreshold = 300; // ms
  private readonly criticalThreshold = 1000; // ms

  /**
   * Start timing a performance metric
   */
  start(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
    console.time(name);
  }

  /**
   * End timing and log performance metric
   */
  end(name: string): number | undefined {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Performance metric "${name}" was not started`);
      return undefined;
    }

    const duration = performance.now() - metric.startTime;
    metric.duration = duration;
    
    console.timeEnd(name);

    // Log performance warnings
    if (duration > this.criticalThreshold) {
      console.error(`🔴 CRITICAL: ${name} took ${duration.toFixed(2)}ms (>${this.criticalThreshold}ms)`);
    } else if (duration > this.warningThreshold) {
      console.warn(`⚠️ WARNING: ${name} took ${duration.toFixed(2)}ms (>${this.warningThreshold}ms)`);
    } else {
      console.log(`✅ ${name} completed in ${duration.toFixed(2)}ms`);
    }

    this.metrics.delete(name);
    return duration;
  }

  /**
   * Measure async operation
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

  /**
   * Measure sync operation
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
   * Get all metrics summary
   */
  getSummary(): { [key: string]: number } {
    const summary: { [key: string]: number } = {};
    this.metrics.forEach((metric, name) => {
      if (metric.duration !== undefined) {
        summary[name] = metric.duration;
      }
    });
    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator to measure component render time
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    performanceMonitor.start(`render:${componentName}`);
    React.useEffect(() => {
      performanceMonitor.end(`render:${componentName}`);
    }, []);
    
    return React.createElement(Component, props);
  };
}
