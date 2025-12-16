/**
 * Smart Loader
 * Intelligent resource loading based on network conditions
 */

import { bandwidthOptimizer } from './low-bandwidth-optimizer';
import { ultraLightMode } from './ultra-light-mode';
import { Logger } from "@/lib/utils/logger";

interface LoaderConfig {
  priority: 'critical' | 'high' | 'normal' | 'low';
  type: 'script' | 'style' | 'image' | 'data' | 'module';
  timeout?: number;
}

interface QueuedItem {
  url: string;
  config: LoaderConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class SmartLoader {
  private queue: QueuedItem[] = [];
  private loading: Set<string> = new Set();
  private cache: Map<string, any> = new Map();
  private isProcessing = false;
  private maxConcurrent = 6;

  constructor() {
    this.updateMaxConcurrent();
  }

  private updateMaxConcurrent() {
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
      return this.cache.get(url);
    }

    // Skip non-critical in ultra-light mode
    if (ultraLightMode.isCriticalOnly() && config.priority !== 'critical') {
      return Promise.resolve(null as T);
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ url, config, resolve, reject });
      this.sortQueue();
      this.processQueue();
    });
  }

  private sortQueue() {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    this.queue.sort((a, b) => 
      priorityOrder[a.config.priority] - priorityOrder[b.config.priority]
    );
  }

  private async processQueue() {
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

  private async loadItem(item: QueuedItem) {
    const { url, config, resolve, reject } = item;
    const timeout = config.timeout || bandwidthOptimizer.getConfig().requestTimeout;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      let result: any;

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
      Logger.error(`Failed to load: ${url}`, error, "SmartLoader");
      reject(error);
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private async loadData(url: string, signal: AbortSignal): Promise<any> {
    const response = await fetch(url, {
      signal,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
    return response.json();
  }

  private async loadModule(url: string): Promise<any> {
    return import(/* @vite-ignore */ url);
  }

  // Preload a resource
  preload(url: string, as: 'script' | 'style' | 'image' | 'font' = 'script') {
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (as === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Prefetch for future navigation
  prefetch(url: string) {
    if (!bandwidthOptimizer.shouldPrefetch()) return;
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      queueLength: this.queue.length,
      loadingCount: this.loading.size,
    };
  }
}

export const smartLoader = new SmartLoader();
