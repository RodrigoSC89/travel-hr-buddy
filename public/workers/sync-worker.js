/**
 * Sync Worker
 * Web Worker for background data synchronization
 * PATCH: Phase 2 - Technical Resilience
 */

/// <reference lib="webworker" />

const SYNC_INTERVAL = 30000; // 30 seconds
const BATCH_SIZE = 10;

interface SyncMessage {
  type: "START" | "STOP" | "SYNC_NOW" | "SET_CONFIG" | "GET_STATUS";
  payload?: any;
}

interface SyncItem {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  data: any;
  timestamp: number;
  retryCount: number;
  priority: "critical" | "high" | "normal" | "low";
}

interface SyncConfig {
  supabaseUrl: string;
  supabaseKey: string;
  batchSize: number;
  interval: number;
}

let config: SyncConfig | null = null;
let syncIntervalId: number | null = null;
let pendingItems: SyncItem[] = [];
let isSyncing = false;

// Priority weights for sorting
const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

self.onmessage = async (event: MessageEvent<SyncMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SET_CONFIG":
      config = payload;
      self.postMessage({ type: "CONFIG_SET", success: true });
      break;

    case "START":
      startSyncLoop();
      break;

    case "STOP":
      stopSyncLoop();
      break;

    case "SYNC_NOW":
      if (payload?.items) {
        pendingItems.push(...payload.items);
      }
      await processSync();
      break;

    case "GET_STATUS":
      self.postMessage({
        type: "STATUS",
        payload: {
          isSyncing,
          pendingCount: pendingItems.length,
          isRunning: syncIntervalId !== null,
        },
      });
      break;
  }
};

function startSyncLoop(): void {
  if (syncIntervalId) return;

  syncIntervalId = self.setInterval(() => {
    processSync();
  }, config?.interval || SYNC_INTERVAL);

  self.postMessage({ type: "SYNC_STARTED" });
  console.log("[SyncWorker] Sync loop started");
}

function stopSyncLoop(): void {
  if (syncIntervalId) {
    self.clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  self.postMessage({ type: "SYNC_STOPPED" });
  console.log("[SyncWorker] Sync loop stopped");
}

async function processSync(): Promise<void> {
  if (isSyncing || pendingItems.length === 0 || !config) {
    return;
  }

  isSyncing = true;
  self.postMessage({ type: "SYNC_PROGRESS", payload: { status: "starting" } });

  try {
    // Sort by priority
    pendingItems.sort(
      (a, b) => PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]
    );

    // Process in batches
    const batch = pendingItems.splice(0, config.batchSize || BATCH_SIZE);
    const results: { success: boolean; item: SyncItem; error?: string }[] = [];

    for (const item of batch) {
      try {
        await syncItem(item);
        results.push({ success: true, item });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Retry logic
        if (item.retryCount < 3) {
          item.retryCount++;
          pendingItems.push(item); // Re-add to queue
          results.push({ success: false, item, error: `Retry ${item.retryCount}/3` });
        } else {
          results.push({ success: false, item, error: errorMessage });
        }
      }
    }

    self.postMessage({
      type: "SYNC_COMPLETE",
      payload: {
        processed: batch.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        remaining: pendingItems.length,
        results,
      },
    });
  } catch (error) {
    self.postMessage({
      type: "SYNC_ERROR",
      payload: { error: error instanceof Error ? error.message : "Sync failed" },
    });
  } finally {
    isSyncing = false;
  }
}

async function syncItem(item: SyncItem): Promise<void> {
  if (!config) throw new Error("Config not set");

  const { supabaseUrl, supabaseKey } = config;
  const headers = {
    "Content-Type": "application/json",
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: item.operation === "insert" ? "return=minimal" : "return=representation",
  };

  let url = `${supabaseUrl}/rest/v1/${item.table}`;
  let method: string;
  let body: string | undefined;

  switch (item.operation) {
    case "insert":
      method = "POST";
      body = JSON.stringify(item.data);
      break;
    case "update":
      method = "PATCH";
      url += `?id=eq.${item.data.id}`;
      body = JSON.stringify(item.data);
      break;
    case "delete":
      method = "DELETE";
      url += `?id=eq.${item.data.id}`;
      break;
    default:
      throw new Error(`Unknown operation: ${item.operation}`);
  }

  const response = await fetch(url, { method, headers, body });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  console.log(`[SyncWorker] Synced ${item.operation} on ${item.table}`);
}

// Notify that worker is ready
self.postMessage({ type: "WORKER_READY" });
