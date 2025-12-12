/**
 * IndexedDB Cache for AI Copilot - Patch 146.1
 * Stores chat history and context for offline access
 */

import { logger } from "@/lib/logger";

const DB_NAME = "ai_copilot_cache";
const DB_VERSION = 1;
const STORE_NAME = "chat_history";
const CONTEXT_STORE = "chat_context";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: "online" | "offline";
}

export interface ChatContext {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
  lastUpdated: string;
  metadata?: Record<string, any>;
}

/**
 * Initialize IndexedDB database
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error("Failed to open IndexedDB", request.error);
      reject(request.error);
    });

    request.onsuccess = () => {
      resolve(request.result);
    });

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create chat history store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("sessionId", "sessionId", { unique: false });
      }

      // Create context store
      if (!db.objectStoreNames.contains(CONTEXT_STORE)) {
        const contextStore = db.createObjectStore(CONTEXT_STORE, { keyPath: "id" });
        contextStore.createIndex("sessionId", "sessionId", { unique: true });
        contextStore.createIndex("lastUpdated", "lastUpdated", { unique: false });
      }

      logger.info("IndexedDB initialized successfully");
    });
  });
};

/**
 * Save a chat message to IndexedDB
 */
export const saveMessage = async (message: ChatMessage): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(message);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.debug("Message saved to cache", { messageId: message.id });
  } catch (error) {
    logger.error("Failed to save message to cache", error);
    throw error;
  }
};

/**
 * Save chat context (session with all messages)
 */
export const saveContext = async (context: ChatContext): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CONTEXT_STORE], "readwrite");
    const store = transaction.objectStore(CONTEXT_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(context);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.debug("Context saved to cache", { contextId: context.id });
  } catch (error) {
    logger.error("Failed to save context to cache", error);
    throw error;
  }
};

/**
 * Get all messages for a session
 */
export const getMessages = async (sessionId?: string): Promise<ChatMessage[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    if (sessionId) {
      const index = store.index("sessionId");
      const request = index.getAll(sessionId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } else {
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    logger.error("Failed to retrieve messages from cache", error);
    return [];
  }
};

/**
 * Get the last context (most recent session)
 */
export const getLastContext = async (): Promise<ChatContext | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CONTEXT_STORE], "readonly");
    const store = transaction.objectStore(CONTEXT_STORE);
    const index = store.index("lastUpdated");

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev"); // Get most recent
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      });
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error("Failed to retrieve last context from cache", error);
    return null;
  }
};

/**
 * Get a specific context by session ID
 */
export const getContext = async (sessionId: string): Promise<ChatContext | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CONTEXT_STORE], "readonly");
    const store = transaction.objectStore(CONTEXT_STORE);
    const index = store.index("sessionId");

    return new Promise((resolve, reject) => {
      const request = index.get(sessionId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error("Failed to retrieve context from cache", error);
    return null;
  }
};

/**
 * Clear all cached messages
 */
export const clearMessages = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.info("All messages cleared from cache");
  } catch (error) {
    logger.error("Failed to clear messages from cache", error);
    throw error;
  }
};

/**
 * Clear all cached contexts
 */
export const clearContexts = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CONTEXT_STORE], "readwrite");
    const store = transaction.objectStore(CONTEXT_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    logger.info("All contexts cleared from cache");
  } catch (error) {
    logger.error("Failed to clear contexts from cache", error);
    throw error;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = async (): Promise<void> => {
  await clearMessages();
  await clearContexts();
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
  messageCount: number;
  contextCount: number;
  lastUpdate: string | null;
}> => {
  try {
    const db = await initDB();
    
    // Get message count
    const messageTransaction = db.transaction([STORE_NAME], "readonly");
    const messageStore = messageTransaction.objectStore(STORE_NAME);
    const messageCount = await new Promise<number>((resolve, reject) => {
      const request = messageStore.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Get context count
    const contextTransaction = db.transaction([CONTEXT_STORE], "readonly");
    const contextStore = contextTransaction.objectStore(CONTEXT_STORE);
    const contextCount = await new Promise<number>((resolve, reject) => {
      const request = contextStore.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Get last update
    const lastContext = await getLastContext();
    const lastUpdate = lastContext?.lastUpdated || null;

    return { messageCount, contextCount, lastUpdate };
  } catch (error) {
    logger.error("Failed to get cache stats", error);
    return { messageCount: 0, contextCount: 0, lastUpdate: null };
  }
};
