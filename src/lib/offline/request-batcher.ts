/**
 * Request Batcher - PATCH 901
 * Batches and deduplicates requests for low-bandwidth optimization
 */

import { logger } from "@/lib/logger";
import { compressPayload, decompressPayload, shouldCompress } from "./payload-compression";

interface BatchedRequest {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
  timestamp: number;
  priority: "high" | "normal" | "low";
}

interface BatchConfig {
  maxBatchSize: number;
  maxWaitMs: number;
  deduplicateGET: boolean;
  compressPayloads: boolean;
}

const DEFAULT_CONFIG: BatchConfig = {
  maxBatchSize: 10,
  maxWaitMs: 100,
  deduplicateGET: true,
  compressPayloads: true,
};

class RequestBatcher {
  private queue: BatchedRequest[] = [];
  private timer: number | null = null;
  private config: BatchConfig;
  private requestCache: Map<string, { response: Response; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5000; // 5 seconds for GET deduplication

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add request to batch queue
   */
  async fetch(
    url: string,
    options: RequestInit = {},
    priority: "high" | "normal" | "low" = "normal"
  ): Promise<Response> {
    const method = options.method?.toUpperCase() || "GET";
    
    // Handle GET deduplication
    if (method === "GET" && this.config.deduplicateGET) {
      const cacheKey = this.getCacheKey(url, options);
      const cached = this.requestCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.debug("[RequestBatcher] Returning cached response", { url });
        return cached.response.clone();
      }
      
      // Check if same request is already in queue
      const existing = this.queue.find(
        r => r.url === url && this.getCacheKey(r.url, r.options) === cacheKey
      );
      
      if (existing) {
        logger.debug("[RequestBatcher] Deduplicating request", { url });
        return new Promise((resolve, reject) => {
          // Chain to existing request
          const originalResolve = existing.resolve;
          const originalReject = existing.reject;
          
          existing.resolve = (response: Response) => {
            originalResolve(response.clone());
            resolve(response.clone());
          };
          existing.reject = (error: any) => {
            originalReject(error);
            reject(error);
          };
        });
      }
    }

    // Compress payload if needed
    const processedOptions = { ...options };
    if (
      this.config.compressPayloads &&
      options.body &&
      typeof options.body === "string" &&
      shouldCompress(options.body)
    ) {
      const compressed = compressPayload(options.body);
      processedOptions.body = JSON.stringify(compressed);
      processedOptions.headers = {
        ...processedOptions.headers,
        "X-Compressed": "true",
      };
    }

    return new Promise((resolve, reject) => {
      const request: BatchedRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url,
        options: processedOptions,
        resolve,
        reject,
        timestamp: Date.now(),
        priority,
      };

      this.queue.push(request);
      this.sortQueue();

      // High priority requests go immediately
      if (priority === "high") {
        this.flush();
      } else {
        this.scheduleFlush();
      }
    });
  }

  private getCacheKey(url: string, options: RequestInit): string {
    return `${options.method || "GET"}-${url}-${JSON.stringify(options.headers || {})}`;
  }

  private sortQueue(): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private scheduleFlush(): void {
    if (this.timer) return;

    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.flush();
    }, this.config.maxWaitMs);
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0, this.config.maxBatchSize);
    if (batch.length === 0) return;

    logger.debug(`[RequestBatcher] Flushing ${batch.length} requests`);

    // Execute requests in parallel with controlled concurrency
    const concurrency = 3;
    for (let i = 0; i < batch.length; i += concurrency) {
      const chunk = batch.slice(i, i + concurrency);
      await Promise.all(chunk.map(req => this.executeRequest(req)));
    }

    // Process remaining queue
    if (this.queue.length > 0) {
      this.scheduleFlush();
    }
  }

  private async executeRequest(request: BatchedRequest): Promise<void> {
    try {
      const response = await fetch(request.url, request.options);
      
      // Cache GET responses
      if (this.config.deduplicateGET && request.options.method?.toUpperCase() !== "POST") {
        const cacheKey = this.getCacheKey(request.url, request.options);
        this.requestCache.set(cacheKey, {
          response: response.clone(),
          timestamp: Date.now(),
        });
        
        // Clean old cache entries
        this.cleanCache();
      }

      request.resolve(response);
    } catch (error) {
      request.reject(error);
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCache) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      cacheSize: this.requestCache.size,
      pendingHigh: this.queue.filter(r => r.priority === "high").length,
      pendingNormal: this.queue.filter(r => r.priority === "normal").length,
      pendingLow: this.queue.filter(r => r.priority === "low").length,
    };
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    for (const request of this.queue) {
      request.reject(new Error("Request cancelled"));
    }
    this.queue = [];
    this.requestCache.clear();
  }
}

export const requestBatcher = new RequestBatcher();

/**
 * Convenience function for batched fetch
 */
export function batchedFetch(
  url: string,
  options?: RequestInit,
  priority?: "high" | "normal" | "low"
): Promise<Response> {
  return requestBatcher.fetch(url, options, priority);
}
