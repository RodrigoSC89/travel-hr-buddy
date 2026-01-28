/**
 * React Performance Utilities
 * PATCH 880: Memoization and optimization utilities
 */

import React, { 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  memo,
  ComponentType,
  useState
} from "react";

/**
 * Smart memo that only re-renders if specific props change
 */
export function smartMemo<P extends object>(
  Component: ComponentType<P>,
  propsToCheck?: (keyof P)[]
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(Component, (prevProps, nextProps) => {
    if (!propsToCheck) {
      // Default shallow comparison
      return Object.keys(prevProps).every(
        key => prevProps[key as keyof P] === nextProps[key as keyof P]
      );
    }
    
    // Only check specified props
    return propsToCheck.every(
      key => prevProps[key] === nextProps[key]
    );
  });
}

/**
 * Stable callback that never changes identity
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastArgs = useRef<Parameters<T>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      lastArgs.current = args;
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        // Schedule trailing call
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...(lastArgs.current as Parameters<T>));
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Safe state update (prevents updates on unmounted components)
 */
export function useSafeState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(initialState);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const safeSetState = useCallback((value: React.SetStateAction<T>) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);
  
  return [state, safeSetState];
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Force update hook
 */
export function useForceUpdate(): () => void {
  const [, setTick] = useState(0);
  return useCallback(() => setTick(t => t + 1), []);
}

/**
 * Memoized object comparison
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  
  const isEqual = useMemo(() => {
    return JSON.stringify(ref.current) === JSON.stringify(value);
  }, [value]);
  
  if (!isEqual) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Event handler that uses passive event listeners
 */
export function usePassiveEvent(
  element: HTMLElement | Window | null,
  event: string,
  handler: EventListener,
  deps: React.DependencyList = []
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  
  useEffect(() => {
    if (!element) return;
    
    const eventHandler: EventListener = (e) => handlerRef.current(e);
    
    element.addEventListener(event, eventHandler, { passive: true });
    return () => element.removeEventListener(event, eventHandler);
  }, [element, event, ...deps]);
}

/**
 * Request Animation Frame hook for smooth animations
 */
export function useAnimationFrame(callback: (deltaTime: number) => void): void {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
}

/**
 * Lazy initialization hook
 */
export function useLazyInit<T>(factory: () => T): T {
  const ref = useRef<T>();
  
  if (ref.current === undefined) {
    ref.current = factory();
  }
  
  return ref.current;
}
