/**
 * Advanced Service Worker Configuration
 * PATCH 850: PWA & Offline - Smart caching strategies
 */

export const SW_VERSION = "1.0.0";

// Cache names for different resource types
export const CACHE_NAMES = {
  static: `static-v${SW_VERSION}`,
  dynamic: `dynamic-v${SW_VERSION}`,
  images: `images-v${SW_VERSION}`,
  api: `api-v${SW_VERSION}`,
  fonts: `fonts-v${SW_VERSION}`,
};

// Resources to precache (critical path)
export const PRECACHE_RESOURCES = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Caching strategies configuration
export const CACHE_STRATEGIES = {
  // Static assets - Cache First
  static: {
    cacheName: CACHE_NAMES.static,
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  },
  // API responses - Network First with fallback
  api: {
    cacheName: CACHE_NAMES.api,
    maxEntries: 50,
    maxAgeSeconds: 5 * 60, // 5 minutes
  },
  // Images - Stale While Revalidate
  images: {
    cacheName: CACHE_NAMES.images,
    maxEntries: 200,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  },
  // Fonts - Cache First (long term)
  fonts: {
    cacheName: CACHE_NAMES.fonts,
    maxEntries: 20,
    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
  },
};

// Background sync configuration
export const SYNC_CONFIG = {
  // Queue names for different operation types
  queues: {
    mutations: "offline-mutations",
    analytics: "offline-analytics",
    uploads: "offline-uploads",
  },
  // Retry configuration
  retry: {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
  },
};

// Network timeout configuration (for slow networks)
export const NETWORK_TIMEOUTS = {
  api: 10000,      // 10 seconds for API calls
  static: 5000,    // 5 seconds for static assets
  images: 15000,   // 15 seconds for images
};
