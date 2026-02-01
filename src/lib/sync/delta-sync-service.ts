/**
 * Delta Sync Service
 * PATCH 868: Migrated to edge-function-helper
 */

import { openDB, IDBPDatabase } from "idb";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/lib/supabase/edge-function-helper";

interface DeltaRecord {
  id: string;
  table: string;
  originalData: Record<string, unknown>;
  modifiedFields: string[];
  deltaData: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

interface DeltaSyncDB {
  snapshots: {
    key: string;
    value: {
      id: string;
      table: string;
      data: Record<string, unknown>;
      timestamp: number;
    };
    indexes: { "by-table": string };
  };
  deltas: {
    key: string;
    value: DeltaRecord;
    indexes: { "by-synced": string; "by-table": string };
  };
}

class DeltaSyncService {
  private db: IDBPDatabase<DeltaSyncDB> | null = null;
  private worker: Worker | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<DeltaSyncDB>("nautilus-delta-sync", 1, {
      upgrade(db) {
        const snapshotsStore = db.createObjectStore("snapshots", { keyPath: "id" });
        snapshotsStore.createIndex("by-table", "table");

        const deltasStore = db.createObjectStore("deltas", { keyPath: "id" });
        deltasStore.createIndex("by-synced", "synced");
        deltasStore.createIndex("by-table", "table");
      },
    });

    // Initialize web worker
    if (typeof Worker !== "undefined") {
      try {
        this.worker = new Worker("/workers/sync-worker.js");
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        
        // Configure worker
        const { data: { session } } = await supabase.auth.getSession();
        
        this.worker.postMessage({
          type: "SET_CONFIG",
          payload: {
            supabaseUrl: SUPABASE_URL,
            supabaseKey: session?.access_token || "",
            batchSize: 10,
            interval: 30000,
          },
        });
      } catch (e) {
        logger.warn("[DeltaSync] Web Worker not available, falling back to main thread");
      }
    }

    logger.info("[DeltaSync] Service initialized");
  }

