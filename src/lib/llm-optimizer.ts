/**
 * LLM Optimizer - Utilities for efficient LLM usage in bandwidth-limited scenarios
 * PATCH: Performance optimization for ~2Mb connections
 */

import { openDB, IDBPDatabase } from 'idb';

// Connection quality detection
interface ConnectionInfo {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
}

export const getConnectionInfo = (): ConnectionInfo => {
  const nav = navigator as Navigator & { connection?: ConnectionInfo };
  return nav.connection || {
    downlink: 10,
    effectiveType: '4g',
    rtt: 50,
    saveData: false
  };
};

export const isSlowConnection = (): boolean => {
  const conn = getConnectionInfo();
  return conn.downlink < 3 || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData;
};

// Token budget management
interface TokenBudget {
  route: string;
  maxTokens: number;
  usedTokens: number;
  resetAt: number;
}

const TOKEN_BUDGETS: Record<string, number> = {
  '/ai/dashboard': 2000,
  '/ai/suggestions': 1500,
  '/ai/chat': 4000,
  '/ai/reports': 3000,
  default: 1000
};

export const getTokenBudget = (route: string): number => {
  const conn = getConnectionInfo();
  const baseBudget = TOKEN_BUDGETS[route] || TOKEN_BUDGETS.default;
  
  // Reduce budget on slow connections
  if (isSlowConnection()) {
    return Math.floor(baseBudget * 0.5);
  }
  return baseBudget;
};

// Prompt compression utilities
export const compressPrompt = (prompt: string): string => {
  return prompt
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
};

export const truncateContext = (messages: Array<{ role: string; content: string }>, maxTokens: number): Array<{ role: string; content: string }> => {
  // Estimate ~4 chars per token
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  
  let totalTokens = 0;
  const result: Array<{ role: string; content: string }> = [];
  
  // Always keep system message
  const systemMsg = messages.find(m => m.role === 'system');
  if (systemMsg) {
    result.push(systemMsg);
    totalTokens += estimateTokens(systemMsg.content);
  }
  
  // Add messages from newest to oldest, respecting budget
  const nonSystemMessages = messages.filter(m => m.role !== 'system').reverse();
  
  for (const msg of nonSystemMessages) {
    const msgTokens = estimateTokens(msg.content);
    if (totalTokens + msgTokens <= maxTokens) {
      result.unshift(msg);
      totalTokens += msgTokens;
    } else {
      break;
    }
  }
  
  return result;
};

// Response caching with IndexedDB
const DB_NAME = 'llm-cache';
const STORE_NAME = 'responses';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

interface CachedResponse {
  key: string;
  response: string;
  timestamp: number;
  model: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      }
    });
  }
  return dbPromise;
};

export const hashPrompt = async (prompt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(prompt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const getCachedResponse = async (prompt: string): Promise<string | null> => {
  try {
    const db = await getDB();
    const key = await hashPrompt(prompt);
    const cached = await db.get(STORE_NAME, key) as CachedResponse | undefined;
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.response;
    }
    return null;
  } catch {
    return null;
  }
};

export const cacheResponse = async (prompt: string, response: string, model: string): Promise<void> => {
  try {
    const db = await getDB();
    const key = await hashPrompt(prompt);
    await db.put(STORE_NAME, {
      key,
      response,
      timestamp: Date.now(),
      model
    });
  } catch {
    // Silent fail - caching is optional
  }
};

// Retry with exponential backoff
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < options.maxRetries) {
        const delay = Math.min(
          options.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          options.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Model selection based on connection quality
type ModelTier = 'fast' | 'balanced' | 'powerful';

const MODEL_MAP: Record<ModelTier, string> = {
  fast: 'google/gemini-2.5-flash-lite',
  balanced: 'google/gemini-2.5-flash',
  powerful: 'google/gemini-2.5-pro'
};

export const selectModel = (preferredTier: ModelTier = 'balanced'): string => {
  if (isSlowConnection()) {
    return MODEL_MAP.fast;
  }
  return MODEL_MAP[preferredTier];
};

// Streaming utilities for low-bandwidth
export const createStreamHandler = (onChunk: (text: string) => void, onDone: () => void) => {
  let buffer = '';
  
  return {
    processChunk: (chunk: string) => {
      buffer += chunk;
      
      // Flush buffer periodically to avoid UI jank
      if (buffer.length > 50) {
        onChunk(buffer);
        buffer = '';
      }
    },
    flush: () => {
      if (buffer) {
        onChunk(buffer);
        buffer = '';
      }
      onDone();
    }
  };
};

// Telemetry for LLM usage
interface LLMMetric {
  model: string;
  tokens: number;
  latencyMs: number;
  success: boolean;
  route: string;
  connectionType: string;
}

const metricsBuffer: LLMMetric[] = [];

export const recordLLMMetric = (metric: LLMMetric): void => {
  metricsBuffer.push(metric);
  
  // Flush to analytics when buffer is full
  if (metricsBuffer.length >= 10) {
    flushMetrics();
  }
};

const flushMetrics = (): void => {
  if (metricsBuffer.length === 0) return;
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[LLM Metrics]', metricsBuffer);
  }
  
  // TODO: Send to analytics endpoint
  metricsBuffer.length = 0;
};

// Export for testing
export const __testing = {
  metricsBuffer,
  flushMetrics
};
