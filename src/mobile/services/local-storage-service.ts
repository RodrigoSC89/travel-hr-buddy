/**
 * Local Storage Service for Offline Data Persistence
 * 
 * Provides a robust interface for storing and retrieving sync data locally
 * with integrity validation and error handling
 */

import { structuredLogger } from "@/lib/logger/structured-logger";

export interface StoredRecord {
  id: string;
  table: string;
  data: any;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
  local_changes?: any;
}

export interface StorageStats {
  totalRecords: number;
  unsyncedRecords: number;
  tableBreakdown: Record<string, number>;
}

export class LocalStorageService {
  private readonly STORAGE_PREFIX = "nautilus_sync_";
  private readonly INDEX_KEY = "nautilus_sync_index";
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

  /**
   * Store or update a record locally
   */
  async storeRecord(
    table: string,
    id: string,
    data: any,
    synced: boolean = false
  ): Promise<boolean> {
    try {
      // Input validation
      if (!table || typeof table !== "string" || table.length === 0) {
        throw new Error("Invalid table name");
      }

      if (!id || typeof id !== "string" || id.length === 0) {
        throw new Error("Invalid record ID");
      }

      if (!data || typeof data !== "object") {
        throw new Error("Invalid data object");
      }

      const record: StoredRecord = {
        id,
        table,
        data: { ...data },
        updated_at: data.updated_at || new Date().toISOString(),
        synced,
        deleted: false,
      };

      const key = this.getRecordKey(table, id);
      
      // Check storage space
      const storageSize = this.estimateStorageSize();
      if (storageSize > this.MAX_STORAGE_SIZE) {
        structuredLogger.warn("Storage limit approaching", {
          currentSize: storageSize,
          maxSize: this.MAX_STORAGE_SIZE,
        });
        await this.cleanupOldRecords();
      }

      // Store record
      localStorage.setItem(key, JSON.stringify(record));
      
      // Update index
      await this.updateIndex(table, id, "add");

      structuredLogger.debug("Record stored locally", {
        table,
        id,
        synced,
      });

      return true;
    } catch (error) {
      structuredLogger.error("Failed to store record", error as Error, {
        table,
        id,
      });
      return false;
    }
  }

  /**
   * Retrieve a record by table and ID
   */
  async getRecord(table: string, id: string): Promise<StoredRecord | null> {
    try {
      const key = this.getRecordKey(table, id);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      const record = JSON.parse(stored) as StoredRecord;

      // Validate record structure
      if (!record.id || !record.table || !record.data) {
        structuredLogger.warn("Invalid stored record structure", {
          table,
          id,
        });
        return null;
      }

      return record;
    } catch (error) {
      structuredLogger.error("Failed to retrieve record", error as Error, {
        table,
        id,
      });
      return null;
    }
  }

  /**
   * Get all records for a table
   */
  async getTableRecords(table: string): Promise<StoredRecord[]> {
    try {
      const index = this.getIndex();
      const tableIds = index[table] || [];
      const records: StoredRecord[] = [];

      for (const id of tableIds) {
        const record = await this.getRecord(table, id);
        if (record && !record.deleted) {
          records.push(record);
        }
      }

      return records;
    } catch (error) {
      structuredLogger.error("Failed to get table records", error as Error, {
        table,
      });
      return [];
    }
  }

  /**
   * Get all unsynced records
   */
  async getUnsyncedRecords(): Promise<StoredRecord[]> {
    try {
      const index = this.getIndex();
      const records: StoredRecord[] = [];

      for (const table of Object.keys(index)) {
        const tableRecords = await this.getTableRecords(table);
        const unsynced = tableRecords.filter(r => !r.synced);
        records.push(...unsynced);
      }

      return records;
    } catch (error) {
      structuredLogger.error("Failed to get unsynced records", error as Error);
      return [];
    }
  }

  /**
   * Mark a record as synced
   */
  async markAsSynced(table: string, id: string): Promise<boolean> {
    try {
      const record = await this.getRecord(table, id);
      
      if (!record) {
        return false;
      }

      record.synced = true;
      record.local_changes = undefined;

      const key = this.getRecordKey(table, id);
      localStorage.setItem(key, JSON.stringify(record));

      structuredLogger.debug("Record marked as synced", { table, id });
      return true;
    } catch (error) {
      structuredLogger.error("Failed to mark as synced", error as Error, {
        table,
        id,
      });
      return false;
    }
  }

