/**
 * UNIFIED Debounce & Throttle Hooks
 * 
 * Consolidates:
 * - src/hooks/use-debounced-value.ts (useDebouncedValue, useDebouncedCallback, useThrottledCallback)
 * - src/hooks/useOptimizedState.ts (useDebouncedState, useThrottle)
 * - src/hooks/usePerformance.ts (useDebounce, useThrottle)
 * - src/hooks/unified/usePerformance.unified.ts (useDebounce, useThrottle, debounce, throttle)
 * - src/lib/performance/form-optimization.ts (useDebouncedInput, useThrottledCallback)
 * - src/lib/performance/memory-leak-detector.ts (debounce, throttle)
 * - src/lib/cleanup-utils.ts (useDebouncedCallback)
 * - src/mobile/hooks/useRuntimeOptimization.ts (useDebounce, useThrottle)
 * - src/utils/performance.ts (useDebounce, useDebouncedCallback)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
}

// ============================================
// DEBOUNCE HOOKS
// ============================================

/**
 * Returns a debounced version of the input value.
 * Updates will only propagate after the specified delay has passed without changes.
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 * // debouncedSearch updates 300ms after searchTerm stops changing
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Returns both the immediate value and a debounced value, plus a setter.
 * Useful for inputs where you need both values.
 * 
 * @example
 * const [value, debouncedValue, setValue] = useDebouncedState("", 300);
 * // value updates immediately, debouncedValue after 300ms
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebouncedValue(value, delay);

  return [value, debouncedValue, setValue];
}

/**
 * Returns a debounced callback function.
 * The callback will only execute after the specified delay has passed without being called.
 * 
 * @example
 * const debouncedSave = useDebouncedCallback((data) => saveToServer(data), 500);
 * // debouncedSave only executes 500ms after last call
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Debounced input hook with loading state.
 * Returns [immediateValue, debouncedValue, setValue, isPending]
 * 
 * @example
 * const [value, debouncedValue, setValue, isPending] = useDebouncedInput("", 300);
 * // isPending is true while waiting for debounce
 */
export function useDebouncedInput<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsPending(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        setIsPending(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, debouncedValue]);

  return [value, debouncedValue, setValue, isPending];
}

/**
 * Hook alias for useDebounceCallback (backward compatibility)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useDebouncedCallback(callback, delay);
}

// ============================================
// THROTTLE HOOKS
// ============================================

/**
 * Returns a throttled callback function.
 * The callback will execute at most once per specified delay.
 * 
 * @example
 * const throttledScroll = useThrottledCallback((e) => handleScroll(e), 100);
 * // throttledScroll executes at most every 100ms
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    },
    [delay]
  ) as T;

  return throttledCallback;
}

/**
 * Hook alias for useThrottledCallback (backward compatibility)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useMemo(() => throttle(callback, delay), [callback, delay]);
}

/**
 * Returns a throttled version of the input value.
 * Value updates will only propagate at most once per specified delay.
 * 
 * @example
 * const throttledValue = useThrottledValue(mousePosition, 100);
 * // throttledValue updates at most every 100ms
 */
export function useThrottledValue<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdateRef = useRef<number>(0);
  const pendingValueRef = useRef<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    pendingValueRef.current = value;

    if (timeSinceLastUpdate >= delay) {
      lastUpdateRef.current = now;
      setThrottledValue(value);
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastUpdateRef.current = Date.now();
        setThrottledValue(pendingValueRef.current);
        timeoutRef.current = null;
      }, delay - timeSinceLastUpdate);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay]);

  return throttledValue;
}

// ============================================
// ADVANCED HOOKS
// ============================================

/**
 * Debounced callback with leading edge execution.
 * Executes immediately on first call, then debounces subsequent calls.
 */
export function useLeadingDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!hasCalledRef.current) {
        hasCalledRef.current = true;
        callbackRef.current(...args);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        hasCalledRef.current = false;
      }, delay);
    },
    [delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Throttled callback with trailing edge execution.
 * Ensures the last call is always executed.
 */
export function useTrailingThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
        pendingArgsRef.current = null;
      } else {
        pendingArgsRef.current = args;

        if (!timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (pendingArgsRef.current) {
              lastCallRef.current = Date.now();
              callbackRef.current(...pendingArgsRef.current);
              pendingArgsRef.current = null;
            }
            timeoutRef.current = null;
          }, delay - timeSinceLastCall);
        }
      }
    },
    [delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Adaptive debounce based on network conditions.
 * Increases delay on slow connections.
 */
export function useAdaptiveDebounce<T extends (...args: any[]) => any>(
  callback: T,
  baseDelay: number = 300
): T {
  const getAdaptiveDelay = useCallback(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        switch (effectiveType) {
        case "slow-2g":
        case "2g":
          return baseDelay * 3;
        case "3g":
          return baseDelay * 2;
        case "4g":
        default:
          return baseDelay;
        }
      }
    }
    return baseDelay;
  }, [baseDelay]);

  const adaptiveDelay = getAdaptiveDelay();
  return useDebouncedCallback(callback, adaptiveDelay);
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Utility functions
  debounce,
  throttle,
  
  // Debounce hooks
  useDebouncedValue,
  useDebouncedState,
  useDebouncedCallback,
  useDebouncedInput,
  useDebounce,
  
  // Throttle hooks
  useThrottledCallback,
  useThrottle,
  useThrottledValue,
  
  // Advanced hooks
  useLeadingDebouncedCallback,
  useTrailingThrottledCallback,
  useAdaptiveDebounce,
};
