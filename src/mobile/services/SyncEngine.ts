/**
 * Mobile Sync Engine - Offline-First with Exponential Backoff
 * Manages IndexedDB ↔ Supabase synchronization for maritime operations
 */

import { operationalDb } from "@/lib/storage/operational-db";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface SyncItem {
  id: string;
  table: string;
  action: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  failedCount: number;
}

const SYNC_QUEUE_KEY = "nauti_sync_queue";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

class SyncEngine {
  private queue: SyncItem[] = [];
  private isSyncing = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupNetworkListeners();
  }

  private loadQueue() {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      this.queue = raw ? JSON.parse(raw) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      logger.warn("Failed to persist sync queue", e);
    }
    this.notifyListeners();
  }

  private setupNetworkListeners() {
    if (typeof window === "undefined") return;
    
    window.addEventListener("online", () => {
      logger.info("Network restored - starting sync");
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      logger.info("Network lost - queuing operations");
      this.notifyListeners();
    });
  }

  /**
   * Add an operation to the sync queue
   */
  enqueue(table: string, action: SyncItem["action"], data: Record<string, unknown>) {
    const item: SyncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
    };

    this.queue.push(item);
    this.saveQueue();

    // Try to sync immediately if online
    if (navigator.onLine && !this.isSyncing) {
      this.processQueue();
    }
  }

  /**
   * Process the sync queue with exponential backoff
   */
  async processQueue() {
    if (this.isSyncing || !navigator.onLine || this.queue.length === 0) return;

    this.isSyncing = true;
    this.notifyListeners();

    const batch = [...this.queue];
    const failed: SyncItem[] = [];
    let successCount = 0;

    for (const item of batch) {
      try {
        await this.syncItem(item);
        successCount++;
      } catch (error) {
        item.retries++;
        if (item.retries < item.maxRetries) {
          failed.push(item);
          // Exponential backoff delay
          const delay = BASE_DELAY_MS * Math.pow(2, item.retries);
          await new Promise(r => setTimeout(r, Math.min(delay, 30000)));
        } else {
          logger.error(`Sync item ${item.id} exceeded max retries`, error);
        }
      }
    }

    this.queue = failed;
    this.saveQueue();
    this.isSyncing = false;

    if (successCount > 0) {
      logger.info(`Synced ${successCount} items, ${failed.length} pending`);
    }
  }

  private async syncItem(item: SyncItem) {
    const tableName = item.table as "maintenance_tasks";
    switch (item.action) {
      case "insert": {
        const { error } = await supabase.from(tableName).insert([item.data] as never);
        if (error) throw error;
        break;
      }
      case "update": {
        const { id, ...rest } = item.data;
        const { error } = await supabase.from(tableName).update(rest as never).eq("id", id as string);
        if (error) throw error;
        break;
      }
      case "delete": {
        const { error } = await supabase.from(tableName).delete().eq("id", item.data.id as string);
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Start periodic sync (every N minutes)
   */
  startAutoSync(intervalMinutes = 5) {
    this.stopAutoSync();
    this.intervalId = setInterval(() => {
      if (navigator.onLine) this.processQueue();
    }, intervalMinutes * 60 * 1000);

    // Initial sync
    if (navigator.onLine) this.processQueue();
  }

  stopAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Cache data for offline reading
   */
  async cacheForOffline(key: string, data: unknown, ttlMs = 24 * 60 * 60 * 1000) {
    await operationalDb.setCache(key, data, ttlMs);
  }

  /**
   * Get cached data
   */
  async getCached(key: string): Promise<unknown | null> {
    return operationalDb.getCache(key);
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(listener: (status: SyncStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(fn => fn(status));
  }

  getStatus(): SyncStatus {
    return {
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      isSyncing: this.isSyncing,
      pendingCount: this.queue.length,
      lastSyncAt: localStorage.getItem("nauti_last_sync"),
      failedCount: this.queue.filter(i => i.retries >= i.maxRetries).length,
    };
  }

  getPendingCount(): number {
    return this.queue.length;
  }
}

export const syncEngine = new SyncEngine();
