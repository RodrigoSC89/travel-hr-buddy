/**
 * React Optimizations v4.0
 * Performance utilities for React components
 * Optimized for 2G/Satellite connections
 */

import React, {
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  ComponentType,
} from 'react';

// =============================================================================
// SMART MEMOIZATION
// =============================================================================

/**
 * Smart memo with deep comparison for simple props
 */
export function smartMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(
    Component,
    propsAreEqual ||
      ((prev, next) => {
        // Fast path for referential equality
        if (prev === next) return true;

        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        if (prevKeys.length !== nextKeys.length) return false;

        for (const key of prevKeys) {
          const prevVal = (prev as Record<string, unknown>)[key];
          const nextVal = (next as Record<string, unknown>)[key];

          // Referential equality check first
          if (prevVal === nextVal) continue;

          // For functions, compare by reference only
          if (typeof prevVal === 'function' && typeof nextVal === 'function') {
            return false; // Functions changed
          }

          // For objects/arrays, do shallow comparison
          if (typeof prevVal === 'object' && typeof nextVal === 'object') {
            if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
              return false;
            }
          } else if (prevVal !== nextVal) {
            return false;
          }
        }

        return true;
      })
  );
}

// =============================================================================
// DEBOUNCE & THROTTLE HOOKS
// =============================================================================

/**
 * Debounce hook - delays value update
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook - limits update frequency
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
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
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number = 100
): T {
  const callbackRef = useRef(callback);
  const lastRan = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          () => {
            callbackRef.current(...args);
            lastRan.current = Date.now();
          },
          limit - (now - lastRan.current)
        );
      }
    }) as T,
    [limit]
  );
}

// =============================================================================
// STABLE CALLBACK
// =============================================================================

/**
 * Prevent unnecessary re-renders with stable callback reference
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// =============================================================================
// LAZY VALUE
// =============================================================================

/**
 * Lazy initialization hook - only computes value once
 */
export function useLazyValue<T>(factory: () => T): T {
  const ref = useRef<{ value: T; initialized: boolean }>({
    value: undefined as unknown as T,
    initialized: false,
  });

  if (!ref.current.initialized) {
    ref.current.value = factory();
    ref.current.initialized = true;
  }

  return ref.current.value;
}

// =============================================================================
// PREVIOUS VALUE
// =============================================================================

/**
 * Track previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// =============================================================================
// INTERSECTION OBSERVER
// =============================================================================

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef.current;
    if (frozen || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}

// =============================================================================
// WINDOW SIZE
// =============================================================================

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Window size hook with throttling
 */
export function useWindowSize(throttleMs: number = 100): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastRan = 0;

    const handler = () => {
      const now = Date.now();

      if (now - lastRan >= throttleMs) {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        lastRan = now;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
          lastRan = Date.now();
        }, throttleMs - (now - lastRan));
      }
    };

    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('resize', handler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [throttleMs]);

  return size;
}

// =============================================================================
// ASYNC EFFECT
// =============================================================================

/**
 * Async effect with cleanup and cancellation
 */
export function useAsyncEffect(
  effect: (signal: AbortSignal) => Promise<void>,
  deps: React.DependencyList
): void {
  useEffect(() => {
    const controller = new AbortController();

    effect(controller.signal).catch((error) => {
      if (error?.name !== 'AbortError') {
        console.error('Async effect error:', error);
      }
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// =============================================================================
// FORCE UPDATE
// =============================================================================

/**
 * Force component re-render
 */
export function useForceUpdate(): () => void {
  const [, setState] = useState(0);
  return useCallback(() => setState((s) => s + 1), []);
}

// =============================================================================
// MOUNTED REF
// =============================================================================

/**
 * Track if component is mounted
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

// =============================================================================
// RENDER COUNT (DEV ONLY)
// =============================================================================

/**
 * Track render count (development only)
 */
export function useRenderCount(componentName: string): number {
  const countRef = useRef(0);
  countRef.current++;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render] ${componentName}: ${countRef.current}`);
  }

  return countRef.current;
}

// =============================================================================
// SAFE STATE
// =============================================================================

/**
 * State that only updates if component is mounted
 */
export function useSafeState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const isMounted = useIsMounted();

  const setSafeState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted]
  );

  return [state, setSafeState];
}
