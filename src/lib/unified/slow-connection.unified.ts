/**
 * UNIFIED Slow Connection Optimizer
 * 
 * Consolida otimizações para conexões < 2 Mbps:
 * - Lazy loading automático
 * - Compressão de payload
 * - Cache inteligente
 * - Retry com backoff
 * - Feedback visual
 * - Delta sync
 * 
 * PATCH 178.2 - Internet Lenta Optimization Suite
 */

// ==================== CONNECTION QUALITY ====================

export type ConnectionQuality = "excellent" | "good" | "moderate" | "slow" | "offline";

export interface ConnectionMetrics {
  quality: ConnectionQuality;
  effectiveBandwidth: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  isOnline: boolean;
}

/**
 * Detect current connection quality
 */
export function detectConnectionQuality(): ConnectionMetrics {
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    return {
      quality: "offline",
      effectiveBandwidth: 0,
      rtt: Infinity,
      saveData: true,
      isOnline: false,
    };
  }
  
  if (!connection) {
    // Fallback for browsers without Network Information API
    return {
      quality: "moderate",
      effectiveBandwidth: 5,
      rtt: 100,
      saveData: false,
      isOnline: true,
    };
  }
  
  const downlink = connection.downlink || 10; // Mbps
  const rtt = connection.rtt || 100; // ms
  const saveData = connection.saveData || false;
  const effectiveType = connection.effectiveType || "4g";
  
  let quality: ConnectionQuality;
  
  if (effectiveType === "slow-2g" || effectiveType === "2g" || downlink < 0.5) {
    quality = "slow";
  } else if (effectiveType === "3g" || downlink < 2) {
    quality = "moderate";
  } else if (downlink < 10) {
    quality = "good";
  } else {
    quality = "excellent";
  }
  
  return {
    quality,
    effectiveBandwidth: downlink,
    rtt,
    saveData,
    isOnline: true,
  };
}

// ==================== ADAPTIVE FETCH ====================

export interface AdaptiveFetchOptions extends Omit<RequestInit, "cache"> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  compress?: boolean;
  priority?: "high" | "low" | "auto";
  cacheStrategy?: "force" | "prefer" | "network";
}

const DEFAULT_OPTIONS: AdaptiveFetchOptions = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  compress: true,
  priority: "auto",
  cacheStrategy: "prefer",
};

/**
 * Adaptive fetch that adjusts based on connection quality
 */
export async function adaptiveFetch(
  url: string,
  options: AdaptiveFetchOptions = {}
): Promise<Response> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const connection = detectConnectionQuality();
  
  // Adjust timeout based on connection
  let timeout = mergedOptions.timeout!;
  if (connection.quality === "slow") {
    timeout *= 3; // Triple timeout for slow connections
  } else if (connection.quality === "moderate") {
    timeout *= 1.5;
  }
  
  // Adjust retry delay based on connection
  let retryDelay = mergedOptions.retryDelay!;
  if (connection.quality === "slow") {
    retryDelay *= 2;
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= mergedOptions.retries!; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const headers = new Headers(options.headers);
      
      // Add compression hint
      if (mergedOptions.compress) {
        headers.set("Accept-Encoding", "gzip, deflate, br");
      }
      
      // Add save-data hint
      if (connection.saveData || connection.quality === "slow") {
        headers.set("Save-Data", "on");
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < mergedOptions.retries!) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }
  
  throw lastError || new Error("Fetch failed after retries");
}

// ==================== PAYLOAD OPTIMIZATION ====================

/**
 * Compress JSON payload for slow connections
 */
export function compressPayload<T>(data: T): string {
  const json = JSON.stringify(data);
  
  // Simple compression: remove whitespace and shorten keys
  // For real compression, use pako/gzip on the server side
  return json
    .replace(/\s+/g, "")
    .replace(/"(\w+)":/g, (_, key) => `"${key.substring(0, 3)}":`)
    .replace(/null/g, "0")
    .replace(/false/g, "0")
    .replace(/true/g, "1");
}

