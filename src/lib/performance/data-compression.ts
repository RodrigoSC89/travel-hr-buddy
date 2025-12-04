/**
 * PATCH 800: Data Compression & Optimization for Low Bandwidth
 * Utilities to compress and optimize data payloads
 */

import { logger } from "@/lib/logger";

/**
 * Compresses an object by removing null/undefined values
 */
export function compressObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const compressed: Partial<T> = {};
  
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "object" && !Array.isArray(value)) {
        const nested = compressObject(value);
        if (Object.keys(nested).length > 0) {
          compressed[key] = nested as T[typeof key];
        }
      } else if (Array.isArray(value) && value.length > 0) {
        compressed[key] = value;
      } else if (typeof value !== "object") {
        compressed[key] = value;
      }
    }
  }
  
  return compressed;
}

/**
 * Selects only specified fields from an object
 */
export function selectFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): Partial<T> {
  const selected: Partial<T> = {};
  for (const field of fields) {
    if (field in obj) {
      selected[field] = obj[field];
    }
  }
  return selected;
}

/**
 * Paginates data for incremental loading
 */
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): { items: T[]; hasMore: boolean; total: number } {
  const start = page * pageSize;
  const items = data.slice(start, start + pageSize);
  
  return {
    items,
    hasMore: start + pageSize < data.length,
    total: data.length,
  };
}

/**
 * Estimates the size of an object in bytes
 */
export function estimateSize(obj: any): number {
  const str = JSON.stringify(obj);
  return new Blob([str]).size;
}

/**
 * Logs data transfer sizes for monitoring
 */
export function logDataTransfer(
  operation: string,
  originalSize: number,
  compressedSize: number
): void {
  const savings = originalSize - compressedSize;
  const percentage = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : 0;
  
  logger.debug(`[DataCompression] ${operation}: ${originalSize}B → ${compressedSize}B (${percentage}% saved)`);
}

/**
 * Chunks large arrays for batch processing
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Debounces API calls with request deduplication
 */
export function createRequestDeduplicator<T>() {
  const pendingRequests = new Map<string, Promise<T>>();
  
  return async (
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const existing = pendingRequests.get(key);
    if (existing) {
      return existing;
    }
    
    const promise = requestFn().finally(() => {
      pendingRequests.delete(key);
    });
    
    pendingRequests.set(key, promise);
    return promise;
  };
}
