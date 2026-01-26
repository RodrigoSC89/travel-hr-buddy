/**
 * Smart Loader - PATCH 750.1
 * Intelligent resource loading based on network conditions
 * 
 * AUDIT FIX: Replaced `any` types with proper generics for type safety
 */

import { bandwidthOptimizer } from './low-bandwidth-optimizer';
import { ultraLightMode } from './ultra-light-mode';
import { Logger } from "@/lib/utils/logger";

interface LoaderConfig {
  priority: 'critical' | 'high' | 'normal' | 'low';
  type: 'script' | 'style' | 'image' | 'data' | 'module';
  timeout?: number;
}

interface QueuedItem<T = unknown> {
  url: string;
  config: LoaderConfig;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class SmartLoader {
  private queue: QueuedItem[] = [];
  private loading: Set<string> = new Set();
  private cache: Map<string, unknown> = new Map();
  private isProcessing = false;
  private maxConcurrent = 6;

  constructor() {
    this.updateMaxConcurrent();
  }

  private updateMaxConcurrent(): void {
    if (ultraLightMode.isEnabled()) {
      this.maxConcurrent = ultraLightMode.getMaxConcurrentRequests();
    } else {
      const config = bandwidthOptimizer.getConfig();
      this.maxConcurrent = config.batchSize;
    }
  }

  async load<T>(url: string, config: LoaderConfig): Promise<T> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url) as T;
    }

    // Skip non-critical in ultra-light mode
    if (ultraLightMode.isCriticalOnly() && config.priority !== 'critical') {
      return Promise.resolve(null as T);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({ 
        url, 
        config, 
        resolve: resolve as (value: unknown) => void, 
        reject 
      });
      this.sortQueue();
      this.processQueue();
    });
  }

  private sortQueue(): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    this.queue.sort((a, b) => 
      priorityOrder[a.config.priority] - priorityOrder[b.config.priority]
    );
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.loading.size < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      if (this.loading.has(item.url)) continue;
      this.loading.add(item.url);

      this.loadItem(item).finally(() => {
        this.loading.delete(item.url);
        this.processQueue();
      });

      // Add delay for slow connections
      const delay = ultraLightMode.getRequestDelay();
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }
    }

    this.isProcessing = false;
  }

  private async loadItem(item: QueuedItem): Promise<void> {
    const { url, config, resolve, reject } = item;
    const timeout = config.timeout || bandwidthOptimizer.getConfig().requestTimeout;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      let result: unknown;

      switch (config.type) {
        case 'script':
          result = await this.loadScript(url);
          break;
        case 'style':
          result = await this.loadStyle(url);
          break;
        case 'image':
          result = await this.loadImage(url);
          break;
        case 'data':
          result = await this.loadData(url, controller.signal);
          break;
        case 'module':
          result = await this.loadModule(url);
          break;
        default:
          result = await this.loadData(url, controller.signal);
      }

      clearTimeout(timeoutId);
      this.cache.set(url, result);
      resolve(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      Logger.error(`Failed to load: ${url}`, errorMessage, "SmartLoader");
      reject(errorMessage);
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  private loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load style: ${url}`));
      document.head.appendChild(link);
    });
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private async loadData<T = unknown>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, {
      signal,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
    return response.json() as Promise<T>;
  }

  private async loadModule<T = unknown>(url: string): Promise<T> {
    return import(/* @vite-ignore */ url) as Promise<T>;
  }

  // Preload a resource
  preload(url: string, as: 'script' | 'style' | 'image' | 'font' = 'script'): void {
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (as === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Prefetch for future navigation
  prefetch(url: string): void {
    if (!bandwidthOptimizer.shouldPrefetch()) return;
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; queueLength: number; loadingCount: number } {
    return {
      size: this.cache.size,
      queueLength: this.queue.length,
      loadingCount: this.loading.size,
    };
  }
}

export const smartLoader = new SmartLoader();
