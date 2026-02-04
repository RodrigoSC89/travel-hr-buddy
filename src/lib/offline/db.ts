/**
 * NAUTI ONE - IndexedDB Database
 * Persistência local com Dexie.js para funcionamento offline
 * Otimizado para sincronização em conexões de 0.5-2 Mbps
 */

import Dexie, { Table } from 'dexie';

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

// Operações pendentes de sincronização
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

// Cache de dados para acesso rápido
export interface CacheEntry {
  id?: number;
  key: string;
  data: unknown;
  timestamp: number;
  ttl: number;
}

// Configurações do usuário offline
export interface OfflineSettings {
  id?: number;
  key: string;
  value: unknown;
  updatedAt: number;
}

// ===================================================================
// CLASSE DO BANCO DE DADOS
// ===================================================================

export class NautiOneDB extends Dexie {
  // Tabelas de dados
  vessels!: Table<OfflineVessel, string>;
  crew_members!: Table<OfflineCrewMember, string>;
  certificates!: Table<OfflineCertificate, string>;
  maintenance_orders!: Table<OfflineMaintenanceOrder, string>;
  documents!: Table<OfflineDocument, string>;
  invoices!: Table<OfflineInvoice, string>;
  alerts!: Table<OfflineAlert, string>;
  
  // Tabelas de controle
  pending_operations!: Table<PendingOperation, number>;
  cache!: Table<CacheEntry, number>;
  settings!: Table<OfflineSettings, number>;

  constructor() {
    super('NautiOneDB');
    
    // Schema versão 1
    this.version(1).stores({
      // Dados principais
      vessels: 'id, name, imo_number, status, organization_id, _synced, _lastModified, _deleted',
      crew_members: 'id, vessel_id, [first_name+last_name], status, organization_id, _synced, _lastModified, _deleted',
      certificates: 'id, crew_member_id, certificate_number, expiry_date, status, _synced, _lastModified, _deleted',
      maintenance_orders: 'id, vessel_id, status, priority, due_date, organization_id, _synced, _lastModified, _deleted',
      documents: 'id, vessel_id, crew_member_id, document_type, expiry_date, _synced, _lastModified, _deleted',
      invoices: 'id, vessel_id, status, due_at, organization_id, _synced, _lastModified, _deleted',
      alerts: 'id, vessel_id, alert_type, severity, is_resolved, _synced, _lastModified, _deleted',
      
      // Controle
      pending_operations: '++id, table, recordId, timestamp, operation, priority',
      cache: '++id, key, timestamp',
      settings: '++id, key',
    });
  }
}

// Instância global do banco
export const db = new NautiOneDB();

// ===================================================================
// HELPERS DE PERSISTÊNCIA
// ===================================================================

/**
 * Salvar registro localmente com metadados de sync
 */
export async function saveToLocal<T extends { id: string }>(
  table: Table<T, string>,
  data: T,
  synced: boolean = false
): Promise<void> {
  const record = {
    ...data,
    _synced: synced,
    _lastModified: Date.now(),
    _version: ((data as unknown as SyncMetadata)._version || 0) + 1,
  } as T;
  
  await table.put(record);
}

/**
 * Deletar registro localmente (soft delete)
 */
export async function deleteFromLocal<T extends { id: string }>(
  table: Table<T, string>,
  id: string
): Promise<void> {
  const record = await table.get(id);
  
  if (record) {
    await (table as any).update(id, {
      _deleted: true,
      _synced: false,
      _lastModified: Date.now(),
    });
  }
}

/**
 * Obter registros não sincronizados
 */
export async function getUnsyncedRecords<T>(
  table: Table<T, string>
): Promise<T[]> {
  return await table
    .filter((record) => !(record as unknown as SyncMetadata)._synced)
    .toArray();
}

/**
 * Marcar registro como sincronizado
 */
export async function markAsSynced<T>(
  table: Table<T, string>,
  id: string
): Promise<void> {
  await (table as any).update(id, { _synced: true });
}

/**
 * Obter registros ativos (não deletados)
 */
export async function getActiveRecords<T>(
  table: Table<T, string>
): Promise<T[]> {
  return await table
    .filter((record) => !(record as unknown as SyncMetadata)._deleted)
    .toArray();
}

// ===================================================================
// QUEUE DE OPERAÇÕES PENDENTES
// ===================================================================

/**
 * Adicionar operação à fila de sincronização
 */
