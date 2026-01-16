/**
 * API Configuration - PATCH 870
 * Optimized for slow connections (3G, LTE, 5G with latency)
 */

export const API_CONFIG = {
  // Timeout settings - Extended for slow networks
  timeout: 30000, // 30 seconds - realistic for 3G/LTE
  
  // Retry with exponential backoff
  maxRetries: 5,
  retryDelay: 1000, // 1s, 2s, 4s, 8s, 16s
  retryBackoff: 2,
  
  // Timeouts by request type
  requestTimeouts: {
    auth: 30000,        // Login must work
    peotram: 60000,     // AI may take longer
    upload: 120000,     // Slow upload on bad internet
    normal: 30000,      // Default
    critical: 45000,    // Critical operations
  },
  
  // Connection quality thresholds
  connectionThresholds: {
    slowDownlink: 1,    // Mbps - below this is "slow"
    slowRtt: 500,       // ms - above this is "slow"
    offlineRtt: 1000,   // ms - above this is "effectively offline"
  },
} as const;

export type RequestType = keyof typeof API_CONFIG.requestTimeouts;

/**
 * Get timeout based on request type and connection quality
 */
export function getAdaptiveTimeout(
  type: RequestType = 'normal',
  connectionQuality?: { downlink?: number; rtt?: number }
): number {
  const baseTimeout = API_CONFIG.requestTimeouts[type];
  
  // If connection is slow, increase timeout
  if (connectionQuality) {
    const isSlow = 
      (connectionQuality.downlink && connectionQuality.downlink < API_CONFIG.connectionThresholds.slowDownlink) ||
      (connectionQuality.rtt && connectionQuality.rtt > API_CONFIG.connectionThresholds.slowRtt);
    
    if (isSlow) {
      return Math.min(baseTimeout * 1.5, 120000);
    }
  }
  
  return baseTimeout;
}

/**
 * Fetch with automatic retry and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: {
    retries?: number;
    type?: RequestType;
    onRetry?: (attempt: number, delay: number) => void;
  } = {}
): Promise<Response> {
  const { retries = API_CONFIG.maxRetries, type = 'normal', onRetry } = config;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = getAdaptiveTimeout(type);
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Retry on server errors
      if (!response.ok && response.status >= 500 && attempt < retries) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort or client errors
      if (error.name === 'AbortError') {
        console.warn(`[API] Request timeout after ${getAdaptiveTimeout(type)}ms, attempt ${attempt + 1}`);
      }
      
      if (attempt < retries) {
        const delay = Math.min(
          API_CONFIG.retryDelay * Math.pow(API_CONFIG.retryBackoff, attempt),
          API_CONFIG.timeout
        );
        
        console.warn(`[API] Retry ${attempt + 1}/${retries} in ${delay}ms`);
        onRetry?.(attempt + 1, delay);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  
  return (
    name === 'aborterror' ||
    name === 'authretryablefetcherror' ||
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('load failed') ||
    message.includes('networkerror') ||
    message.includes('timeout') ||
    message.includes('aborted')
  );
}

/**
 * Get user-friendly error message
 */
export function getNetworkErrorMessage(error: any): string {
  if (!navigator.onLine) {
    return 'Você está offline. Verifique sua conexão.';
  }
  
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return 'Conexão lenta. Aguarde, tentando novamente...';
  }
  
  if (error?.message?.includes('Failed to fetch')) {
    return 'Erro de conexão. Verifique sua internet.';
  }
  
  return 'Erro de rede. Tente novamente.';
}
