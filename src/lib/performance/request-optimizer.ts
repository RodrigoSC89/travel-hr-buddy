/**
 * Request Optimizer
 * PATCH 834: Optimized request handling for slow networks
 */

import { bandwidthOptimizer } from "./low-bandwidth-optimizer";

interface RequestConfig {
  priority?: "high" | "normal" | "low";
  cache?: boolean;
  compress?: boolean;
  timeout?: number;
  retries?: number;
}

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  config: RequestConfig;
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
  attempts: number;
  timestamp: number;
}

class RequestOptimizer {
  private queue: QueuedRequest[] = [];
  private activeRequests = 0;
  private maxConcurrent = 6;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private isProcessing = false;

  constructor() {
    this.updateConcurrency();
    this.setupConnectionListener();
  }

  private updateConcurrency() {
    const connection = (navigator as any).connection;
    const connectionType = connection?.effectiveType || "4g";
    
    switch (connectionType) {
    case "slow-2g":
      this.maxConcurrent = 1;
      break;
    case "2g":
      this.maxConcurrent = 2;
      break;
    case "3g":
      this.maxConcurrent = 4;
      break;
    default:
      this.maxConcurrent = 6;
    }
  }

  private setupConnectionListener() {
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", () => {
        this.updateConcurrency();
      });
    }
  }

  private getCacheKey(url: string, options: RequestInit): string {
    return `${options.method || "GET"}:${url}`;
  }

  async request(
    url: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<Response> {
    const {
      priority = "normal",
      cache = options.method === "GET" || !options.method,
      compress = true,
      timeout = bandwidthOptimizer.getConfig().requestTimeout,
      retries = 3,
    } = config;

    const cacheKey = this.getCacheKey(url, options);

    // Check cache first
    if (cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        return new Response(JSON.stringify(cached.data), {
          headers: { "X-Cache": "HIT" },
        });
      }
      this.cache.delete(cacheKey);
    }

    // Add compression headers
    const headers = new Headers(options.headers);
    if (compress) {
      headers.set("Accept-Encoding", "gzip, deflate, br");
    }

    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: crypto.randomUUID(),
        url,
        options: { ...options, headers },
        config: { ...config, timeout, retries },
        resolve,
        reject,
        attempts: 0,
        timestamp: Date.now(),
      };

      // Insert based on priority
      if (priority === "high") {
        this.queue.unshift(request);
      } else if (priority === "low") {
        this.queue.push(request);
      } else {
        // Insert after high priority requests
        const insertIndex = this.queue.findIndex(r => r.config.priority !== "high");
        if (insertIndex === -1) {
          this.queue.push(request);
        } else {
          this.queue.splice(insertIndex, 0, request);
        }
      }

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;
      this.executeRequest(request);
    }

    this.isProcessing = false;
  }

  private async executeRequest(request: QueuedRequest) {
    const { url, options, config, resolve, reject } = request;
    const { timeout, retries, cache } = config;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Cache successful GET responses
      if (cache && response.ok && (!options.method || options.method === "GET")) {
        const clone = response.clone();
        const data = await clone.json().catch(() => null);
        if (data) {
          this.cache.set(this.getCacheKey(url, options), {
            data,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000, // 5 minutes
          });
        }
      }

      resolve(response);
    } catch (error) {
      request.attempts++;

      if (request.attempts < (retries || 3)) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, request.attempts - 1), 10000);
        
        setTimeout(() => {
          this.queue.unshift(request);
          this.processQueue();
        }, delay);
      } else {
        reject(error);
      }
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  // Cancel all pending requests
  cancelAll() {
    this.queue.forEach(request => {
      request.reject(new Error("Request cancelled"));
    });
    this.queue = [];
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get queue status
  getStatus() {
    return {
      pending: this.queue.length,
      active: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      cacheSize: this.cache.size,
    };
  }
}

export const requestOptimizer = new RequestOptimizer();

// Optimized fetch wrapper
export async function optimizedFetch(
  url: string,
  options?: RequestInit,
  config?: RequestConfig
): Promise<Response> {
  return requestOptimizer.request(url, options, config);
}

// React hook
import { useCallback, useMemo } from "react";

export function useOptimizedFetch() {
  const fetch = useCallback((url: string, options?: RequestInit, config?: RequestConfig) => {
    return requestOptimizer.request(url, options, config);
  }, []);

  const status = useMemo(() => requestOptimizer.getStatus(), []);

  return {
    fetch,
    status,
    cancelAll: requestOptimizer.cancelAll.bind(requestOptimizer),
    clearCache: requestOptimizer.clearCache.bind(requestOptimizer),
  };
}
