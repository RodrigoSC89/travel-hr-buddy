/**
 * Advanced Service Worker Manager - PATCH 950
 * Comprehensive caching and offline strategy
 */

import { logger } from "@/lib/logger";

interface CacheStrategy {
  name: string;
  match: (url: URL) => boolean;
  strategy: "cache-first" | "network-first" | "stale-while-revalidate" | "cache-only" | "network-only";
  maxAge?: number;
  maxEntries?: number;
}

const CACHE_STRATEGIES: CacheStrategy[] = [
  // Static assets - cache first
  {
    name: "static-assets",
    match: (url) => /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|webp|ico)$/i.test(url.pathname),
    strategy: "cache-first",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  // API requests - network first with fallback
  {
    name: "api-requests",
    match: (url) => url.pathname.includes("/rest/v1/") || url.pathname.includes("/functions/v1/"),
    strategy: "network-first",
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
  },
  // HTML pages - stale while revalidate
  {
    name: "html-pages",
    match: (url) => url.pathname.endsWith("/") || url.pathname.endsWith(".html"),
    strategy: "stale-while-revalidate",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 20,
  },
  // Supabase Auth - network only
  {
    name: "auth-requests",
    match: (url) => url.pathname.includes("/auth/"),
    strategy: "network-only",
  },
];

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = "serviceWorker" in navigator;

  async register(): Promise<boolean> {
    if (!this.isSupported) {
      logger.warn("[SW] Service Workers not supported");
      return false;
    }

    try {
      // Register the service worker
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      logger.info("[SW] Service Worker registered", {
        scope: this.registration.scope,
      });

      // Listen for updates
      this.registration.addEventListener("updatefound", () => {
        const newWorker = this.registration?.installing;
        
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Handle messages from SW
      navigator.serviceWorker.addEventListener("message", this.handleMessage.bind(this));

      return true;
    } catch (error) {
      logger.error("[SW] Registration failed", { error });
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      logger.info("[SW] Service Worker unregistered", { success });
      return success;
    } catch (error) {
      logger.error("[SW] Unregistration failed", { error });
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      logger.info("[SW] Checked for updates");
    } catch (error) {
      logger.error("[SW] Update check failed", { error });
    }
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  async clearCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );

    logger.info("[SW] All caches cleared");
  }

  async getCacheStats(): Promise<{
    caches: Array<{ name: string; entries: number; size: number }>;
    totalSize: number;
  }> {
    const cacheNames = await caches.keys();
    const stats: Array<{ name: string; entries: number; size: number }> = [];
    let totalSize = 0;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      // Estimate size (simplified)
      let cacheSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          cacheSize += blob.size;
        }
      }

      stats.push({
        name,
        entries: keys.length,
        size: cacheSize,
      });

      totalSize += cacheSize;
    }

    return { caches: stats, totalSize };
  }

  async precacheUrls(urls: string[]): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: "PRECACHE_URLS",
      urls,
    });
  }

  private handleMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
    case "CACHE_UPDATED":
      logger.debug("[SW] Cache updated", payload);
      break;
    case "OFFLINE_READY":
      logger.info("[SW] App ready for offline use");
      this.dispatchEvent("offline-ready");
      break;
    case "SYNC_COMPLETE":
      logger.info("[SW] Background sync complete", payload);
      this.dispatchEvent("sync-complete", payload);
      break;
    }
  }

  private notifyUpdateAvailable(): void {
    logger.info("[SW] New version available");
    this.dispatchEvent("update-available");
  }

  private dispatchEvent(name: string, detail?: any): void {
    window.dispatchEvent(new CustomEvent(`sw:${name}`, { detail }));
  }

  // Check if currently offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Get service worker state
  getState(): ServiceWorkerState | null {
    return this.registration?.active?.state || null;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Generate service worker script content
 */
export function generateServiceWorkerScript(): string {
  return `
// Nautilus One Service Worker - PATCH 950
const CACHE_NAME = 'nautilus-v1';
const STATIC_CACHE = 'nautilus-static-v1';
const API_CACHE = 'nautilus-api-v1';

// Files to precache
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event with strategy selection
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;
  
  // API requests - network first
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }
  
  // Static assets - cache first
  if (/\\.(js|css|woff2?|ttf|png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }
  
  // HTML - stale while revalidate
  event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale while revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  return cached || await networkPromise || new Response('Offline', { status: 503 });
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'PRECACHE_URLS') {
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(event.data.urls));
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Notify clients sync is complete
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}
`;
}

// React hook for service worker
import { useState, useEffect, useCallback } from "react";

export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => setIsUpdateAvailable(true);
    const handleOfflineReady = () => setIsOfflineReady(true);

    window.addEventListener("sw:update-available", handleUpdateAvailable);
    window.addEventListener("sw:offline-ready", handleOfflineReady);

    // Register on mount
    serviceWorkerManager.register().then(setIsRegistered);

    return () => {
      window.removeEventListener("sw:update-available", handleUpdateAvailable);
      window.removeEventListener("sw:offline-ready", handleOfflineReady);
    };
  }, []);

  const update = useCallback(() => {
    serviceWorkerManager.skipWaiting();
    window.location.reload();
  }, []);

  const clearCaches = useCallback(async () => {
    await serviceWorkerManager.clearCaches();
  }, []);

  return {
    isRegistered,
    isUpdateAvailable,
    isOfflineReady,
    update,
    clearCaches,
    isOffline: serviceWorkerManager.isOffline(),
  };
}
