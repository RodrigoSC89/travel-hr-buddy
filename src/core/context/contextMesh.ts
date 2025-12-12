
/**
 * PATCH 216 - Context Mesh Core
 * TODO PATCH 659: TypeScript fixes deferred (context_history table schema missing from database)
 * Distributed context mesh for sharing state, decisions, and learning between modules
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ContextType = "mission" | "risk" | "ai" | "prediction" | "telemetry";
export type SyncStatus = "pending" | "synced" | "failed";

export interface ContextMessage {
  id?: string;
  moduleName: string;
  contextType: ContextType;
  contextData: Record<string, any>;
  timestamp?: Date;
  source: string;
  syncStatus?: SyncStatus;
}

export interface ContextSubscription {
  id: string;
  moduleName: string;
  contextTypes: ContextType[];
  handler: (message: ContextMessage) => void;
}

type EventHandler = (message: ContextMessage) => void;

class ContextMesh {
  private subscribers: Map<string, ContextSubscription> = new Map();
  private eventBus: Map<ContextType, Set<EventHandler>> = new Map();
  private pendingSync: ContextMessage[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private useLocalStorage = false;
  private isInitialized = false;

  /**
   * Initialize the context mesh
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn("[ContextMesh] Already initialized");
      return;
    }

    logger.info("[ContextMesh] Initializing context mesh...");
    
    // Test Supabase connectivity
    try {
      const { error } = await supabase.from("context_history").select("id").limit(1);
      if (error) {
        logger.warn("[ContextMesh] Supabase not available, using local storage", error);
        this.useLocalStorage = true;
      }
    } catch (err) {
      logger.warn("[ContextMesh] Failed to connect to Supabase, using local storage", err);
      this.useLocalStorage = true;
    }

    // Start periodic sync
    this.syncInterval = setInterval(() => this.syncPendingMessages(), 5000);
    
    this.isInitialized = true;
    logger.info("[ContextMesh] Context mesh initialized successfully");
  }

  /**
   * Publish a context message to the mesh
   */
  async publish(message: ContextMessage): Promise<void> {
    try {
      const timestamp = message.timestamp || new Date();
      const fullMessage: ContextMessage = {
        ...message,
        timestamp,
        syncStatus: "pending"
      };

      // Notify local subscribers via event bus
      this.notifyLocalSubscribers(fullMessage);

      // Save to persistent storage
      if (this.useLocalStorage) {
        await this.saveToLocalStorage(fullMessage);
      } else {
        await this.saveToSupabase(fullMessage);
      }

      logger.debug(`[ContextMesh] Published ${message.contextType} context from ${message.moduleName}`);
    } catch (error) {
      logger.error("[ContextMesh] Failed to publish context message", error);
      // Add to pending queue for retry
      this.pendingSync.push(message);
    }
  }

  /**
   * Subscribe to context updates
   */
  subscribe(subscription: Omit<ContextSubscription, "id">): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSubscription: ContextSubscription = { ...subscription, id };
    
    this.subscribers.set(id, fullSubscription);

    // Register handler in event bus for each context type
    subscription.contextTypes.forEach(type => {
      if (!this.eventBus.has(type)) {
        this.eventBus.set(type, new Set());
      }
      this.eventBus.get(type)!.add(subscription.handler);
    });

    logger.debug(`[ContextMesh] Module ${subscription.moduleName} subscribed to ${subscription.contextTypes.join(", ")}`);
    
    return id;
  }

  /**
   * Unsubscribe from context updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) {
      logger.warn(`[ContextMesh] Subscription ${subscriptionId} not found`);
      return;
    }

    // Remove from event bus
    subscription.contextTypes.forEach(type => {
      const handlers = this.eventBus.get(type);
      if (handlers) {
        handlers.delete(subscription.handler);
      }
    });

    this.subscribers.delete(subscriptionId);
    logger.debug(`[ContextMesh] Unsubscribed ${subscriptionId}`);
  }

  /**
   * Get context history for a module
   */
  async getContextHistory(
    moduleName: string,
    contextType?: ContextType,
    limit: number = 100
  ): Promise<ContextMessage[]> {
    try {
      if (this.useLocalStorage) {
        return this.getFromLocalStorage(moduleName, contextType, limit);
      }

      let query = supabase
        .from("context_history")
        .select("*")
        .eq("module_name", moduleName)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (contextType) {
        query = query.eq("context_type", contextType);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("[ContextMesh] Failed to get context history", error);
        return [];
      }

      return (data || []).map(row => ({
        id: row.id,
        moduleName: row.module_name,
        contextType: row.context_type as ContextType,
        contextData: row.context_data as Record<string, any>,
        timestamp: new Date(row.timestamp),
        source: row.source,
        syncStatus: row.sync_status as SyncStatus
      }));
    } catch (error) {
      logger.error("[ContextMesh] Error getting context history", error);
      return [];
    }
  }

  /**
   * Sync context with another module
   */
  async syncContext(
    fromModule: string,
    toModule: string,
    contextType: ContextType
  ): Promise<void> {
    try {
      const history = await this.getContextHistory(fromModule, contextType, 10);
      
      if (history.length > 0) {
        const latestContext = history[0];
        await this.publish({
          moduleName: toModule,
          contextType,
          contextData: {
            ...latestContext.contextData,
            syncedFrom: fromModule,
            syncedAt: new Date()
          },
          source: `sync_from_${fromModule}`
        });
      }

      logger.debug(`[ContextMesh] Synced ${contextType} context from ${fromModule} to ${toModule}`);
    } catch (error) {
      logger.error(`[ContextMesh] Failed to sync context from ${fromModule} to ${toModule}`, error);
    }
  }

  /**
   * Clean up old context data
   */
  async cleanup(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      if (this.useLocalStorage) {
        // Clean up local storage
        const key = "context_mesh_history";
        const stored = localStorage.getItem(key);
        if (stored) {
          const history = JSON.parse(stored) as ContextMessage[];
          const cleaned = history.filter(msg => 
            new Date(msg.timestamp!) > cutoffDate
          );
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      } else {
        // Clean up Supabase
        const { error } = await supabase
          .from("context_history")
          .delete()
          .lt("timestamp", cutoffDate.toISOString());

        if (error) {
          logger.error("[ContextMesh] Failed to cleanup old context", error);
        }
      }

      logger.info(`[ContextMesh] Cleaned up context data older than ${olderThanDays} days`);
    } catch (error) {
      logger.error("[ContextMesh] Error during cleanup", error);
    }
  }

  /**
   * Shutdown the context mesh
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.subscribers.clear();
    this.eventBus.clear();
    this.isInitialized = false;

    logger.info("[ContextMesh] Context mesh shutdown complete");
  }

  // Private methods

  private notifyLocalSubscribers(message: ContextMessage): void {
    const handlers = this.eventBus.get(message.contextType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          logger.error(`[ContextMesh] Error in subscriber handler for ${message.contextType}`, error);
        }
      });
    }
  }

  private async saveToSupabase(message: ContextMessage): Promise<void> {
    const { error } = await supabase
      .from("context_history")
      .insert({
        module_name: message.moduleName,
        context_type: message.contextType,
        context_data: message.contextData,
        timestamp: message.timestamp?.toISOString(),
        source: message.source,
        sync_status: message.syncStatus || "synced"
      });

    if (error) {
      logger.error("[ContextMesh] Failed to save to Supabase", error);
      throw error;
    }
  }

  private async saveToLocalStorage(message: ContextMessage): Promise<void> {
    try {
      const key = "context_mesh_history";
      const stored = localStorage.getItem(key);
      const history: ContextMessage[] = stored ? JSON.parse(stored) : [];
      
      history.unshift({
        ...message,
        id: `local_${Date.now()}_${Math.random()}`,
        syncStatus: "synced"
      });
      
      // Keep only last 1000 messages in local storage
      const trimmed = history.slice(0, 1000);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      logger.error("[ContextMesh] Failed to save to localStorage", error);
      
      // Try IndexedDB as fallback
      try {
        await this.saveToIndexedDB(message);
      } catch (idbError) {
        logger.error("[ContextMesh] Failed to save to IndexedDB", idbError);
      }
    }
  }

  private async saveToIndexedDB(message: ContextMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ContextMeshDB", 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["contexts"], "readwrite");
        const store = transaction.objectStore("contexts");
        
        store.add({
          ...message,
          id: `idb_${Date.now()}_${Math.random()}`,
          syncStatus: "pending"
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("contexts")) {
          db.createObjectStore("contexts", { keyPath: "id" });
        }
      };
    });
  }

  private getFromLocalStorage(
    moduleName: string,
    contextType?: ContextType,
    limit: number = 100
  ): ContextMessage[] {
    try {
      const key = "context_mesh_history";
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const history = JSON.parse(stored) as ContextMessage[];
      
      let filtered = history.filter(msg => msg.moduleName === moduleName);
      if (contextType) {
        filtered = filtered.filter(msg => msg.contextType === contextType);
      }
      
      return filtered.slice(0, limit);
    } catch (error) {
      logger.error("[ContextMesh] Error reading from localStorage", error);
      return [];
    }
  }

  private async syncPendingMessages(): Promise<void> {
    if (this.pendingSync.length === 0) return;

    const messages = [...this.pendingSync];
    this.pendingSync = [];

    for (const message of messages) {
      try {
        await this.publish(message);
      } catch (error) {
        logger.error("[ContextMesh] Failed to sync pending message", error);
        // Re-add to queue if still failing
        if (this.pendingSync.length < 100) {
          this.pendingSync.push(message);
        }
      }
    }
  }
}

// Export singleton instance
export const contextMesh = new ContextMesh();
