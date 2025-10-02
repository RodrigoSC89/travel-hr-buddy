/**
 * Performance Monitoring Utility
 * Tracks and logs performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100;

  /**
   * Mark a performance point
   */
  public mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  public measure(name: string, startMark: string, endMark: string): number | null {
    try {
      if (typeof performance !== 'undefined' && performance.measure) {
        performance.measure(name, startMark, endMark);
        
        const entries = performance.getEntriesByName(name, 'measure');
        if (entries.length > 0) {
          const duration = entries[entries.length - 1].duration;
          
          this.recordMetric(name, duration);
          
          // Cleanup
          performance.clearMarks(startMark);
          performance.clearMarks(endMark);
          performance.clearMeasures(name);
          
          return duration;
        }
      }
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
    
    return null;
  }

  /**
   * Record a custom metric
   */
  public recordMetric(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Limit stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (value > 1000) {
      console.warn(`Slow operation detected: ${name} took ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Get metrics by name
   */
  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  /**
   * Get average metric value
   */
  public getAverage(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics = [];
  }

  /**
   * Monitor component render time
   */
  public monitorComponent(componentName: string): {
    start: () => void;
    end: () => void;
  } {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    return {
      start: () => this.mark(startMark),
      end: () => {
        this.mark(endMark);
        const duration = this.measure(measureName, startMark, endMark);
        
        if (duration && duration > 16.67) {
          console.warn(`Component ${componentName} render took ${duration.toFixed(2)}ms (> 16.67ms)`);
        }
      },
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
