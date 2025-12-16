/**
 * PATCH 547 - Cleanup Utilities
 * Utilities for proper cleanup of timers, intervals, subscriptions, and event listeners
 * Prevents memory leaks and ensures proper resource management
 */

import { useEffect, useRef, useCallback } from "react";
import { logger } from "@/lib/logger";

/**
 * Cleanup manager for tracking and cleaning up resources
 */
export class CleanupManager {
  private cleanupFunctions: Array<() => void> = [];
  private timers: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private name: string;

  constructor(name: string = "CleanupManager") {
    this.name = name;
  }

  /**
   * Register a timer for automatic cleanup
   */
  setTimeout(callback: () => void, ms: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, ms);
    this.timers.add(timer);
    return timer;
  }

  /**
   * Register an interval for automatic cleanup
   */
  setInterval(callback: () => void, ms: number): NodeJS.Timeout {
    const interval = setInterval(callback, ms);
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Clear a specific timer
   */
  clearTimeout(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  /**
   * Clear a specific interval
   */
  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  /**
   * Register a cleanup function
   */
  register(cleanupFn: () => void): void {
    this.cleanupFunctions.push(cleanupFn);
  }

  /**
   * Clean up all registered resources
   */
  cleanup(): void {
    // Clear all timers
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();

    // Execute all cleanup functions
    this.cleanupFunctions.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        logger.error(`[${this.name}] Error during cleanup:`, error);
      }
    });
    this.cleanupFunctions = [];

    logger.debug(`[${this.name}] Cleanup completed`);
  }

  /**
   * Get stats about managed resources
   */
  getStats() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      cleanupFunctions: this.cleanupFunctions.length,
    };
  }
}

/**
 * React hook for automatic cleanup management
 * Usage:
 * ```tsx
 * const cleanup = useCleanup('MyComponent');
 * 
 * useEffect(() => {
 *   const timer = cleanup.setTimeout(() => console.log('done'), 1000);
 *   const interval = cleanup.setInterval(() => console.log('tick'), 500);
 *   
 *   cleanup.register(() => {
 *     // Custom cleanup logic
 *   });
 * }, []);
 * ```
 */
export function useCleanup(componentName: string = "Component"): CleanupManager {
  const managerRef = useRef<CleanupManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new CleanupManager(componentName);
  }

  useEffect(() => {
    const manager = managerRef.current;
    return () => {
      manager?.cleanup();
    };
  }, []);

  return managerRef.current;
}

/**
 * Hook for safe setTimeout with automatic cleanup
 */
export function useSafeTimeout(
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const timer = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, ...deps]);
}

/**
 * Hook for safe setInterval with automatic cleanup
 */
export function useSafeInterval(
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(interval);
    };
  }, [delay, ...deps]);
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = window,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) {
      return;
    }

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Hook for managing subscriptions (e.g., Supabase realtime, MQTT)
 */
export function useSubscription<T>(
  subscribe: (callback: (data: T) => void) => () => void,
  callback: (data: T) => void,
  deps: React.DependencyList = []
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = subscribe((data: T) => {
      savedCallback.current(data);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, deps);
}

/**
 * Hook for debounced callbacks with cleanup
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Utility to wrap async functions with abort signal support
 */
export function useAbortableEffect(
  effect: (signal: AbortSignal) => Promise<void> | void,
  deps: React.DependencyList
): void {
  useEffect(() => {
    const controller = new AbortController();

    const runEffect = async () => {
      try {
        await effect(controller.signal);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Ignore abort errors
          return;
        }
        logger.error("[useAbortableEffect] Error in effect:", error);
      }
    };

    runEffect();

    return () => {
      controller.abort();
    };
  }, deps);
}
