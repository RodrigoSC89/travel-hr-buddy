/**
 * Request Queue Manager - PATCH 832
 * Manages API requests with offline queue, retry logic, and prioritization
 */

import { logger } from '@/lib/monitoring/structured-logging';

type RequestPriority = 'high' | 'medium' | 'low';
type RequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  priority: RequestPriority;
  status: RequestStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastAttemptAt?: number;
  error?: string;
  callback?: (response: Response | null, error?: Error) => void;
}

interface RequestQueueConfig {
  maxConcurrent: number;
  maxRetries: number;
  retryDelay: number;
  maxQueueSize: number;
  persistQueue: boolean;
}

const DEFAULT_CONFIG: RequestQueueConfig = {
  maxConcurrent: 3,
  maxRetries: 3,
  retryDelay: 2000,
  maxQueueSize: 100,
  persistQueue: true,
};

const STORAGE_KEY = 'request-queue';

class RequestQueueManager {
  private queue: Map<string, QueuedRequest> = new Map();
  private activeRequests = 0;
  private config: RequestQueueConfig;
  private isProcessing = false;
  private listeners: Set<(queue: QueuedRequest[]) => void> = new Set();

  constructor(config: Partial<RequestQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
    this.setupNetworkListeners();
  }

  private loadFromStorage() {
    if (!this.config.persistQueue) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: QueuedRequest[] = JSON.parse(stored);
        items.forEach((item) => {
          item.status = 'pending'; // Reset status on load
          this.queue.set(item.id, item);
        });
      }
    } catch (error) {
      logger.warn('Failed to load request queue from storage', { error });
    }
  }

  private saveToStorage() {
    if (!this.config.persistQueue) return;

    try {
      const items = Array.from(this.queue.values()).filter(
        (r) => r.status === 'pending' || r.status === 'processing'
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      logger.warn('Failed to save request queue to storage', { error });
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      logger.info('Network online, processing queue');
      this.processQueue();
    });
  }

  // Add request to queue
  enqueue(
    url: string,
    options: RequestInit & {
      priority?: RequestPriority;
      maxRetries?: number;
      callback?: (response: Response | null, error?: Error) => void;
    } = {}
  ): string {
    const { priority = 'medium', maxRetries = this.config.maxRetries, callback, ...fetchOptions } = options;

    if (this.queue.size >= this.config.maxQueueSize) {
      // Remove oldest low priority request
      const lowPriorityRequests = Array.from(this.queue.values())
        .filter((r) => r.priority === 'low' && r.status === 'pending')
        .sort((a, b) => a.createdAt - b.createdAt);

      if (lowPriorityRequests.length > 0) {
        this.queue.delete(lowPriorityRequests[0].id);
      } else {
        throw new Error('Request queue is full');
      }
    }

    const request: QueuedRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      method: fetchOptions.method || 'GET',
      body: fetchOptions.body as string | undefined,
      headers: fetchOptions.headers as Record<string, string> | undefined,
      priority,
      status: 'pending',
      retryCount: 0,
      maxRetries,
      createdAt: Date.now(),
      callback,
    };

    this.queue.set(request.id, request);
    this.saveToStorage();
    this.notifyListeners();

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return request.id;
  }

  // Process the queue
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;

    this.isProcessing = true;

    try {
      // Sort by priority and creation time
      const pendingRequests = Array.from(this.queue.values())
        .filter((r) => r.status === 'pending')
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          return priorityDiff !== 0 ? priorityDiff : a.createdAt - b.createdAt;
        });

      for (const request of pendingRequests) {
        if (this.activeRequests >= this.config.maxConcurrent) {
          break;
        }

        if (!navigator.onLine) {
          break;
        }

        this.executeRequest(request);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    this.activeRequests++;
    request.status = 'processing';
    request.lastAttemptAt = Date.now();
    this.notifyListeners();

    try {
      const response = await fetch(request.url, {
        method: request.method,
        body: request.body,
        headers: request.headers,
      });

      if (response.ok) {
        request.status = 'completed';
        request.callback?.(response);
        this.queue.delete(request.id);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      request.retryCount++;
      request.error = error instanceof Error ? error.message : 'Unknown error';

      if (request.retryCount >= request.maxRetries) {
        request.status = 'failed';
        request.callback?.(null, error instanceof Error ? error : new Error('Request failed'));
        logger.error('Request failed after max retries', undefined, {
          requestId: request.id,
          url: request.url,
          errorMessage: request.error,
        });
      } else {
        request.status = 'pending';
        // Schedule retry
        setTimeout(() => {
          if (this.queue.has(request.id)) {
            this.processQueue();
          }
        }, this.config.retryDelay * Math.pow(2, request.retryCount - 1)); // Exponential backoff
      }
    } finally {
      this.activeRequests--;
      this.saveToStorage();
      this.notifyListeners();

      // Process more if queue has items
      if (this.getPendingCount() > 0) {
        this.processQueue();
      }
    }
  }

  // Cancel a request
  cancel(requestId: string): boolean {
    const request = this.queue.get(requestId);
    if (request && request.status === 'pending') {
      this.queue.delete(requestId);
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Clear all pending requests
  clearPending(): void {
    for (const [id, request] of this.queue) {
      if (request.status === 'pending') {
        this.queue.delete(id);
      }
    }
    this.saveToStorage();
    this.notifyListeners();
  }

  // Get queue status
  getStatus() {
    const requests = Array.from(this.queue.values());
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      processing: requests.filter((r) => r.status === 'processing').length,
      failed: requests.filter((r) => r.status === 'failed').length,
      isOnline: navigator.onLine,
    };
  }

  getPendingCount(): number {
    return Array.from(this.queue.values()).filter((r) => r.status === 'pending').length;
  }

  getFailedRequests(): QueuedRequest[] {
    return Array.from(this.queue.values()).filter((r) => r.status === 'failed');
  }

  // Retry all failed requests
  retryFailed(): void {
    for (const request of this.queue.values()) {
      if (request.status === 'failed') {
        request.status = 'pending';
        request.retryCount = 0;
        request.error = undefined;
      }
    }
    this.saveToStorage();
    this.notifyListeners();
    this.processQueue();
  }

  // Subscribe to queue changes
  subscribe(callback: (queue: QueuedRequest[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    const queue = Array.from(this.queue.values());
    this.listeners.forEach((callback) => callback(queue));
  }
}

// Singleton instance
export const requestQueue = new RequestQueueManager();

// React hook
export function useRequestQueue() {
  const [status, setStatus] = React.useState(requestQueue.getStatus());

  React.useEffect(() => {
    const unsubscribe = requestQueue.subscribe(() => {
      setStatus(requestQueue.getStatus());
    });

    return unsubscribe;
  }, []);

  return {
    ...status,
    enqueue: requestQueue.enqueue.bind(requestQueue),
    cancel: requestQueue.cancel.bind(requestQueue),
    clearPending: requestQueue.clearPending.bind(requestQueue),
    retryFailed: requestQueue.retryFailed.bind(requestQueue),
    getFailedRequests: requestQueue.getFailedRequests.bind(requestQueue),
  };
}

// Need React import for hook
import React from 'react';
