/**
 * PATCH 178.0 - Unified Performance Metrics Hook
 * Fusão de: usePerformance.ts, use-performance-monitor.ts
 * 
 * Provides comprehensive performance monitoring including:
 * - FPS monitoring
 * - Web Vitals (LCP, FID, CLS, TTFB, FCP)
 * - Memory usage
 * - Render performance
 * - Long task detection
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { logger } from "@/lib/logger";

// =============================================================================
// TYPES
// =============================================================================

export interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
}

export interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
}

export interface PerformanceMetrics {
  fps: number;
  vitals: WebVitals;
  memory: MemoryInfo | null;
  longTaskCount: number;
  timestamp: number;
}

export interface PerformanceEvaluation {
  score: number;
  rating: "excellent" | "good" | "needs-improvement" | "poor";
  recommendations: string[];
}

interface UsePerformanceMetricsOptions {
  /** Enable FPS monitoring */
  monitorFps?: boolean;
  /** Enable Web Vitals monitoring */
  monitorVitals?: boolean;
  /** Enable memory monitoring */
  monitorMemory?: boolean;
  /** Interval for metric collection (ms) */
  interval?: number;
  /** Callback when metrics are updated */
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

// =============================================================================
// FPS MONITOR CLASS
// =============================================================================

class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private animationId: number | null = null;
  private callback: ((fps: number) => void) | null = null;

  start(callback: (fps: number) => void): void {
    this.callback = callback;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.callback = null;
  }

  private tick = (): void => {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      this.callback?.(fps);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.tick);
  };
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Unified performance metrics hook
 * Combines all performance monitoring into a single hook
 */
