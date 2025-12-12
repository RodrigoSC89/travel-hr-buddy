/**
 * UNIFIED PERFORMANCE HOOK
 * Fusão de: usePerformance.ts + use-performance-monitor.ts
 * 
 * Combina:
 * - FPS monitoring, render profiling (usePerformance.ts)
 * - Web Vitals, memory monitoring (use-performance-monitor.ts)
 * - Lazy loading, debounce/throttle helpers (usePerformance.ts)
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { logger } from "@/lib/logger";

// ============================================
// TYPES
// ============================================

export interface WebVitals {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  inp?: number;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
}

export interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  memory: MemoryMetrics | null;
  fps: number;
  timestamp: number;
}

export interface PerformanceEvaluation {
  score: number;
  rating: "excellent" | "good" | "needs-improvement" | "poor";
  recommendations: string[];
}

// ============================================
// FPS MONITOR CLASS
// ============================================

class FPSMonitor {
  private animationId: number | null = null;
  private lastTime: number = 0;
  private frames: number = 0;
  
  start(callback: (fps: number) => void): void {
    const measure = (time: number) => {
      this.frames++;
      
      if (time - this.lastTime >= 1000) {
        callback(this.frames);
        this.frames = 0;
        this.lastTime = time;
      }
      
      this.animationId = requestAnimationFrame(measure);
    });
    
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(measure);
  }
  
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ============================================
// PERFORMANCE METRICS COLLECTION
// ============================================

export function getPerformanceMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    memory: null,
    fps: 60,
    timestamp: Date.now()
  };

  try {
    // Navigation Timing API
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.fcp = navigation.responseEnd - navigation.fetchStart;
    }

    // Memory Usage (Chrome/Edge only)
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      metrics.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      });
    }
  } catch (error) {
    logger.error("Error collecting performance metrics:", error);
  }

  return metrics;
}

export function evaluatePerformance(metrics: PerformanceMetrics): PerformanceEvaluation {
  const recommendations: string[] = [];
  let score = 100;

  if (metrics.lcp !== null) {
    if (metrics.lcp > 4000) {
      score -= 25;
      recommendations.push("LCP too high - optimize largest content loading");
    } else if (metrics.lcp > 2500) {
      score -= 10;
      recommendations.push("LCP could be improved - consider lazy loading");
    }
  }

  if (metrics.fid !== null) {
    if (metrics.fid > 300) {
      score -= 25;
      recommendations.push("FID too high - reduce JavaScript execution time");
    } else if (metrics.fid > 100) {
      score -= 10;
      recommendations.push("FID could be improved - optimize event handlers");
    }
  }

  if (metrics.cls !== null) {
    if (metrics.cls > 0.25) {
      score -= 25;
      recommendations.push("CLS too high - stabilize layout shifts");
    } else if (metrics.cls > 0.1) {
      score -= 10;
      recommendations.push("CLS could be improved - add size attributes to images");
    }
  }

  if (metrics.memory && metrics.memory.percentage > 85) {
    score -= 15;
    recommendations.push("High memory usage - check for memory leaks");
  }

  if (metrics.fps < 30) {
    score -= 20;
    recommendations.push("Low FPS - reduce rendering complexity");
  } else if (metrics.fps < 50) {
    score -= 10;
    recommendations.push("FPS could be improved - optimize animations");
  }

  let rating: "excellent" | "good" | "needs-improvement" | "poor";
  if (score >= 90) rating = "excellent";
  else if (score >= 75) rating = "good";
  else if (score >= 50) rating = "needs-improvement";
  else rating = "poor";

  return { score, rating, recommendations };
}

// ============================================
// HOOKS
// ============================================

/**
 * Monitor FPS in component
 */
export function useFPSMonitor(enabled: boolean = true): number {
  const [fps, setFps] = useState(60);
  const monitorRef = useRef<FPSMonitor | null>(null);

  useEffect(() => {
    if (!enabled) return;

    monitorRef.current = new FPSMonitor();
    monitorRef.current.start((currentFps) => {
      setFps(currentFps);
    });

    return () => {
      monitorRef.current?.stop();
    });
  }, [enabled]);

  return fps;
}

/**
 * Track component render performance
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
 * Monitor Web Vitals
 */
export function useWebVitals(): WebVitals {
  const [vitals, setVitals] = useState<WebVitals>({});

  useEffect(() => {
    if (!("PerformanceObserver" in window)) return;

    const observers: PerformanceObserver[] = [];

    try {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        setVitals(prev => ({ ...prev, lcp: lastEntry?.renderTime || lastEntry?.loadTime }));
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"], buffered: true });
      observers.push(lcpObserver);
    } catch {}

    try {
      // FID
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          setVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"], buffered: true });
      observers.push(fidObserver);
    } catch {}

    try {
      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setVitals(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ entryTypes: ["layout-shift"], buffered: true });
      observers.push(clsObserver);
    } catch {}

    return () => {
      observers.forEach(o => o.disconnect());
    });
  }, []);

  return vitals;
}

/**
 * Monitor memory usage
 */
export function useMemoryMonitor(interval: number = 5000): MemoryMetrics | null {
  const [memory, setMemory] = useState<MemoryMetrics | null>(null);

  useEffect(() => {
    if (!("memory" in performance)) return;

    const update = () => {
      const mem = (performance as any).memory;
      setMemory({
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        percentage: (mem.usedJSHeapSize / mem.totalJSHeapSize) * 100
      });
    });

    update();
    const intervalId = setInterval(update, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memory;
}

/**
 * Get current performance metrics
 */
export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => getPerformanceMetrics());
  const fps = useFPSMonitor();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMetrics(prev => ({ ...getPerformanceMetrics(), fps }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fps]);

  return { ...metrics, fps };
}

/**
 * Debounced callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useMemo(() => debounce(callback, delay), [callback, delay]);
}

/**
 * Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useMemo(() => throttle(callback, delay), [callback, delay]);
}

/**
 * Lazy loading with Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement>(
  options?: IntersectionObserverInit
): { ref: React.RefObject<T>; isVisible: boolean } {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      options || { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

/**
 * Lazy image loading
 */
export function useLazyImage(src: string, options?: IntersectionObserverInit): {
  imgSrc: string | undefined;
  imgRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
} {
  const [imgSrc, setImgSrc] = useState<string>();
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImgSrc(src);
          observer.disconnect();
        }
      },
      options || { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, options]);

  useEffect(() => {
    if (!imgSrc) return;

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => setIsLoaded(true);
  }, [imgSrc]);

  return { imgSrc, imgRef, isLoaded };
}

/**
 * Detect long tasks
 */
export function useLongTaskDetection(threshold: number = 50): number {
  const [longTaskCount, setLongTaskCount] = useState(0);

  useEffect(() => {
    if (!PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          setLongTaskCount(count => count + 1);
        }
      }
    });

    observer.observe({ entryTypes: ["longtask"] });

    return () => observer.disconnect();
  }, [threshold]);

  return longTaskCount;
}

/**
 * First input delay
 */
export function useFirstInputDelay(): number | null {
  const [fid, setFid] = useState<number | null>(null);

  useEffect(() => {
    if (!PerformanceObserver.supportedEntryTypes?.includes("first-input")) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any;
        setFid(fidEntry.processingStart - fidEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ["first-input"] });

    return () => observer.disconnect();
  }, []);

  return fid;
}

// Backward compatibility
export { FPSMonitor };
export default usePerformanceMetrics;
