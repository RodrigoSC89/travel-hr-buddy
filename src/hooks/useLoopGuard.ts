/**
 * PATCH 653 - Loop Guard Hook
 * Detects and prevents infinite loops in React components
 */

import { useRef, useEffect } from 'react';

interface LoopGuardOptions {
  maxExecutions?: number;
  timeWindow?: number; // milliseconds
  componentName?: string;
  onLoopDetected?: (info: LoopInfo) => void;
}

interface LoopInfo {
  componentName: string;
  executionCount: number;
  timestamp: number;
  stackTrace: string;
}

const DEFAULT_MAX_EXECUTIONS = 5;
const DEFAULT_TIME_WINDOW = 1000; // 1 second

/**
 * Hook to guard against infinite loops in React components
 * Tracks execution frequency and triggers warning/prevention when threshold exceeded
 */
export const useLoopGuard = (
  functionName: string,
  options: LoopGuardOptions = {}
) => {
  const {
    maxExecutions = DEFAULT_MAX_EXECUTIONS,
    timeWindow = DEFAULT_TIME_WINDOW,
    componentName = 'UnknownComponent',
    onLoopDetected,
  } = options;

  const executionHistory = useRef<number[]>([]);
  const isLoopDetected = useRef(false);

  const checkAndLog = () => {
    const now = Date.now();
    
    // Remove old executions outside the time window
    executionHistory.current = executionHistory.current.filter(
      (timestamp) => now - timestamp < timeWindow
    );

    // Add current execution
    executionHistory.current.push(now);

    // Check if loop threshold exceeded
    if (executionHistory.current.length >= maxExecutions && !isLoopDetected.current) {
      isLoopDetected.current = true;
      
      const loopInfo: LoopInfo = {
        componentName,
        executionCount: executionHistory.current.length,
        timestamp: now,
        stackTrace: new Error().stack || 'No stack trace available',
      };

      console.error(
        `🔁 LOOP DETECTED in ${componentName}.${functionName}:`,
        `${executionHistory.current.length} executions in ${timeWindow}ms`,
        loopInfo
      );

      // Call custom handler if provided
      if (onLoopDetected) {
        onLoopDetected(loopInfo);
      }

      // Log to performance monitoring (if available)
      if (window.performance && window.performance.mark) {
        window.performance.mark(`loop-detected-${componentName}-${functionName}`);
      }

      return false; // Prevent execution
    }

    // Reset flag if executions drop below threshold
    if (executionHistory.current.length < maxExecutions) {
      isLoopDetected.current = false;
    }

    return true; // Allow execution
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      executionHistory.current = [];
      isLoopDetected.current = false;
    };
  }, []);

  return {
    canExecute: checkAndLog,
    isLoopActive: () => isLoopDetected.current,
    reset: () => {
      executionHistory.current = [];
      isLoopDetected.current = false;
    },
  };
};

/**
 * Higher-order function to wrap async functions with loop protection
 */
export const withLoopGuard = <T extends (...args: any[]) => any>(
  fn: T,
  guardName: string,
  options: LoopGuardOptions = {}
): T => {
  const executionHistory: number[] = [];
  const { maxExecutions = DEFAULT_MAX_EXECUTIONS, timeWindow = DEFAULT_TIME_WINDOW } = options;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    // Clean old executions
    const validExecutions = executionHistory.filter(
      (timestamp) => now - timestamp < timeWindow
    );
    executionHistory.length = 0;
    executionHistory.push(...validExecutions, now);

    if (executionHistory.length >= maxExecutions) {
      console.error(
        `🔁 LOOP DETECTED in ${guardName}:`,
        `${executionHistory.length} executions in ${timeWindow}ms. Execution blocked.`
      );
      return Promise.resolve(undefined);
    }

    return fn(...args);
  }) as T;
};
