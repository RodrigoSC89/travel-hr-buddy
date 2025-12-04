/**
 * Network-Aware Hook
 * Adapts app behavior based on network conditions
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { networkDetector } from "../services/networkDetector";
import { dataCompression } from "../services/data-compression";
import { NetworkStatus } from "../types";

export type NetworkQuality = "excellent" | "good" | "fair" | "poor" | "offline";

export interface NetworkAwareState {
  isOnline: boolean;
  quality: NetworkQuality;
  effectiveType: string | undefined;
  downlink: number | undefined;
  rtt: number | undefined;
  shouldCompress: boolean;
  shouldReduceData: boolean;
  isSlowConnection: boolean;
}

export interface NetworkAwareOptions {
  onQualityChange?: (quality: NetworkQuality) => void;
  onOffline?: () => void;
  onOnline?: () => void;
  slowConnectionThreshold?: number; // Mbps
}

// Calculate network quality
function getQuality(status: NetworkStatus): NetworkQuality {
  if (!status.isOnline) return "offline";
  
  const effectiveType = status.effectiveType;
  const downlink = status.downlink ?? 10;
  const rtt = status.rtt ?? 50;
  
  if (effectiveType === "4g" && downlink >= 10 && rtt <= 50) {
    return "excellent";
  } else if (effectiveType === "4g" || (downlink >= 5 && rtt <= 100)) {
    return "good";
  } else if (effectiveType === "3g" || (downlink >= 2 && rtt <= 300)) {
    return "fair";
  } else {
    return "poor";
  }
}

function shouldCompress(status: NetworkStatus): boolean {
  return !status.isOnline || 
         status.effectiveType === "2g" || 
         status.effectiveType === "slow-2g" ||
         (status.downlink !== undefined && status.downlink < 5);
}

function shouldReduceData(status: NetworkStatus): boolean {
  return !status.isOnline ||
         status.effectiveType === "2g" ||
         status.effectiveType === "slow-2g" ||
         (status.downlink !== undefined && status.downlink < 2);
}

function isSlowConnection(status: NetworkStatus, threshold: number): boolean {
  if (!status.isOnline) return true;
  if (status.downlink !== undefined && status.downlink < threshold) return true;
  if (status.effectiveType === "2g" || status.effectiveType === "slow-2g") return true;
  return false;
}

// Helper: Convert quality to numeric score
function getQualityScore(quality: NetworkQuality): number {
  const scores: Record<NetworkQuality, number> = {
    offline: 0,
    poor: 1,
    fair: 2,
    good: 3,
    excellent: 4,
  };
  return scores[quality];
}

export function useNetworkAware(options: NetworkAwareOptions = {}) {
  const {
    onQualityChange,
    onOffline,
    onOnline,
    slowConnectionThreshold = 2,
  } = options;

  const initialStatus = networkDetector.getStatus();
  
  const [state, setState] = useState<NetworkAwareState>({
    isOnline: initialStatus.isOnline,
    quality: getQuality(initialStatus),
    effectiveType: initialStatus.effectiveType,
    downlink: initialStatus.downlink,
    rtt: initialStatus.rtt,
    shouldCompress: shouldCompress(initialStatus),
    shouldReduceData: shouldReduceData(initialStatus),
    isSlowConnection: isSlowConnection(initialStatus, slowConnectionThreshold),
  });

  const prevQuality = useRef<NetworkQuality>(state.quality);
  const prevOnline = useRef<boolean>(state.isOnline);

  // Update state when network changes
  useEffect(() => {
    const handleChange = (status: NetworkStatus) => {
      const newState: NetworkAwareState = {
        isOnline: status.isOnline,
        quality: getQuality(status),
        effectiveType: status.effectiveType,
        downlink: status.downlink,
        rtt: status.rtt,
        shouldCompress: shouldCompress(status),
        shouldReduceData: shouldReduceData(status),
        isSlowConnection: isSlowConnection(status, slowConnectionThreshold),
      };

      setState(newState);

      // Trigger callbacks
      if (newState.quality !== prevQuality.current) {
        onQualityChange?.(newState.quality);
        prevQuality.current = newState.quality;
      }

      if (newState.isOnline !== prevOnline.current) {
        if (newState.isOnline) {
          onOnline?.();
        } else {
          onOffline?.();
        }
        prevOnline.current = newState.isOnline;
      }
    };

    const unsubscribe = networkDetector.onChange(handleChange);
    return unsubscribe;
  }, [onQualityChange, onOnline, onOffline, slowConnectionThreshold]);

  // Get adaptive fetch options
  const getAdaptiveFetchOptions = useCallback((): RequestInit => {
    const opts: RequestInit = {};

    if (state.isSlowConnection) {
      // Use longer timeout for slow connections
      opts.signal = AbortSignal.timeout(30000);
    } else {
      opts.signal = AbortSignal.timeout(10000);
    }

    return opts;
  }, [state.isSlowConnection]);

  // Get compression recommendations
  const getCompressionRecommendations = useCallback(() => {
    const speed = state.downlink ?? 2;
    return dataCompression.getRecommendations(speed);
  }, [state.downlink]);

  // Estimate transfer time
  const estimateTransferTime = useCallback((dataSize: number) => {
    const speed = state.downlink ?? 2;
    return dataCompression.estimateTransferTime(dataSize, speed);
  }, [state.downlink]);

  // Wait for good connection
  const waitForGoodConnection = useCallback(async (
    minQuality: NetworkQuality = "fair",
    timeout: number = 30000
  ): Promise<boolean> => {
    if (getQualityScore(state.quality) >= getQualityScore(minQuality)) {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = networkDetector.onChange((status: NetworkStatus) => {
        const quality = getQuality(status);
        if (getQualityScore(quality) >= getQualityScore(minQuality)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }, [state.quality]);

  return {
    ...state,
    getAdaptiveFetchOptions,
    getCompressionRecommendations,
    estimateTransferTime,
    waitForGoodConnection,
  };
}