/**
 * Paginate data for slow connections
 */
export function paginateForSlowConnection<T>(
  data: T[],
  pageSize: number = 10
): { pages: T[][]; total: number; pageCount: number } {
  const connection = detectConnectionQuality();
  
  // Reduce page size for slow connections
  let effectivePageSize = pageSize;
  if (connection.quality === "slow") {
    effectivePageSize = Math.max(5, Math.floor(pageSize / 3));
  } else if (connection.quality === "moderate") {
    effectivePageSize = Math.max(5, Math.floor(pageSize / 2));
  }
  
  const pages: T[][] = [];
  for (let i = 0; i < data.length; i += effectivePageSize) {
    pages.push(data.slice(i, i + effectivePageSize));
  }
  
  return {
    pages,
    total: data.length,
    pageCount: pages.length,
  };
}

// ==================== IMAGE OPTIMIZATION ====================

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  lazy?: boolean;
}

/**
 * Get optimized image URL based on connection
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const connection = detectConnectionQuality();
  
  let maxWidth = options.maxWidth || 1920;
  let quality = options.quality || 80;
  
  // Reduce quality and size for slow connections
  if (connection.quality === "slow") {
    maxWidth = Math.min(maxWidth, 480);
    quality = 40;
  } else if (connection.quality === "moderate") {
    maxWidth = Math.min(maxWidth, 800);
    quality = 60;
  } else if (connection.saveData) {
    maxWidth = Math.min(maxWidth, 640);
    quality = 50;
  }
  
  // If using a CDN that supports transformations
  if (originalUrl.includes("supabase")) {
    const url = new URL(originalUrl);
    url.searchParams.set("width", String(maxWidth));
    url.searchParams.set("quality", String(quality));
    return url.toString();
  }
  
  // Return original if no transformation available
  return originalUrl;
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(urls: string[]): void {
  const connection = detectConnectionQuality();
  
  // Skip preloading on slow connections
  if (connection.quality === "slow" || connection.quality === "offline") {
    return;
  }
  
  // Limit preloads on moderate connections
  const maxPreloads = connection.quality === "moderate" ? 3 : 10;
  
  urls.slice(0, maxPreloads).forEach(url => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = getOptimizedImageUrl(url);
    document.head.appendChild(link);
  });
}

// ==================== CACHE STRATEGIES ====================

const CACHE_PREFIX = "nautilus_slow_conn_";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

/**
 * Get cached data with TTL support
 */
export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    
    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Set cached data with adaptive TTL
 */
export function setCached<T>(
  key: string,
  data: T,
  ttlMs: number = 5 * 60 * 1000, // 5 minutes default
  version: string = "1.0"
): void {
  const connection = detectConnectionQuality();
  
  // Increase TTL for slow connections
  let effectiveTtl = ttlMs;
  if (connection.quality === "slow") {
    effectiveTtl *= 4; // 4x longer cache for slow connections
  } else if (connection.quality === "moderate") {
    effectiveTtl *= 2;
  }
  
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl: effectiveTtl,
    version,
  };
  
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    // Handle quota exceeded
    clearOldCache();
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Silently fail if still can't store
    }
  }
}

/**
 * Clear old cache entries
 */
export function clearOldCache(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entry = JSON.parse(raw);
          if (Date.now() - entry.timestamp > entry.ttl) {
            keysToRemove.push(key);
          }
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ==================== LOADING STATE HELPERS ====================

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  estimatedTime: number | null;
}

/**
 * Calculate estimated time based on connection and data size
 */
export function estimateLoadTime(
  dataSizeKb: number,
  connection?: ConnectionMetrics
): number {
  const conn = connection || detectConnectionQuality();
  
  // Convert bandwidth from Mbps to KBps (multiply by 125)
  const bandwidthKbps = conn.effectiveBandwidth * 125;
  
  // Add RTT and processing overhead
  const transferTime = dataSizeKb / bandwidthKbps;
  const overhead = conn.rtt / 1000 * 2; // Round trip for request/response
  
  return Math.ceil((transferTime + overhead) * 1000); // Return in ms
}

