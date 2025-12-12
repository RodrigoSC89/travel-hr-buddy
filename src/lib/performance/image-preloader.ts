/**
 * Image Preloader
 * Intelligent image preloading based on connection and viewport
 */

import { getConnectionInfo, isSlowConnection } from "./connection-aware";

interface PreloadOptions {
  priority?: "high" | "low" | "auto";
  timeout?: number;
}

class ImagePreloader {
  private preloadedUrls = new Set<string>();
  private loadingUrls = new Map<string, Promise<void>>();
  private maxConcurrent = 4;
  private queue: Array<{ url: string; resolve: () => void; reject: (e: Error) => void }> = [];
  private activeLoads = 0;

  /**
   * Preload a single image
   */
  async preload(url: string, options: PreloadOptions = {}): Promise<void> {
    if (this.preloadedUrls.has(url)) return;
    
    const existing = this.loadingUrls.get(url);
    if (existing) return existing;

    // Skip preloading on slow connections unless high priority
    if (isSlowConnection() && options.priority !== "high") {
      return;
    }

    const promise = new Promise<void>((resolve, reject) => {
      if (this.activeLoads >= this.maxConcurrent) {
        this.queue.push({ url, resolve, reject });
        return;
      }
      
      this.loadImage(url, options.timeout)
        .then(() => {
          this.preloadedUrls.add(url);
          resolve();
        })
        .catch(reject)
        .finally(() => this.processQueue());
    });

    this.loadingUrls.set(url, promise);
    
    try {
      await promise;
    } finally {
      this.loadingUrls.delete(url);
    }
  }

  /**
   * Preload multiple images
   */
  async preloadBatch(urls: string[], options: PreloadOptions = {}): Promise<void[]> {
    const connectionInfo = getConnectionInfo();
    
    // Limit batch size on slow connections
    const limit = isSlowConnection() ? 2 : urls.length;
    const limitedUrls = urls.slice(0, limit);

    return Promise.all(
      limitedUrls.map(url => this.preload(url, options).catch(() => {}))
    );
  }

  private async loadImage(url: string, timeout = 10000): Promise<void> {
    this.activeLoads++;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        this.activeLoads--;
        reject(new Error("Image load timeout"));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.activeLoads--;
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        this.activeLoads--;
        reject(new Error(`Failed to load: ${url}`));
      };

      img.src = url;
    });
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.activeLoads < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        this.loadImage(next.url)
          .then(next.resolve)
          .catch(next.reject);
      }
    }
  }

  /**
   * Check if an image is preloaded
   */
  isPreloaded(url: string): boolean {
    return this.preloadedUrls.has(url);
  }

  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloadedUrls.clear();
  }
}

export const imagePreloader = new ImagePreloader();

/**
 * Preload images that are likely to be needed soon
 */
export function preloadVisibleImages(container?: HTMLElement): void {
  const root = container || document;
  const images = root.querySelectorAll<HTMLImageElement>("img[data-preload]");
  
  images.forEach(img => {
    const src = img.dataset.preload || img.src;
    if (src) {
      imagePreloader.preload(src, { priority: "low" });
    }
  });
}

/**
 * Preload images for next page/route
 */
export function preloadRouteImages(route: string): void {
  // This could be extended to have a mapping of routes to images
  const routeImages: Record<string, string[]> = {
    "/dashboard": ["/images/dashboard-bg.jpg"],
    "/profile": ["/images/profile-default.png"],
  };

  const images = routeImages[route];
  if (images) {
    imagePreloader.preloadBatch(images, { priority: "low" });
  }
}
