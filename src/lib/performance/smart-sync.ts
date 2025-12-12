/**
 * Smart Sync Manager - PATCH 970
 * Optimized sync for 2Mbps connections with chunking and priority
 */

export interface SyncItem {
  id: string;
  module: string;
  data: any;
  priority: "critical" | "high" | "normal" | "low";
  size: number;
  retries: number;
  createdAt: number;
  lastAttempt?: number;
}

export interface SyncStats {
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  avgTimeMs: number;
  lastSyncAt: number | null;
}

interface SyncConfig {
  maxConcurrent: number;
  chunkSizeKB: number;
  baseRetryDelayMs: number;
  maxRetries: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  maxConcurrent: 2,
  chunkSizeKB: 50, // 50KB chunks for 2Mbps
  baseRetryDelayMs: 1000,
  maxRetries: 5,
  timeoutMs: 30000
};

const SLOW_CONNECTION_CONFIG: SyncConfig = {
  maxConcurrent: 1,
  chunkSizeKB: 20,
  baseRetryDelayMs: 2000,
  maxRetries: 8,
  timeoutMs: 60000
};

class SmartSyncManager {
  private queue: SyncItem[] = [];
  private processing: Set<string> = new Set();
  private config: SyncConfig = DEFAULT_CONFIG;
  private stats: SyncStats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
    avgTimeMs: 0,
    lastSyncAt: null
  };
  private syncTimes: number[] = [];
  private isRunning: boolean = false;
  private listeners: Set<(stats: SyncStats) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.detectConnectionSpeed();
  }

  private detectConnectionSpeed(): void {
    if ("connection" in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType || "4g";
      
      if (effectiveType === "2g" || effectiveType === "slow-2g" || effectiveType === "3g") {
        this.config = SLOW_CONNECTION_CONFIG;
      }

      conn?.addEventListener("change", () => {
        const newType = conn.effectiveType;
        if (newType === "2g" || newType === "slow-2g" || newType === "3g") {
          this.config = SLOW_CONNECTION_CONFIG;
        } else {
          this.config = DEFAULT_CONFIG;
        }
      });
    }
  }

  add(item: Omit<SyncItem, "id" | "size" | "retries" | "createdAt">): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const size = new Blob([JSON.stringify(item.data)]).size;
    
    const syncItem: SyncItem = {
      ...item,
      id,
      size,
      retries: 0,
      createdAt: Date.now()
    };

    // Insert by priority
    const insertIndex = this.queue.findIndex(q => 
      this.getPriorityValue(q.priority) < this.getPriorityValue(syncItem.priority)
    );
    
    if (insertIndex === -1) {
      this.queue.push(syncItem);
    } else {
      this.queue.splice(insertIndex, 0, syncItem);
    }

    this.saveQueue();
    this.updateStats();
    this.processQueue();
    
    return id;
  }

  private getPriorityValue(priority: SyncItem["priority"]): number {
    const values = { critical: 4, high: 3, normal: 2, low: 1 };
    return values[priority];
  }

  async processQueue(): Promise<void> {
    if (this.isRunning || !navigator.onLine) return;
    
    this.isRunning = true;
    
    while (this.queue.length > 0 && this.processing.size < this.config.maxConcurrent) {
      const item = this.queue.find(q => !this.processing.has(q.id));
      if (!item) break;
      
      this.processing.add(item.id);
      this.processItem(item); // Don't await - process concurrently
    }
    
    this.isRunning = false;
  }

  private async processItem(item: SyncItem): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Split into chunks if large
      if (item.size > this.config.chunkSizeKB * 1024) {
        await this.processLargeItem(item);
      } else {
        await this.syncItem(item);
      }
      
      // Success
      const duration = performance.now() - startTime;
      this.syncTimes.push(duration);
      if (this.syncTimes.length > 100) this.syncTimes.shift();
      
      this.removeFromQueue(item.id);
      this.stats.completed++;
      this.stats.lastSyncAt = Date.now();
      
    } catch (error) {
      console.warn(`[SmartSync] Failed to sync ${item.id}:`, error);
      console.warn(`[SmartSync] Failed to sync ${item.id}:`, error);
      
      item.retries++;
      item.lastAttempt = Date.now();
      
      if (item.retries >= this.config.maxRetries) {
        this.stats.failed++;
        this.removeFromQueue(item.id);
        this.saveFailedItem(item);
      } else {
        // Exponential backoff
        const delay = this.config.baseRetryDelayMs * Math.pow(2, item.retries);
        setTimeout(() => {
          this.processing.delete(item.id);
          this.processQueue();
        }, delay);
        return;
      }
    }
    
    this.processing.delete(item.id);
    this.saveQueue();
    this.updateStats();
    this.processQueue();
  }

  private async processLargeItem(item: SyncItem): Promise<void> {
    const dataStr = JSON.stringify(item.data);
    const chunkSize = this.config.chunkSizeKB * 1024;
    const chunks = Math.ceil(dataStr.length / chunkSize);
    
    
    for (let i = 0; i < chunks; i++) {
      const chunk = dataStr.slice(i * chunkSize, (i + 1) * chunkSize);
      await this.syncChunk(item.id, i, chunks, chunk, item.module);
      
      // Small delay between chunks to not overwhelm slow connections
      if (i < chunks - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  private async syncItem(item: SyncItem): Promise<void> {
    // Simulate sync - in real app, this would call the actual sync endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
    
    try {
      // This is a placeholder - replace with actual sync logic
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.05) { // 95% success rate simulation
            resolve(true);
          } else {
            reject(new Error("Simulated sync failure"));
          }
        }, 100 + Math.random() * 200);
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async syncChunk(
    itemId: string, 
    chunkIndex: number, 
    totalChunks: number, 
    chunk: string,
    module: string
  ): Promise<void> {
    // Placeholder for chunk sync logic
    await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
  }

  private removeFromQueue(id: string): void {
    const index = this.queue.findIndex(q => q.id === id);
    if (index >= 0) {
      this.queue.splice(index, 1);
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem("smart_sync_queue", JSON.stringify(this.queue));
    } catch (e) {
      console.warn("[SmartSync] Failed to save queue:", e);
      console.warn("[SmartSync] Failed to save queue:", e);
    }
  }

  private loadQueue(): void {
    try {
      const saved = localStorage.getItem("smart_sync_queue");
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveFailedItem(item: SyncItem): void {
    try {
      const failed = JSON.parse(localStorage.getItem("smart_sync_failed") || "[]");
      failed.push({ ...item, failedAt: Date.now() });
      if (failed.length > 100) failed.shift();
      localStorage.setItem("smart_sync_failed", JSON.stringify(failed));
    } catch (e) {
      console.warn("[SmartSync] Failed to save failed item:", e);
      console.warn("[SmartSync] Failed to save failed item:", e);
    }
  }

  private updateStats(): void {
    this.stats.pending = this.queue.length;
    this.stats.inProgress = this.processing.size;
    this.stats.avgTimeMs = this.syncTimes.length > 0
      ? Math.round(this.syncTimes.reduce((a, b) => a + b, 0) / this.syncTimes.length)
      : 0;
    
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn(this.getStats()));
  }

  getStats(): SyncStats {
    return { ...this.stats };
  }

  subscribe(callback: (stats: SyncStats) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getQueueByModule(): Record<string, number> {
    const byModule: Record<string, number> = {};
    for (const item of this.queue) {
      byModule[item.module] = (byModule[item.module] || 0) + 1;
    }
    return byModule;
  }

  clearFailed(): void {
    localStorage.removeItem("smart_sync_failed");
  }

  retryFailed(): void {
    try {
      const failed = JSON.parse(localStorage.getItem("smart_sync_failed") || "[]");
      for (const item of failed) {
        item.retries = 0;
        this.queue.push(item);
      }
      this.clearFailed();
      this.saveQueue();
      this.processQueue();
    } catch {
      // Ignore errors
    }
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    this.processQueue();
  }
}

export const smartSyncManager = new SmartSyncManager();
