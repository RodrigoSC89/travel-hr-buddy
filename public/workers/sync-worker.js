/**
 * Sync Worker
 * Web Worker for background data synchronization
 * PATCH: Phase 2 - Technical Resilience (Fixed: removed TS syntax for browser compat)
 */

const SYNC_INTERVAL = 30000; // 30 seconds
const BATCH_SIZE = 10;

// Priority weights for sorting
const PRIORITY_WEIGHTS = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

let config = null;
let syncIntervalId = null;
let pendingItems = [];
let isSyncing = false;

self.onmessage = async (event) => {
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
      if (payload && payload.items) {
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

function startSyncLoop() {
  if (syncIntervalId) return;

  syncIntervalId = self.setInterval(() => {
    processSync();
  }, (config && config.interval) || SYNC_INTERVAL);

  self.postMessage({ type: "SYNC_STARTED" });
}

function stopSyncLoop() {
  if (syncIntervalId) {
    self.clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  self.postMessage({ type: "SYNC_STOPPED" });
}

async function processSync() {
  if (isSyncing || pendingItems.length === 0 || !config) {
    return;
  }

  isSyncing = true;
  self.postMessage({ type: "SYNC_PROGRESS", payload: { status: "starting" } });

  try {
    // Sort by priority
    pendingItems.sort(
      (a, b) => (PRIORITY_WEIGHTS[a.priority] || 2) - (PRIORITY_WEIGHTS[b.priority] || 2)
    );

    // Process in batches
    const batchSize = (config && config.batchSize) || BATCH_SIZE;
    const batch = pendingItems.splice(0, batchSize);
    const results = [];

    for (const item of batch) {
      try {
        await syncItem(item);
        results.push({ success: true, item });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (item.retryCount < 3) {
          item.retryCount++;
          pendingItems.push(item);
          results.push({ success: false, item, error: "Retry " + item.retryCount + "/3" });
        } else {
          results.push({ success: false, item, error: errorMessage });
        }
      }
    }

    self.postMessage({
      type: "SYNC_COMPLETE",
      payload: {
        processed: batch.length,
        successful: results.filter(function(r) { return r.success; }).length,
        failed: results.filter(function(r) { return !r.success; }).length,
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

async function syncItem(item) {
  if (!config) throw new Error("Config not set");

  const headers = {
    "Content-Type": "application/json",
    apikey: config.supabaseKey,
    Authorization: "Bearer " + config.supabaseKey,
    Prefer: item.operation === "insert" ? "return=minimal" : "return=representation",
  };

  let url = config.supabaseUrl + "/rest/v1/" + item.table;
  let method;
  let body;

  switch (item.operation) {
    case "insert":
      method = "POST";
      body = JSON.stringify(item.data);
      break;
    case "update":
      method = "PATCH";
      url += "?id=eq." + item.data.id;
      body = JSON.stringify(item.data);
      break;
    case "delete":
      method = "DELETE";
      url += "?id=eq." + item.data.id;
      break;
    default:
      throw new Error("Unknown operation: " + item.operation);
  }

  const response = await fetch(url, { method, headers, body });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("HTTP " + response.status + ": " + errorText);
  }
}

// Notify that worker is ready
self.postMessage({ type: "WORKER_READY" });
