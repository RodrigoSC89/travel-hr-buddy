/**
 * Supabase Client - PATCH v27 Production Fix
 * Otimizado para conexões marítimas/satélite com retry robusto
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Hardcoded values - NEVER use env vars in production code
const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

// Safe storage adapter that checks for localStorage availability
const safeLocalStorage = (() => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      // Test if we can actually use localStorage
      window.localStorage.setItem("__storage_test__", "test");
      window.localStorage.removeItem("__storage_test__");
      return window.localStorage;
    }
  } catch {
    console.warn("localStorage is not available, using in-memory storage fallback");
  }
  
  // Fallback to in-memory storage
  const memoryStorage: Record<string, string> = {};
  return {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => { memoryStorage[key] = value; },
    removeItem: (key: string) => { delete memoryStorage[key]; },
    clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); },
    key: (index: number) => Object.keys(memoryStorage)[index] || null,
    length: Object.keys(memoryStorage).length,
  };
})();

// Detect slow connections (2G, 3G, satellite, <2Mbps)
const isSlowConnection = (): boolean => {
  try {
    if ('connection' in navigator) {
      const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } }).connection;
      if (conn) {
        return (
          conn.saveData === true || 
          conn.effectiveType === '2g' || 
          conn.effectiveType === 'slow-2g' || 
          conn.effectiveType === '3g' ||
          (typeof conn.downlink === 'number' && conn.downlink < 2)
        );
      }
    }
  } catch {
    // Ignore errors in connection detection
  }
  return false;
};

// Custom fetch with retry for maritime satellite connections
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const MAX_RETRIES = 4;
  const slow = isSlowConnection();
  
  // Adaptive timeouts for maritime/satellite connections
  // First attempt has longer timeout to avoid premature failures
  // Slow: 30s/45s/60s/75s | Normal: 20s/30s/40s/50s
  const getTimeout = (attempt: number) => {
    const base = slow ? 30000 : 20000;
    return base + (attempt * (slow ? 15000 : 10000));
  };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = getTimeout(attempt);
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Handle external abort signal
    const externalSignal = init?.signal;
    let externalAbortHandler: (() => void) | undefined;
    
    if (externalSignal) {
      externalAbortHandler = () => controller.abort();
      externalSignal.addEventListener('abort', externalAbortHandler);
    }
    
    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (externalSignal && externalAbortHandler) {
        externalSignal.removeEventListener('abort', externalAbortHandler);
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (externalSignal && externalAbortHandler) {
        externalSignal.removeEventListener('abort', externalAbortHandler);
      }
      lastError = error as Error;
      
      // Check if aborted by external signal (user cancelled)
      if (externalSignal?.aborted) {
        throw error;
      }
      
      // Check if error is retryable (network errors, iOS Safari PWA specific errors)
      const isAborted = (error as Error).name === 'AbortError';
      const errorMessage = (error as Error).message || '';
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('network') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('Load failed') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('The operation was aborted') ||
        errorMessage.includes('A network error') ||
        errorMessage.includes('The Internet connection appears to be offline') ||
        errorMessage.includes('Could not connect to the server');
      
      const isRetryable = isAborted || isNetworkError;
      
      // If not retryable or last attempt, throw error
      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        if (import.meta.env.DEV) {
          console.error(`[Supabase] Request failed after ${attempt + 1} attempts:`, errorMessage);
        }
        throw error;
      }
      
      // Exponential backoff with jitter: 1.5s, 3s, 6s (+ random 0-1s)
      const jitter = Math.random() * 1000;
      const delay = Math.min(1500 * Math.pow(2, attempt) + jitter, 10000);
      
      if (import.meta.env.DEV) {
        console.log(`[Supabase] Retry ${attempt + 1}/${MAX_RETRIES} after ${Math.round(delay)}ms`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeLocalStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use implicit flow for better compatibility with custom domains
    // PKCE can cause issues with some browsers on custom domains
    flowType: 'implicit',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "x-client-info": "nauti-one-v4",
    },
    fetch: customFetch,
  },
});

// Export URL for health checks
export const SUPABASE_PROJECT_URL = SUPABASE_URL;
