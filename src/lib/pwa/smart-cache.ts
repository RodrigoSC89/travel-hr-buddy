/**
 * PATCH 837: Smart Caching System
 * Intelligent caching with prediction and prioritization
 */

// Get connection type from navigator API
function getConnectionType(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
      return 'slow';
    }
    if (conn?.effectiveType === '3g') {
      return 'medium';
    }
  }
  return 'fast';
}

interface CacheEntry {
  data: any;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number;
  priority: number;
}

interface CacheConfig {
  maxSize: number; // in bytes
  defaultTTL: number; // in ms
  cleanupInterval: number; // in ms
}

class SmartCacheManager {
  private cache = new Map<string, CacheEntry>();
  private accessPatterns = new Map<string, number[]>();
  private config: CacheConfig;
  private totalSize = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      ...config,
    };

    // Adjust based on connection
    this.adjustForConnection();

    // Start cleanup interval
    setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  private adjustForConnection(): void {
    const connectionType = getConnectionType();
    
    switch (connectionType) {
      case 'slow':
        this.config.maxSize = 100 * 1024 * 1024; // More cache for slow connections
        this.config.defaultTTL = 30 * 60 * 1000; // Longer TTL
        break;
      case 'medium':
        this.config.maxSize = 75 * 1024 * 1024;
        this.config.defaultTTL = 15 * 60 * 1000;
        break;
      case 'fast':
        this.config.maxSize = 50 * 1024 * 1024;
        this.config.defaultTTL = 5 * 60 * 1000;
        break;
    }
  }

  // Set cache with smart prioritization
  set(key: string, data: any, options: { ttl?: number; priority?: number } = {}): void {
    const size = this.estimateSize(data);
    
    // Ensure space
    while (this.totalSize + size > this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
      size,
      priority: options.priority ?? this.calculatePriority(key),
    };

    this.cache.set(key, entry);
    this.totalSize += size;
    this.recordAccess(key);
  }

  // Get with access tracking
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.config.defaultTTL) {
      this.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.recordAccess(key);

    return entry.data as T;
  }

  // Get or fetch with automatic caching
  async getOrFetch<T>(
    key: string, 
    fetcher: () => Promise<T>,
    options: { ttl?: number; priority?: number } = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }

  // Delete entry
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  // Prefetch predicted data
  async prefetch(keys: string[], fetchers: Map<string, () => Promise<any>>): Promise<void> {
    const predictions = this.predictNextAccess();
    const toPrefetch = keys.filter(k => predictions.includes(k) && !this.cache.has(k));

    await Promise.all(
      toPrefetch.map(async key => {
        const fetcher = fetchers.get(key);
        if (fetcher) {
          try {
            const data = await fetcher();
            this.set(key, data, { priority: 5 }); // Low priority for prefetched
          } catch {
            // Ignore prefetch errors
          }
        }
      })
    );
  }

  // Get cache statistics
  getStats(): {
    entries: number;
    totalSize: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      entries: this.cache.size,
      totalSize: this.totalSize,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  // Predict next likely accessed keys
  private predictNextAccess(): string[] {
    const predictions: Array<{ key: string; score: number }> = [];

    this.accessPatterns.forEach((timestamps, key) => {
      if (timestamps.length < 2) return;

      // Calculate access frequency
      const frequency = timestamps.length;
      const recency = Date.now() - timestamps[timestamps.length - 1];
      const score = frequency * 1000 / (recency + 1);

      predictions.push({ key, score });
    });

    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => p.key);
  }

  // Record access pattern
  private recordAccess(key: string): void {
    const pattern = this.accessPatterns.get(key) || [];
    pattern.push(Date.now());
    
    // Keep only last 100 accesses
    if (pattern.length > 100) {
      pattern.shift();
    }
    
    this.accessPatterns.set(key, pattern);
  }

  // Calculate priority based on access patterns
  private calculatePriority(key: string): number {
    const pattern = this.accessPatterns.get(key);
    if (!pattern || pattern.length === 0) return 5;

    const frequency = pattern.length;
    if (frequency > 50) return 1;
    if (frequency > 20) return 2;
    if (frequency > 10) return 3;
    if (frequency > 5) return 4;
    return 5;
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruScore = Infinity;

    this.cache.forEach((entry, key) => {
      // Score = (priority * 10) + (accessCount * 2) - (age in minutes)
      const age = (Date.now() - entry.lastAccess) / 60000;
      const score = (entry.priority * 10) + (entry.accessCount * 2) - age;
      
      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.defaultTTL) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.delete(key));
  }

  // Estimate data size
  private estimateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  // Calculate hit rate (simplified)
  private calculateHitRate(): number {
    let totalAccesses = 0;
    this.cache.forEach(entry => {
      totalAccesses += entry.accessCount;
    });
    return totalAccesses > 0 ? Math.min(totalAccesses / this.cache.size, 1) : 0;
  }
}

export const smartCache = new SmartCacheManager();

// React hook
export function useSmartCache<T>(key: string, fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const result = await smartCache.getOrFetch(key, fetcher);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [key, ...deps]);

  const refresh = async () => {
    smartCache.delete(key);
    setLoading(true);
    try {
      const result = await fetcher();
      smartCache.set(key, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

import { useState, useEffect } from 'react';
