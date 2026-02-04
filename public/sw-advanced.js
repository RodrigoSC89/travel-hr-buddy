// ===================================================================
// Service Worker Nauti One v20 - ADVANCED CACHE STRATEGIES
// Otimizado para ambientes marítimos (0.5-2 Mbps)
// ===================================================================

const SW_VERSION = 'v20-advanced';
const CACHE_PREFIX = 'nauti-one';

// Cache names
const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-v1`,
  RUNTIME: `${CACHE_PREFIX}-runtime-v1`,
  API: `${CACHE_PREFIX}-api-v1`,
  IMAGES: `${CACHE_PREFIX}-images-v1`,
  FONTS: `${CACHE_PREFIX}-fonts-v1`,
};

// Critical assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /\/rest\/v1\/vessels/,
  /\/rest\/v1\/crew_members/,
  /\/rest\/v1\/maintenance_orders/,
  /\/rest\/v1\/documents/,
  /\/rest\/v1\/organizations/,
];

// ===================================================================
// INSTALL: Precache critical assets
// ===================================================================

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing...`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.STATIC);

      // Cache critical assets
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
          console.log(`[SW] Cached: ${asset}`);
        } catch (error) {
          console.warn(`[SW] Failed to cache: ${asset}`, error);
        }
      }

      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// ===================================================================
// ACTIVATE: Clean old caches
// ===================================================================

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating...`);

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      const validCaches = Object.values(CACHES);

      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_PREFIX) && !validCaches.includes(cacheName)) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );

      // Claim all clients
      await self.clients.claim();

      // Notify clients
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
        });
      });
    })()
  );
});

// ===================================================================
// FETCH: Advanced cache strategies
// ===================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Route to appropriate strategy
  if (isApiRequest(url)) {
    event.respondWith(networkFirstWithCache(request, CACHES.API, 5000));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirstWithNetwork(request, CACHES.IMAGES, 30 * 24 * 60 * 60 * 1000));
  } else if (isFontRequest(request)) {
    event.respondWith(cacheFirstWithNetwork(request, CACHES.FONTS, 365 * 24 * 60 * 60 * 1000));
  } else if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHES.STATIC));
  } else if (isDocumentRequest(request)) {
    event.respondWith(networkFirstWithOffline(request));
  } else {
    event.respondWith(networkFirstWithCache(request, CACHES.RUNTIME, 3000));
  }
});

// ===================================================================
// REQUEST TYPE DETECTION
// ===================================================================

function isApiRequest(url) {
  // Supabase API
  if (url.hostname.includes('supabase.co')) {
    return true;
  }

  // Local API
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')) {
    return true;
  }

  return false;
}

function isImageRequest(request) {
  return (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i.test(request.url)
  );
}

function isFontRequest(request) {
  return (
    request.destination === 'font' ||
    /\.(woff|woff2|ttf|otf|eot)$/i.test(request.url)
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|json)$/i.test(url.pathname)
  );
}

function isDocumentRequest(request) {
  return request.destination === 'document' || request.mode === 'navigate';
}

// ===================================================================
// CACHE STRATEGIES
// ===================================================================

/**
 * Network First with Cache Fallback (with timeout)
 * Best for: API requests
 */
async function networkFirstWithCache(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);

  try {
    // Try network with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const networkResponse = await fetch(request, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Cache successful responses
    if (networkResponse.ok) {
      // Clone before caching
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log(`[SW] Network failed for ${request.url}, trying cache...`);

    // Try cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cache-Status', 'HIT');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      });
    }

    // Return error response
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Cache First with Network Fallback
 * Best for: Images, Fonts
 */
async function cacheFirstWithNetwork(request, cacheName, maxAge = 86400000) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still fresh
    const cachedDate = cachedResponse.headers.get('sw-cached-date');
    const isFresh = cachedDate && Date.now() - parseInt(cachedDate) < maxAge;

    if (isFresh) {
      return cachedResponse;
    }

    // Revalidate in background if stale
    fetchAndCache(request, cache);
    return cachedResponse;
  }

  // Fetch from network
  return fetchAndCache(request, cache);
}

/**
 * Stale While Revalidate
 * Best for: Static assets (JS, CSS)
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always revalidate in background
  const fetchPromise = fetchAndCache(request, cache);

  // Return cached immediately if available
  return cachedResponse || fetchPromise;
}

/**
 * Network First with Offline Fallback
 * Best for: HTML documents
 */
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log(`[SW] Document fetch failed, serving offline page`);

    // Try cached version first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fall back to offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    // Last resort
    return new Response('<h1>Offline</h1><p>Please check your connection.</p>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/**
 * Helper: Fetch and cache response
 */
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Add timestamp header
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-date', Date.now().toString());

      const responseToCache = new Response(networkResponse.clone().body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      });

      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.warn(`[SW] Fetch failed: ${request.url}`);
    throw error;
  }
}

// ===================================================================
// MESSAGE HANDLERS
// ===================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_ALL_CACHES':
      clearAllCaches().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;

    case 'CLEAR_API_CACHE':
      caches.delete(CACHES.API).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;

    case 'GET_CACHE_STATS':
      getCacheStats().then((stats) => {
        event.ports[0]?.postMessage(stats);
      });
      break;

    case 'PREFETCH':
      prefetchUrls(payload?.urls || []).then((results) => {
        event.ports[0]?.postMessage(results);
      });
      break;

    case 'HEALTH_CHECK':
      event.ports[0]?.postMessage({
        healthy: true,
        version: SW_VERSION,
        caches: Object.keys(CACHES),
      });
      break;
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log(`[SW] All caches cleared`);
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const stats = {};

  for (const [name, cacheName] of Object.entries(CACHES)) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[name] = {
      name: cacheName,
      entries: keys.length,
    };
  }

  return stats;
}

/**
 * Prefetch URLs for offline access
 */
async function prefetchUrls(urls) {
  const cache = await caches.open(CACHES.RUNTIME);
  const results = { success: [], failed: [] };

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        results.success.push(url);
      } else {
        results.failed.push({ url, error: `HTTP ${response.status}` });
      }
    } catch (error) {
      results.failed.push({ url, error: error.message });
    }
  }

  return results;
}

// ===================================================================
// BACKGROUND SYNC
// ===================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  console.log(`[SW] Background sync triggered`);

  // Notify clients to sync
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({
      type: 'BACKGROUND_SYNC',
      timestamp: Date.now(),
    });
  });
}

// ===================================================================
// PUSH NOTIFICATIONS
// ===================================================================

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nauti One', {
      body: data.body || 'Nova notificação',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(event.notification.data?.url || '/');
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

// ===================================================================

console.log(`[SW ${SW_VERSION}] Advanced Service Worker loaded with maritime optimizations`);
