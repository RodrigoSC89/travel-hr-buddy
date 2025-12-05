/**
 * Payload Compression - PATCH 900
 * Efficient compression for low-bandwidth sync
 */

import { logger } from '@/lib/logger';

/**
 * LZ-String-like compression for JSON data
 * Optimized for text/JSON payloads
 */

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const UINT6_TO_B64: string[] = [];
const B64_TO_UINT6: Record<string, number> = {};

for (let i = 0; i < 64; i++) {
  UINT6_TO_B64[i] = BASE64_CHARS[i];
  B64_TO_UINT6[BASE64_CHARS[i]] = i;
}

export interface CompressedPayload {
  v: number; // version
  c: boolean; // compressed
  cs: string; // checksum
  d: string; // data
  os: number; // original size
  ds: number; // compressed size
}

/**
 * Compress a string using LZ-based compression
 */
export function compressString(input: string): string {
  if (!input || input.length === 0) return '';
  
  const dict: Map<string, number> = new Map();
  const result: number[] = [];
  let dictSize = 256;
  
  // Initialize dictionary with single characters
  for (let i = 0; i < 256; i++) {
    dict.set(String.fromCharCode(i), i);
  }
  
  let current = '';
  
  for (const char of input) {
    const combined = current + char;
    
    if (dict.has(combined)) {
      current = combined;
    } else {
      result.push(dict.get(current)!);
      dict.set(combined, dictSize++);
      current = char;
    }
  }
  
  if (current) {
    result.push(dict.get(current)!);
  }
  
  // Convert to base64-like string
  return result.map(code => {
    if (code < 64) return UINT6_TO_B64[code];
    if (code < 4096) return UINT6_TO_B64[code >> 6] + UINT6_TO_B64[code & 63];
    return UINT6_TO_B64[code >> 12] + UINT6_TO_B64[(code >> 6) & 63] + UINT6_TO_B64[code & 63];
  }).join('');
}

/**
 * Decompress a string
 */
export function decompressString(compressed: string): string {
  if (!compressed || compressed.length === 0) return '';
  
  try {
    // Decode base64-like to codes
    const codes: number[] = [];
    let i = 0;
    
    while (i < compressed.length) {
      const c1 = B64_TO_UINT6[compressed[i++]];
      if (c1 === undefined) break;
      
      if (i >= compressed.length || B64_TO_UINT6[compressed[i]] === undefined) {
        codes.push(c1);
        continue;
      }
      
      const c2 = B64_TO_UINT6[compressed[i++]];
      const combined = (c1 << 6) | c2;
      
      if (combined < 256) {
        codes.push(c1);
        codes.push(c2);
      } else if (i < compressed.length && B64_TO_UINT6[compressed[i]] !== undefined) {
        const c3 = B64_TO_UINT6[compressed[i++]];
        codes.push((c1 << 12) | (c2 << 6) | c3);
      } else {
        codes.push(combined);
      }
    }
    
    // LZ decompress
    const dict: string[] = [];
    for (let j = 0; j < 256; j++) {
      dict[j] = String.fromCharCode(j);
    }
    
    let current = String.fromCharCode(codes[0]);
    let result = current;
    
    for (let j = 1; j < codes.length; j++) {
      const code = codes[j];
      let entry: string;
      
      if (dict[code]) {
        entry = dict[code];
      } else if (code === dict.length) {
        entry = current + current[0];
      } else {
        throw new Error('Invalid compressed data');
      }
      
      result += entry;
      dict.push(current + entry[0]);
      current = entry;
    }
    
    return result;
  } catch (error) {
    logger.error('[Compression] Decompression failed', { error });
    return compressed; // Return original on failure
  }
}

/**
 * Generate simple checksum for data integrity
 */
export function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Verify checksum
 */
export function verifyChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

/**
 * Compress JSON payload for transmission
 */
export function compressPayload<T>(data: T): CompressedPayload {
  const jsonString = JSON.stringify(data);
  const originalSize = new Blob([jsonString]).size;
  
  // Only compress if data is large enough
  if (originalSize < 500) {
    return {
      v: 1,
      c: false,
      cs: generateChecksum(jsonString),
      d: jsonString,
      os: originalSize,
      ds: originalSize,
    };
  }
  
  const compressed = compressString(jsonString);
  const compressedSize = new Blob([compressed]).size;
  
  // Only use compression if it actually reduces size
  if (compressedSize >= originalSize) {
    return {
      v: 1,
      c: false,
      cs: generateChecksum(jsonString),
      d: jsonString,
      os: originalSize,
      ds: originalSize,
    };
  }
  
  logger.debug('[Compression] Payload compressed', {
    original: originalSize,
    compressed: compressedSize,
    ratio: ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%',
  });
  
  return {
    v: 1,
    c: true,
    cs: generateChecksum(jsonString),
    d: compressed,
    os: originalSize,
    ds: compressedSize,
  };
}

/**
 * Decompress payload
 */
export function decompressPayload<T>(payload: CompressedPayload): T | null {
  try {
    const jsonString = payload.c ? decompressString(payload.d) : payload.d;
    
    // Verify integrity
    if (!verifyChecksum(jsonString, payload.cs)) {
      logger.error('[Compression] Checksum verification failed');
      return null;
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.error('[Compression] Decompression failed', { error });
    return null;
  }
}

/**
 * Calculate compression stats
 */
export function getCompressionStats(payload: CompressedPayload): {
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  savings: string;
} {
  const ratio = payload.c ? payload.ds / payload.os : 1;
  const savings = ((1 - ratio) * 100).toFixed(1);
  
  return {
    compressed: payload.c,
    originalSize: payload.os,
    compressedSize: payload.ds,
    ratio,
    savings: savings + '%',
  };
}

/**
 * Batch compress multiple payloads
 */
export function compressBatch<T>(items: T[]): CompressedPayload {
  return compressPayload(items);
}

/**
 * Estimate if compression would help
 */
export function shouldCompress(data: unknown): boolean {
  const jsonString = JSON.stringify(data);
  const size = new Blob([jsonString]).size;
  
  // Compress if > 500 bytes and likely to benefit
  // JSON with repeated keys typically compresses well
  return size > 500;
}
