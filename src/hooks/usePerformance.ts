/**
 * Performance Optimization Hooks - PATCH 597
 * Custom React hooks for performance monitoring and optimization
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce, throttle, measureWebVitals } from '@/utils/performance-utils';

/**
 * PATCH 597: Hook to detect slow renders
 */
export function useRenderPerformance(componentName: string, threshold: number = 16) {
  const renderCount = useRef(0);
  const renderStart = useRef(0);

  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    renderCount.current++;

    if (renderTime > threshold) {
      console.warn(
        `⚠️ Slow render in ${componentName}:`,
        `${renderTime.toFixed(2)}ms`,
        `(render #${renderCount.current})`
      );
    }
  });

  return renderCount.current;
}

/**
 * PATCH 597: Hook to create debounced callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(callback, delay), [callback, delay]);
}

/**
 * PATCH 597: Hook to create throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(throttle(callback, limit), [callback, limit]);
}

/**
 * PATCH 597: Hook to detect memory leaks
 */
export function useMemoryLeak(componentName: string) {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      const lifetime = Date.now() - mountTime.current;
      if (lifetime < 100) {
        console.warn(
          `⚠️ Potential memory leak in ${componentName}:`,
          `Component unmounted very quickly (${lifetime}ms)`
        );
      }
    };
  }, [componentName]);
}

/**
 * PATCH 597: Hook to monitor component updates
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[why-did-you-update] ${name}`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * PATCH 597: Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * PATCH 597: Hook to measure Web Vitals
 */
export function useWebVitals() {
  const vitals = useRef<any>({});

  useEffect(() => {
    measureWebVitals().then(data => {
      vitals.current = data;
      
      if (import.meta.env.MODE === 'development') {
        console.log('📊 Web Vitals:', data);
      }
    });
  }, []);

  return vitals.current;
}

/**
 * PATCH 597: Hook for optimized event listeners
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Element = window,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    
    element.addEventListener(eventName, eventListener, options);
    
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * PATCH 597: Hook for optimized window resize handler
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
}

/**
 * PATCH 597: Hook for optimized scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = React.useState({
    x: window.scrollX,
    y: window.scrollY
  });

  const handleScroll = useThrottle(() => {
    setScrollPosition({
      x: window.scrollX,
      y: window.scrollY
    });
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return scrollPosition;
}

/**
 * PATCH 597: Hook for prefetching data
 */
export function usePrefetch<T>(
  fetchFn: () => Promise<T>,
  shouldPrefetch: boolean = true
) {
  const dataRef = useRef<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (!shouldPrefetch || dataRef.current) return;

    setIsLoading(true);
    fetchFn()
      .then(data => {
        dataRef.current = data;
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [fetchFn, shouldPrefetch]);

  return { data: dataRef.current, isLoading, error };
}

/**
 * PATCH 597: Hook for optimized local storage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * PATCH 597: Hook to clean up async operations
 */
export function useAsyncCleanup() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runAsync = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      const result = await asyncFn();
      return isMountedRef.current ? result : null;
    } catch (error) {
      if (isMountedRef.current) {
        throw error;
      }
      return null;
    }
  }, []);

  return runAsync;
}

// Export React import for hooks
import React from 'react';
