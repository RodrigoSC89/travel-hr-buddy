/**
 * Optimized Polling Hook
 * Self-contained polling with visibility/online awareness
 */

import { useEffect, useRef, useCallback } from "react";

export interface UsePollingOptions {
  id: string;
  callback: () => void | Promise<void>;
  interval: number;
  immediate?: boolean;
  enabled?: boolean;
  deps?: React.DependencyList;
}

export function useOptimizedPolling(options: UsePollingOptions): void {
  const {
    id,
    callback,
    interval,
    immediate = false,
    enabled = true,
    deps = [],
  } = options;

  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    if (immediate) {
      try { callbackRef.current(); } catch {}
    }

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        try { callbackRef.current(); } catch {}
      }
    }, interval);

    return () => clearInterval(timer);
  }, [id, interval, immediate, enabled, ...deps]);
}

export async function runPollNow(_id: string): Promise<void> {
  // No-op after cleanup - individual components handle their own refresh
}

export function stopPoll(_id: string): void {
  // No-op after cleanup
}

export function getPollingStats() {
  return { activePollCount: 0, polls: [] };
}
