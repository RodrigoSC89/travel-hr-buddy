/**
 * React Hook for Circuit Breaker
 * 
 * Provides circuit breaker functionality with React state management
 * and automatic re-renders on state changes.
 * 
 * @example
 * const { execute, metrics, isOpen } = useCircuitBreaker('gemini');
 * 
 * const result = await execute(() => fetch('/api/gemini'));
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getCircuitBreaker, 
  getAllCircuitBreakers,
  CircuitBreakerMetrics,
  CircuitState 
} from '@/lib/resilience/circuit-breaker';

export interface UseCircuitBreakerResult<T = unknown> {
  /** Execute a function with circuit breaker protection */
  execute: (fn: () => Promise<T>) => Promise<T>;
  /** Current metrics */
  metrics: CircuitBreakerMetrics;
  /** Is circuit open? */
  isOpen: boolean;
  /** Is circuit closed? */
  isClosed: boolean;
  /** Current state */
  state: CircuitState;
  /** Manually reset circuit */
  reset: () => void;
}

export function useCircuitBreaker<T = unknown>(
  serviceName: string
): UseCircuitBreakerResult<T> {
  const breaker = getCircuitBreaker(serviceName);
  const [metrics, setMetrics] = useState<CircuitBreakerMetrics>(breaker.getMetrics());

  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = breaker.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return unsubscribe;
  }, [breaker]);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      return breaker.execute(fn);
    },
    [breaker]
  );

  const reset = useCallback(() => {
    breaker.reset();
  }, [breaker]);

  return {
    execute,
    metrics,
    isOpen: metrics.state === 'OPEN',
    isClosed: metrics.state === 'CLOSED',
    state: metrics.state,
    reset,
  };
}

/**
 * Hook to monitor all circuit breakers
 */
export function useAllCircuitBreakers() {
  const [allMetrics, setAllMetrics] = useState(() => getAllCircuitBreakers());

  useEffect(() => {
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      setAllMetrics(getAllCircuitBreakers());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const resetAll = useCallback(() => {
    const { resetAllCircuitBreakers } = require('@/lib/resilience/circuit-breaker');
    resetAllCircuitBreakers();
    setAllMetrics(getAllCircuitBreakers());
  }, []);

  return {
    circuits: allMetrics,
    resetAll,
    hasOpenCircuits: allMetrics.some(c => c.metrics.state === 'OPEN'),
  };
}

export default useCircuitBreaker;