export function usePerformanceMetrics(options: UsePerformanceMetricsOptions = {}): {
  metrics: PerformanceMetrics;
  evaluation: PerformanceEvaluation;
  collectMetrics: () => PerformanceMetrics;
  cleanup: () => void;
} {
  const {
    monitorFps = true,
    monitorVitals = true,
    monitorMemory = true,
    interval = 5000,
    onMetricsUpdate,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    vitals: {},
    memory: null,
    longTaskCount: 0,
    timestamp: Date.now(),
  });

  const fpsMonitorRef = useRef<FPSMonitor | null>(null);
  const observersRef = useRef<PerformanceObserver[]>([]);
  const longTaskCountRef = useRef(0);

  // Collect all metrics
  const collectMetrics = useCallback((): PerformanceMetrics => {
    const newMetrics: PerformanceMetrics = {
      fps: metrics.fps,
      vitals: {},
      memory: null,
      longTaskCount: longTaskCountRef.current,
      timestamp: Date.now(),
    };

    // Navigation Timing API
    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.vitals.ttfb = navigation.responseStart - navigation.requestStart;
        newMetrics.vitals.fcp = navigation.responseEnd - navigation.fetchStart;
      }
    } catch (e) {
      // Navigation timing not available
    }

    // Memory Usage (Chrome/Edge only)
    if (monitorMemory && "memory" in performance) {
      const memory = (performance as any).memory;
      newMetrics.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);

    // Store in window for debugging
    if (typeof window !== "undefined") {
      (window as any).__NAUTILUS_PERFORMANCE__ = newMetrics;
    }

    return newMetrics;
  }, [metrics.fps, monitorMemory, onMetricsUpdate]);

  // FPS Monitoring
  useEffect(() => {
    if (!monitorFps) return;

    fpsMonitorRef.current = new FPSMonitor();
    fpsMonitorRef.current.start((fps) => {
      setMetrics(prev => ({ ...prev, fps }));
    });

    return () => {
      fpsMonitorRef.current?.stop();
    };
  }, [monitorFps]);

  // Web Vitals Monitoring
  useEffect(() => {
    if (!monitorVitals || !("PerformanceObserver" in window)) return;

    const cleanupObservers = () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    };

    cleanupObservers();

    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const lcp = lastEntry?.renderTime || lastEntry?.loadTime;
        if (lcp) {
          setMetrics(prev => ({ ...prev, vitals: { ...prev.vitals, lcp } }));
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"], buffered: true });
      observersRef.current.push(lcpObserver);
    } catch (e) {}

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, vitals: { ...prev.vitals, fid } }));
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"], buffered: true });
      observersRef.current.push(fidObserver);
    } catch (e) {}

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, vitals: { ...prev.vitals, cls: clsValue } }));
      });
      clsObserver.observe({ entryTypes: ["layout-shift"], buffered: true });
      observersRef.current.push(clsObserver);
    } catch (e) {}

    // Long Tasks
    try {
      if (PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              longTaskCountRef.current++;
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });
        observersRef.current.push(longTaskObserver);
      }
    } catch (e) {}

    return cleanupObservers;
  }, [monitorVitals]);

  // Periodic metric collection
  useEffect(() => {
    const timer = setInterval(collectMetrics, interval);
    return () => clearInterval(timer);
  }, [collectMetrics, interval]);

  // Performance evaluation
  const evaluation = useMemo((): PerformanceEvaluation => {
    const recommendations: string[] = []);
    let score = 100;

    // LCP scoring
    if (metrics.vitals.lcp) {
      if (metrics.vitals.lcp > 4000) {
        score -= 25;
        recommendations.push("LCP muito alto - otimize o carregamento do conteúdo principal");
      } else if (metrics.vitals.lcp > 2500) {
        score -= 10;
        recommendations.push("LCP pode ser melhorado - considere lazy loading");
      }
    }

    // FID scoring
    if (metrics.vitals.fid) {
      if (metrics.vitals.fid > 300) {
        score -= 25;
        recommendations.push("FID muito alto - reduza o tempo de execução do JavaScript");
      } else if (metrics.vitals.fid > 100) {
        score -= 10;
        recommendations.push("FID pode ser melhorado - otimize event handlers");
      }
    }

    // CLS scoring
    if (metrics.vitals.cls !== undefined) {
      if (metrics.vitals.cls > 0.25) {
        score -= 25;
        recommendations.push("CLS muito alto - estabilize as mudanças de layout");
      } else if (metrics.vitals.cls > 0.1) {
        score -= 10;
        recommendations.push("CLS pode ser melhorado - adicione dimensões às imagens");
      }
    }

    // FPS scoring
    if (metrics.fps < 30) {
      score -= 20;
      recommendations.push("FPS baixo - reduza animações complexas");
    } else if (metrics.fps < 50) {
      score -= 10;
      recommendations.push("FPS abaixo do ideal - otimize renderizações");
    }

    // Memory scoring
    if (metrics.memory && metrics.memory.percentage > 85) {
      score -= 15;
      recommendations.push("Alto uso de memória - verifique memory leaks");
    }

    // Determine rating
    let rating: "excellent" | "good" | "needs-improvement" | "poor";
    if (score >= 90) rating = "excellent";
    else if (score >= 75) rating = "good";
    else if (score >= 50) rating = "needs-improvement";
    else rating = "poor";

    return { score, rating, recommendations };
  }, [metrics]);

  const cleanup = useCallback(() => {
    fpsMonitorRef.current?.stop();
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current = [];
  }, []);

  return {
    metrics,
    evaluation,
    collectMetrics,
    cleanup,
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to track component render performance
 */
export function useRenderPerformance(componentName: string, enabled: boolean = true): void {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    renderCountRef.current++;
    const renderTime = performance.now() - startTimeRef.current;

    if (renderTime > 16) {
      logger.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`);
    }

    startTimeRef.current = performance.now();
  });
}

/**
 * Get current performance metrics snapshot
 */
export function getPerformanceSnapshot(): PerformanceMetrics | null {
  if (typeof window !== "undefined" && (window as any).__NAUTILUS_PERFORMANCE__) {
    return (window as any).__NAUTILUS_PERFORMANCE__;
  }
  return null;
}

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================

/** @deprecated Use usePerformanceMetrics instead */
export const usePerformanceMonitor = (options?: { enabled?: boolean; interval?: number }) => {
  return usePerformanceMetrics({
    monitorFps: options?.enabled ?? true,
    interval: options?.interval ?? 5000,
  });
};

/** @deprecated Use usePerformanceMetrics instead */
export const usePerformance = usePerformanceMetrics;

export default usePerformanceMetrics;