/**
 * Get user-friendly loading message based on connection
 */
export function getLoadingMessage(connection?: ConnectionMetrics): string {
  const conn = connection || detectConnectionQuality();
  
  switch (conn.quality) {
  case "offline":
    return "Sem conexão. Usando dados em cache...";
  case "slow":
    return "Conexão lenta detectada. Carregando de forma otimizada...";
  case "moderate":
    return "Carregando...";
  default:
    return "Carregando...";
  }
}

// ==================== REACT HOOKS ====================

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for connection-aware data fetching
 */
export function useSlowConnectionFetch<T>(
  fetchFn: () => Promise<T>,
  cacheKey?: string,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connection, setConnection] = useState(detectConnectionQuality);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Check cache first for slow connections
    if (cacheKey && connection.quality === "slow") {
      const cached = getCached<T>(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        
        // Refresh in background
        fetchFn().then(fresh => {
          setData(fresh);
          setCached(cacheKey, fresh);
        }).catch(() => {
          // Silently fail, we have cached data
        });
        
        return;
      }
    }
    
    try {
      const result = await fetchFn();
      setData(result);
      
      if (cacheKey) {
        setCached(cacheKey, result);
      }
    } catch (e) {
      setError(e as Error);
      
      // Try cache as fallback
      if (cacheKey) {
        const cached = getCached<T>(cacheKey);
        if (cached) {
          setData(cached);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey, connection.quality, ...deps]);
  
  useEffect(() => {
    fetchData();
    
    // Listen for connection changes
    const conn = (navigator as any).connection;
    if (conn) {
      const handleChange = () => setConnection(detectConnectionQuality());
      conn.addEventListener("change", handleChange);
      return () => conn.removeEventListener("change", handleChange);
    }
  }, [fetchData]);
  
  return { data, loading, error, connection, refetch: fetchData };
}

/**
 * Hook for connection quality monitoring
 */
export function useConnectionQuality() {
  const [metrics, setMetrics] = useState(detectConnectionQuality);
  
  useEffect(() => {
    const updateMetrics = () => setMetrics(detectConnectionQuality());
    
    // Check periodically
    const interval = setInterval(updateMetrics, 10000);
    
    // Listen for online/offline events
    window.addEventListener("online", updateMetrics);
    window.addEventListener("offline", updateMetrics);
    
    // Listen for connection changes
    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener("change", updateMetrics);
    }
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateMetrics);
      window.removeEventListener("offline", updateMetrics);
      if (conn) {
        conn.removeEventListener("change", updateMetrics);
      }
    };
  }, []);
  
  return metrics;
}

/**
 * Hook for adaptive polling based on connection
 */
export function useAdaptivePolling<T>(
  fetchFn: () => Promise<T>,
  baseIntervalMs: number = 30000
) {
  const [data, setData] = useState<T | null>(null);
  const connection = useConnectionQuality();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Calculate interval based on connection
    let interval = baseIntervalMs;
    
    switch (connection.quality) {
    case "offline":
      interval = Infinity; // Don't poll when offline
      break;
    case "slow":
      interval = baseIntervalMs * 4; // Poll less frequently
      break;
    case "moderate":
      interval = baseIntervalMs * 2;
      break;
    }
    
    if (interval === Infinity) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
      } catch {
        // Silently fail, will retry on next interval
      }
    };
    
    // Initial fetch
    poll();
    
    // Set up interval
    intervalRef.current = setInterval(poll, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFn, baseIntervalMs, connection.quality]);
  
  return { data, connection };
}

// ==================== EXPORTS ====================

export default {
  detectConnectionQuality,
  adaptiveFetch,
  compressPayload,
  paginateForSlowConnection,
  getOptimizedImageUrl,
  preloadCriticalImages,
  getCached,
  setCached,
  clearOldCache,
  estimateLoadTime,
  getLoadingMessage,
  useSlowConnectionFetch,
  useConnectionQuality,
  useAdaptivePolling,
};
