/**
 * Advanced Data Compressor - PATCH 835
 * Compress/decompress data for low bandwidth networks
 */

import { bandwidthOptimizer } from './low-bandwidth-optimizer';

// LZ-based compression (simplified, browser-compatible)
const DICTIONARY_SIZE = 4096;

/**
 * Compress string using LZ-style compression
 */
export function compressLZ(input: string): string {
  if (!input || input.length < 100) return input;
  
  const dict: Record<string, number> = {};
  let dictSize = 256;
  let w = '';
  const result: number[] = [];
  
  // Initialize dictionary with single chars
  for (let i = 0; i < 256; i++) {
    dict[String.fromCharCode(i)] = i;
  }
  
  for (const c of input) {
    const wc = w + c;
    if (dict[wc] !== undefined) {
      w = wc;
    } else {
      result.push(dict[w]);
      if (dictSize < DICTIONARY_SIZE) {
        dict[wc] = dictSize++;
      }
      w = c;
    }
  }
  
  if (w) {
    result.push(dict[w]);
  }
  
  // Convert to base64-like string
  return result.map(n => String.fromCharCode(n + 0x100)).join('');
}

/**
 * Decompress LZ-compressed string
 */
export function decompressLZ(compressed: string): string {
  if (!compressed) return '';
  
  // Check if actually compressed
  if (!compressed.startsWith(String.fromCharCode(0x100))) {
    return compressed;
  }
  
  const dict: string[] = [];
  let dictSize = 256;
  
  // Initialize dictionary
  for (let i = 0; i < 256; i++) {
    dict[i] = String.fromCharCode(i);
  }
  
  const data = compressed.split('').map(c => c.charCodeAt(0) - 0x100);
  let w = String.fromCharCode(data[0]);
  let result = w;
  
  for (let i = 1; i < data.length; i++) {
    const k = data[i];
    let entry: string;
    
    if (dict[k] !== undefined) {
      entry = dict[k];
    } else if (k === dictSize) {
      entry = w + w[0];
    } else {
      throw new Error('Invalid compressed data');
    }
    
    result += entry;
    
    if (dictSize < DICTIONARY_SIZE) {
      dict[dictSize++] = w + entry[0];
    }
    
    w = entry;
  }
  
  return result;
}

/**
 * Compress JSON with field filtering
 */
export function compressJSON<T extends Record<string, unknown>>(
  data: T | T[],
  options?: {
    fields?: (keyof T)[];
    removeNulls?: boolean;
    shortenKeys?: boolean;
  }
): string {
  const { fields, removeNulls = true, shortenKeys = false } = options || {};
  
  const process = (obj: T): Partial<T> => {
    const result: Partial<T> = {};
    const keys = fields || (Object.keys(obj) as (keyof T)[]);
    
    for (const key of keys) {
      const value = obj[key];
      
      // Skip nulls/undefined if requested
      if (removeNulls && (value === null || value === undefined)) {
        continue;
      }
      
      result[key] = value;
    }
    
    return result;
  };
  
  const processed = Array.isArray(data) ? data.map(process) : process(data);
  const json = JSON.stringify(processed);
  
  // Only compress if beneficial
  if (json.length < 200) return json;
  
  const compressed = compressLZ(json);
  return compressed.length < json.length ? `__LZ__${compressed}` : json;
}

/**
 * Decompress JSON
 */
export function decompressJSON<T>(compressed: string): T {
  if (compressed.startsWith('__LZ__')) {
    const decompressed = decompressLZ(compressed.slice(6));
    return JSON.parse(decompressed);
  }
  return JSON.parse(compressed);
}

/**
 * Smart data reducer for API responses
 */
export function reducePayload<T extends Record<string, unknown>>(
  data: T[],
  options?: {
    maxItems?: number;
    priorityField?: keyof T;
    essentialFields?: (keyof T)[];
  }
): T[] {
  const config = bandwidthOptimizer.getConfig();
  const { 
    maxItems = config.batchSize, 
    priorityField,
    essentialFields 
  } = options || {};
  
  // Limit items
  let result = data.slice(0, maxItems);
  
  // Sort by priority if specified
  if (priorityField && result.length > 0) {
    result = result.sort((a, b) => {
      const aVal = a[priorityField];
      const bVal = b[priorityField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return bVal - aVal;
      }
      return 0;
    });
  }
  
  // Filter fields for slow connections
  if (config.imageQuality < 50 && essentialFields) {
    result = result.map(item => {
      const filtered: Partial<T> = {};
      for (const field of essentialFields) {
        if (item[field] !== undefined) {
          filtered[field] = item[field];
        }
      }
      return filtered as T;
    });
  }
  
  return result;
}

/**
 * Calculate data transfer savings
 */
export function calculateSavings(original: string, compressed: string): {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
} {
  const originalSize = new Blob([original]).size;
  const compressedSize = new Blob([compressed]).size;
  const savedBytes = originalSize - compressedSize;
  const savedPercent = Math.round((savedBytes / originalSize) * 100);
  
  return { originalSize, compressedSize, savedBytes, savedPercent };
}

/**
 * Estimate transfer time at 2 Mbps
 */
export function estimateTransferTime(bytes: number): number {
  const bitsPerSecond = 2 * 1024 * 1024; // 2 Mbps
  const bytesPerSecond = bitsPerSecond / 8;
  return Math.ceil((bytes / bytesPerSecond) * 1000); // ms
}

/**
 * Hook for compressed data fetching
 */
export function useCompressedFetch() {
  const fetchCompressed = async <T>(
    url: string,
    options?: RequestInit & { 
      compress?: boolean;
      fields?: string[];
    }
  ): Promise<T> => {
    const { compress = true, fields, ...fetchOptions } = options || {};
    
    const headers = new Headers(fetchOptions.headers);
    if (compress) {
      headers.set('Accept-Encoding', 'gzip, deflate');
    }
    
    // Add field selection header if supported
    if (fields?.length) {
      headers.set('X-Fields', fields.join(','));
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    return decompressJSON<T>(text);
  };
  
  return { fetchCompressed };
}
