/**
 * API Optimizer
 * PATCH: Request batching and caching strategies
 */

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate: boolean;
  maxSize: number;
}

export interface BatchConfig {
  maxBatchSize: number;
  batchDelay: number; // ms
  enabled: boolean;
}

export interface RequestMetrics {
  endpoint: string;
  count: number;
  avgLatency: number;
  cacheHitRate: number;
  errorRate: number;
}

export class APIOptimizer {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private pendingBatches = new Map<string, { requests: Array<{ key: string; resolve: (data: unknown) => void }>; timeout: NodeJS.Timeout | null }>();
  private metrics = new Map<string, RequestMetrics>();

  private cacheConfig: CacheConfig = {
    ttl: 300, // 5 minutes default
    staleWhileRevalidate: true,
    maxSize: 1000,
  };

  private batchConfig: BatchConfig = {
    maxBatchSize: 50,
    batchDelay: 50,
    enabled: true,
  };

  async cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: Partial<CacheConfig>
  ): Promise<T> {
    const config = { ...this.cacheConfig, ...options };
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached if valid
    if (cached && now - cached.timestamp < cached.ttl * 1000) {
      this.recordCacheHit(key);
      return cached.data as T;
    }

    // Stale while revalidate
    if (cached && config.staleWhileRevalidate) {
      this.recordCacheHit(key);
      // Revalidate in background
      fetcher().then(data => this.setCache(key, data, config.ttl)).catch(() => {});
      return cached.data as T;
    }

    // Fetch fresh data
    const startTime = Date.now();
    try {
      const data = await fetcher();
      this.setCache(key, data, config.ttl);
      this.recordRequest(key, Date.now() - startTime, false);
      return data;
    } catch (error) {
      this.recordError(key);
      throw error;
    }
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    // Enforce max size
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async batchedFetch<T>(
    batchKey: string,
    itemKey: string,
    batchFetcher: (keys: string[]) => Promise<Map<string, T>>
  ): Promise<T> {
    if (!this.batchConfig.enabled) {
      const result = await batchFetcher([itemKey]);
      const data = result.get(itemKey);
      if (data === undefined) throw new Error(`No data for key: ${itemKey}`);
      return data;
    }

    return new Promise((resolve) => {
      let batch = this.pendingBatches.get(batchKey);

      if (!batch) {
        batch = { requests: [], timeout: null };
        this.pendingBatches.set(batchKey, batch);
      }

      batch.requests.push({ key: itemKey, resolve: resolve as (data: unknown) => void });

      // Clear existing timeout
      if (batch.timeout) {
        clearTimeout(batch.timeout);
      }

      // Execute batch if max size reached
      if (batch.requests.length >= this.batchConfig.maxBatchSize) {
        this.executeBatch(batchKey, batchFetcher);
      } else {
        // Schedule batch execution
        batch.timeout = setTimeout(() => {
          this.executeBatch(batchKey, batchFetcher);
        }, this.batchConfig.batchDelay);
      }
    });
  }

  private async executeBatch<T>(
    batchKey: string,
    batchFetcher: (keys: string[]) => Promise<Map<string, T>>
  ): Promise<void> {
    const batch = this.pendingBatches.get(batchKey);
    if (!batch || batch.requests.length === 0) return;

    this.pendingBatches.delete(batchKey);

    const keys = batch.requests.map(r => r.key);
    const startTime = Date.now();

    try {
      const results = await batchFetcher(keys);
      const latency = Date.now() - startTime;

      batch.requests.forEach(({ key, resolve }) => {
        const data = results.get(key);
        resolve(data);
        this.recordRequest(key, latency / batch.requests.length, false);
      });
    } catch (error) {
      batch.requests.forEach(({ key }) => {
        this.recordError(key);
      });
      throw error;
    }
  }

  private recordCacheHit(endpoint: string): void {
    const metrics = this.getOrCreateMetrics(endpoint);
    metrics.count++;
    // Update cache hit rate (rolling average)
    metrics.cacheHitRate = metrics.cacheHitRate * 0.95 + 1 * 0.05;
  }

  private recordRequest(endpoint: string, latency: number, isError: boolean): void {
    const metrics = this.getOrCreateMetrics(endpoint);
    metrics.count++;
    metrics.avgLatency = metrics.avgLatency * 0.9 + latency * 0.1;
    if (isError) {
      metrics.errorRate = metrics.errorRate * 0.95 + 1 * 0.05;
    } else {
      metrics.errorRate = metrics.errorRate * 0.95;
    }
    metrics.cacheHitRate = metrics.cacheHitRate * 0.95;
  }

  private recordError(endpoint: string): void {
    this.recordRequest(endpoint, 0, true);
  }

  private getOrCreateMetrics(endpoint: string): RequestMetrics {
    let metrics = this.metrics.get(endpoint);
    if (!metrics) {
      metrics = {
        endpoint,
        count: 0,
        avgLatency: 0,
        cacheHitRate: 0,
        errorRate: 0,
      };
      this.metrics.set(endpoint, metrics);
    }
    return metrics;
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getMetrics(): RequestMetrics[] {
    return Array.from(this.metrics.values());
  }

  getCacheStats(): { size: number; hitRate: number } {
    const allMetrics = this.getMetrics();
    const avgHitRate = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / allMetrics.length
      : 0;

    return {
      size: this.cache.size,
      hitRate: avgHitRate,
    };
  }

  setCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  setBatchConfig(config: Partial<BatchConfig>): void {
    this.batchConfig = { ...this.batchConfig, ...config };
  }
}

export const apiOptimizer = new APIOptimizer();
