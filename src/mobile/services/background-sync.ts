/**
 * Background Sync Service
 * Handles data synchronization in background when app is not active
 */

import { sqliteStorage } from "./sqlite-storage";
import { syncQueue } from "./syncQueue";
import { networkDetector } from "./networkDetector";

// Capacitor Background Task plugin
const BackgroundTask = typeof window !== "undefined" && 
  (window as any).Capacitor?.Plugins?.BackgroundTask;

interface BackgroundSyncConfig {
  minInterval: number; // Minimum interval between syncs (ms)
  maxRetries: number;
  batchSize: number;
  networkRequired: "any" | "wifi" | "cellular";
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  duration: number;
}

class BackgroundSyncService {
  private config: BackgroundSyncConfig = {
    minInterval: 15 * 60 * 1000, // 15 minutes
    maxRetries: 3,
    batchSize: 20,
    networkRequired: "any",
  };
  
  private lastSyncTime: number = 0;
  private isSyncing: boolean = false;
  private syncListeners: Set<(result: SyncResult) => void> = new Set();

  /**
   * Initialize background sync service
   */
  async initialize(): Promise<void> {
    console.info("Initializing background sync service");
    
    // Register for background fetch (if supported)
    await this.registerBackgroundFetch();
    
    // Set up periodic sync check
    this.startPeriodicSync();
    
    // Sync when app comes to foreground
    this.setupVisibilityListener();
  }

  /**
   * Register for background fetch (native)
   */
  private async registerBackgroundFetch(): Promise<void> {
    if (!BackgroundTask) {
      console.debug("BackgroundTask not available, using fallback");
      return;
    }

    try {
      // Request background task permission
      const taskId = await BackgroundTask.beforeExit(async () => {
        await this.performSync();
        BackgroundTask.finish({ taskId });
      });
      
      console.info("Background fetch registered", { taskId });
    } catch (error) {
      console.error("Failed to register background fetch", error);
    }
  }

  /**
   * Start periodic sync check
   */
  private startPeriodicSync(): void {
    // Check every minute if sync is needed
    setInterval(async () => {
      const shouldSync = await this.shouldSync();
      if (shouldSync) {
        await this.performSync();
      }
    }, 60000);
  }

  /**
   * Setup visibility change listener
   */
  private setupVisibilityListener(): void {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible") {
        console.debug("App became visible, checking for sync");
        const shouldSync = await this.shouldSync();
        if (shouldSync) {
          await this.performSync();
        }
      }
    });
  }

  /**
   * Check if sync should be performed
   */
  private async shouldSync(): Promise<boolean> {
    // Check if already syncing
    if (this.isSyncing) {
      return false;
    }

    // Check minimum interval
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    if (timeSinceLastSync < this.config.minInterval) {
      return false;
    }

    // Check network status
    const networkStatus = networkDetector.getStatus();
    if (!networkStatus.isOnline) {
      return false;
    }

    // Check if there's pending data
    const pendingCount = await sqliteStorage.getQueueCount();
    if (pendingCount === 0) {
      return false;
    }

    // Check network type preference
    if (this.config.networkRequired === "wifi") {
      // Only sync on WiFi
      const effectiveType = networkStatus.effectiveType;
      if (effectiveType && !["4g"].includes(effectiveType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Perform background sync
   */
  async performSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0, duration: 0 };
    }

    this.isSyncing = true;
    const startTime = Date.now();
    
    console.info("Starting background sync");

    try {
      const result = await syncQueue.processQueue({
        maxRetries: this.config.maxRetries,
        batchSize: this.config.batchSize,
      });

      this.lastSyncTime = Date.now();
      
      const syncResult: SyncResult = {
        success: result.failed === 0,
        synced: result.success,
        failed: result.failed,
        duration: Date.now() - startTime,
      };

      console.info("Background sync completed", syncResult);
      
      // Notify listeners
      this.notifyListeners(syncResult);
      
      return syncResult;
    } catch (error) {
      console.error("Background sync failed", error);
      
      const syncResult: SyncResult = {
        success: false,
        synced: 0,
        failed: 0,
        duration: Date.now() - startTime,
      };
      
      this.notifyListeners(syncResult);
      return syncResult;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<SyncResult> {
    // Reset last sync time to bypass interval check
    this.lastSyncTime = 0;
    return this.performSync();
  }

  /**
   * Add sync completion listener
   */
  addListener(callback: (result: SyncResult) => void): () => void {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(result: SyncResult): void {
    for (const listener of this.syncListeners) {
      try {
        listener(result);
      } catch (error) {
        console.error("Error in sync listener", error);
      }
    }
  }

  /**
   * Get sync status
   */
  getStatus(): {
    isSyncing: boolean;
    lastSyncTime: number;
    timeSinceLastSync: number;
  } {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      timeSinceLastSync: Date.now() - this.lastSyncTime,
    };
  }

  /**
   * Update configuration
   */
  configure(config: Partial<BackgroundSyncConfig>): void {
    this.config = { ...this.config, ...config };
    console.info("Background sync config updated", this.config);
  }

  /**
   * Schedule sync for specific time
   */
  async scheduleSync(delayMs: number): Promise<void> {
    setTimeout(() => {
      this.performSync();
    }, delayMs);
    
    console.info("Sync scheduled", { delayMs });
  }
}

export const backgroundSyncService = new BackgroundSyncService();
