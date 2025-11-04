/**
 * PATCH 653 - Loop Debugger Utility
 * Tracks and logs loop execution patterns for debugging
 */

interface ExecutionRecord {
  functionName: string;
  timestamp: number;
  args?: any[];
  stackTrace: string;
}

interface LoopStats {
  functionName: string;
  totalExecutions: number;
  executionsPerSecond: number;
  firstExecution: number;
  lastExecution: number;
  averageInterval: number;
}

class LoopDebugger {
  private executionRecords: Map<string, ExecutionRecord[]> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';
  private maxRecordsPerFunction: number = 100;

  /**
   * Enable or disable loop debugging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Track a function execution
   */
  track(functionName: string, args?: any[]): void {
    if (!this.enabled) return;

    const record: ExecutionRecord = {
      functionName,
      timestamp: Date.now(),
      args: args ? this.sanitizeArgs(args) : undefined,
      stackTrace: new Error().stack || 'No stack trace',
    };

    if (!this.executionRecords.has(functionName)) {
      this.executionRecords.set(functionName, []);
    }

    const records = this.executionRecords.get(functionName)!;
    records.push(record);

    // Limit records to prevent memory leaks
    if (records.length > this.maxRecordsPerFunction) {
      records.shift();
    }

    // Auto-detect potential loops
    this.detectLoop(functionName);
  }

  /**
   * Sanitize arguments to prevent circular references
   */
  private sanitizeArgs(args: any[]): any[] {
    try {
      return JSON.parse(JSON.stringify(args));
    } catch {
      return args.map((arg) => {
        if (typeof arg === 'object' && arg !== null) {
          return '[Object]';
        }
        if (typeof arg === 'function') {
          return '[Function]';
        }
        return arg;
      });
    }
  }

  /**
   * Detect if a function is executing in a loop pattern
   */
  private detectLoop(functionName: string): void {
    const records = this.executionRecords.get(functionName);
    if (!records || records.length < 5) return;

    const recentRecords = records.slice(-5);
    const timeSpan =
      recentRecords[recentRecords.length - 1].timestamp - recentRecords[0].timestamp;

    // If 5 executions within 1 second, it's likely a loop
    if (timeSpan < 1000) {
      console.warn(
        `⚠️ Potential loop detected: ${functionName} executed ${recentRecords.length} times in ${timeSpan}ms`,
        {
          records: recentRecords.map((r) => ({
            timestamp: new Date(r.timestamp).toISOString(),
            args: r.args,
          })),
        }
      );
    }
  }

  /**
   * Get statistics for a specific function
   */
  getStats(functionName: string): LoopStats | null {
    const records = this.executionRecords.get(functionName);
    if (!records || records.length === 0) return null;

    const totalExecutions = records.length;
    const firstExecution = records[0].timestamp;
    const lastExecution = records[records.length - 1].timestamp;
    const timeSpan = lastExecution - firstExecution;

    const intervals: number[] = [];
    for (let i = 1; i < records.length; i++) {
      intervals.push(records[i].timestamp - records[i - 1].timestamp);
    }

    const averageInterval =
      intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;

    return {
      functionName,
      totalExecutions,
      executionsPerSecond: timeSpan > 0 ? (totalExecutions / timeSpan) * 1000 : 0,
      firstExecution,
      lastExecution,
      averageInterval,
    };
  }

  /**
   * Get all tracked function statistics
   */
  getAllStats(): LoopStats[] {
    const stats: LoopStats[] = [];
    for (const functionName of this.executionRecords.keys()) {
      const stat = this.getStats(functionName);
      if (stat) {
        stats.push(stat);
      }
    }
    return stats.sort((a, b) => b.executionsPerSecond - a.executionsPerSecond);
  }

  /**
   * Generate a report of potential loops
   */
  generateReport(): string {
    const stats = this.getAllStats();
    const potentialLoops = stats.filter((s) => s.executionsPerSecond > 2);

    if (potentialLoops.length === 0) {
      return '✅ No loops detected';
    }

    let report = '🔁 LOOP DETECTION REPORT\n\n';
    report += `Found ${potentialLoops.length} potential loops:\n\n`;

    potentialLoops.forEach((stat, index) => {
      report += `${index + 1}. ${stat.functionName}\n`;
      report += `   - Total executions: ${stat.totalExecutions}\n`;
      report += `   - Executions/second: ${stat.executionsPerSecond.toFixed(2)}\n`;
      report += `   - Average interval: ${stat.averageInterval.toFixed(2)}ms\n\n`;
    });

    return report;
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.executionRecords.clear();
  }

  /**
   * Export data for external analysis
   */
  export(): Record<string, ExecutionRecord[]> {
    const data: Record<string, ExecutionRecord[]> = {};
    for (const [key, value] of this.executionRecords.entries()) {
      data[key] = value;
    }
    return data;
  }
}

// Singleton instance
export const loopDebugger = new LoopDebugger();

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).__loopDebugger = loopDebugger;
}

/**
 * Decorator to automatically track function executions
 */
export function trackLoop(functionName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const trackingName = functionName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      loopDebugger.track(trackingName, args);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
