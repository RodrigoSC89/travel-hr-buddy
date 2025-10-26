/**
 * PATCH 165.0 - Local Memory Storage
 * Stores AI conversation context locally for offline use
 */

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  context?: Record<string, any>;
}

interface MemoryContext {
  missionId?: string;
  missionStatus?: string;
  currentLocation?: { lat: number; lng: number };
  weatherConditions?: any;
  activeChecklists?: any[];
  recentActivity?: string[];
}

class LocalMemory {
  private dbName = 'nautilus_ai_memory';
  private maxMessages = 100;
  private context: MemoryContext = {};

  /**
   * Store a conversation message
   */
  async storeMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<string> {
    // Generate UUID if available, otherwise fallback to timestamp-based ID
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID()
      : `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMessage: ConversationMessage = {
      ...message,
      id: uuid,
      timestamp: Date.now()
    };

    await this.saveToIndexedDB('messages', fullMessage);
    
    // Cleanup old messages if exceeding limit
    await this.cleanupOldMessages();
    
    return fullMessage.id;
  }

  /**
   * Get conversation history
   */
  async getHistory(limit: number = 20): Promise<ConversationMessage[]> {
    const messages = await this.getAllFromIndexedDB('messages');
    
    // Sort by timestamp descending and take latest
    return messages
      .sort((a: ConversationMessage, b: ConversationMessage) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .reverse(); // Return in chronological order
  }

  /**
   * Update context
   */
  async updateContext(updates: Partial<MemoryContext>): Promise<void> {
    this.context = { ...this.context, ...updates };
    await this.saveToIndexedDB('context', { id: 'current', ...this.context });
  }

  /**
   * Get current context
   */
  async getContext(): Promise<MemoryContext> {
    const stored = await this.getFromIndexedDB('context', 'current');
    if (stored) {
      this.context = stored;
    }
    return this.context;
  }

  /**
   * Search conversation history
   */
  async searchHistory(query: string, limit: number = 10): Promise<ConversationMessage[]> {
    const allMessages = await this.getAllFromIndexedDB('messages');
    const lowerQuery = query.toLowerCase();
    
    return allMessages
      .filter((msg: ConversationMessage) => 
        msg.content.toLowerCase().includes(lowerQuery)
      )
      .sort((a: ConversationMessage, b: ConversationMessage) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Search for relevant content (for AI context)
   */
  search(query: string, limit: number = 10): string[] {
    // Simple synchronous search in memory
    // In production, this could be async and search indexed data
    const lowerQuery = query.toLowerCase();
    const results: string[] = [];
    
    // This is a placeholder - in real implementation, would search cached data
    if (this.context.recentActivity) {
      results.push(...this.context.recentActivity.slice(0, limit));
    }
    
    return results;
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    await this.clearIndexedDBStore('messages');
  }

  /**
   * Clear old messages beyond limit
   */
  private async cleanupOldMessages(): Promise<void> {
    const messages = await this.getAllFromIndexedDB('messages');
    
    if (messages.length > this.maxMessages) {
      const sorted = messages.sort(
        (a: ConversationMessage, b: ConversationMessage) => b.timestamp - a.timestamp
      );
      
      const toDelete = sorted.slice(this.maxMessages);
      
      for (const msg of toDelete) {
        await this.deleteFromIndexedDB('messages', msg.id);
      }
    }
  }

  /**
   * Get context summary for AI
   */
  async getContextSummary(): Promise<string> {
    const context = await this.getContext();
    const recentMessages = await this.getHistory(5);
    
    let summary = 'Current Context:\n';
    
    if (context.missionId) {
      summary += `- Mission: ${context.missionId} (${context.missionStatus || 'unknown'})\n`;
    }
    
    if (context.currentLocation) {
      summary += `- Location: ${context.currentLocation.lat.toFixed(2)}, ${context.currentLocation.lng.toFixed(2)}\n`;
    }
    
    if (context.weatherConditions) {
      summary += `- Weather: ${context.weatherConditions.conditions || 'unknown'}\n`;
    }
    
    if (context.activeChecklists && context.activeChecklists.length > 0) {
      summary += `- Active Checklists: ${context.activeChecklists.length}\n`;
    }
    
    if (recentMessages.length > 0) {
      summary += '\nRecent Conversation:\n';
      recentMessages.forEach(msg => {
        summary += `${msg.role}: ${msg.content.substring(0, 100)}...\n`;
      });
    }
    
    return summary;
  }

  // IndexedDB helper methods
  private async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        store.put(data);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('context')) {
          db.createObjectStore('context', { keyPath: 'id' });
        }
      };
    });
  }

  private async getFromIndexedDB(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  private async getAllFromIndexedDB(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  }

  private async deleteFromIndexedDB(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  private async clearIndexedDBStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }
}

export const localMemory = new LocalMemory();
