/**
 * Request Queue for Offline-First Architecture
 * Manages HTTP requests with automatic retry and offline queuing
 * PATCH: Performance Optimization for 2Mb connections
 */

import { logger } from "@/lib/logger";

// Request priority levels
export enum RequestPriority {
  CRITICAL = 0,  // Auth, security
  HIGH = 1,      // User actions
  MEDIUM = 2,    // Data fetches
  LOW = 3,       // Analytics, logging
  BACKGROUND = 4 // Prefetch, sync
}

// Queued request structure
interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  priority: RequestPriority;
  timestamp: number;
  retries: number;
  maxRetries: number;
  timeout: number;
  resolve: (value: Response) => void;
  reject: (reason: Error) => void;
}

// Queue configuration
interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  defaultTimeout: number;
  retryDelay: number;
  maxRetries: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 4,      // Max parallel requests
  maxQueueSize: 100,     // Max queued requests
  defaultTimeout: 15000, // 15 second timeout
  retryDelay: 1000,      // 1 second retry delay
  maxRetries: 3,
};

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private activeRequests = 0;
  private config: QueueConfig;
  private isOnline = navigator.onLine;
  private isPaused = false;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      logger.info("[RequestQueue] Online - processing queue");
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      logger.warn("[RequestQueue] Offline - queuing requests");
    });
  }

  /**
   * Add request to queue
   */
  public enqueue(
    url: string,
    options: RequestInit = {},
    priority: RequestPriority = RequestPriority.MEDIUM,
    timeout?: number
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      // Check queue size
      if (this.queue.length >= this.config.maxQueueSize) {
        // Remove lowest priority request
        const lowestPriority = this.queue
          .filter(r => r.priority === RequestPriority.BACKGROUND)
          .sort((a, b) => a.timestamp - b.timestamp)[0];
        
        if (lowestPriority) {
          this.removeFromQueue(lowestPriority.id);
          lowestPriority.reject(new Error("Request dropped due to queue overflow"));
        } else {
          reject(new Error("Request queue is full"));
          return;
        }
      }

      const request: QueuedRequest = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        options,
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: this.config.maxRetries,
        timeout: timeout || this.config.defaultTimeout,
        resolve,
        reject,
      };

      // Insert in priority order
      const insertIndex = this.queue.findIndex(r => r.priority > priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      logger.debug(`[RequestQueue] Queued: ${url} (priority: ${priority})`);
      this.processQueue();
    });
  }

  /**
   * Process next requests in queue
   */
  private async processQueue(): Promise<void> {
    if (this.isPaused || !this.isOnline) return;
    
    while (
      this.activeRequests < this.config.maxConcurrent &&
      this.queue.length > 0
    ) {
      const request = this.queue.shift();
      if (!request) break;

      this.activeRequests++;
      this.executeRequest(request);
    }
  }

  /**
   * Execute a single request with timeout and retry
   */
  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), request.timeout);

      const response = await fetch(request.url, {
        ...request.options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      request.resolve(response);
      logger.debug(`[RequestQueue] Completed: ${request.url}`);
    } catch (error) {
      if (request.retries < request.maxRetries && this.shouldRetry(error)) {
        request.retries++;
        logger.warn(`[RequestQueue] Retrying (${request.retries}/${request.maxRetries}): ${request.url}`);
        
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, request.retries - 1);
        
        setTimeout(() => {
          // Re-queue with same priority
          this.queue.unshift(request);
          this.processQueue();
        }, delay);
      } else {
        request.reject(error as Error);
        logger.error(`[RequestQueue] Failed: ${request.url}`, error);
      }
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry on network errors and 5xx
      if (error.name === "AbortError") return true;
      if (error.message.includes("Server error")) return true;
      if (error.message.includes("network")) return true;
    }
    return false;
  }

  /**
   * Remove request from queue
   */
  private removeFromQueue(id: string): void {
    const index = this.queue.findIndex(r => r.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Cancel a specific request
   */
  public cancel(url: string): boolean {
    const request = this.queue.find(r => r.url === url);
    if (request) {
      this.removeFromQueue(request.id);
      request.reject(new Error("Request cancelled"));
      return true;
    }
    return false;
  }

  /**
   * Cancel all requests with specific priority
   */
  public cancelByPriority(priority: RequestPriority): number {
    const toCancel = this.queue.filter(r => r.priority === priority);
    toCancel.forEach(r => {
      this.removeFromQueue(r.id);
      r.reject(new Error("Request cancelled"));
    });
    return toCancel.length;
  }

  /**
   * Pause queue processing
   */
  public pause(): void {
    this.isPaused = true;
    logger.info("[RequestQueue] Paused");
  }

  /**
   * Resume queue processing
   */
  public resume(): void {
    this.isPaused = false;
    logger.info("[RequestQueue] Resumed");
    this.processQueue();
  }

  /**
   * Clear all queued requests
   */
  public clear(): void {
    this.queue.forEach(r => r.reject(new Error("Queue cleared")));
    this.queue = [];
    logger.info("[RequestQueue] Cleared");
  }

  /**
   * Get queue status
   */
  public getStatus(): {
    queued: number;
    active: number;
    isOnline: boolean;
    isPaused: boolean;
    } {
    return {
      queued: this.queue.length,
      active: this.activeRequests,
      isOnline: this.isOnline,
      isPaused: this.isPaused,
    };
  }

  /**
   * Adjust concurrent limit based on network
   */
  public adjustConcurrency(connectionType?: string): void {
    if (connectionType === "slow-2g" || connectionType === "2g") {
      this.config.maxConcurrent = 2;
    } else if (connectionType === "3g") {
      this.config.maxConcurrent = 3;
    } else {
      this.config.maxConcurrent = DEFAULT_CONFIG.maxConcurrent;
    }
    logger.info(`[RequestQueue] Concurrency adjusted to ${this.config.maxConcurrent}`);
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();

// Convenience wrapper for fetch with queuing
export const queuedFetch = (
  url: string,
  options?: RequestInit,
  priority?: RequestPriority,
  timeout?: number
): Promise<Response> => {
  return requestQueue.enqueue(url, options, priority, timeout);
};

// High priority fetch for user actions
export const priorityFetch = (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  return requestQueue.enqueue(url, options, RequestPriority.HIGH, 10000);
};

// Background fetch for non-critical requests
export const backgroundFetch = (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  return requestQueue.enqueue(url, options, RequestPriority.BACKGROUND, 30000);
};