  /**
   * Take a snapshot of the current data state
   */
  async snapshot(
    table: string, 
    id: string, 
    data: Record<string, unknown>
  ): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    await this.db.put("snapshots", {
      id: `${table}:${id}`,
      table,
      data: { ...data },
      timestamp: Date.now(),
    });
  }

  /**
   * Calculate delta between original and modified data
   */
  calculateDelta(
    original: Record<string, unknown>,
    modified: Record<string, unknown>
  ): { fields: string[]; delta: Record<string, unknown> } {
    const fields: string[] = [];
    const delta: Record<string, unknown> = {};

    for (const key of Object.keys(modified)) {
      const originalValue = original[key];
      const modifiedValue = modified[key];

      // Deep comparison for objects
      if (JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)) {
        fields.push(key);
        delta[key] = modifiedValue;
      }
    }

    // Check for removed fields
    for (const key of Object.keys(original)) {
      if (!(key in modified)) {
        fields.push(key);
        delta[key] = null;
      }
    }

    return { fields, delta };
  }

  /**
   * Save a delta change for later sync
   */
  async saveDelta(
    table: string,
    id: string,
    modifiedData: Record<string, unknown>
  ): Promise<{ deltaSize: number; originalSize: number; savings: number }> {
    await this.initialize();
    if (!this.db) {
      return { deltaSize: 0, originalSize: 0, savings: 0 };
    }

    const snapshotKey = `${table}:${id}`;
    const snapshot = await this.db.get("snapshots", snapshotKey);

    if (!snapshot) {
      // No snapshot, save full data
      await this.snapshot(table, id, modifiedData);
      return { 
        deltaSize: JSON.stringify(modifiedData).length, 
        originalSize: JSON.stringify(modifiedData).length, 
        savings: 0 
      };
    }

    const { fields, delta } = this.calculateDelta(snapshot.data, modifiedData);

    if (fields.length === 0) {
      // No changes
      return { deltaSize: 0, originalSize: 0, savings: 100 };
    }

    const deltaRecord: DeltaRecord = {
      id: `${table}:${id}:${Date.now()}`,
      table,
      originalData: snapshot.data,
      modifiedFields: fields,
      deltaData: { id, ...delta },
      timestamp: Date.now(),
      synced: false,
    };

    await this.db.put("deltas", deltaRecord);

    // Update snapshot
    await this.snapshot(table, id, modifiedData);

    const originalSize = JSON.stringify(modifiedData).length;
    const deltaSize = JSON.stringify(delta).length;
    const savings = Math.round((1 - deltaSize / originalSize) * 100);

    logger.info(`[DeltaSync] Delta saved: ${fields.length} fields changed, ${savings}% bandwidth saved`);

    return { deltaSize, originalSize, savings };
  }

  /**
   * Sync all pending deltas
   */
  async syncPendingDeltas(): Promise<{
    synced: number;
    failed: number;
    totalSavings: number;
  }> {
    await this.initialize();
    if (!this.db) return { synced: 0, failed: 0, totalSavings: 0 };

    const tx = this.db.transaction("deltas", "readonly");
    const index = tx.store.index("by-synced");
    const pendingDeltas = await index.getAll("false");

    if (pendingDeltas.length === 0) {
      return { synced: 0, failed: 0, totalSavings: 0 };
    }

    // Use worker if available
    if (this.worker) {
      const syncItems = pendingDeltas.map((delta) => ({
        id: delta.id,
        table: delta.table,
        operation: "update" as const,
        data: delta.deltaData,
        timestamp: delta.timestamp,
        retryCount: 0,
        priority: "normal" as const,
      }));

      this.worker.postMessage({
        type: "SYNC_NOW",
        payload: { items: syncItems },
      });

      // Return optimistic result, actual results come via worker message
      return { 
        synced: pendingDeltas.length, 
        failed: 0, 
        totalSavings: this.calculateAverageSavings(pendingDeltas) 
      };
    }

    // Fallback: sync on main thread
    let synced = 0;
    let failed = 0;
    let totalOriginalSize = 0;
    let totalDeltaSize = 0;

    for (const delta of pendingDeltas) {
      try {
        const { error } = await supabase
          .from(delta.table)
          .update(delta.deltaData)
          .eq("id", delta.deltaData.id);

        if (error) throw error;

        // Mark as synced
        delta.synced = true;
        await this.db!.put("deltas", delta);
        synced++;

        totalOriginalSize += JSON.stringify(delta.originalData).length;
        totalDeltaSize += JSON.stringify(delta.deltaData).length;
      } catch (e) {
        logger.error("[DeltaSync] Failed to sync delta:", e);
        failed++;
      }
    }

    const totalSavings = totalOriginalSize > 0
      ? Math.round((1 - totalDeltaSize / totalOriginalSize) * 100)
      : 0;

    return { synced, failed, totalSavings };
  }

  /**
   * Start background sync with Web Worker
   */
  startBackgroundSync(): void {
    if (this.worker) {
      this.worker.postMessage({ type: "START" });
      logger.info("[DeltaSync] Background sync started");
    }
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync(): void {
    if (this.worker) {
      this.worker.postMessage({ type: "STOP" });
      logger.info("[DeltaSync] Background sync stopped");
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case "WORKER_READY":
        logger.info("[DeltaSync] Worker ready");
        break;
      case "SYNC_COMPLETE":
        logger.info("[DeltaSync] Sync complete:", payload);
        break;
      case "SYNC_ERROR":
        logger.error("[DeltaSync] Sync error:", payload.error);
        break;
    }
  }

  private calculateAverageSavings(deltas: DeltaRecord[]): number {
    if (deltas.length === 0) return 0;

    let totalOriginal = 0;
    let totalDelta = 0;

    for (const delta of deltas) {
      totalOriginal += JSON.stringify(delta.originalData).length;
      totalDelta += JSON.stringify(delta.deltaData).length;
    }

    return totalOriginal > 0
      ? Math.round((1 - totalDelta / totalOriginal) * 100)
      : 0;
  }

  /**
   * Clean up old synced deltas
   */
  async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    await this.initialize();
    if (!this.db) return 0;

    const cutoff = Date.now() - maxAge;
    const tx = this.db.transaction("deltas", "readwrite");
    let deleted = 0;

    let cursor = await tx.store.openCursor();
    while (cursor) {
      if (cursor.value.synced && cursor.value.timestamp < cutoff) {
        await cursor.delete();
        deleted++;
      }
      cursor = await cursor.continue();
    }

    logger.info(`[DeltaSync] Cleaned up ${deleted} old deltas`);
    return deleted;
  }
}

export const deltaSyncService = new DeltaSyncService();
