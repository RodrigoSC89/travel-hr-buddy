/**
 * Request Deduplication
 * Prevents duplicate API calls and caches responses
 */

type RequestKey = string;
type PendingRequest<T> = Promise<T>;

class RequestDeduplicator {
  private pendingRequests = new Map<RequestKey, PendingRequest<unknown>>();
  private cache = new Map<RequestKey, { data: unknown; timestamp: number }>();
  private defaultCacheDuration = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate a unique key for a request
   */
  private generateKey(url: string, options?: RequestInit): RequestKey {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Execute a request with deduplication
   */
  async fetch<T>(
    url: string,
    options?: RequestInit & { 
      cacheDuration?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const { cacheDuration = this.defaultCacheDuration, forceRefresh = false, ...fetchOptions } = options || {};
    const key = this.generateKey(url, fetchOptions);

    // Check cache first (only for GET requests)
    if (!forceRefresh && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data as T;
      }
    }

    // Check for pending request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Create new request
    const request = this.executeRequest<T>(url, fetchOptions, key, cacheDuration);
    this.pendingRequests.set(key, request);

    try {
      return await request;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async executeRequest<T>(
    url: string,
    options: RequestInit | undefined,
    key: RequestKey,
    cacheDuration: number
  ): Promise<T> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Schedule cache cleanup
    setTimeout(() => {
      this.cache.delete(key);
    }, cacheDuration);

    return data as T;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  invalidate(url: string, options?: RequestInit): void {
    const key = this.generateKey(url, options);
    this.cache.delete(key);
  }

  /**
   * Prefetch a URL
   */
  async prefetch(url: string): Promise<void> {
    const key = this.generateKey(url);
    
    if (this.cache.has(key) || this.pendingRequests.has(key)) {
      return;
    }

    try {
      await this.fetch(url);
    } catch {
      // Silently fail for prefetch
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Batch multiple requests together
 */
export class RequestBatcher<T, R> {
  private queue: Array<{ key: T; resolve: (value: R) => void; reject: (error: Error) => void }> = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private batchDelay: number;
  private maxBatchSize: number;
  private batchFn: (keys: T[]) => Promise<Map<T, R>>;

  constructor(
    batchFn: (keys: T[]) => Promise<Map<T, R>>,
    options: { delay?: number; maxSize?: number } = {}
  ) {
    this.batchFn = batchFn;
    this.batchDelay = options.delay ?? 10;
    this.maxBatchSize = options.maxSize ?? 100;
  }

  async load(key: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    const batch = this.queue.splice(0, this.maxBatchSize);
    if (batch.length === 0) return;

    const keys = batch.map(item => item.key);

    try {
      const results = await this.batchFn(keys);
      
      batch.forEach(item => {
        const result = results.get(item.key);
        if (result !== undefined) {
          item.resolve(result);
        } else {
          item.reject(new Error(`No result for key: ${String(item.key)}`));
        }
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Batch request failed');
      batch.forEach(item => item.reject(err));
    }
  }
}

/**
 * Retry failed requests with exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit & {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  }
): Promise<T> {
  const { 
    maxRetries = 3, 
    baseDelay = 1000, 
    maxDelay = 10000,
    ...fetchOptions 
  } = options || {};

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');
      
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
