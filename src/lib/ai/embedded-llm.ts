/**
 * Embedded LLM Manager
 * PATCH 950: LLM embarcada com fallback offline e cache inteligente
 * Integração com Lovable AI Gateway
 */

import { supabase } from "@/integrations/supabase/client";

// Tipos
export interface LLMRequest {
  prompt: string;
  context?: string;
  module?: string;
  mode?: "deterministic" | "creative" | "safe";
  maxTokens?: number;
  useCache?: boolean;
}

export interface LLMResponse {
  content: string;
  confidence: number;
  cached: boolean;
  model: string;
  executionTime: number;
  offline: boolean;
}

interface CachedResponse {
  prompt_hash: string;
  response: string;
  created_at: string;
  usage_count: number;
}

// IndexedDB para cache offline
const DB_NAME = "nautilus_llm_cache";
const STORE_NAME = "responses";
const DB_VERSION = 1;

class EmbeddedLLMManager {
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private pendingRequests: Map<string, LLMRequest> = new Map();
  private responseCache: Map<string, LLMResponse> = new Map();
  
  // Respostas pré-definidas para modo offline
  private offlineFallbacks: Record<string, string> = {
    "status": "Sistema operando em modo offline. Dados em cache disponíveis.",
    "help": "Comandos disponíveis offline: status, historico, checklist, alertas",
    "checklist": "Checklists salvos localmente estão disponíveis para consulta.",
    "alertas": "Alertas críticos são armazenados offline para sua segurança.",
    "default": "Estou operando em modo offline com capacidades limitadas. Conecte-se à internet para funcionalidade completa."
  };

  constructor() {
    this.initIndexedDB();
    this.setupNetworkListeners();
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "prompt_hash" });
          store.createIndex("created_at", "created_at");
          store.createIndex("usage_count", "usage_count");
        }
      };
    });
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processPendingRequests();
    });
    
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private generateHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private async getCachedResponse(promptHash: string): Promise<CachedResponse | null> {
    // Tentar cache em memória primeiro
    const memCached = this.responseCache.get(promptHash);
    if (memCached) {
      return {
        prompt_hash: promptHash,
        response: memCached.content,
        created_at: new Date().toISOString(),
        usage_count: 1
      };
    }

    // Tentar IndexedDB
    if (!this.db) return null;
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(promptHash);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  private async saveToCache(promptHash: string, response: string): Promise<void> {
    // Salvar em memória
    this.responseCache.set(promptHash, {
      content: response,
      confidence: 0.9,
      cached: true,
      model: "cache",
      executionTime: 0,
      offline: false
    });

    // Salvar em IndexedDB
    if (!this.db) return;
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      store.put({
        prompt_hash: promptHash,
        response,
        created_at: new Date().toISOString(),
        usage_count: 1
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  private getOfflineFallback(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    for (const [key, value] of Object.entries(this.offlineFallbacks)) {
      if (lowercasePrompt.includes(key)) {
        return value;
      }
    }
    
    return this.offlineFallbacks["default"];
  }

  private async processPendingRequests(): Promise<void> {
    for (const [hash, request] of this.pendingRequests) {
      try {
        await this.query(request);
        this.pendingRequests.delete(hash);
      } catch (error) {
        console.error("Failed to process pending request:", error);
      }
    }
  }

  async query(request: LLMRequest): Promise<LLMResponse> {
    const startTime = performance.now();
    const promptHash = this.generateHash(request.prompt + (request.context || ""));
    
    // 1. Verificar cache se permitido
    if (request.useCache !== false) {
      const cached = await this.getCachedResponse(promptHash);
      if (cached) {
        return {
          content: cached.response,
          confidence: 0.85,
          cached: true,
          model: "cache",
          executionTime: performance.now() - startTime,
          offline: !this.isOnline
        };
      }
    }

    // 2. Se offline, usar fallback
    if (!this.isOnline) {
      // Salvar request pendente para processar quando online
      this.pendingRequests.set(promptHash, request);
      
      return {
        content: this.getOfflineFallback(request.prompt),
        confidence: 0.5,
        cached: false,
        model: "offline-fallback",
        executionTime: performance.now() - startTime,
        offline: true
      };
    }

    // 3. Chamar edge function com Lovable AI
    try {
      const { data, error } = await supabase.functions.invoke("nautilus-llm", {
        body: {
          prompt: request.prompt,
          contextId: request.context,
          moduleId: request.module,
          sessionId: crypto.randomUUID(),
          mode: request.mode || "safe"
        }
      });

      if (error) throw error;

      const response: LLMResponse = {
        content: data.response,
        confidence: data.confidenceScore || 0.9,
        cached: data.usedCache || false,
        model: data.model || "lovable-ai",
        executionTime: performance.now() - startTime,
        offline: false
      };

      // Salvar em cache
      await this.saveToCache(promptHash, data.response);

      return response;
    } catch (error) {
      console.error("LLM query error:", error);
      
      // Fallback para cache ou resposta padrão
      const cached = await this.getCachedResponse(promptHash);
      if (cached) {
        return {
          content: cached.response,
          confidence: 0.7,
          cached: true,
          model: "cache-fallback",
          executionTime: performance.now() - startTime,
          offline: false
        };
      }

      return {
        content: "Desculpe, não foi possível processar sua solicitação no momento. Por favor, tente novamente.",
        confidence: 0.3,
        cached: false,
        model: "error-fallback",
        executionTime: performance.now() - startTime,
        offline: false
      };
    }
  }

  // Métodos utilitários
  async clearCache(): Promise<void> {
    this.responseCache.clear();
    
    if (!this.db) return;
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      transaction.oncomplete = () => resolve();
    });
  }

  async getCacheStats(): Promise<{ count: number; size: number }> {
    if (!this.db) return { count: 0, size: 0 };
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result;
        const size = JSON.stringify(items).length;
        resolve({ count: items.length, size });
      };
      
      request.onerror = () => resolve({ count: 0, size: 0 });
    });
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Singleton
export const embeddedLLM = new EmbeddedLLMManager();

// React Hook
import { useState, useCallback } from "react";

export function useEmbeddedLLM() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<LLMResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (request: LLMRequest): Promise<LLMResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await embeddedLLM.query(request);
      setLastResponse(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    query,
    isLoading,
    lastResponse,
    error,
    isOnline: embeddedLLM.isNetworkAvailable(),
    pendingCount: embeddedLLM.getPendingCount(),
    clearCache: embeddedLLM.clearCache.bind(embeddedLLM),
    getCacheStats: embeddedLLM.getCacheStats.bind(embeddedLLM)
  };
}
