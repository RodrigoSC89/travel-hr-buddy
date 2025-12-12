/**
 * PATCH 589 - Adaptive Polling Hook
 * Adjusts polling interval based on network quality and battery
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { networkDetector } from "../services/networkDetector";

interface AdaptivePollingConfig {
  /** Base interval in ms for 4G/WiFi */
  baseInterval: number;
  /** Maximum interval in ms for poor connections */
  maxInterval: number;
  /** Minimum interval in ms for real-time needs */
  minInterval: number;
  /** Enable battery-aware adjustments */
  batteryAware?: boolean;
  /** Pause when tab is hidden */
  pauseOnHidden?: boolean;
  /** Callback on each poll */
  onPoll: () => Promise<void>;
}

interface PollingState {
  isPolling: boolean;
  currentInterval: number;
  lastPollTime: Date | null;
  networkType: string;
  isPaused: boolean;
}

/**
 * Adaptive polling that adjusts interval based on network quality
 * 
 * @example
 * ```tsx
 * const { isPolling, currentInterval, pause, resume } = useAdaptivePolling({
 *   baseInterval: 30000,
 *   maxInterval: 120000,
 *   minInterval: 10000,
 *   onPoll: async () => await fetchData()
 * });
 * ```
 */
export const useAdaptivePolling = (config: AdaptivePollingConfig) => {
  const {
    baseInterval,
    maxInterval,
    minInterval,
    batteryAware = true,
    pauseOnHidden = true,
    onPoll
  } = config;

  const [state, setState] = useState<PollingState>({
    isPolling: false,
    currentInterval: baseInterval,
    lastPollTime: null,
    networkType: "4g",
    isPaused: false
  });

  const intervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Calculate optimal interval based on network conditions
   */
  const calculateInterval = useCallback(async (): Promise<number> => {
    const networkStatus = networkDetector.getStatus();
    let interval = baseInterval;

    // Adjust based on connection type
    switch (networkStatus.effectiveType) {
    case "slow-2g":
      interval = maxInterval; // Maximum slowdown
      break;
    case "2g":
      interval = maxInterval * 0.75;
      break;
    case "3g":
      interval = baseInterval * 2;
      break;
    case "4g":
    default:
      interval = baseInterval;
    }

    // Adjust based on RTT if available
    if (networkStatus.rtt && networkStatus.rtt > 500) {
      interval = Math.min(interval * 1.5, maxInterval);
    }

    // Battery-aware adjustment
    if (batteryAware && "getBattery" in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        if (battery.level < 0.2 && !battery.charging) {
          // Low battery: reduce polling frequency
          interval = Math.min(interval * 2, maxInterval);
        }
      } catch {
        // Battery API not available
      }
    }

    // Ensure within bounds
    return Math.max(minInterval, Math.min(interval, maxInterval));
  }, [baseInterval, maxInterval, minInterval, batteryAware]);

  /**
   * Execute poll with error handling
   */
  const executePoll = useCallback(async () => {
    if (!isMountedRef.current || state.isPaused) return;

    setState(prev => ({ ...prev, isPolling: true }));

    try {
      await onPoll();
      setState(prev => ({ 
        ...prev, 
        lastPollTime: new Date(),
        isPolling: false 
      }));
    } catch (error) {
      console.error("[AdaptivePolling] Poll failed:", error);
      setState(prev => ({ ...prev, isPolling: false }));
    }
  }, [onPoll, state.isPaused]);

  /**
   * Start or restart polling with new interval
   */
  const startPolling = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = await calculateInterval();
    
    setState(prev => ({ 
      ...prev, 
      currentInterval: interval,
      isPaused: false 
    }));

    // Initial poll
    await executePoll();

    // Start interval
    intervalRef.current = window.setInterval(executePoll, interval);
  }, [calculateInterval, executePoll]);

  /**
   * Pause polling
   */
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  /**
   * Resume polling
   */
  const resume = useCallback(() => {
    startPolling();
  }, [startPolling]);

  /**
   * Force immediate poll
   */
  const pollNow = useCallback(async () => {
    await executePoll();
  }, [executePoll]);

  // Setup listeners and start polling
  useEffect(() => {
    isMountedRef.current = true;

    // Start polling
    startPolling();

    // Network change listener
    const unsubscribeNetwork = networkDetector.onChange(async (status) => {
      setState(prev => ({ 
        ...prev, 
        networkType: status.effectiveType || "4g" 
      }));
      
      // Recalculate interval on network change
      const newInterval = await calculateInterval();
      if (Math.abs(newInterval - state.currentInterval) > 5000) {
        startPolling(); // Restart with new interval
      }
    });

    // Visibility change listener
    const handleVisibilityChange = () => {
      if (pauseOnHidden) {
        if (document.hidden) {
          pause();
        } else {
          resume();
        }
      }
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      unsubscribeNetwork();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  }, []);

  return {
    ...state,
    pause,
    resume,
    pollNow,
    restart: startPolling
  };
};

/**
 * Interval multipliers by connection type
 */
export const CONNECTION_MULTIPLIERS = {
  "slow-2g": 4.0,
  "2g": 3.0,
  "3g": 1.5,
  "4g": 1.0,
  "wifi": 1.0
} as const;

/**
 * Recommended intervals by data type
 */
export const RECOMMENDED_INTERVALS = {
  realtime: { base: 5000, max: 30000, min: 2000 },
  frequent: { base: 30000, max: 120000, min: 10000 },
  normal: { base: 60000, max: 300000, min: 30000 },
  rare: { base: 300000, max: 900000, min: 120000 }
} as const;
