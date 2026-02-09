/**
 * Offline-First Sync Engine
 * PATCH: Robust offline data handling with conflict resolution
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { logger } from "@/lib/utils/production-logger";

// IndexedDB Schema
interface NautilusOfflineDB extends DBSchema {
  pendingOperations: {
    key: string;
    value: PendingOperation;
    indexes: {
      "by-timestamp": number;
      "by-type": string;
      "by-priority": number;
    };
  };
  cachedData: {
    key: string;
    value: CachedEntry;
    indexes: {
      "by-timestamp": number;
      "by-table": string;
    };
  };
  conflictLog: {
    key: string;
    value: ConflictEntry;
    indexes: {
      "by-resolved": number;
    };
  };
}

interface PendingOperation {
  id: string;
  type: "insert" | "update" | "delete";
  table: string;
  data: unknown;
  timestamp: number;
  priority: number;
  retries: number;
  lastError?: string;
}

interface CachedEntry {
  key: string;
  table: string;
  data: unknown;
  timestamp: number;
  version: number;
  checksum: string;
}

interface ConflictEntry {
  id: string;
  table: string;
  localData: unknown;
  serverData: unknown;
  timestamp: number;
  resolved: boolean;
  resolution?: "local" | "server" | "merge";
}

// Database instance
let db: IDBPDatabase<NautilusOfflineDB> | null = null;

/**
 * Initialize the offline database
 */
export async function initOfflineDB(): Promise<IDBPDatabase<NautilusOfflineDB>> {
  if (db) return db;

  db = await openDB<NautilusOfflineDB>("nautilus-offline", 1, {
    upgrade(database) {
      // Pending operations store
      const pendingStore = database.createObjectStore("pendingOperations", {
        keyPath: "id",
      });
      pendingStore.createIndex("by-timestamp", "timestamp");
      pendingStore.createIndex("by-type", "type");
      pendingStore.createIndex("by-priority", "priority");

      // Cached data store
      const cacheStore = database.createObjectStore("cachedData", {
        keyPath: "key",
      });
      cacheStore.createIndex("by-timestamp", "timestamp");
      cacheStore.createIndex("by-table", "table");

      // Conflict log store
      const conflictStore = database.createObjectStore("conflictLog", {
        keyPath: "id",
      });
      conflictStore.createIndex("by-resolved", "resolved");
    },
  });

  return db;
}

/**
 * Queue an operation for offline sync
 */
export async function queueOperation(
  type: PendingOperation["type"],
  table: string,
  data: unknown,
  priority: number = 5
): Promise<string> {
  const database = await initOfflineDB();
  
  const operation: PendingOperation = {
    id: `op_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`,
    type,
    table,
    data,
    timestamp: Date.now(),
    priority,
    retries: 0,
  };

  await database.add("pendingOperations", operation);
  
  // Try to sync if online
  if (navigator.onLine) {
    syncPendingOperations();
  }

  return operation.id;
}

/**
 * Get all pending operations
 */
export async function getPendingOperations(): Promise<PendingOperation[]> {
  const database = await initOfflineDB();
  const operations = await database.getAllFromIndex(
    "pendingOperations",
    "by-priority"
  );
  return operations.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
}

/**
 * Sync pending operations with server
 */
export async function syncPendingOperations(): Promise<{
  synced: number;
  failed: number;
  conflicts: number;
}> {
  const database = await initOfflineDB();
  const operations = await getPendingOperations();

  let synced = 0;
  let failed = 0;
  let conflicts = 0;

  for (const op of operations) {
    try {
      const result = await executeOperation(op);
      
      if (result.success) {
        await database.delete("pendingOperations", op.id);
        synced++;
        logger.debug("Sync operation completed", { operationId: op.id, table: op.table, type: op.type });
      } else if (result.conflict) {
        await handleConflict(op, result.serverData);
        conflicts++;
        logger.warn("Sync conflict detected", { operationId: op.id, table: op.table });
      } else {
        // Update retry count
        op.retries++;
        op.lastError = result.error;
        await database.put("pendingOperations", op);
        failed++;
        logger.warn("Sync operation failed", { operationId: op.id, table: op.table, retries: op.retries, error: result.error });
      }
    } catch (error) {
      op.retries++;
      op.lastError = String(error);
      await database.put("pendingOperations", op);
      failed++;
      logger.error("Sync operation exception", error, { operationId: op.id, table: op.table });
    }
  }

  logger.info("Sync batch completed", { synced, failed, conflicts });
  return { synced, failed, conflicts };
}

