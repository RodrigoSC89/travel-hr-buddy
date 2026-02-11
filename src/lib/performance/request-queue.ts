/**
 * Request Queue Manager
 * Manages and prioritizes network requests for low-bandwidth scenarios
 */

type RequestPriority = 'critical' | 'high' | 'normal' | 'low';

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  priority: RequestPriority;
  timestamp: number;
  retries: number;
  resolve: (value: Response) => void;
  reject: (reason: unknown) => void;
}

class RequestQueueManager {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private concurrentLimit = 4;
  private activeRequests = 0;
  private retryLimit = 3;
  private retryDelay = 1000;

  constructor() {
    // Adjust concurrency based on connection
    this.updateConcurrency();
    
    if ('connection' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- non-standard Navigator.connection API
      ((navigator as Record<string, any>).connection)?.addEventListener('change', () => {
        this.updateConcurrency();
      });
    }
  }

  private updateConcurrency() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- non-standard Navigator.connection API
    const connection = (navigator as Record<string, any>).connection;
    if (!connection) return;

    const effectiveType = connection.effectiveType;
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        this.concurrentLimit = 1;
        break;
      case '3g':
        this.concurrentLimit = 2;
        break;
      case '4g':
      default:
        this.concurrentLimit = 4;
    }
  }

  /**
   * Add request to queue with priority
   */
  enqueue(url: string, options: RequestInit = {}, priority: RequestPriority = 'normal'): Promise<Response> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
        url,
        options,
        priority,
        timestamp: Date.now(),
        retries: 0,
        resolve,
        reject,
      };

      this.insertByPriority(request);
      this.processQueue();
    });
  }

  private insertByPriority(request: QueuedRequest) {
    const priorityOrder: Record<RequestPriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    const insertIndex = this.queue.findIndex(
      r => priorityOrder[r.priority] > priorityOrder[request.priority]
    );

    if (insertIndex === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(insertIndex, 0, request);
    }
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit) {
      const request = this.queue.shift();
      if (!request) continue;

      this.activeRequests++;
      this.executeRequest(request).finally(() => {
        this.activeRequests--;
        this.processQueue();
      });
    }

    this.isProcessing = false;
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const response = await fetch(request.url, {
        ...request.options,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok && request.retries < this.retryLimit) {
        request.retries++;
        await this.delay(this.retryDelay * request.retries);
        this.insertByPriority(request);
        return;
      }

      request.resolve(response);
    } catch (error) {
      if (request.retries < this.retryLimit) {
        request.retries++;
        await this.delay(this.retryDelay * request.retries);
        this.insertByPriority(request);
        return;
      }

      request.reject(error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    this.queue.forEach(request => {
      request.reject(new Error('Request cancelled'));
    });
    this.queue = [];
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      pending: this.queue.length,
      active: this.activeRequests,
      concurrentLimit: this.concurrentLimit,
    };
  }
}

export const requestQueue = new RequestQueueManager();

/**
 * Prioritized fetch wrapper
 */
export function prioritizedFetch(
  url: string,
  options?: RequestInit,
  priority: RequestPriority = 'normal'
): Promise<Response> {
  return requestQueue.enqueue(url, options, priority);
}
