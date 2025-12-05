/**
 * Final Optimizations - Production Ready
 * Last-mile performance improvements for 2Mbps networks
 */

// Intersection Observer for lazy loading
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, {
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  });
}

// Debounced resize handler
export function createResizeObserver(
  callback: (entry: ResizeObserverEntry) => void,
  debounceMs: number = 100
): ResizeObserver {
  let timeout: ReturnType<typeof setTimeout>;
  
  return new ResizeObserver((entries) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      entries.forEach(callback);
    }, debounceMs);
  });
}

// Optimized scroll handler
export function createScrollHandler(
  callback: () => void,
  throttleMs: number = 100
): () => void {
  let lastCall = 0;
  let rafId: number;

  return () => {
    const now = Date.now();
    if (now - lastCall >= throttleMs) {
      lastCall = now;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(callback);
    }
  };
}

// Image loading with retry
export async function loadImageWithRetry(
  src: string,
  retries: number = 3,
  delay: number = 1000
): Promise<HTMLImageElement> {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    } catch {
      if (i === retries - 1) throw new Error(`Failed to load image: ${src}`);
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error(`Failed to load image: ${src}`);
}

// Chunk array for batch processing
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Process items in batches with delay
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = [];
  const chunks = chunkArray(items, batchSize);
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  
  return results;
}

// Measure function execution time
export function measureTime<T>(fn: () => T, label?: string): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (label) {
    console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// Async measure
export async function measureTimeAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (label) {
    console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// Memory-efficient data structures
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) item
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Export everything
export const finalOptimizations = {
  createLazyObserver,
  createResizeObserver,
  createScrollHandler,
  loadImageWithRetry,
  chunkArray,
  processBatch,
  measureTime,
  measureTimeAsync,
  LRUCache,
};

export default finalOptimizations;
