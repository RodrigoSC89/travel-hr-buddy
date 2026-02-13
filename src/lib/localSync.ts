/**
 * Local Sync - Stub for syncEngine compatibility
 */

export interface OfflineRecord {
  id?: string;
  table: string;
  data: Record<string, unknown>;
  action: 'create' | 'update' | 'delete';
  operation?: 'insert' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
}

class LocalSync {
  async saveLocally(_data: Record<string, unknown>, _table: string, _action: string): Promise<void> {
    // No-op stub
  }
  
  async getUnsyncedRecords(): Promise<OfflineRecord[]> {
    return [];
  }

  async getPending(): Promise<OfflineRecord[]> {
    return [];
  }
  
  async markAsSynced(_id: string): Promise<void> {
    // No-op stub
  }

  async markSynced(_id: string): Promise<void> {
    // No-op stub
  }

  async deleteSyncedRecord(_id: string): Promise<void> {
    // No-op stub
  }
  
  async getAll(): Promise<OfflineRecord[]> {
    return [];
  }

  async getQueueCount(): Promise<number> {
    return 0;
  }
  
  async clear(): Promise<void> {
    // No-op stub
  }
}

export const localSync = new LocalSync();
