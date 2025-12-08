/**
 * PATCH 180.0 - Resilient Fetch for Slow Networks
 * Network-aware fetch with retry, timeout, and fallback strategies
 */

import { logger } from "@/lib/logger";

// ===== Types =====

export interface FetchOptions extends Omit<RequestInit, "priority"> {
  /** Maximum number of retry attempts */
  retries?: number;
  /** Base delay between retries (exponential backoff) */
  retryDelay?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Show loading state while fetching */
  showLoading?: boolean;
  /** Cache key for storing response */
  cacheKey?: string;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Fallback data if all retries fail */
  fallbackData?: unknown;
  /** Custom priority: 'high' for critical requests, 'low' for deferrable */
  fetchPriority?: "high" | "normal" | "low";
}

export interface FetchResult<T> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
  attempts: number;
  duration: number;
}

// ===== Constants =====

const DEFAULT_OPTIONS: Required<Pick<FetchOptions, 
  "retries" | "retryDelay" | "timeout" | "fetchPriority"
>> = {
  retries: 3,
  retryDelay: 1000,
  timeout: 30000, // 30s default for slow networks
  fetchPriority: "normal",
};

// Adjust timeouts based on connection quality
const TIMEOUT_BY_CONNECTION: Record<string, number> = {
  "4g": 10000,
  "3g": 20000,
  "2g": 45000,
  "slow-2g": 60000,
  unknown: 30000,
};

// Simple in-memory cache
const responseCache = new Map<string, { data: unknown; expires: number }>();

// ===== Utilities =====

/**
 * Get effective connection type
 */
function getConnectionType(): string {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  };
  
  return nav.connection?.effectiveType || "unknown";
}

/**
 * Get adaptive timeout based on connection
 */
function getAdaptiveTimeout(baseTimeout?: number): number {
  const connection = getConnectionType();
  const adaptiveTimeout = TIMEOUT_BY_CONNECTION[connection] || TIMEOUT_BY_CONNECTION.unknown;
  
  return baseTimeout || adaptiveTimeout;
}

/**
 * Check if request should be deferred (low priority + slow connection)
 */
function shouldDeferRequest(fetchPriority: "high" | "normal" | "low"): boolean {
  if (fetchPriority === "high") return false;
  
  const connection = getConnectionType();
  const isSlowConnection = ["2g", "slow-2g"].includes(connection);
  
  return fetchPriority === "low" && isSlowConnection;
}

/**
 * Sleep utility
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get cached data if valid
 */
function getCachedData<T>(key: string): T | null {
  const cached = responseCache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  
  if (cached) {
    responseCache.delete(key);
  }
  
  return null;
}

/**
 * Store data in cache
 */
function setCachedData(key: string, data: unknown, duration: number): void {
  responseCache.set(key, {
    data,
    expires: Date.now() + duration,
  });
}

// ===== Main Fetch Function =====

/**
 * Resilient fetch with retry, timeout, and caching
 */
export async function resilientFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const startTime = Date.now();
  const {
    retries = DEFAULT_OPTIONS.retries,
    retryDelay = DEFAULT_OPTIONS.retryDelay,
    timeout = getAdaptiveTimeout(options.timeout),
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    fallbackData,
    fetchPriority = DEFAULT_OPTIONS.fetchPriority,
    ...fetchOptions
  } = options;

  let attempts = 0;
  let lastError: Error | null = null;

  // Check cache first
  if (cacheKey) {
    const cached = getCachedData<T>(cacheKey);
    if (cached) {
      logger.debug("[ResilientFetch] Cache hit", { url, cacheKey });
      return {
        data: cached,
        error: null,
        fromCache: true,
        attempts: 0,
        duration: Date.now() - startTime,
      };
    }
  }

  // Defer low priority requests on slow connections
  if (shouldDeferRequest(fetchPriority)) {
    logger.debug("[ResilientFetch] Deferring low priority request", { url, fetchPriority });
    await sleep(2000); // Wait 2s before low priority requests
  }

  // Retry loop
  while (attempts <= retries) {
    attempts++;
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as T;

      // Cache successful response
      if (cacheKey) {
        setCachedData(cacheKey, data, cacheDuration);
      }

      logger.debug("[ResilientFetch] Success", { 
        url, 
        attempts, 
        duration: Date.now() - startTime 
      });

      return {
        data,
        error: null,
        fromCache: false,
        attempts,
        duration: Date.now() - startTime,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const isTimeout = lastError.name === "AbortError";
      const isNetworkError = lastError.message.includes("Failed to fetch") || 
                            lastError.message.includes("NetworkError");

      logger.warn("[ResilientFetch] Attempt failed", {
        url,
        attempt: attempts,
        maxRetries: retries,
        error: lastError.message,
        isTimeout,
        isNetworkError,
      });

      // Don't retry on 4xx errors (client errors)
      if (lastError.message.includes("HTTP 4")) {
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempts <= retries) {
        const delay = retryDelay * Math.pow(2, attempts - 1);
        await sleep(Math.min(delay, 30000)); // Max 30s delay
      }
    }
  }

  // All retries failed - return fallback or error
  logger.error("[ResilientFetch] All attempts failed", {
    url,
    attempts,
    error: lastError?.message,
  });

  if (fallbackData !== undefined) {
    return {
      data: fallbackData as T,
      error: lastError,
      fromCache: false,
      attempts,
      duration: Date.now() - startTime,
    };
  }

  return {
    data: null,
    error: lastError,
    fromCache: false,
    attempts,
    duration: Date.now() - startTime,
  };
}

// ===== Specialized Fetch Functions =====

/**
 * GET request with resilience
 */
export async function resilientGet<T>(
  url: string,
  options: Omit<FetchOptions, "method" | "body"> = {}
): Promise<FetchResult<T>> {
  return resilientFetch<T>(url, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request with resilience
 */
export async function resilientPost<T>(
  url: string,
  body: unknown,
  options: Omit<FetchOptions, "method" | "body"> = {}
): Promise<FetchResult<T>> {
  return resilientFetch<T>(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Batch multiple requests with concurrency control
 */
export async function batchFetch<T>(
  urls: string[],
  options: FetchOptions = {},
  concurrency: number = 2 // Low concurrency for slow networks
): Promise<FetchResult<T>[]> {
  const results: FetchResult<T>[] = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(url => resilientFetch<T>(url, options))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// ===== Cache Management =====

/**
 * Clear all cached responses
 */
export function clearFetchCache(): void {
  responseCache.clear();
  logger.info("[ResilientFetch] Cache cleared");
}

/**
 * Get cache statistics
 */
export function getFetchCacheStats(): { size: number; keys: string[] } {
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys()),
  };
}

/**
 * Preload critical endpoints
 */
export async function preloadEndpoints(
  endpoints: { url: string; cacheKey: string }[]
): Promise<void> {
  logger.info("[ResilientFetch] Preloading endpoints", { count: endpoints.length });
  
  for (const { url, cacheKey } of endpoints) {
    await resilientFetch(url, {
      cacheKey,
      fetchPriority: "low",
      retries: 1,
    });
  }
}
