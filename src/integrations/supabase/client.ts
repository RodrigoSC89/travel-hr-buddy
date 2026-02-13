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

// XHR-based fetch fallback - bypasses any fetch interceptors/proxies
const xhrFetch = (url: string, method: string, headers: Record<string, string>, body?: string): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.timeout = 60000; // 60s timeout for slow connections
    
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }
    
    xhr.onload = () => {
      const responseHeaders = new Headers();
      xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(line => {
        const parts = line.split(': ');
        if (parts.length === 2) responseHeaders.append(parts[0], parts[1]);
      });
      resolve(new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: responseHeaders,
      }));
    };
    
    xhr.onerror = () => reject(new Error('XHR network error'));
    xhr.ontimeout = () => reject(new Error('XHR timeout'));
    xhr.send(body || null);
  });
};

// Custom fetch with retry for maritime satellite connections
// Auth requests use XHR fallback to bypass fetch interceptors
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  const isAuthRequest = url.includes('/auth/v1/');
  
  if (isAuthRequest) {
    const { signal: _stripped, ...cleanInit } = init || {};
    const MAX_AUTH_RETRIES = 3;
    
    // Extract headers for XHR fallback
    const headers: Record<string, string> = {};
    if (cleanInit.headers) {
      if (cleanInit.headers instanceof Headers) {
        cleanInit.headers.forEach((v, k) => { headers[k] = v; });
      } else if (typeof cleanInit.headers === 'object') {
        Object.assign(headers, cleanInit.headers);
      }
    }
    const bodyStr = typeof cleanInit.body === 'string' ? cleanInit.body : undefined;
    const method = cleanInit.method || 'GET';
    
    for (let attempt = 0; attempt < MAX_AUTH_RETRIES; attempt++) {
      try {
        // First attempt: try native fetch (fast path)
        // Subsequent attempts: use XHR to bypass any fetch interceptors
        let response: Response;
        if (attempt === 0) {
          try {
            response = await fetch(input, cleanInit as RequestInit);
          } catch {
            // If native fetch fails immediately, try XHR
            // eslint-disable-next-line no-console
            console.log('[Auth] Native fetch failed, switching to XHR fallback');
            response = await xhrFetch(url, method, headers, bodyStr);
          }
        } else {
          // eslint-disable-next-line no-console
          console.log(`[Auth] Retry ${attempt} using XHR fallback`);
          response = await xhrFetch(url, method, headers, bodyStr);
        }
        
        if (response.status >= 500 && attempt < MAX_AUTH_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise(resolve => setTimeout(resolve, Math.min(delay, 10000)));
          continue;
        }
        
        return response;
      } catch (error) {
        if (attempt < MAX_AUTH_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1500 + Math.random() * 500;
          // eslint-disable-next-line no-console
          console.log(`[Auth] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max auth retries exceeded');
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
