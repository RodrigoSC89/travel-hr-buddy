/**
 * Hub Cache - Offline Storage Management
 * 
 * Manages local storage for offline operations.
 * Stores data when connection is unavailable and syncs when restored.
 */

import { logger } from "@/lib/logger";

export interface CacheEntry {
  id: string;
  timestamp: Date;
  module: string;
  data: unknown;
  synced: boolean;
}

export class HubCache {
  private cacheKey = "nautilus_control_hub_cache";
  private maxSizeMB = 100;

  /**
   * Save data to offline cache
   */
  async salvar(dados: unknown, module: string): Promise<void> {
    try {
      const cache = this.getCache();
      const entry: CacheEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        module,
        data: dados,
        synced: false,
      };

      cache.push(entry);
      this.saveCache(cache);

      logger.info("💾 Dados armazenados localmente (modo offline).", {
        module,
        cacheSize: cache.length,
      });
    } catch (error) {
      logger.error("Erro ao salvar no cache", error);
      throw error;
    }
  }

  /**
   * Get all pending (unsynced) cache entries
   */
  getPending(): CacheEntry[] {
    const cache = this.getCache();
    return cache.filter((entry) => !entry.synced);
  }

  /**
   * Mark entries as synced
   */
  markAsSynced(ids: string[]): void {
    const cache = this.getCache();
    cache.forEach((entry) => {
      if (ids.includes(entry.id)) {
        entry.synced = true;
      }
    });
    this.saveCache(cache);
  }

  /**
   * Clear all synced entries
   */
  clearSynced(): void {
    const cache = this.getCache();
    const unsynced = cache.filter((entry) => !entry.synced);
    this.saveCache(unsynced);
    logger.info("Cache limpo", { removed: cache.length - unsynced.length });
  }

  /**
   * Get cache size in MB
   */
  getCacheSizeMB(): number {
    try {
      const cache = this.getCache();
      const sizeBytes = new Blob([JSON.stringify(cache)]).size;
      return sizeBytes / (1024 * 1024);
    } catch {
      return 0;
    }
  }

  /**
   * Check if cache is full
   */
  isCacheFull(): boolean {
    return this.getCacheSizeMB() >= this.maxSizeMB;
  }

  /**
   * Get all cache entries
   */
  private getCache(): CacheEntry[] {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((entry: CacheEntry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch (error) {
      logger.error("Erro ao ler cache", error);
      return [];
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(cache: CacheEntry[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      logger.error("Erro ao salvar cache", error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all cache (including unsynced)
   */
  clearAll(): void {
    localStorage.removeItem(this.cacheKey);
    logger.info("Cache completamente limpo");
  }
}

export default new HubCache();
