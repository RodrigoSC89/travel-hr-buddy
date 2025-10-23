/**
 * Hub Cache - Offline Storage Management
 * Manages local cache for offline operation with 100MB capacity
 */

import { CacheEntry } from "./types";
import config from "./hub_config.json";

export class HubCache {
  private readonly storageKey = config.cache.storageKey;
  private readonly maxSize = config.cache.maxSize;
  private readonly cleanupThreshold = config.cache.cleanupThreshold;

  /**
   * Add entry to cache
   */
  async addEntry(entry: Omit<CacheEntry, "id" | "timestamp">): Promise<void> {
    const cache = this.getCache();
    const newEntry: CacheEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    cache.push(newEntry);
    await this.cleanup();
    this.setCache(cache);
  }

  /**
   * Get all pending (unsynchronized) entries
   */
  getPendingEntries(): CacheEntry[] {
    return this.getCache().filter(entry => !entry.synchronized);
  }

  /**
   * Mark entries as synchronized
   */
  markSynchronized(ids: string[]): void {
    const cache = this.getCache();
    const updated = cache.map(entry => 
      ids.includes(entry.id) ? { ...entry, synchronized: true } : entry
    );
    this.setCache(updated);
  }

  /**
   * Get cache size in bytes
   */
  getCacheSize(): number {
    const cache = this.getCache();
    return new Blob([JSON.stringify(cache)]).size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cache = this.getCache();
    const size = this.getCacheSize();
    const pending = cache.filter(entry => !entry.synchronized).length;
    
    return {
      total: cache.length,
      pending,
      synchronized: cache.length - pending,
      size,
      capacity: this.maxSize,
      usagePercent: (size / this.maxSize) * 100,
    };
  }

  /**
   * Clear synchronized entries
   */
  clearSynchronized(): void {
    const cache = this.getCache();
    const filtered = cache.filter(entry => !entry.synchronized);
    this.setCache(filtered);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Cleanup old entries if cache is near capacity
   */
  private async cleanup(): Promise<void> {
    const size = this.getCacheSize();
    if (size < this.maxSize * this.cleanupThreshold) {
      return;
    }

    // Remove oldest synchronized entries
    const cache = this.getCache();
    const synchronized = cache.filter(entry => entry.synchronized)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const toRemove = synchronized.slice(0, Math.ceil(synchronized.length * 0.3));
    const toRemoveIds = toRemove.map(entry => entry.id);
    
    const filtered = cache.filter(entry => !toRemoveIds.includes(entry.id));
    this.setCache(filtered);
  }

  /**
   * Get cache from localStorage
   */
  private getCache(): CacheEntry[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch (error) {
      console.error("Failed to parse cache:", error);
      return [];
    }
  }

  /**
   * Set cache to localStorage
   */
  private setCache(cache: CacheEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      console.error("Failed to set cache:", error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const hubCache = new HubCache();
