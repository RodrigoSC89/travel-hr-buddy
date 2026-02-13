/**
 * Supabase Client - PATCH v27 Production Fix
 * Otimizado para conexões marítimas/satélite com retry robusto
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Hardcoded values - NEVER use env vars in production code
const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

// Flag to track storage warning (avoid spam)
let storageWarningLogged = false;

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
    // Only log once to avoid spam
    if (!storageWarningLogged && typeof window !== "undefined") {
      storageWarningLogged = true;
      // Use native console.warn here since logger might not be available yet
      // eslint-disable-next-line no-console
      console.warn("localStorage is not available, using in-memory storage fallback");
    }
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
// CRITICAL: Auth requests use native fetch to prevent AbortController from killing login
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  
  // Auth requests: use generous timeout (30s) but still have one
  // Without timeout, broken connections hang for 75+ seconds
  const isAuthRequest = url.includes('/auth/v1/');
  
  if (isAuthRequest) {
    const controller = new AbortController();
    const authTimeout = setTimeout(() => controller.abort(), 30000);
    const { signal: _stripped, ...cleanInit } = init || {};
    try {
      const response = await fetch(input, { ...cleanInit, signal: controller.signal } as RequestInit);
      clearTimeout(authTimeout);
      return response;
    } catch (error) {
      clearTimeout(authTimeout);
      throw error;
    }
  }
  
  // Non-auth requests: use retry with conservative timeouts
  const MAX_RETRIES = 2;
  const slow = isSlowConnection();
  
  const getTimeout = (attempt: number) => {
    const base = slow ? 15000 : 10000;
    return base + (attempt * (slow ? 10000 : 5000));
  };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = getTimeout(attempt);
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
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
      
      if (externalSignal?.aborted) {
        throw error;
      }
      
      const isAborted = (error as Error).name === 'AbortError';
      const errorMessage = (error as Error).message || '';
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Load failed') ||
        errorMessage.includes('The Internet connection appears to be offline');
      
      const isRetryable = isAborted || isNetworkError;
      
      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        throw error;
      }
      
      // Simple backoff: 2s, 4s
      const delay = 2000 * (attempt + 1) + Math.random() * 500;
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