export async function queueOperation(
  operation: 'create' | 'update' | 'delete',
  table: string,
  recordId: string,
  data: Record<string, unknown>,
  priority: PendingOperation['priority'] = 'normal'
): Promise<number> {
  // Verificar se já existe operação para este registro
  const existing = await db.pending_operations
    .where({ table, recordId })
    .first();
  
  if (existing) {
    // Atualizar operação existente
    await db.pending_operations.update(existing.id!, {
      operation,
      data,
      timestamp: Date.now(),
      priority,
    });
    return existing.id!;
  }
  
  // Criar nova operação
  return await db.pending_operations.add({
    operation,
    table,
    recordId,
    data,
    timestamp: Date.now(),
    retries: 0,
    priority,
  });
}

/**
 * Obter operações pendentes ordenadas por prioridade e timestamp
 */
export async function getPendingOperations(): Promise<PendingOperation[]> {
  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
  
  const operations = await db.pending_operations.toArray();
  
  return operations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.timestamp - b.timestamp;
  });
}

/**
 * Remover operação da fila
 */
export async function removePendingOperation(id: number): Promise<void> {
  await db.pending_operations.delete(id);
}

/**
 * Incrementar contador de tentativas
 */
export async function incrementRetry(id: number, error: string): Promise<void> {
  const op = await db.pending_operations.get(id);
  
  if (op) {
    await db.pending_operations.update(id, {
      retries: op.retries + 1,
      lastError: error,
    });
  }
}

/**
 * Contar operações pendentes
 */
export async function countPendingOperations(): Promise<number> {
  return await db.pending_operations.count();
}

// ===================================================================
// CACHE HELPERS
// ===================================================================

/**
 * Salvar no cache com TTL
 */
export async function setCache(
  key: string,
  data: unknown,
  ttlMs: number = 5 * 60 * 1000
): Promise<void> {
  const existing = await db.cache.where('key').equals(key).first();
  
  if (existing) {
    await db.cache.update(existing.id!, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  } else {
    await db.cache.add({
      key,
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }
}

/**
 * Obter do cache se não expirado
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const entry = await db.cache.where('key').equals(key).first();
  
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  
  if (isExpired) {
    await db.cache.delete(entry.id!);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Limpar cache expirado
 */
export async function clearExpiredCache(): Promise<number> {
  const now = Date.now();
  const entries = await db.cache.toArray();
  
  let deleted = 0;
  for (const entry of entries) {
    if (now - entry.timestamp > entry.ttl) {
      await db.cache.delete(entry.id!);
      deleted++;
    }
  }
  
  return deleted;
}

// ===================================================================
// SETTINGS HELPERS
// ===================================================================

/**
 * Salvar configuração
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  
  if (existing) {
    await db.settings.update(existing.id!, {
      value,
      updatedAt: Date.now(),
    });
  } else {
    await db.settings.add({
      key,
      value,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Obter configuração
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const entry = await db.settings.where('key').equals(key).first();
  return entry ? (entry.value as T) : defaultValue;
}

// ===================================================================
// UTILITÁRIOS
// ===================================================================

/**
 * Limpar todos os dados do banco
 */
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

/**
 * Obter estatísticas do banco
 */
export async function getDatabaseStats(): Promise<{
  vessels: number;
  crewMembers: number;
  certificates: number;
  maintenanceOrders: number;
  documents: number;
  invoices: number;
  alerts: number;
  pendingOperations: number;
  unsynced: number;
}> {
  const [
    vessels,
    crewMembers,
    certificates,
    maintenanceOrders,
    documents,
    invoices,
    alerts,
    pendingOperations,
  ] = await Promise.all([
    db.vessels.count(),
    db.crew_members.count(),
    db.certificates.count(),
    db.maintenance_orders.count(),
    db.documents.count(),
    db.invoices.count(),
    db.alerts.count(),
    db.pending_operations.count(),
  ]);
  
  // Contar não sincronizados
  const unsyncedPromises = [
    db.vessels.filter((r) => !r._synced).count(),
    db.crew_members.filter((r) => !r._synced).count(),
    db.certificates.filter((r) => !r._synced).count(),
    db.maintenance_orders.filter((r) => !r._synced).count(),
    db.documents.filter((r) => !r._synced).count(),
    db.invoices.filter((r) => !r._synced).count(),
    db.alerts.filter((r) => !r._synced).count(),
  ];
  
  const unsyncedCounts = await Promise.all(unsyncedPromises);
  const unsynced = unsyncedCounts.reduce((a, b) => a + b, 0);
  
  return {
    vessels,
    crewMembers,
    certificates,
    maintenanceOrders,
    documents,
    invoices,
    alerts,
    pendingOperations,
    unsynced,
  };
}

export default db;