  /**
   * Mark a record as deleted
   */
  async markAsDeleted(table: string, id: string): Promise<boolean> {
    try {
      const record = await this.getRecord(table, id);
      
      if (!record) {
        // Create a deleted record marker
        const deletedRecord: StoredRecord = {
          id,
          table,
          data: {},
          updated_at: new Date().toISOString(),
          synced: false,
          deleted: true,
        };

        const key = this.getRecordKey(table, id);
        localStorage.setItem(key, JSON.stringify(deletedRecord));
      } else {
        record.deleted = true;
        record.synced = false;
        record.updated_at = new Date().toISOString();

        const key = this.getRecordKey(table, id);
        localStorage.setItem(key, JSON.stringify(record));
      }

      structuredLogger.debug("Record marked as deleted", { table, id });
      return true;
    } catch (error) {
      structuredLogger.error("Failed to mark as deleted", error as Error, {
        table,
        id,
      });
      return false;
    }
  }

  /**
   * Permanently delete a record
   */
  async deleteRecord(table: string, id: string): Promise<boolean> {
    try {
      const key = this.getRecordKey(table, id);
      localStorage.removeItem(key);
      
      // Update index
      await this.updateIndex(table, id, "remove");

      structuredLogger.debug("Record permanently deleted", { table, id });
      return true;
    } catch (error) {
      structuredLogger.error("Failed to delete record", error as Error, {
        table,
        id,
      });
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    try {
      const index = this.getIndex();
      let totalRecords = 0;
      let unsyncedRecords = 0;
      const tableBreakdown: Record<string, number> = {};

      for (const [table, ids] of Object.entries(index)) {
        const count = ids.length;
        totalRecords += count;
        tableBreakdown[table] = count;

        // Count unsynced
        for (const id of ids) {
          const record = await this.getRecord(table, id);
          if (record && !record.synced) {
            unsyncedRecords++;
          }
        }
      }

      return {
        totalRecords,
        unsyncedRecords,
        tableBreakdown,
      };
    } catch (error) {
      structuredLogger.error("Failed to get storage stats", error as Error);
      return {
        totalRecords: 0,
        unsyncedRecords: 0,
        tableBreakdown: {},
      };
    }
  }

  /**
   * Clear all stored data for a table
   */
  async clearTable(table: string): Promise<boolean> {
    try {
      const index = this.getIndex();
      const tableIds = index[table] || [];

      for (const id of tableIds) {
        await this.deleteRecord(table, id);
      }

      structuredLogger.info("Table cleared", { table, count: tableIds.length });
      return true;
    } catch (error) {
      structuredLogger.error("Failed to clear table", error as Error, { table });
      return false;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<boolean> {
    try {
      const index = this.getIndex();

      for (const table of Object.keys(index)) {
        await this.clearTable(table);
      }

      localStorage.removeItem(this.INDEX_KEY);
      structuredLogger.info("All storage cleared");
      return true;
    } catch (error) {
      structuredLogger.error("Failed to clear all storage", error as Error);
      return false;
    }
  }

  /**
   * Generate storage key for a record
   */
  private getRecordKey(table: string, id: string): string {
    return `${this.STORAGE_PREFIX}${table}:${id}`;
  }

  /**
   * Get or initialize the storage index
   */
  private getIndex(): Record<string, string[]> {
    try {
      const stored = localStorage.getItem(this.INDEX_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Update the storage index
   */
  private async updateIndex(
    table: string,
    id: string,
    action: "add" | "remove"
  ): Promise<void> {
    try {
      const index = this.getIndex();

      if (!index[table]) {
        index[table] = [];
      }

      if (action === "add") {
        if (!index[table].includes(id)) {
          index[table].push(id);
        }
      } else {
        index[table] = index[table].filter(recordId => recordId !== id);
        
        // Remove table from index if empty
        if (index[table].length === 0) {
          delete index[table];
        }
      }

      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      structuredLogger.error("Failed to update index", error as Error);
    }
  }

  /**
   * Estimate current storage size
   */
  private estimateStorageSize(): number {
    let total = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        total += (key.length + (value?.length || 0)) * 2; // UTF-16 encoding
      }
    }

    return total;
  }

  /**
   * Cleanup old synced records to free space
   */
  private async cleanupOldRecords(): Promise<void> {
    try {
      const index = this.getIndex();
      let cleaned = 0;

      for (const table of Object.keys(index)) {
        const records = await this.getTableRecords(table);
        
        // Sort by updated_at
        const sortedRecords = records
          .filter(r => r.synced)
          .sort((a, b) => 
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          );

        // Delete oldest 10% of synced records
        const toDelete = Math.ceil(sortedRecords.length * 0.1);
        
        for (let i = 0; i < toDelete; i++) {
          await this.deleteRecord(table, sortedRecords[i].id);
          cleaned++;
        }
      }

      structuredLogger.info("Old records cleaned up", { cleaned });
    } catch (error) {
      structuredLogger.error("Cleanup failed", error as Error);
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
