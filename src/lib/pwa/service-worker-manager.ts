/**
 * PATCH 837: Service Worker Manager
 * Advanced PWA capabilities for offline-first experience
 */

interface ServiceWorkerConfig {
  scope: string;
  updateInterval: number;
  onUpdateAvailable?: () => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      scope: '/',
      updateInterval: 60 * 60 * 1000, // Check for updates every hour
      ...config,
    };
  }

  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: this.config.scope,
      });

      console.log('Service Worker registered:', this.registration.scope);

      // Setup update checking
      this.setupUpdateChecking();

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New Service Worker activated');
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        console.log('Service Worker unregistered');
      }
      return success;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  // Skip waiting and activate new SW immediately
  skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Send message to SW
  postMessage(message: any): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // Cache specific URLs
  async cacheUrls(urls: string[]): Promise<void> {
    this.postMessage({
      type: 'CACHE_URLS',
      payload: urls,
    });
  }

  // Clear specific cache
  async clearCache(cacheName: string): Promise<boolean> {
    if ('caches' in window) {
      return await caches.delete(cacheName);
    }
    return false;
  }

  // Get all cache names
  async getCacheNames(): Promise<string[]> {
    if ('caches' in window) {
      return await caches.keys();
    }
    return [];
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.clone().blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  }

  // Check if update is available
  isUpdateAvailable(): boolean {
    return !!this.registration?.waiting;
  }

  // Get SW status
  getStatus(): 'installing' | 'waiting' | 'active' | 'none' {
    if (!this.registration) return 'none';
    if (this.registration.installing) return 'installing';
    if (this.registration.waiting) return 'waiting';
    if (this.registration.active) return 'active';
    return 'none';
  }

  private setupUpdateChecking(): void {
    if (!this.registration) return;

    // Check for updates when SW updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          this.config.onUpdateAvailable?.();
        }
      });
    });

    // Periodic update check
    setInterval(() => this.update(), this.config.updateInterval);
  }

  private handleMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;
      case 'OFFLINE':
        this.config.onOffline?.();
        break;
      case 'ONLINE':
        this.config.onOnline?.();
        break;
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for SW management
export function useServiceWorker() {
  const [status, setStatus] = useState<'installing' | 'waiting' | 'active' | 'none'>('none');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    const init = async () => {
      await serviceWorkerManager.register();
      setStatus(serviceWorkerManager.getStatus());
      
      const size = await serviceWorkerManager.getCacheSize();
      setCacheSize(size);
    };

    init();

    // Check for updates periodically
    const interval = setInterval(() => {
      setUpdateAvailable(serviceWorkerManager.isUpdateAvailable());
      setStatus(serviceWorkerManager.getStatus());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    updateAvailable,
    cacheSize,
    update: () => serviceWorkerManager.update(),
    skipWaiting: () => serviceWorkerManager.skipWaiting(),
    clearCache: (name: string) => serviceWorkerManager.clearCache(name),
    cacheUrls: (urls: string[]) => serviceWorkerManager.cacheUrls(urls),
  };
}

import { useState, useEffect } from 'react';
