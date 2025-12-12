/**
 * PATCH 589 - Mobile Optimization Hook
 * Comprehensive hook for mobile performance optimizations
 */

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { networkDetector } from "../services/networkDetector";

interface OptimizationConfig {
  /** Enable aggressive memoization */
  memoize?: boolean;
  /** Defer non-critical rendering */
  deferRendering?: boolean;
  /** Reduce motion for performance */
  reduceMotion?: boolean;
  /** Limit concurrent operations */
  concurrencyLimit?: number;
}

interface MobileOptimizationState {
  isLowPowerMode: boolean;
  isSlowNetwork: boolean;
  isReducedMotion: boolean;
  memoryPressure: "normal" | "moderate" | "critical";
  shouldDefer: boolean;
}

/**
 * Hook for comprehensive mobile optimizations
 * 
 * @example
 * ```tsx
 * const { 
 *   isSlowNetwork, 
 *   shouldDefer, 
 *   deferredValue,
 *   throttledCallback 
 * } = useMobileOptimization();
 * 
 * return shouldDefer ? <Skeleton /> : <HeavyComponent />;
 * ```
 */
export const useMobileOptimization = (config: OptimizationConfig = {}) => {
  const { 
    memoize = true, 
    deferRendering = true,
    reduceMotion = false,
    concurrencyLimit = 3
  } = config;

  const [state, setState] = useState<MobileOptimizationState>({
    isLowPowerMode: false,
    isSlowNetwork: false,
    isReducedMotion: false,
    memoryPressure: "normal",
    shouldDefer: false
  });

  const activeOperationsRef = useRef(0);
  const queueRef = useRef<(() => Promise<void>)[]>([]);

  /**
   * Check device capabilities and preferences
   */
  useEffect(() => {
    const checkCapabilities = async () => {
      // Check reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Check network
      const networkStatus = networkDetector.getStatus();
      const isSlowNetwork = 
        !networkStatus.isOnline ||
        networkStatus.effectiveType === "slow-2g" ||
        networkStatus.effectiveType === "2g" ||
        (networkStatus.downlink && networkStatus.downlink < 1);

      // Check battery (if available)
      let isLowPowerMode = false;
      if ("getBattery" in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          isLowPowerMode = battery.level < 0.2 && !battery.charging;
        } catch {}
      }

      // Check memory (if available)
      let memoryPressure: "normal" | "moderate" | "critical" = "normal";
      if ("deviceMemory" in navigator) {
        const memory = (navigator as any).deviceMemory;
        if (memory < 2) memoryPressure = "critical";
        else if (memory < 4) memoryPressure = "moderate";
      }

      setState({
        isLowPowerMode,
        isSlowNetwork: !!isSlowNetwork,
        isReducedMotion: prefersReducedMotion || reduceMotion,
        memoryPressure,
        shouldDefer: isSlowNetwork || isLowPowerMode || memoryPressure !== "normal"
      });
    });

    checkCapabilities();

    // Listen for network changes
    const unsubscribe = networkDetector.onChange(() => {
      checkCapabilities();
    });

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", checkCapabilities);

    return () => {
      unsubscribe();
      motionQuery.removeEventListener("change", checkCapabilities);
    };
  }, [reduceMotion]);

  /**
   * Throttle a callback for mobile performance
   */
  const throttledCallback = useCallback(
    <T extends (...args: any[]) => any>(fn: T, delay: number = 100): T => {
      let lastCall = 0;
      let timeoutId: NodeJS.Timeout | null = null;

      return ((...args: Parameters<T>) => {
        const now = Date.now();
        const remaining = delay - (now - lastCall);

        if (remaining <= 0) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          lastCall = now;
          return fn(...args);
        }

        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            lastCall = Date.now();
            timeoutId = null;
            fn(...args);
          }, remaining);
        }
      }) as T;
    },
    []
  );

  /**
   * Debounce a callback for mobile performance
   */
  const debouncedCallback = useCallback(
    <T extends (...args: any[]) => any>(fn: T, delay: number = 300): T => {
      let timeoutId: NodeJS.Timeout | null = null;

      return ((...args: Parameters<T>) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          fn(...args);
        }, delay);
      }) as T;
    },
    []
  );

  /**
   * Queue an async operation with concurrency limit
   */
  const queueOperation = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        const executeOperation = async () => {
          activeOperationsRef.current++;
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            activeOperationsRef.current--;
            processQueue();
          }
        };

        const processQueue = () => {
          if (
            queueRef.current.length > 0 &&
            activeOperationsRef.current < concurrencyLimit
          ) {
            const next = queueRef.current.shift();
            next?.();
          }
        };

        if (activeOperationsRef.current < concurrencyLimit) {
          executeOperation();
        } else {
          queueRef.current.push(executeOperation);
        }
      });
    },
    [concurrencyLimit]
  );

  /**
   * Create a deferred value that updates on idle
   */
  const useDeferredValue = useCallback(
    <T>(value: T): T => {
      const [deferredValue, setDeferredValue] = useState(value);

      useEffect(() => {
        if ("requestIdleCallback" in window) {
          const id = requestIdleCallback(() => {
            setDeferredValue(value);
          });
          return () => cancelIdleCallback(id);
        } else {
          const id = setTimeout(() => {
            setDeferredValue(value);
          }, 100);
          return () => clearTimeout(id);
        }
      }, [value]);

      return deferredValue;
    },
    []
  );

  /**
   * Get animation config based on device capabilities
   */
  const getAnimationConfig = useMemo(() => {
    if (state.isReducedMotion || state.isLowPowerMode) {
      return {
        duration: 0,
        spring: { stiffness: 1000, damping: 1000 },
        transition: "none"
      };
    }

    if (state.memoryPressure === "critical") {
      return {
        duration: 0.15,
        spring: { stiffness: 500, damping: 50 },
        transition: "transform 0.15s ease-out"
      };
    }

    return {
      duration: 0.3,
      spring: { stiffness: 300, damping: 30 },
      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    };
  }, [state.isReducedMotion, state.isLowPowerMode, state.memoryPressure]);

  /**
   * Get image loading strategy based on network
   */
  const getImageStrategy = useMemo(() => {
    if (!state.isSlowNetwork) {
      return {
        quality: "high",
        loading: "eager" as const,
        format: "avif"
      };
    }

    return {
      quality: "low",
      loading: "lazy" as const,
      format: "webp"
    };
  }, [state.isSlowNetwork]);

  return {
    ...state,
    throttledCallback,
    debouncedCallback,
    queueOperation,
    useDeferredValue,
    getAnimationConfig,
    getImageStrategy
  };
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useLazyLoad = (options: IntersectionObserverInit = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, options]);

  return { ref: elementRef, isVisible };
};

/**
 * Memory-efficient list hook
 */
export const useMemoryEfficientList = <T>(
  items: T[],
  maxItems: number = 100
) => {
  return useMemo(() => {
    if (items.length <= maxItems) {
      return items;
    }
    // Keep most recent items
    return items.slice(-maxItems);
  }, [items, maxItems]);
};
