/**
 * Network Performance Utilities
 * PATCH: Optimizations for slow networks (VSAT 1-2Mbps)
 */

import { useEffect, useState, useCallback } from "react";

// Network quality detection
export type NetworkQuality = "fast" | "medium" | "slow" | "offline";

interface NetworkInfo {
  quality: NetworkQuality;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Hook to detect network quality
 */
export function useNetworkQuality(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    quality: "fast",
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;

      if (!navigator.onLine) {
        setNetworkInfo({ quality: "offline" });
        return;
      }

      if (!connection) {
        setNetworkInfo({ quality: "fast" });
        return;
      }

      const { effectiveType, downlink, rtt, saveData } = connection;

      let quality: NetworkQuality = "fast";

      if (effectiveType === "slow-2g" || effectiveType === "2g" || downlink < 0.5) {
        quality = "slow";
      } else if (effectiveType === "3g" || downlink < 2) {
        quality = "medium";
      }

      if (saveData) {
        quality = "slow"; // Respect data saver mode
      }

      setNetworkInfo({
        quality,
        effectiveType,
        downlink,
        rtt,
        saveData,
      });
    };

    updateNetworkInfo();

    // Listen for changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo);
    }
    window.addEventListener("online", updateNetworkInfo);
    window.addEventListener("offline", updateNetworkInfo);

    return () => {
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
      window.removeEventListener("online", updateNetworkInfo);
      window.removeEventListener("offline", updateNetworkInfo);
    };
  }, []);

  return networkInfo;
}

/**
 * Adaptive image quality based on network
 */
export function getOptimalImageQuality(networkQuality: NetworkQuality): number {
  switch (networkQuality) {
    case "slow":
      return 40;
    case "medium":
      return 70;
    case "fast":
    default:
      return 90;
  }
}

/**
 * Adaptive fetch timeout based on network
 */
export function getAdaptiveTimeout(networkQuality: NetworkQuality): number {
  switch (networkQuality) {
    case "slow":
      return 30000; // 30s
    case "medium":
      return 15000; // 15s
    case "fast":
    default:
      return 8000; // 8s
  }
}

/**
 * Prefetch with network awareness
 */
export function usePrefetch() {
  const { quality } = useNetworkQuality();

  const prefetch = useCallback(
    (url: string, options?: { priority?: "high" | "low" }) => {
      // Don't prefetch on slow networks unless high priority
      if (quality === "slow" && options?.priority !== "high") {
        return;
      }

      if (quality === "offline") {
        return;
      }

      // Use link prefetch
      const link = document.createElement("link");
      link.rel = quality === "fast" ? "prefetch" : "preconnect";
      link.href = url;
      document.head.appendChild(link);
    },
    [quality]
  );

  return prefetch;
}

/**
 * Debounced fetch for slow networks
 */
export function createAdaptiveFetch(networkQuality: NetworkQuality) {
  const timeout = getAdaptiveTimeout(networkQuality);

  return async (url: string, options?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
}

/**
 * Compression utilities
 */
export function compressJSON(data: unknown): string {
  const json = JSON.stringify(data);
  // Simple compression: remove whitespace
  return json.replace(/\s+/g, "");
}

/**
 * Delta sync: only send changed fields
 */
export function getDelta<T extends Record<string, unknown>>(
  original: T,
  updated: T
): Partial<T> {
  const delta: Partial<T> = {};

  for (const key of Object.keys(updated) as (keyof T)[]) {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      delta[key] = updated[key];
    }
  }

  return delta;
}

/**
 * Batch requests to reduce overhead
 */
export class RequestBatcher<T, R> {
  private queue: Array<{ data: T; resolve: (result: R) => void; reject: (error: Error) => void }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchSize: number;
  private delay: number;

  constructor(
    private processBatch: (items: T[]) => Promise<R[]>,
    options: { batchSize?: number; delay?: number } = {}
  ) {
    this.batchSize = options.batchSize || 10;
    this.delay = options.delay || 100;
  }

  async add(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const items = batch.map((b) => b.data);

    try {
      const results = await this.processBatch(items);
      batch.forEach((b, i) => b.resolve(results[i]));
    } catch (error) {
      batch.forEach((b) => b.reject(error as Error));
    }
  }
}

/**
 * Local cache with LRU eviction
 */
export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(options: { maxSize?: number; ttl?: number } = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}
