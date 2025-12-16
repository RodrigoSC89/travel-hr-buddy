/**
 * Delta Sync Manager
 * Syncs only changes instead of full data for bandwidth efficiency
 */

import { openDB, IDBPDatabase } from 'idb';

interface SyncState {
  table: string;
  lastSyncAt: string;
  lastVersion: number;
  checksum: string;
}

interface DeltaChange<T = any> {
  id: string;
  operation: 'insert' | 'update' | 'delete';
  data: T;
  timestamp: string;
  version: number;
}

class DeltaSyncManager {
  private db: IDBPDatabase | null = null;
  private dbName = 'delta-sync-db';
  private syncStates: Map<string, SyncState> = new Map();

  async init() {
    if (this.db) return;

    this.db = await openDB(this.dbName, 1, {
      upgrade(db) {
        // Store sync states
        if (!db.objectStoreNames.contains('sync_states')) {
          db.createObjectStore('sync_states', { keyPath: 'table' });
        }
        // Store pending changes
        if (!db.objectStoreNames.contains('pending_changes')) {
          const store = db.createObjectStore('pending_changes', { keyPath: 'id' });
          store.createIndex('by_table', 'table');
          store.createIndex('by_timestamp', 'timestamp');
        }
      },
    });

    await this.loadSyncStates();
  }

  private async loadSyncStates() {
    if (!this.db) return;
    const states = await this.db.getAll('sync_states');
    states.forEach(state => {
      this.syncStates.set(state.table, state);
    });
  }

  /**
   * Get last sync timestamp for a table
   */
  getLastSyncAt(table: string): string | null {
    return this.syncStates.get(table)?.lastSyncAt || null;
  }

  /**
   * Update sync state after successful sync
   */
  async updateSyncState(table: string, timestamp: string, version: number, checksum: string) {
    if (!this.db) await this.init();

    const state: SyncState = {
      table,
      lastSyncAt: timestamp,
      lastVersion: version,
      checksum,
    };

    await this.db!.put('sync_states', state);
    this.syncStates.set(table, state);
  }

  /**
   * Queue a local change for sync
   */
  async queueChange<T>(table: string, operation: DeltaChange['operation'], data: T, id: string) {
    if (!this.db) await this.init();

    const change: DeltaChange<T> & { table: string } = {
      id: `${table}_${id}_${Date.now()}`,
      table,
      operation,
      data,
      timestamp: new Date().toISOString(),
      version: Date.now(),
    };

    await this.db!.put('pending_changes', change);
    return change;
  }

  /**
   * Get pending changes for a table
   */
  async getPendingChanges(table: string): Promise<DeltaChange[]> {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex('pending_changes', 'by_table', table);
  }

  /**
   * Clear pending changes after successful sync
   */
  async clearPendingChanges(changeIds: string[]) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('pending_changes', 'readwrite');
    await Promise.all(changeIds.map(id => tx.store.delete(id)));
    await tx.done;
  }

  /**
   * Generate checksum for data integrity verification
   */
  generateChecksum(data: any[]): string {
    const str = JSON.stringify(data.map(d => d.id).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Build delta query params for API request
   */
  buildDeltaQueryParams(table: string): Record<string, string> {
    const state = this.syncStates.get(table);
    if (!state) return {};

    return {
      since: state.lastSyncAt,
      version: state.lastVersion.toString(),
      checksum: state.checksum,
    };
  }
}

export const deltaSyncManager = new DeltaSyncManager();

/**
 * Hook for delta sync in components
 */
export function useDeltaSync(table: string) {
  return {
    getLastSyncAt: () => deltaSyncManager.getLastSyncAt(table),
    queueChange: <T>(op: DeltaChange['operation'], data: T, id: string) =>
      deltaSyncManager.queueChange(table, op, data, id),
    getPendingChanges: () => deltaSyncManager.getPendingChanges(table),
    buildQueryParams: () => deltaSyncManager.buildDeltaQueryParams(table),
  };
}
