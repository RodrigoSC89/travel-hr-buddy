/**
 * Smart Sync - PATCH 901
 * Adaptive synchronization based on connection quality
 */

import { logger } from "@/lib/logger";
import { connectionResilience } from "./connection-resilience";
import { offlineSyncManager } from "./sync-manager";
import { getQueueStats } from "./sync-queue";

export interface SmartSyncConfig {
  // Minimum interval between syncs (ms)
  minInterval: number;
  // Maximum interval between syncs (ms)
  maxInterval: number;
  // Sync immediately when this many items are queued
  urgentThreshold: number;
  // Reduce frequency when on battery
  respectBattery: boolean;
  // Sync when connection improves
  syncOnConnectionImprove: boolean;
}

const DEFAULT_CONFIG: SmartSyncConfig = {
  minInterval: 10000,  // 10 seconds
  maxInterval: 300000, // 5 minutes
  urgentThreshold: 10,
  respectBattery: true,
  syncOnConnectionImprove: true,
};

class SmartSync {
  private config: SmartSyncConfig;
  private syncTimer: number | null = null;
  private lastSyncTime = 0;
  private lastConnectionType: string = "";
  private isActive = false;

  constructor(config: Partial<SmartSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start smart sync
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setupListeners();
    this.scheduleNextSync();
    
    logger.info("[SmartSync] Started adaptive synchronization");
  }

  /**
   * Stop smart sync
   */
  stop(): void {
    this.isActive = false;
    
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    
    logger.info("[SmartSync] Stopped");
  }

  private setupListeners(): void {
    // Listen for connection changes
    connectionResilience.subscribe((state) => {
      if (!this.isActive) return;
      
      const currentType = state.effectiveType;
      
      // Sync when connection improves
      if (
        this.config.syncOnConnectionImprove &&
        this.isConnectionImproved(this.lastConnectionType, currentType)
      ) {
        logger.info("[SmartSync] Connection improved, triggering sync");
        this.triggerSync();
      }
      
      this.lastConnectionType = currentType;
      
      // Reschedule based on new connection quality
      this.scheduleNextSync();
    });

    // Listen for visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.isActive) {
        this.scheduleNextSync();
      }
    });
  }

  private isConnectionImproved(oldType: string, newType: string): boolean {
    const quality: Record<string, number> = {
      "slow-2g": 1,
      "2g": 2,
      "3g": 3,
      "4g": 4,
      "unknown": 2.5,
    });
    
    return (quality[newType] || 2.5) > (quality[oldType] || 2.5);
  }

  /**
   * Calculate optimal sync interval (sync version using cached pending count)
   */
  private calculateInterval(pendingCount: number = 0): number {
    const state = connectionResilience.getState();
    
    // Base interval on connection quality
    let interval: number;
    
    if (!state.isOnline) {
      return this.config.maxInterval;
    }
    
    switch (state.effectiveType) {
    case "slow-2g":
      interval = this.config.maxInterval;
      break;
    case "2g":
      interval = this.config.maxInterval * 0.7;
      break;
    case "3g":
      interval = this.config.minInterval * 3;
      break;
    case "4g":
      interval = this.config.minInterval;
      break;
    default:
      interval = this.config.minInterval * 2;
    }
    
    // Reduce interval if many items pending
    if (pendingCount > this.config.urgentThreshold / 2) {
      interval *= 0.5;
    }
    
    // Increase interval if on battery saver
    if (this.config.respectBattery && this.isOnBatterySaver()) {
      interval *= 1.5;
    }
    
    // Increase interval if page is hidden
    if (document.visibilityState === "hidden") {
      interval *= 2;
    }
    
    return Math.min(
      Math.max(interval, this.config.minInterval),
      this.config.maxInterval
    );
  }

  private isOnBatterySaver(): boolean {
    const battery = (navigator as any).getBattery;
    if (!battery) return false;
    
    // This is async, so we cache the result
    return false; // Simplified for now
  }

  private async scheduleNextSync(): Promise<void> {
    if (!this.isActive) return;
    
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    
    const stats = await getQueueStats();
    
    // Immediate sync if urgent
    if (stats.pendingCount >= this.config.urgentThreshold) {
      this.triggerSync();
      return;
    }
    
    const interval = this.calculateInterval(stats.pendingCount);
    
    logger.debug(`[SmartSync] Next sync in ${interval}ms`);
    
    this.syncTimer = window.setTimeout(() => {
      this.triggerSync();
    }, interval);
  }

  private async triggerSync(): Promise<void> {
    const state = connectionResilience.getState();
    
    if (!state.isOnline) {
      logger.debug("[SmartSync] Skipping sync - offline");
      this.scheduleNextSync();
      return;
    }
    
    const now = Date.now();
    const timeSinceLastSync = now - this.lastSyncTime;
    
    // Prevent too frequent syncs
    if (timeSinceLastSync < this.config.minInterval) {
      this.scheduleNextSync();
      return;
    }
    
    this.lastSyncTime = now;
    
    try {
      logger.info("[SmartSync] Triggering sync");
      await offlineSyncManager.syncAll();
    } catch (error) {
      logger.error("[SmartSync] Sync failed", { error });
    } finally {
      this.scheduleNextSync();
    }
  }

  /**
   * Force immediate sync
   */
  async syncNow(): Promise<void> {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    
    await this.triggerSync();
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      lastSyncTime: this.lastSyncTime,
      nextSyncIn: this.syncTimer ? this.calculateInterval() : null,
      connectionQuality: connectionResilience.getState().effectiveType,
    });
  }
}

export const smartSync = new SmartSync();

/**
 * Initialize smart sync (call in main.tsx)
 */
export function initializeSmartSync(): () => void {
  smartSync.start();
  return () => smartSync.stop();
}
