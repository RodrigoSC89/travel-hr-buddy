/**
 * NAUTI ONE - IndexedDB Database
 * Persistência local com idb para funcionamento offline
 * Otimizado para sincronização em conexões de 0.5-2 Mbps
 * Migrated from Dexie to idb to resolve TS1540 build errors
 */

import { openDB, type IDBPDatabase } from 'idb';

// ===================================================================
// INTERFACES DE DADOS COM METADADOS DE SINCRONIZAÇÃO
// ===================================================================

export interface SyncMetadata {
  _synced: boolean;
  _lastModified: number;
  _version: number;
  _deleted?: boolean;
  _conflictResolved?: boolean;
}

export interface OfflineVessel extends SyncMetadata {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type?: string;
  flag_state?: string;
  status?: string;
  gross_tonnage?: number;
  crew_capacity?: number;
  current_location?: string;
  current_latitude?: number;
  current_longitude?: number;
  current_fuel_level?: number;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineCrewMember extends SyncMetadata {
  id: string;
  vessel_id?: string;
  first_name: string;
  last_name: string;
  rank?: string;
  specialization?: string;
  nationality?: string;
  status?: string;
  email?: string;
  phone?: string;
  contract_start?: string;
  contract_end?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineCertificate extends SyncMetadata {
  id: string;
  crew_member_id?: string;
  certificate_number: string;
  certificate_type?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  status?: string;
  document_url?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineMaintenanceOrder extends SyncMetadata {
  id: string;
  vessel_id?: string;
  order_number?: string;
  title?: string;
  description?: string;
  equipment_id?: string;
  equipment_name?: string;
  category?: string;
  order_type?: string;
  priority?: string;
  status?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineDocument extends SyncMetadata {
  id: string;
  vessel_id?: string;
  crew_member_id?: string;
  name: string;
  document_type?: string;
  file_path?: string;
  file_size?: number;
  file_blob?: Blob;
  mime_type?: string;
  expiry_date?: string;
  status?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineInvoice extends SyncMetadata {
  id: string;
  invoice_number?: string;
  vessel_id?: string;
  recipient_name?: string;
  total_amount?: number;
  currency?: string;
  issued_at?: string;
  due_at?: string;
  paid_at?: string;
  status?: string;
  type?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfflineAlert extends SyncMetadata {
  id: string;
  vessel_id?: string;
  vessel_name?: string;
  alert_type?: string;
  severity?: string;
  title?: string;
  message?: string;
  is_resolved?: boolean;
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PendingOperation {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  lastError?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface CacheEntry {
  id?: number;
  key: string;
  data: unknown;
  timestamp: number;
  ttl: number;
}

export interface OfflineSettings {
  id?: number;
  key: string;
  value: unknown;
  updatedAt: number;
}

const DB_NAME = 'NautiOneDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Data stores
      if (!db.objectStoreNames.contains('vessels')) {
        const store = db.createObjectStore('vessels', { keyPath: 'id' });
        store.createIndex('status', 'status');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('crew_members')) {
        const store = db.createObjectStore('crew_members', { keyPath: 'id' });
        store.createIndex('vessel_id', 'vessel_id');
        store.createIndex('status', 'status');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('certificates')) {
        const store = db.createObjectStore('certificates', { keyPath: 'id' });
        store.createIndex('crew_member_id', 'crew_member_id');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('maintenance_orders')) {
        const store = db.createObjectStore('maintenance_orders', { keyPath: 'id' });
        store.createIndex('vessel_id', 'vessel_id');
        store.createIndex('status', 'status');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('documents')) {
        const store = db.createObjectStore('documents', { keyPath: 'id' });
        store.createIndex('vessel_id', 'vessel_id');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('invoices')) {
        const store = db.createObjectStore('invoices', { keyPath: 'id' });
        store.createIndex('vessel_id', 'vessel_id');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('alerts')) {
        const store = db.createObjectStore('alerts', { keyPath: 'id' });
        store.createIndex('vessel_id', 'vessel_id');
        store.createIndex('_synced', '_synced');
      }
      if (!db.objectStoreNames.contains('pending_operations')) {
        const store = db.createObjectStore('pending_operations', { keyPath: 'id', autoIncrement: true });
        store.createIndex('table', 'table');
        store.createIndex('recordId', 'recordId');
      }
      if (!db.objectStoreNames.contains('cache')) {
        const store = db.createObjectStore('cache', { keyPath: 'id', autoIncrement: true });
        store.createIndex('key', 'key');
      }
      if (!db.objectStoreNames.contains('settings')) {
        const store = db.createObjectStore('settings', { keyPath: 'id', autoIncrement: true });
        store.createIndex('key', 'key');
      }
    },
  });

  return dbInstance;
}

// ===================================================================
// COMPATIBILITY LAYER - Mimics old Dexie API surface
// ===================================================================

/** The db proxy object that provides store access */
export const db = {
  async getStore(storeName: string) {
    const database = await getDB();
    return database;
  },
  vessels: createStoreProxy<OfflineVessel>('vessels'),
  crew_members: createStoreProxy<OfflineCrewMember>('crew_members'),
  certificates: createStoreProxy<OfflineCertificate>('certificates'),
  maintenance_orders: createStoreProxy<OfflineMaintenanceOrder>('maintenance_orders'),
  documents: createStoreProxy<OfflineDocument>('documents'),
  invoices: createStoreProxy<OfflineInvoice>('invoices'),
  alerts: createStoreProxy<OfflineAlert>('alerts'),
  pending_operations: createStoreProxy<PendingOperation>('pending_operations'),
  cache: createStoreProxy<CacheEntry>('cache'),
  settings: createStoreProxy<OfflineSettings>('settings'),
  isOpen: () => dbInstance !== null,
  open: async () => { await getDB(); },
};

function createStoreProxy<T>(storeName: string) {
  return {
    async get(id: string | number): Promise<T | undefined> {
      const database = await getDB();
      return database.get(storeName, id) as Promise<T | undefined>;
    },
    async put(record: T): Promise<void> {
      const database = await getDB();
      await database.put(storeName, record as any);
    },
    async add(record: T): Promise<number> {
      const database = await getDB();
      const result = await database.add(storeName, record as any);
      return result as number;
    },
    async delete(id: string | number): Promise<void> {
      const database = await getDB();
      await database.delete(storeName, id);
    },
    async clear(): Promise<void> {
      const database = await getDB();
      await database.clear(storeName);
    },
    async count(): Promise<number> {
      const database = await getDB();
      return database.count(storeName);
    },
    async toArray(): Promise<T[]> {
      const database = await getDB();
      return database.getAll(storeName) as Promise<T[]>;
    },
    filter(predicate: (item: T) => boolean) {
      return {
        async toArray(): Promise<T[]> {
          const database = await getDB();
          const all = await database.getAll(storeName) as T[];
          return all.filter(predicate);
        },
        async count(): Promise<number> {
          const database = await getDB();
          const all = await database.getAll(storeName) as T[];
          return all.filter(predicate).length;
        },
      };
    },
    async update(id: string | number, changes: Partial<T>): Promise<void> {
      const database = await getDB();
      const existing = await database.get(storeName, id) as T | undefined;
      if (existing) {
        await database.put(storeName, { ...existing, ...changes } as any);
      }
    },
    where(indexOrObj: string | Record<string, unknown>) {
      const self = this;
      if (typeof indexOrObj === 'string') {
        return {
          equals(value: unknown) {
            return {
              async first(): Promise<T | undefined> {
                const database = await getDB();
                const all = await database.getAllFromIndex(storeName, indexOrObj, value as any) as T[];
                return all[0];
              },
              async toArray(): Promise<T[]> {
                const database = await getDB();
                return database.getAllFromIndex(storeName, indexOrObj, value as any) as Promise<T[]>;
              },
              async delete(): Promise<void> {
                const database = await getDB();
                const all = await database.getAllFromIndex(storeName, indexOrObj, value as any) as any[];
                const tx = database.transaction(storeName, 'readwrite');
                for (const item of all) {
                  await tx.store.delete(item.id);
                }
                await tx.done;
              },
            };
          },
          below(value: unknown) {
            return {
              async delete(): Promise<void> {
                const database = await getDB();
                const all = await database.getAll(storeName) as any[];
                const tx = database.transaction(storeName, 'readwrite');
                for (const item of all) {
                  if (item[indexOrObj as string] < (value as any)) {
                    await tx.store.delete(item.id);
                  }
                }
                await tx.done;
              },
            };
          },
        };
      }
      // Object-based where (e.g., { table: 'vessels', recordId: id })
      return {
        async first(): Promise<T | undefined> {
          const database = await getDB();
          const all = await database.getAll(storeName) as any[];
          return all.find((item) =>
            Object.entries(indexOrObj).every(([k, v]) => item[k] === v)
          ) as T | undefined;
        },
        async delete(): Promise<void> {
          const database = await getDB();
          const all = await database.getAll(storeName) as any[];
          const tx = database.transaction(storeName, 'readwrite');
          for (const item of all) {
            if (Object.entries(indexOrObj).every(([k, v]) => item[k] === v)) {
              await tx.store.delete(item.id);
            }
          }
          await tx.done;
        },
      };
    },
  };
}

// ===================================================================
// NautiOneDB class for backward compat
// ===================================================================

export class NautiOneDB {
  vessels = db.vessels;
  crew_members = db.crew_members;
  certificates = db.certificates;
  maintenance_orders = db.maintenance_orders;
  documents = db.documents;
  invoices = db.invoices;
  alerts = db.alerts;
  pending_operations = db.pending_operations;
  cache = db.cache;
  settings = db.settings;

  isOpen() { return db.isOpen(); }
  async open() { await db.open(); }
}

/**
 * Inicializar o banco de dados
 */
export async function initNautiOneDB(): Promise<NautiOneDB> {
  await getDB();
  return new NautiOneDB();
}

// ===================================================================
// HELPERS DE PERSISTÊNCIA
// ===================================================================

export async function saveToLocal<T extends { id: string }>(
  store: ReturnType<typeof createStoreProxy>,
  data: T,
  synced: boolean = false
): Promise<void> {
  const record = {
    ...data,
    _synced: synced,
    _lastModified: Date.now(),
    _version: ((data as unknown as SyncMetadata)._version || 0) + 1,
  };
  await store.put(record as any);
}

export async function deleteFromLocal<T extends { id: string }>(
  store: ReturnType<typeof createStoreProxy>,
  id: string
): Promise<void> {
  const record = await store.get(id);
  if (record) {
    await store.update(id, {
      _deleted: true,
      _synced: false,
      _lastModified: Date.now(),
    } as any);
  }
}

export async function getUnsyncedRecords<T>(
  store: ReturnType<typeof createStoreProxy>
): Promise<T[]> {
  return store.filter((record: any) => !record._synced).toArray() as Promise<T[]>;
}

export async function markAsSynced<T>(
  store: ReturnType<typeof createStoreProxy>,
  id: string
): Promise<void> {
  await store.update(id, { _synced: true } as any);
}

export async function getActiveRecords<T>(
  store: ReturnType<typeof createStoreProxy>
): Promise<T[]> {
  return store.filter((record: any) => !record._deleted).toArray() as Promise<T[]>;
}

// ===================================================================
// QUEUE DE OPERAÇÕES PENDENTES
// ===================================================================

export async function queueOperation(
  operation: 'create' | 'update' | 'delete',
  table: string,
  recordId: string,
  data: Record<string, unknown>,
  priority: PendingOperation['priority'] = 'normal'
): Promise<number> {
  const existing = await db.pending_operations.where({ table, recordId }).first?.() as PendingOperation | undefined;
  
  if (existing && existing.id) {
    await db.pending_operations.update(existing.id, {
      operation,
      data,
      timestamp: Date.now(),
      priority,
    } as any);
    return existing.id;
  }
  
  return await db.pending_operations.add({
    operation,
    table,
    recordId,
    data,
    timestamp: Date.now(),
    retries: 0,
    priority,
  } as any);
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
  const operations = await db.pending_operations.toArray() as PendingOperation[];
  
  return operations.sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    if (priorityDiff !== 0) return priorityDiff;
    return a.timestamp - b.timestamp;
  });
}

export async function removePendingOperation(id: number): Promise<void> {
  await db.pending_operations.delete(id);
}

export async function incrementRetry(id: number, error: string): Promise<void> {
  const op = await db.pending_operations.get(id) as PendingOperation | undefined;
  if (op) {
    await db.pending_operations.update(id, {
      retries: op.retries + 1,
      lastError: error,
    } as any);
  }
}

export async function countPendingOperations(): Promise<number> {
  return await db.pending_operations.count();
}

// ===================================================================
// CACHE HELPERS
// ===================================================================

export async function setCache(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000): Promise<void> {
  const all = await db.cache.toArray() as CacheEntry[];
  const existing = all.find(e => e.key === key);
  
  if (existing && existing.id) {
    await db.cache.update(existing.id, { data, timestamp: Date.now(), ttl: ttlMs } as any);
  } else {
    await db.cache.add({ key, data, timestamp: Date.now(), ttl: ttlMs } as any);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const all = await db.cache.toArray() as CacheEntry[];
  const entry = all.find(e => e.key === key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    if (entry.id) await db.cache.delete(entry.id);
    return null;
  }
  return entry.data as T;
}

export async function clearExpiredCache(): Promise<number> {
  const now = Date.now();
  const entries = await db.cache.toArray() as CacheEntry[];
  let deleted = 0;
  for (const entry of entries) {
    if (now - entry.timestamp > entry.ttl && entry.id) {
      await db.cache.delete(entry.id);
      deleted++;
    }
  }
  return deleted;
}

// ===================================================================
// SETTINGS HELPERS
// ===================================================================

export async function setSetting(key: string, value: unknown): Promise<void> {
  const all = await db.settings.toArray() as OfflineSettings[];
  const existing = all.find(e => e.key === key);
  
  if (existing && existing.id) {
    await db.settings.update(existing.id, { value, updatedAt: Date.now() } as any);
  } else {
    await db.settings.add({ key, value, updatedAt: Date.now() } as any);
  }
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const all = await db.settings.toArray() as OfflineSettings[];
  const entry = all.find(e => e.key === key);
  return entry ? (entry.value as T) : defaultValue;
}

// ===================================================================
// UTILITÁRIOS
// ===================================================================

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.vessels.clear(),
    db.crew_members.clear(),
    db.certificates.clear(),
    db.maintenance_orders.clear(),
    db.documents.clear(),
    db.invoices.clear(),
    db.alerts.clear(),
    db.pending_operations.clear(),
    db.cache.clear(),
  ]);
}

export async function getDatabaseStats() {
  const [vessels, crewMembers, certificates, maintenanceOrders, documents, invoices, alerts, pendingOperations] = await Promise.all([
    db.vessels.count(),
    db.crew_members.count(),
    db.certificates.count(),
    db.maintenance_orders.count(),
    db.documents.count(),
    db.invoices.count(),
    db.alerts.count(),
    db.pending_operations.count(),
  ]);
  
  const unsyncedCounts = await Promise.all([
    db.vessels.filter((r: any) => !r._synced).count(),
    db.crew_members.filter((r: any) => !r._synced).count(),
    db.certificates.filter((r: any) => !r._synced).count(),
    db.maintenance_orders.filter((r: any) => !r._synced).count(),
    db.documents.filter((r: any) => !r._synced).count(),
    db.invoices.filter((r: any) => !r._synced).count(),
    db.alerts.filter((r: any) => !r._synced).count(),
  ]);
  
  return {
    vessels, crewMembers, certificates, maintenanceOrders,
    documents, invoices, alerts, pendingOperations,
    unsynced: unsyncedCounts.reduce((a, b) => a + b, 0),
  };
}

export default db;
