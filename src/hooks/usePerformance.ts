/**
 * usePerformance Hook - PATCH 597
 * 
 * React hooks for performance monitoring and optimization including:
 * - Render profiling
 * - Lazy loading helpers
 * - Optimized event listeners
 * - Performance tracking
 */

// @ts-nocheck
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  FPSMonitor,
  getPerformanceMetrics,
  measureWebVitals,
  monitorMemory,
  debounce,
  throttle,
  type PerformanceMetrics,
  type WebVitals
} from "@/utils/performance-utils";
import { logger } from "@/lib/logger";

/**
 * Hook to monitor FPS in component
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
    };
  }, [enabled]);

  return fps;
}

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

    if (renderTime > 16) { // > 1 frame at 60fps
      logger.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`);
    }

    startTimeRef.current = performance.now();
  });
}

/**
 * Hook to monitor Web Vitals
 */
export function useWebVitals(): WebVitals {
  const [vitals, setVitals] = useState<WebVitals>({});

  useEffect(() => {
    const cleanup = measureWebVitals((updatedVitals) => {
      setVitals(updatedVitals);
    });

    return cleanup;
  }, []);

  return vitals;
}

/**
 * Hook to monitor memory usage
 */
export function useMemoryMonitor(interval: number = 5000): PerformanceMetrics["memory"] | undefined {
  const [memory, setMemory] = useState<PerformanceMetrics["memory"]>();

  useEffect(() => {
    const cleanup = monitorMemory((memoryData) => {
      setMemory(memoryData);
    }, interval);

    return cleanup;
  }, [interval]);

  return memory;
}

/**
 * Hook to get current performance metrics
 */
export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => getPerformanceMetrics());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return metrics;
}

/**
 * Hook for debounced callbacks
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const debouncedCallback = useMemo(() => debounce(callback, delay), [callback, delay]);
  return debouncedCallback;
}

/**
 * Hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const throttledCallback = useMemo(() => throttle(callback, delay), [callback, delay]);
  return throttledCallback;
}

/**
 * Hook for lazy loading images
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
 * Hook for lazy loading components with Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement>(
  options?: IntersectionObserverInit
): {
  ref: React.RefObject<T>;
  isVisible: boolean;
} {
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
 * Hook for optimized event listeners
 */
export function useOptimizedEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: {
    throttle?: number;
    debounce?: number;
    enabled?: boolean;
  }
): void {
  const savedHandler = useRef(handler);
  const { throttle: throttleMs, debounce: debounceMs, enabled = true } = options || {};

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    let optimizedHandler = (event: WindowEventMap[K]) => savedHandler.current(event);

    if (throttleMs) {
      optimizedHandler = throttle(optimizedHandler, throttleMs);
    } else if (debounceMs) {
      optimizedHandler = debounce(optimizedHandler, debounceMs);
    }

    window.addEventListener(eventName, optimizedHandler as any);

    return () => {
      window.removeEventListener(eventName, optimizedHandler as any);
    };
  }, [eventName, throttleMs, debounceMs, enabled]);
}

/**
 * Hook to track component visibility time
 */
export function useVisibilityTracking(componentName: string): void {
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const visibilityDuration = performance.now() - startTimeRef.current;
        logger.info(`${componentName} visibility duration: ${visibilityDuration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

/**
 * Hook to measure time to interactive
 */
export function useTimeToInteractive(callback?: (time: number) => void): void {
  useEffect(() => {
    const startTime = performance.now();

    const checkInteractive = () => {
      requestIdleCallback(() => {
        const tti = performance.now() - startTime;
        logger.info(`Time to Interactive: ${tti.toFixed(2)}ms`);
        callback?.(tti);
      });
    };

    if (document.readyState === "complete") {
      checkInteractive();
    } else {
      window.addEventListener("load", checkInteractive);
      return () => window.removeEventListener("load", checkInteractive);
    }
  }, [callback]);
}

/**
 * Hook for prefetching data on hover
 */
export function usePrefetchOnHover<T>(
  fetchFn: () => Promise<T>,
  enabled: boolean = true
): {
  onMouseEnter: () => void;
  data: T | null;
  isLoading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);

  const onMouseEnter = useCallback(() => {
    if (!enabled || fetchedRef.current || isLoading) return;

    fetchedRef.current = true;
    setIsLoading(true);

    fetchFn()
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(error => {
        logger.error("Prefetch failed:", error);
        setIsLoading(false);
        fetchedRef.current = false;
      });
  }, [enabled, fetchFn, isLoading]);

  return { onMouseEnter, data, isLoading };
}

/**
 * Hook to detect long tasks
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
 * Hook for measuring first input delay
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
