/**
 * Data Retention Manager - PATCH 970
 * Automated cleanup and archiving of old data
 */

export interface RetentionPolicy {
  module: string;
  maxAgeDays: number;
  priority: 'low' | 'medium' | 'high';
  storageKey: string;
}

export interface CleanupResult {
  module: string;
  itemsRemoved: number;
  bytesFreed: number;
  timestamp: number;
}

const DEFAULT_POLICIES: RetentionPolicy[] = [
  { module: 'cache', maxAgeDays: 3, priority: 'low', storageKey: 'cache_' },
  { module: 'sync_queue', maxAgeDays: 7, priority: 'high', storageKey: 'sync_' },
  { module: 'ai_cache', maxAgeDays: 14, priority: 'medium', storageKey: 'ai_' },
  { module: 'audit_logs', maxAgeDays: 90, priority: 'high', storageKey: 'audit_' },
  { module: 'temp_data', maxAgeDays: 1, priority: 'low', storageKey: 'temp_' },
  { module: 'form_drafts', maxAgeDays: 30, priority: 'medium', storageKey: 'draft_' },
  { module: 'analytics', maxAgeDays: 60, priority: 'medium', storageKey: 'analytics_' },
];

class DataRetentionManager {
  private policies: RetentionPolicy[] = DEFAULT_POLICIES;
  private cleanupHistory: CleanupResult[] = [];

  setPolicies(policies: RetentionPolicy[]): void {
    this.policies = policies;
  }

  addPolicy(policy: RetentionPolicy): void {
    const existing = this.policies.findIndex(p => p.module === policy.module);
    if (existing >= 0) {
      this.policies[existing] = policy;
    } else {
      this.policies.push(policy);
    }
  }

  async runCleanup(force: boolean = false): Promise<CleanupResult[]> {
    const results: CleanupResult[] = [];
    const now = Date.now();

    for (const policy of this.policies) {
      const result = await this.cleanupModule(policy, now, force);
      if (result.itemsRemoved > 0) {
        results.push(result);
        this.cleanupHistory.unshift(result);
      }
    }

    // Also clean IndexedDB if available
    await this.cleanupIndexedDB();

    // Trim history
    if (this.cleanupHistory.length > 50) {
      this.cleanupHistory = this.cleanupHistory.slice(0, 50);
    }

    return results;
  }

  private async cleanupModule(
    policy: RetentionPolicy,
    now: number,
    force: boolean
  ): Promise<CleanupResult> {
    const maxAge = policy.maxAgeDays * 24 * 60 * 60 * 1000;
    let itemsRemoved = 0;
    let bytesFreed = 0;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(policy.storageKey)) {
          try {
            const item = localStorage.getItem(key);
            if (!item) continue;

            const parsed = JSON.parse(item);
            const timestamp = parsed.timestamp || parsed.created_at || parsed.date;
            
            if (timestamp && (now - new Date(timestamp).getTime() > maxAge)) {
              keysToRemove.push(key);
              bytesFreed += item.length * 2; // UTF-16
            } else if (force && policy.priority === 'low') {
              keysToRemove.push(key);
              bytesFreed += item.length * 2;
            }
          } catch {
            // Invalid JSON, mark for removal
            if (force || policy.priority === 'low') {
              keysToRemove.push(key);
            }
          }
        }
      }

      // Remove items
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
        itemsRemoved++;
      }
    } catch (e) {
      console.warn(`[DataRetention] Error cleaning ${policy.module}:`, e);
      console.warn(`[DataRetention] Error cleaning ${policy.module}:`, e);
    }

    return {
      module: policy.module,
      itemsRemoved,
      bytesFreed,
      timestamp: now
    };
  }

  private async cleanupIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) return;

    try {
      const databases = await indexedDB.databases?.() || [];
      for (const db of databases) {
        if (db.name?.includes('temp') || db.name?.includes('cache')) {
          // Could delete old temp databases
        }
      }
    } catch (e) {
      // indexedDB.databases() not supported in all browsers
    }
  }

  getStorageStats(): {
    total: number;
    used: number;
    available: number;
    byModule: Record<string, number>;
  } {
    let total = 5 * 1024 * 1024; // 5MB default localStorage limit
    let used = 0;
    const byModule: Record<string, number> = {};

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const item = localStorage.getItem(key) || '';
          const size = item.length * 2;
          used += size;

          // Categorize by module
          const module = this.getModuleFromKey(key);
          byModule[module] = (byModule[module] || 0) + size;
        }
      }

      // Try to get actual quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          if (estimate.quota) {
            total = estimate.quota;
          }
        });
      }
    } catch (e) {
      console.warn('[DataRetention] Error getting storage stats:', e);
      console.warn('[DataRetention] Error getting storage stats:', e);
    }

    return {
      total,
      used,
      available: total - used,
      byModule
    };
  }

  private getModuleFromKey(key: string): string {
    for (const policy of this.policies) {
      if (key.startsWith(policy.storageKey)) {
        return policy.module;
      }
    }
    return 'other';
  }

  getCleanupHistory(): CleanupResult[] {
    return [...this.cleanupHistory];
  }

  suggestCleanup(): { shouldClean: boolean; reason: string; urgency: 'low' | 'medium' | 'high' } {
    const stats = this.getStorageStats();
    const usagePercent = stats.used / stats.total;

    if (usagePercent > 0.9) {
      return { 
        shouldClean: true, 
        reason: 'Armazenamento crítico: mais de 90% utilizado', 
        urgency: 'high' 
      };
    }
    if (usagePercent > 0.7) {
      return { 
        shouldClean: true, 
        reason: 'Armazenamento alto: mais de 70% utilizado', 
        urgency: 'medium' 
      };
    }
    
    return { 
      shouldClean: false, 
      reason: 'Armazenamento em níveis adequados', 
      urgency: 'low' 
    };
  }

  async exportBeforeCleanup(modules: string[]): Promise<Blob> {
    const exportData: Record<string, any[]> = {};

    for (const module of modules) {
      const policy = this.policies.find(p => p.module === module);
      if (!policy) continue;

      exportData[module] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(policy.storageKey)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              exportData[module].push({
                key,
                data: JSON.parse(item)
              });
            }
          } catch {
            // Skip invalid items
          }
        }
      }
    }

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }
}

export const dataRetentionManager = new DataRetentionManager();
