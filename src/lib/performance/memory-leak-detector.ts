/**
 * Memory Leak Detector - PATCH 975
 * Detects memory leaks and CPU inefficiencies
 */

interface LeakReport {
  component: string;
  type: "event-listener" | "timer" | "closure" | "dom-reference" | "subscription";
  severity: "low" | "medium" | "high";
  suggestion: string;
}

interface CPUReport {
  hotspot: string;
  duration: number;
  frequency: number;
  suggestion: string;
}

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  growth: number;
}

class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private intervalId: number | null = null;
  private listeners: Map<string, number> = new Map();
  private timers: Set<number> = new Set();
  private readonly MAX_SNAPSHOTS = 60;
  
  /**
   * Start monitoring memory usage
   */
  startMonitoring(intervalMs: number = 10000): void {
    if (this.intervalId) return;
    
    this.takeSnapshot();
    
    this.intervalId = window.setInterval(() => {
      this.takeSnapshot();
      this.analyzeGrowth();
    }, intervalMs);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): void {
    const perf = performance as any;
    
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: perf.memory?.usedJSHeapSize || 0,
      heapTotal: perf.memory?.totalJSHeapSize || 0,
      external: 0,
      growth: 0
    };
    
    if (this.snapshots.length > 0) {
      const last = this.snapshots[this.snapshots.length - 1];
      snapshot.growth = snapshot.heapUsed - last.heapUsed;
    }
    
    this.snapshots.push(snapshot);
    
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
  }
  
  /**
   * Analyze memory growth patterns
   */
  private analyzeGrowth(): void {
    if (this.snapshots.length < 5) return;
    
    const recentGrowth = this.snapshots
      .slice(-5)
      .reduce((sum, s) => sum + s.growth, 0);
    
    // Warning if growing more than 5MB in last 5 snapshots
    if (recentGrowth > 5 * 1024 * 1024) {
    }
  }
  
  /**
   * Track event listener registration
   */
  trackListener(component: string, add: boolean): void {
    const current = this.listeners.get(component) || 0;
    this.listeners.set(component, add ? current + 1 : Math.max(0, current - 1));
  }
  
  /**
   * Track timer creation
   */
  trackTimer(id: number, add: boolean): void {
    if (add) {
      this.timers.add(id);
    } else {
      this.timers.delete(id);
    }
  }
  
  /**
   * Get potential leak report
   */
  getLeakReport(): LeakReport[] {
    const reports: LeakReport[] = [];
    
    // Check for components with many listeners
    this.listeners.forEach((count, component) => {
      if (count > 10) {
        reports.push({
          component,
          type: "event-listener",
          severity: count > 50 ? "high" : count > 20 ? "medium" : "low",
          suggestion: `Componente "${component}" tem ${count} listeners ativos. Verifique se estão sendo removidos no cleanup.`
        });
      }
    });
    
    // Check for many active timers
    if (this.timers.size > 20) {
      reports.push({
        component: "Global",
        type: "timer",
        severity: this.timers.size > 50 ? "high" : "medium",
        suggestion: `${this.timers.size} timers ativos. Considere usar um único timer centralizado.`
      });
    }
    
    return reports;
  }
  
  /**
   * Get memory stats
   */
  getStats(): {
    currentHeapMB: number;
    maxHeapMB: number;
    averageGrowthKB: number;
    snapshotCount: number;
    potentialLeaks: boolean;
    } {
    const current = this.snapshots[this.snapshots.length - 1];
    const avgGrowth = this.snapshots.length > 1
      ? this.snapshots.slice(1).reduce((sum, s) => sum + s.growth, 0) / (this.snapshots.length - 1)
      : 0;
    
    return {
      currentHeapMB: current ? Math.round(current.heapUsed / 1024 / 1024) : 0,
      maxHeapMB: current ? Math.round(current.heapTotal / 1024 / 1024) : 0,
      averageGrowthKB: Math.round(avgGrowth / 1024),
      snapshotCount: this.snapshots.length,
      potentialLeaks: avgGrowth > 500 * 1024 // More than 500KB average growth
    };
  }
  
  /**
   * Force garbage collection (if available in dev tools)
   */
  requestGC(): void {
    if ((window as any).gc) {
      (window as any).gc();
    }
  }
  
  /**
   * Clear monitoring data
   */
  reset(): void {
    this.snapshots = [];
    this.listeners.clear();
    this.timers.clear();
  }
}

/**
 * Throttle function with memory optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = window.setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function with cleanup
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): { call: (...args: Parameters<T>) => void; cancel: () => void } {
  let timeoutId: number | null = null;
  
  return {
    call: (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        fn(...args);
      }, delay);
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };
}

/**
 * Create cleanup-aware effect
 */
export function createCleanupEffect(setup: () => (() => void) | void): () => void {
  const cleanup = setup();
  return () => {
    if (typeof cleanup === "function") {
      cleanup();
    }
  };
}

export const memoryLeakDetector = new MemoryLeakDetector();
