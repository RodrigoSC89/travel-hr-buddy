/**
 * PATCH OPS-V7 FINAL — Sync Queue
 * 
 * Fila de sincronização para operação offline-first
 * Features:
 * - Retry exponencial
 * - Deduplicação
 * - Resolução de conflitos
 * - Persistência em localStorage
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Dynamic table accessor for offline sync (tables may not be in generated types)
const dynamicDb = { from: supabase.from as Function };

export type SyncItemStatus = "queued" | "sending" | "sent" | "failed" | "conflict";

export interface SyncItem {
  id: string;
  table: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  data: Record<string, unknown>;
  timestamp: number;
  status: SyncItemStatus;
  retryCount: number;
  lastError?: string;
  conflictData?: Record<string, unknown>;
}

interface SyncQueueState {
  items: SyncItem[];
  lastSync: number | null;
  isProcessing: boolean;
}

const STORAGE_KEY = "nauti_sync_queue";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

class SyncQueue {
  private state: SyncQueueState = {
    items: [],
    lastSync: null,
    isProcessing: false,
  };
  
  private listeners: Set<(state: SyncQueueState) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Carrega estado do localStorage
   */
  private loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
        // Reset status de itens que estavam sending
        this.state.items = this.state.items.map(item => ({
          ...item,
          status: item.status === "sending" ? "queued" : item.status,
        }));
        this.state.isProcessing = false;
        this.saveToStorage();
      }
    } catch (e) {
      logger.error("Failed to load sync queue from storage", e as Error);
    }
  }

  /**
   * Salva estado no localStorage
   */
  private saveToStorage() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      logger.error("Failed to save sync queue to storage", e as Error);
    }
  }

  /**
   * Notifica listeners de mudança de estado
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Adiciona listener de estado
   */
  addListener(listener: (state: SyncQueueState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  /**
   * Adiciona item à fila
   */
  enqueue(table: string, action: SyncItem["action"], data: Record<string, unknown>): string {
    const id = `${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
    
    // Verificar duplicata (mesmo table + action + id nos últimos 5s)
    const isDuplicate = this.state.items.some(item => 
      item.table === table &&
      item.action === action &&
      item.data.id === data.id &&
      Date.now() - item.timestamp < 5000
    );

    if (isDuplicate) {
      logger.info("Duplicate sync item detected, skipping", { table, action, id: data.id });
      return id;
    }

    const item: SyncItem = {
      id,
      table,
      action,
      data,
      timestamp: Date.now(),
      status: "queued",
      retryCount: 0,
    };

    this.state.items.push(item);
    this.saveToStorage();
    this.notifyListeners();

    // Tentar processar imediatamente se online
    if (navigator.onLine) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Remove item da fila
   */
  dequeue(id: string) {
    this.state.items = this.state.items.filter(item => item.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Atualiza status de um item
   */
  private updateItemStatus(id: string, status: SyncItemStatus, error?: string) {
    const item = this.state.items.find(i => i.id === id);
    if (item) {
      item.status = status;
      if (error) item.lastError = error;
      if (status === "failed") item.retryCount++;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Processa a fila de sincronização
   */
  async processQueue(): Promise<void> {
    if (this.state.isProcessing || !navigator.onLine) {
      return;
    }

    this.state.isProcessing = true;
    this.notifyListeners();

    const queuedItems = this.state.items.filter(
      item => item.status === "queued" || item.status === "failed"
    );

    for (const item of queuedItems) {
      if (item.retryCount >= MAX_RETRIES) {
        logger.error("Max retries reached for sync item", undefined, { id: item.id, table: item.table });
        continue;
      }

      try {
        this.updateItemStatus(item.id, "sending");
        
        await this.syncItem(item);
        
        this.updateItemStatus(item.id, "sent");
        
        // Remover itens enviados com sucesso após 5 segundos
        setTimeout(() => this.dequeue(item.id), 5000);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        this.updateItemStatus(item.id, "failed", errorMsg);
        
        // Delay exponencial para retry
        const delay = BASE_DELAY_MS * Math.pow(2, item.retryCount);
        logger.info(`Sync item failed, will retry in ${delay}ms`, { id: item.id, retryCount: item.retryCount });
        
        // Agendar retry
        setTimeout(() => this.processQueue(), delay);
      }
    }

    this.state.isProcessing = false;
    this.state.lastSync = Date.now();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Sincroniza um item individual
   */
  private async syncItem(item: SyncItem): Promise<void> {
    const { table, action, data } = item;

    switch (action) {
      case "INSERT": {
        const { error } = await dynamicDb.from(table).insert(data);
        if (error) throw error;
        break;
      }
      
      case "UPDATE": {
        if (!data.id) throw new Error("UPDATE requires id");
        
        // Verificar conflito
        const { data: serverData } = await dynamicDb.from(table)
          .select("*")
          .eq("id", data.id)
          .single();

        const serverRecord = serverData as Record<string, unknown> | null;
        if (serverRecord && serverRecord.updated_at) {
          const serverTime = new Date(String(serverRecord.updated_at)).getTime();
          const localTime = item.timestamp;
          
          if (serverTime > localTime) {
            this.updateItemStatus(item.id, "conflict");
            const itemInState = this.state.items.find(i => i.id === item.id);
            if (itemInState) {
              itemInState.conflictData = serverRecord;
            }
            throw new Error("CONFLICT: Server has newer version");
          }
        }

        const { error } = await dynamicDb.from(table)
          .update(data)
          .eq("id", data.id);
        if (error) throw error;
        break;
      }
      
      case "DELETE": {
        if (!data.id) throw new Error("DELETE requires id");
        const { error } = await dynamicDb.from(table)
          .delete()
          .eq("id", data.id);
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Resolve um conflito (aceita versão local ou servidor)
   */
  async resolveConflict(itemId: string, resolution: "local" | "server"): Promise<void> {
    const item = this.state.items.find(i => i.id === itemId);
    if (!item || item.status !== "conflict") {
      throw new Error("Item not in conflict state");
    }

    if (resolution === "server") {
      // Aceitar versão do servidor, descartar local
      this.dequeue(itemId);
    } else {
      // Forçar versão local
      item.status = "queued";
      item.retryCount = 0;
      item.timestamp = Date.now(); // Novo timestamp para vencer conflito
      this.saveToStorage();
      this.processQueue();
    }
  }

  /**
   * Retorna estatísticas da fila
   */
  getStats() {
    return {
      total: this.state.items.length,
      queued: this.state.items.filter(i => i.status === "queued").length,
      sending: this.state.items.filter(i => i.status === "sending").length,
      sent: this.state.items.filter(i => i.status === "sent").length,
      failed: this.state.items.filter(i => i.status === "failed").length,
      conflict: this.state.items.filter(i => i.status === "conflict").length,
      lastSync: this.state.lastSync,
      isProcessing: this.state.isProcessing,
    };
  }

  /**
   * Limpa a fila
   */
  clear() {
    this.state.items = [];
    this.saveToStorage();
    this.notifyListeners();
  }
}

// Singleton
export const syncQueue = new SyncQueue();

// Hook para React
export function useSyncQueue() {
  const [stats, setStats] = React.useState(syncQueue.getStats());

  React.useEffect(() => {
    const unsubscribe = syncQueue.addListener(() => {
      setStats(syncQueue.getStats());
    });
    return unsubscribe;
  }, []);

  return {
    ...stats,
    enqueue: syncQueue.enqueue.bind(syncQueue),
    processQueue: syncQueue.processQueue.bind(syncQueue),
    resolveConflict: syncQueue.resolveConflict.bind(syncQueue),
    clear: syncQueue.clear.bind(syncQueue),
  };
}

// Importar React para o hook
import React from "react";