/**
 * Execute a single operation
 */
async function executeOperation(op: PendingOperation): Promise<{
  success: boolean;
  conflict?: boolean;
  serverData?: unknown;
  error?: string;
}> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    
    if (op.type === "insert") {
      const { error } = await supabase.from(op.table as any).insert(op.data as any);
      if (error) {
        if (error.code === "23505") return { success: false, conflict: true, serverData: null };
        return { success: false, error: error.message };
      }
      return { success: true };
    } else if (op.type === "update") {
      const data = op.data as any;
      const { error } = await supabase.from(op.table as any).update(data).eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else if (op.type === "delete") {
      const data = op.data as any;
      const { error } = await supabase.from(op.table as any).delete().eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    
    return { success: false, error: "Unknown operation type" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Handle data conflict
 */
async function handleConflict(
  op: PendingOperation,
  serverData: unknown
): Promise<void> {
  const database = await initOfflineDB();

  const conflict: ConflictEntry = {
    id: `conflict_${Date.now()}`,
    table: op.table,
    localData: op.data,
    serverData,
    timestamp: Date.now(),
    resolved: false,
  };

  await database.add("conflictLog", conflict);
}

/**
 * Get unresolved conflicts
 */
export async function getUnresolvedConflicts(): Promise<ConflictEntry[]> {
  const database = await initOfflineDB();
  return database.getAllFromIndex("conflictLog", "by-resolved", IDBKeyRange.only(0));
}

/**
 * Resolve a conflict
 */
export async function resolveConflict(
  conflictId: string,
  resolution: "local" | "server" | "merge",
  mergedData?: unknown
): Promise<void> {
  const database = await initOfflineDB();
  const conflict = await database.get("conflictLog", conflictId);

  if (!conflict) return;

  conflict.resolved = true;
  conflict.resolution = resolution;

  await database.put("conflictLog", conflict);

  // Apply the resolution
  if (resolution === "local") {
    await queueOperation("update", conflict.table, conflict.localData, 10);
  } else if (resolution === "merge" && mergedData) {
    await queueOperation("update", conflict.table, mergedData, 10);
  }
  // "server" means accept server data, no action needed
}

/**
 * Cache data for offline access
 */
export async function cacheData(
  table: string,
  key: string,
  data: unknown
): Promise<void> {
  const database = await initOfflineDB();

  const entry: CachedEntry = {
    key: `${table}_${key}`,
    table,
    data,
    timestamp: Date.now(),
    version: 1,
    checksum: await generateChecksum(data),
  };

  await database.put("cachedData", entry);
}

/**
 * Get cached data
 */
export async function getCachedData<T>(table: string, key: string): Promise<T | null> {
  const database = await initOfflineDB();
  const entry = await database.get("cachedData", `${table}_${key}`);
  return entry ? (entry.data as T) : null;
}

/**
 * Generate checksum for data integrity
 */
async function generateChecksum(data: unknown): Promise<string> {
  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  const buffer = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

/**
 * Hook for offline-aware data operations
 */
export function useOfflineSync() {
  const syncNow = async () => {
    if (navigator.onLine) {
      return syncPendingOperations();
    }
    return { synced: 0, failed: 0, conflicts: 0 };
  };

  const queueInsert = async (table: string, data: unknown) => {
    return queueOperation("insert", table, data, 5);
  };

  const queueUpdate = async (table: string, data: unknown) => {
    return queueOperation("update", table, data, 5);
  };

  const queueDelete = async (table: string, data: unknown) => {
    return queueOperation("delete", table, data, 5);
  };

  return {
    syncNow,
    queueInsert,
    queueUpdate,
    queueDelete,
    getPendingOperations,
    getUnresolvedConflicts,
    resolveConflict,
  };
}
