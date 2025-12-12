/**
 * PATCH 190.0 - Runtime Performance Optimization Hook
 * 
 * Comprehensive runtime optimizations for mobile:
 * - Memory management
 * - Render optimization
 * - Layout performance
 * - Interaction smoothness
 */

import { useEffect, useCallback, useRef, useMemo, useState } from "react";

// ============================================
// MEMORY MANAGEMENT
// ============================================

interface MemoryState {
  isLowMemory: boolean;
  usedHeap: number;
  totalHeap: number;
  percentage: number;
}

/**
 * Monitor and respond to memory pressure
 */
export function useMemoryPressure(threshold = 80): MemoryState {
  const [memoryState, setMemoryState] = useState<MemoryState>({
    isLowMemory: false,
    usedHeap: 0,
    totalHeap: 0,
    percentage: 0,
  });

  useEffect(() => {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const used = memory.usedJSHeapSize;
        const total = memory.jsHeapSizeLimit;
        const percentage = (used / total) * 100;
        
        setMemoryState({
          isLowMemory: percentage > threshold,
          usedHeap: used,
          totalHeap: total,
          percentage,
        });
      }
    });

    checkMemory();
    const interval = setInterval(checkMemory, 10000);
    
    return () => clearInterval(interval);
  }, [threshold]);

  return memoryState;
}

/**
 * Automatically cleanup resources when memory is low
 */
export function useMemoryCleanup(cleanup: () => void, threshold = 85): void {
  const { isLowMemory } = useMemoryPressure(threshold);
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  useEffect(() => {
    if (isLowMemory) {
      cleanupRef.current();
    }
  }, [isLowMemory]);
}

// ============================================
// RENDER OPTIMIZATION
// ============================================

/**
 * Defer non-critical renders until idle
 */
export function useDeferredRender<T>(value: T, delay = 100): T {
  const [deferredValue, setDeferredValue] = useState(value);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(
        () => setDeferredValue(value),
        { timeout: delay }
      );
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => {
        setDeferredValue(value);
      }, delay);
      return () => clearTimeout(id);
    }
  }, [value, delay]);

  return deferredValue;
}

/**
 * Only render when component is visible
 */
export function useVisibleRender(options?: { rootMargin?: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: options?.rootMargin || "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.rootMargin]);

  return { ref, shouldRender: inView };
}

/**
 * Batch multiple state updates
 */
export function useBatchedUpdates<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const rafId = useRef<number>();

  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    if (rafId.current) return;
    
    rafId.current = requestAnimationFrame(() => {
      setState((prev) => ({ ...prev, ...pendingUpdates.current }));
      pendingUpdates.current = {};
      rafId.current = undefined;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return [state, batchUpdate];
}

// ============================================
// LAYOUT PERFORMANCE
// ============================================

/**
 * Optimize layout calculations with containment
 */
export function useLayoutContainment() {
  return useMemo(() => ({
    style: {
      contain: "layout paint" as const,
      willChange: "transform" as const,
    },
    className: "transform-gpu",
  }), []);
}

/**
 * Prevent layout thrashing by batching DOM reads/writes
 */
export function useLayoutBatch() {
  const reads = useRef<(() => any)[]>([]);
  const writes = useRef<(() => void)[]>([]);

  const scheduleRead = useCallback(<T>(fn: () => T): Promise<T> => {
    return new Promise((resolve) => {
      reads.current.push(() => resolve(fn()));
    });
  }, []);

  const scheduleWrite = useCallback((fn: () => void): void => {
    writes.current.push(fn);
  }, []);

  const flush = useCallback(() => {
    requestAnimationFrame(() => {
      // Batch all reads first
      reads.current.forEach((read) => read());
      reads.current = [];
      
      // Then all writes
      writes.current.forEach((write) => write());
      writes.current = [];
    });
  }, []);

  return { scheduleRead, scheduleWrite, flush };
}

// ============================================
// INTERACTION OPTIMIZATION
// ============================================

/**
 * Debounce expensive operations
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const timeoutRef = useRef<number>();
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Throttle frequent operations
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T {
  const lastRun = useRef(0);
  const timeoutRef = useRef<number>();
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRun.current >= limit) {
        lastRun.current = now;
        fnRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          lastRun.current = Date.now();
          fnRef.current(...args);
        }, limit - (now - lastRun.current));
      }
    }) as T,
    [limit]
  );
}

/**
 * Optimize scroll handlers
 */
export function useOptimizedScroll(
  handler: (event: Event) => void,
  options?: { passive?: boolean; throttle?: number }
) {
  const { passive = true, throttle = 16 } = options || {};
  const throttledHandler = useThrottle(handler, throttle);

  useEffect(() => {
    window.addEventListener("scroll", throttledHandler, { passive });
    return () => window.removeEventListener("scroll", throttledHandler);
  }, [throttledHandler, passive]);
}

// ============================================
// COMBINED OPTIMIZATION HOOK
// ============================================

interface RuntimeOptimizationOptions {
  enableMemoryMonitor?: boolean;
  enableDeferredRender?: boolean;
  memoryThreshold?: number;
}

/**
 * All-in-one runtime optimization hook
 */
export function useRuntimeOptimization(options: RuntimeOptimizationOptions = {}) {
  const {
    enableMemoryMonitor = true,
    memoryThreshold = 80,
  } = options;

  const memory = enableMemoryMonitor 
    ? useMemoryPressure(memoryThreshold) 
    : { isLowMemory: false, percentage: 0 };
  
  const containment = useLayoutContainment();
  const layoutBatch = useLayoutBatch();

  // Reduce quality when memory is low
  const qualityMode = useMemo(() => {
    if (memory.isLowMemory) return "low";
    if (memory.percentage > 60) return "medium";
    return "high";
  }, [memory]);

  return {
    memory,
    qualityMode,
    containment,
    layoutBatch,
    isLowMemory: memory.isLowMemory,
  };
}
