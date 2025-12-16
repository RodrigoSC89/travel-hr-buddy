/**
 * Offline Audit Protocol - PATCH 950
 * Complete audit trail for offline operations
 */

import { localCrypto } from '@/lib/security/local-crypto';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  action: string;
  module: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  synced: boolean;
  syncedAt?: Date;
  hash?: string;
}

export interface AuditFilter {
  userId?: string;
  module?: string;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  synced?: boolean;
}

export interface AuditReport {
  id: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  filters: AuditFilter;
  totalEntries: number;
  byUser: Record<string, number>;
  byModule: Record<string, number>;
  byAction: Record<string, number>;
  entries: AuditEntry[];
}

const STORAGE_KEY = 'nautilus_audit_log';
const MAX_ENTRIES = 10000;
const RETENTION_DAYS = 90;
const AUDIT_PASSWORD = 'nautilus_audit_secure_key_2024';

class AuditProtocol {
  private entries: AuditEntry[] = [];
  private encryptionEnabled: boolean = true;
  private currentSessionId: string;

  constructor() {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.loadFromStorage();
    this.cleanupOldEntries();
  }

  /**
   * Load audit entries from storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        if (this.encryptionEnabled) {
          try {
            const encrypted = JSON.parse(stored);
            const decrypted = await localCrypto.decrypt(encrypted, AUDIT_PASSWORD);
            this.entries = JSON.parse(decrypted).map((e: any) => ({
              ...e,
              timestamp: new Date(e.timestamp),
              syncedAt: e.syncedAt ? new Date(e.syncedAt) : undefined
            }));
          } catch {
            // Fallback to unencrypted
            this.entries = JSON.parse(stored).map((e: any) => ({
              ...e,
              timestamp: new Date(e.timestamp),
              syncedAt: e.syncedAt ? new Date(e.syncedAt) : undefined
            }));
          }
        } else {
          this.entries = JSON.parse(stored).map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
            syncedAt: e.syncedAt ? new Date(e.syncedAt) : undefined
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to load audit log:', error);
      this.entries = [];
    }
  }

  /**
   * Save audit entries to storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const data = JSON.stringify(this.entries);
      if (this.encryptionEnabled) {
        const encrypted = await localCrypto.encrypt(data, AUDIT_PASSWORD);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
      } else {
        localStorage.setItem(STORAGE_KEY, data);
      }
    } catch (error) {
      console.warn('Failed to save audit log:', error);
    }
  }

  /**
   * Generate entry hash for integrity
   */
  private generateHash(entry: Omit<AuditEntry, 'hash'>): string {
    const data = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      userId: entry.userId,
      action: entry.action,
      module: entry.module,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      details: entry.details
    });
    
    // Simple hash for integrity check
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clean up old entries
   */
  private cleanupOldEntries(): void {
    const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const before = this.entries.length;
    
    this.entries = this.entries.filter(e => 
      e.timestamp.getTime() > cutoff || !e.synced
    );

    // Also limit to max entries
    if (this.entries.length > MAX_ENTRIES) {
      // Keep unsynced entries and most recent
      const unsynced = this.entries.filter(e => !e.synced);
      const synced = this.entries
        .filter(e => e.synced)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, MAX_ENTRIES - unsynced.length);
      
      this.entries = [...unsynced, ...synced];
    }

    if (before !== this.entries.length) {
      this.saveToStorage();
    }
  }

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'synced' | 'hash' | 'sessionId'>): Promise<AuditEntry> {
    const fullEntry: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sessionId: this.currentSessionId,
      synced: false
    };

    fullEntry.hash = this.generateHash(fullEntry);
    
    this.entries.push(fullEntry);
    await this.saveToStorage();

    return fullEntry;
  }

  /**
   * Log common actions
   */
  async logCreate(userId: string, module: string, resourceType: string, resourceId: string, data: any): Promise<AuditEntry> {
    return this.log({
      userId,
      action: 'CREATE',
      module,
      resourceType,
      resourceId,
      details: { operation: 'create' },
      newValue: data
    });
  }

  async logUpdate(userId: string, module: string, resourceType: string, resourceId: string, oldValue: any, newValue: any): Promise<AuditEntry> {
    return this.log({
      userId,
      action: 'UPDATE',
      module,
      resourceType,
      resourceId,
      details: { operation: 'update', changedFields: this.getChangedFields(oldValue, newValue) },
      previousValue: oldValue,
      newValue
    });
  }

  async logDelete(userId: string, module: string, resourceType: string, resourceId: string, data: any): Promise<AuditEntry> {
    return this.log({
      userId,
      action: 'DELETE',
      module,
      resourceType,
      resourceId,
      details: { operation: 'delete' },
      previousValue: data
    });
  }

  async logAccess(userId: string, module: string, resourceType: string, resourceId?: string): Promise<AuditEntry> {
    return this.log({
      userId,
      action: 'ACCESS',
      module,
      resourceType,
      resourceId,
      details: { operation: 'access' }
    });
  }

  async logLogin(userId: string, success: boolean, method: string): Promise<AuditEntry> {
    return this.log({
      userId,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      module: 'auth',
      resourceType: 'session',
      details: { method, success }
    });
  }

  async logLogout(userId: string): Promise<AuditEntry> {
    return this.log({
      userId,
      action: 'LOGOUT',
      module: 'auth',
      resourceType: 'session',
      details: { operation: 'logout' }
    });
  }

  async logAIAction(userId: string, action: string, input: string, output: string): Promise<AuditEntry> {
    return this.log({
      userId,
      action: 'AI_ACTION',
      module: 'ai',
      resourceType: 'inference',
      details: { action, inputLength: input.length, outputLength: output.length }
    });
  }

  /**
   * Get changed fields between two objects
   */
  private getChangedFields(oldValue: any, newValue: any): string[] {
    if (!oldValue || !newValue) return [];
    
    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    
    allKeys.forEach(key => {
      if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
        changes.push(key);
      }
    });

    return changes;
  }

  /**
   * Query audit entries
   */
  query(filter: AuditFilter): AuditEntry[] {
    return this.entries.filter(entry => {
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.module && entry.module !== filter.module) return false;
      if (filter.action && entry.action !== filter.action) return false;
      if (filter.resourceType && entry.resourceType !== filter.resourceType) return false;
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.synced !== undefined && entry.synced !== filter.synced) return false;
      return true;
    });
  }

  /**
   * Get entries pending sync
   */
  getPendingSync(): AuditEntry[] {
    return this.entries.filter(e => !e.synced);
  }

  /**
   * Mark entries as synced
   */
  async markSynced(entryIds: string[]): Promise<void> {
    const syncedAt = new Date();
    entryIds.forEach(id => {
      const entry = this.entries.find(e => e.id === id);
      if (entry) {
        entry.synced = true;
        entry.syncedAt = syncedAt;
      }
    });
    await this.saveToStorage();
  }

  /**
   * Generate audit report
   */
  generateReport(filter: AuditFilter): AuditReport {
    const entries = this.query(filter);
    
    const byUser: Record<string, number> = {};
    const byModule: Record<string, number> = {};
    const byAction: Record<string, number> = {};

    entries.forEach(entry => {
      byUser[entry.userId] = (byUser[entry.userId] || 0) + 1;
      byModule[entry.module] = (byModule[entry.module] || 0) + 1;
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    });

    return {
      id: `report_${Date.now()}`,
      generatedAt: new Date(),
      period: {
        start: filter.startDate || new Date(Math.min(...entries.map(e => e.timestamp.getTime()))),
        end: filter.endDate || new Date()
      },
      filters: filter,
      totalEntries: entries.length,
      byUser,
      byModule,
      byAction,
      entries
    };
  }

  /**
   * Export audit log
   */
  async exportLog(filter?: AuditFilter): Promise<string> {
    const entries = filter ? this.query(filter) : this.entries;
    const report = this.generateReport(filter || {});
    
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      summary: {
        totalEntries: report.totalEntries,
        byUser: report.byUser,
        byModule: report.byModule,
        byAction: report.byAction
      },
      entries: entries.map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
        syncedAt: e.syncedAt?.toISOString()
      }))
    }, null, 2);
  }

  /**
   * Verify entry integrity
   */
  verifyIntegrity(entryId: string): boolean {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry || !entry.hash) return false;

    const { hash, ...entryWithoutHash } = entry;
    const expectedHash = this.generateHash(entryWithoutHash);
    
    return hash === expectedHash;
  }

  /**
   * Verify all entries integrity
   */
  verifyAllIntegrity(): { valid: number; invalid: number; invalidIds: string[] } {
    let valid = 0;
    let invalid = 0;
    const invalidIds: string[] = [];

    this.entries.forEach(entry => {
      if (this.verifyIntegrity(entry.id)) {
        valid++;
      } else {
        invalid++;
        invalidIds.push(entry.id);
      }
    });

    return { valid, invalid, invalidIds };
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalEntries: number;
    pendingSync: number;
    byModule: Record<string, number>;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const byModule: Record<string, number> = {};
    this.entries.forEach(e => {
      byModule[e.module] = (byModule[e.module] || 0) + 1;
    });

    const timestamps = this.entries.map(e => e.timestamp.getTime());

    return {
      totalEntries: this.entries.length,
      pendingSync: this.entries.filter(e => !e.synced).length,
      byModule,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : undefined,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : undefined
    };
  }
}

export const auditProtocol = new AuditProtocol();
