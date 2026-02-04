/**
 * NAUTI ONE - Bandwidth Optimizations
 * Otimizações para conexões lentas marítimas (0.5-2 Mbps)
 */

// ===================================================================
// 1. IMAGE COMPRESSION & OPTIMIZATION
// ===================================================================

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Compress and resize an image for bandwidth optimization
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.7,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        const mimeType = `image/${format}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(
                `📷 Image optimized: ${file.size} → ${blob.size} bytes (${Math.round((1 - blob.size / file.size) * 100)}% reduction)`
              );
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target!.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail for preview
 */
export async function generateThumbnail(
  file: File,
  size: number = 150
): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.6,
    format: 'jpeg',
  });
}

// ===================================================================
// 2. REQUEST BATCHING
// ===================================================================

interface BatchRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

class RequestBatcher {
  private queue: BatchRequest[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly maxBatchSize = 10;
  private readonly batchDelay = 100; // ms

  async add<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        method,
        path,
        body,
        resolve: resolve as (value: unknown) => void,
        reject,
      };

      this.queue.push(request);

      // Execute immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        this.executeBatch();
      } else {
        // Otherwise, wait for more requests
        this.scheduleBatch();
      }
    });
  }

  private scheduleBatch() {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      this.batchTimeout = null;
      this.executeBatch();
    }, this.batchDelay);
  }

  private async executeBatch() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    console.log(`📦 Executing batch of ${batch.length} requests`);

    try {
      // In a real implementation, this would send all requests as a single payload
      // For now, execute them individually but concurrently
      const results = await Promise.allSettled(
        batch.map(async (req) => {
          const response = await fetch(req.path, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body: req.body ? JSON.stringify(req.body) : undefined,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return response.json();
        })
      );

      // Resolve/reject individual promises
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(new Error(result.reason));
        }
      });
    } catch (error) {
      // Reject all if batch fails
      batch.forEach((req) => {
        req.reject(error instanceof Error ? error : new Error(String(error)));
      });
    }
  }
}

export const requestBatcher = new RequestBatcher();

// ===================================================================
// 3. DEBOUNCED OPERATIONS
// ===================================================================

type AnyFunction = (...args: unknown[]) => unknown;

export function debounce<T extends AnyFunction>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

export function throttle<T extends AnyFunction>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ===================================================================
// 4. PAYLOAD COMPRESSION
// ===================================================================

/**
 * Compress JSON payload by removing null/undefined values
 */
export function compressPayload<T extends Record<string, unknown>>(data: T): Partial<T> {
  const compressed: Partial<T> = {};

  for (const key of Object.keys(data) as (keyof T)[]) {
    const value = data[key];

    // Skip null, undefined, and empty strings
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // Recursively compress nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      compressed[key] = compressPayload(value as Record<string, unknown>) as T[keyof T];
    } else {
      compressed[key] = value;
    }
  }

  return compressed;
}

/**
 * Calculate approximate payload size in bytes
 */
export function getPayloadSize(data: unknown): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Check if payload exceeds limit and warn
 */
export function validatePayloadSize(
  data: unknown,
  maxSize: number = 100 * 1024 // 100KB
): { valid: boolean; size: number; message?: string } {
  const size = getPayloadSize(data);

  if (size > maxSize) {
    return {
      valid: false,
      size,
      message: `Payload size (${Math.round(size / 1024)}KB) exceeds limit (${Math.round(maxSize / 1024)}KB)`,
    };
  }

  return { valid: true, size };
}

// ===================================================================
// 5. PROGRESSIVE IMAGE LOADING
// ===================================================================

export interface ProgressiveImageState {
  lowRes: string | null;
  highRes: string | null;
  loading: boolean;
  error: boolean;
}

export function loadImageProgressively(
  lowResUrl: string,
  highResUrl: string,
  onUpdate: (state: ProgressiveImageState) => void
): () => void {
  let cancelled = false;

  const state: ProgressiveImageState = {
    lowRes: null,
    highRes: null,
    loading: true,
    error: false,
  };

  // Load low-res first
  const lowResImg = new Image();
  lowResImg.onload = () => {
    if (cancelled) return;
    state.lowRes = lowResUrl;
    onUpdate({ ...state });
  };
  lowResImg.onerror = () => {
    if (cancelled) return;
    state.error = true;
    state.loading = false;
    onUpdate({ ...state });
  };
  lowResImg.src = lowResUrl;

  // Load high-res in background
  const highResImg = new Image();
  highResImg.onload = () => {
    if (cancelled) return;
    state.highRes = highResUrl;
    state.loading = false;
    onUpdate({ ...state });
  };
  highResImg.onerror = () => {
    if (cancelled) return;
    // High-res failed, but we might still have low-res
    state.loading = false;
    if (!state.lowRes) {
      state.error = true;
    }
    onUpdate({ ...state });
  };
  highResImg.src = highResUrl;

  // Return cleanup function
  return () => {
    cancelled = true;
  };
}

// ===================================================================
// 6. CONNECTION QUALITY DETECTION
// ===================================================================

export interface ConnectionInfo {
  type: 'fast' | 'moderate' | 'slow' | 'offline';
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function getConnectionInfo(): ConnectionInfo {
  if (!navigator.onLine) {
    return { type: 'offline' };
  }

  const connection = (navigator as Navigator & { 
    connection?: NetworkInformation 
  }).connection;

  if (!connection) {
    return { type: 'moderate' }; // Default if API not available
  }

  const info: ConnectionInfo = {
    type: 'moderate',
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };

  // Determine quality based on effective type
  switch (connection.effectiveType) {
    case '4g':
      info.type = connection.downlink && connection.downlink >= 5 ? 'fast' : 'moderate';
      break;
    case '3g':
      info.type = 'moderate';
      break;
    case '2g':
    case 'slow-2g':
      info.type = 'slow';
      break;
    default:
      info.type = 'moderate';
  }

  // Override if Save-Data is enabled
  if (connection.saveData) {
    info.type = 'slow';
  }

  return info;
}

interface NetworkInformation {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

// ===================================================================
// 7. ADAPTIVE QUALITY SETTINGS
// ===================================================================

export interface QualitySettings {
  imageQuality: number;
  maxImageSize: number;
  enableAnimations: boolean;
  prefetchEnabled: boolean;
  batchDelay: number;
}

export function getAdaptiveQualitySettings(): QualitySettings {
  const connection = getConnectionInfo();

  switch (connection.type) {
    case 'fast':
      return {
        imageQuality: 0.85,
        maxImageSize: 2048,
        enableAnimations: true,
        prefetchEnabled: true,
        batchDelay: 50,
      };
    case 'moderate':
      return {
        imageQuality: 0.7,
        maxImageSize: 1024,
        enableAnimations: true,
        prefetchEnabled: false,
        batchDelay: 100,
      };
    case 'slow':
      return {
        imageQuality: 0.5,
        maxImageSize: 512,
        enableAnimations: false,
        prefetchEnabled: false,
        batchDelay: 200,
      };
    case 'offline':
    default:
      return {
        imageQuality: 0.4,
        maxImageSize: 256,
        enableAnimations: false,
        prefetchEnabled: false,
        batchDelay: 500,
      };
  }
}

// ===================================================================
// 8. STORAGE QUOTA MANAGEMENT
// ===================================================================

export interface StorageQuota {
  used: number;
  total: number;
  percent: number;
  available: number;
}

export async function getStorageQuota(): Promise<StorageQuota | null> {
  if (!navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const total = estimate.quota || 0;

    return {
      used,
      total,
      percent: total > 0 ? (used / total) * 100 : 0,
      available: total - used,
    };
  } catch {
    return null;
  }
}

/**
 * Clear old cached data if storage is running low
 */
export async function cleanupStorageIfNeeded(threshold: number = 80): Promise<void> {
  const quota = await getStorageQuota();

  if (!quota || quota.percent < threshold) {
    return;
  }

  console.warn(`⚠️ Storage usage at ${quota.percent.toFixed(1)}%, cleaning up...`);

  // Clear old caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter((name) => !name.includes('-v1'));

    for (const cacheName of oldCaches) {
      await caches.delete(cacheName);
      console.log(`🗑️ Deleted old cache: ${cacheName}`);
    }
  }
}

// ===================================================================
// EXPORTS
// ===================================================================

export const optimizations = {
  optimizeImage,
  generateThumbnail,
  requestBatcher,
  debounce,
  throttle,
  compressPayload,
  getPayloadSize,
  validatePayloadSize,
  loadImageProgressively,
  getConnectionInfo,
  getAdaptiveQualitySettings,
  getStorageQuota,
  cleanupStorageIfNeeded,
};

export default optimizations;
