/**
 * PATCH 634: Offline Cache and Sync System
 * IndexedDB-based offline storage for PWA-like functionality
 * PATCH 872: Type safety improvements - replaced any with proper types
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

// Typed session data structure
interface SessionData {
  moduleContext?: string;
  preferences?: Record<string, unknown>;
  cachedQueries?: Record<string, unknown>;
  [key: string]: unknown;
}

// Typed document content structure
interface DocumentContent {
  text?: string;
  metadata?: Record<string, unknown>;
  extractedData?: Record<string, unknown>;
  [key: string]: unknown;
}

// Typed log data structure
interface LogData {
  message?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

// Typed pending action payload
interface ActionPayload {
  entityType?: string;
  entityId?: string;
  operation?: 'create' | 'update' | 'delete';
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface NautilusDB extends DBSchema {
  sessions: {
    key: string;
    value: {
      id: string;
      userId: string;
      data: SessionData;
      timestamp: number;
      synced: boolean;
    };
  };
  documents: {
    key: string;
    value: {
      id: string;
      title: string;
      content: DocumentContent;
      lastModified: number;
      synced: boolean;
    };
  };
  logs: {
    key: string;
    value: {
      id: string;
      type: string;
      data: LogData;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'timestamp': number };
  };
  pendingActions: {
    key: string;
    value: {
      id: string;
      action: string;
      payload: ActionPayload;
      timestamp: number;
      retries: number;
    };
  };
}

class OfflineCacheManager {
  private db: IDBPDatabase<NautilusDB> | null = null;
  private readonly DB_NAME = "nautilus-offline-cache";
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<NautilusDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("logs")) {
          const logsStore = db.createObjectStore("logs", { keyPath: "id" });
          logsStore.createIndex("timestamp", "timestamp");
        }
        if (!db.objectStoreNames.contains("pendingActions")) {
          db.createObjectStore("pendingActions", { keyPath: "id" });
        }
      },
    });
  }

  // Session Management
  async saveSession(sessionId: string, userId: string, data: SessionData): Promise<void> {
    if (!this.db) await this.initialize();
    
    await this.db!.put("sessions", {
      id: sessionId,
      userId,
      data,
      timestamp: Date.now(),
      synced: false,
    });
  }

  async getSession(sessionId: string): Promise<NautilusDB['sessions']['value'] | undefined> {
    if (!this.db) await this.initialize();
    return await this.db!.get("sessions", sessionId);
  }

  async getAllSessions(): Promise<NautilusDB['sessions']['value'][]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAll("sessions");
  }

  // Document Management
  async saveDocument(documentId: string, title: string, content: DocumentContent): Promise<void> {
    if (!this.db) await this.initialize();
    
    await this.db!.put("documents", {
      id: documentId,
      title,
      content,
      lastModified: Date.now(),
      synced: false,
    });
  }

  async getDocument(documentId: string): Promise<NautilusDB['documents']['value'] | undefined> {
    if (!this.db) await this.initialize();
    return await this.db!.get("documents", documentId);
  }

  async getAllDocuments(): Promise<NautilusDB['documents']['value'][]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAll("documents");
  }

  async getUnsyncedDocuments(): Promise<NautilusDB['documents']['value'][]> {
    if (!this.db) await this.initialize();
    const docs = await this.db!.getAll("documents");
    return docs.filter(doc => !doc.synced);
  }

  // Logs Management
  async saveLog(logId: string, type: string, data: LogData): Promise<void> {
    if (!this.db) await this.initialize();
    
    await this.db!.put("logs", {
      id: logId,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    });
  }

  async getUnsyncedLogs(): Promise<NautilusDB['logs']['value'][]> {
    if (!this.db) await this.initialize();
    const logs = await this.db!.getAll("logs");
    return logs.filter(log => !log.synced);
  }

  // Pending Actions
  async addPendingAction(actionId: string, action: string, payload: ActionPayload): Promise<void> {
    if (!this.db) await this.initialize();
    
    await this.db!.put("pendingActions", {
      id: actionId,
      action,
      payload,
      timestamp: Date.now(),
      retries: 0,
    });
  }

  async getPendingActions(): Promise<NautilusDB['pendingActions']['value'][]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAll("pendingActions");
  }

  async removePendingAction(actionId: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.delete("pendingActions", actionId);
  }

  // Mark as synced
  async markDocumentSynced(documentId: string): Promise<void> {
    if (!this.db) await this.initialize();
    const doc = await this.getDocument(documentId);
    if (doc) {
      doc.synced = true;
      await this.db!.put("documents", doc);
    }
  }

  async markLogSynced(logId: string): Promise<void> {
    if (!this.db) await this.initialize();
    const log = await this.db!.get("logs", logId);
    if (log) {
      log.synced = true;
      await this.db!.put("logs", log);
    }
  }

  // Clear old data
  async clearOldData(daysToKeep: number = 7): Promise<void> {
    if (!this.db) await this.initialize();
    
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    // Clear old logs
    const logs = await this.db!.getAll("logs");
    for (const log of logs) {
      if (log.timestamp < cutoffTime && log.synced) {
        await this.db!.delete("logs", log.id);
      }
    }
  }

  // Get storage stats
  async getStorageStats(): Promise<{ documents: number; logs: number; pendingActions: number }> {
    if (!this.db) await this.initialize();
    
    const [documents, logs, pendingActions] = await Promise.all([
      this.db!.count("documents"),
      this.db!.count("logs"),
      this.db!.count("pendingActions"),
    ]);
    
    return { documents, logs, pendingActions };
  }
}

// Global instance
export const offlineCache = new OfflineCacheManager();
