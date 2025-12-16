/**
 * Optimized Polling Hook - PATCH 651.0
 * Replace setInterval with managed polling
 */

import { useEffect, useRef } from "react";
import { pollingManager } from "@/lib/performance/polling-manager";

export interface UsePollingOptions {
  /**
   * Unique identifier for this poll
   */
  id: string;

  /**
   * Callback function to execute
   */
  callback: () => void | Promise<void>;

  /**
   * Interval in milliseconds
   */
  interval: number;

  /**
   * Run callback immediately on mount
   * @default false
   */
  immediate?: boolean;

  /**
   * Enable/disable polling
   * @default true
   */
  enabled?: boolean;

  /**
   * Dependencies array - polling will restart if these change
   */
  deps?: React.DependencyList;
}

/**
 * Use optimized polling instead of manual setInterval
 * 
 * Features:
 * - Automatic cleanup on unmount
 * - Pauses when page is hidden
 * - Pauses when offline
 * - Centralized management
 * - Performance tracking
 * 
 * @example
 * ```tsx
 * useOptimizedPolling({
 *   id: 'dashboard-stats',
 *   callback: fetchDashboardStats,
 *   interval: 30000, // 30 seconds
 *   immediate: true,
 *   enabled: isAuthenticated,
 * });
 * ```
 */
export function useOptimizedPolling(options: UsePollingOptions): void {
  const {
    id,
    callback,
    interval,
    immediate = false,
    enabled = true,
    deps = [],
  } = options;

  // Store callback in ref to avoid recreating poll on every render
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Register poll with stable callback reference
    const unregister = pollingManager.register({
      id,
      callback: () => callbackRef.current(),
      interval,
      immediate,
      enabled,
    });

    // Cleanup on unmount or deps change
    return () => {
      unregister();
    };
  }, [id, interval, immediate, enabled, ...deps]);
}

/**
 * Force run a poll immediately (useful for manual refresh)
 */
export async function runPollNow(id: string): Promise<void> {
  await pollingManager.runNow(id);
}

/**
 * Stop a specific poll
 */
export function stopPoll(id: string): void {
  pollingManager.stop(id);
}

/**
 * Get polling statistics (for debugging)
 */
export function getPollingStats() {
  return pollingManager.getStats();
}
