/**
 * API Configuration - PATCH 854
 * Optimized for slow connections (3G, LTE, 5G with latency)
 */

export const API_CONFIG = {
  // Base timeout - 30 seconds for slow connections
  timeout: 30000,
  
  // Retry with exponential backoff
  maxRetries: 5,
  retryDelay: 1000, // 1s, 2s, 4s, 8s, 16s
  retryBackoff: 2,
  
  // Timeouts by request type
  requestTimeouts: {
    auth: 30000,        // Auth needs to work reliably
    peotram: 60000,     // AI processing takes longer
    upload: 120000,     // Slow upload on bad connection
    download: 60000,    // Large file downloads
    normal: 30000,      // Default
    quick: 15000,       // Quick health checks
  },
  
  // Connection quality thresholds
  connectionThresholds: {
    slow2g: { timeout: 60000, retries: 7 },
    '2g': { timeout: 45000, retries: 6 },
    '3g': { timeout: 30000, retries: 5 },
    '4g': { timeout: 20000, retries: 3 },
    fast: { timeout: 15000, retries: 2 },
  },
} as const;

/**
 * Get connection-aware configuration
 */
export function getConnectionConfig() {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    const effectiveType = conn?.effectiveType || '4g';
    const saveData = conn?.saveData || false;
    
    if (saveData || effectiveType === 'slow-2g') {
      return API_CONFIG.connectionThresholds.slow2g;
    }
    if (effectiveType === '2g') {
      return API_CONFIG.connectionThresholds['2g'];
    }
    if (effectiveType === '3g') {
      return API_CONFIG.connectionThresholds['3g'];
    }
    if (effectiveType === '4g') {
      return API_CONFIG.connectionThresholds['4g'];
    }
  }
  return API_CONFIG.connectionThresholds['3g']; // Conservative default
}

/**
 * Fetch with retry and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  customRetries?: number
): Promise<Response> {
  const config = getConnectionConfig();
  const maxRetries = customRetries ?? config.retries;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Success - return response
      if (response.ok) {
        return response;
      }
      
      // Server error - might be temporary, retry
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[API] Server error ${response.status}, retry ${attempt + 1}/${maxRetries}`);
        const delay = API_CONFIG.retryDelay * Math.pow(API_CONFIG.retryBackoff, attempt);
        await sleep(delay);
        continue;
      }
      
      // Client error or final attempt - return as is
      return response;
      
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort (intentional cancellation)
      if (error.name === 'AbortError' && attempt === maxRetries) {
        throw new Error('Conexão expirou. Verifique sua internet e tente novamente.');
      }
      
      // Network error - retry if attempts remain
      if (attempt < maxRetries) {
        const delay = API_CONFIG.retryDelay * Math.pow(API_CONFIG.retryBackoff, attempt);
        console.warn(`[API] Retry ${attempt + 1}/${maxRetries} after ${delay}ms - ${error.message}`);
        await sleep(delay);
        continue;
      }
    }
  }
  
  // All retries exhausted
  throw lastError || new Error('Falha na conexão após múltiplas tentativas');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Get connection quality info
 */
export function getConnectionQuality(): {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} {
  const defaultInfo = {
    type: 'unknown',
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  };
  
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return {
      type: conn?.type || 'unknown',
      effectiveType: conn?.effectiveType || '4g',
      downlink: conn?.downlink || 10,
      rtt: conn?.rtt || 100,
      saveData: conn?.saveData || false,
    };
  }
  
  return defaultInfo;
}
