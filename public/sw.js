// Service Worker Nauti One v21 - WHITE SCREEN FIX
// STRATEGY: Network-first for ALL navigable content (HTML, JS, CSS)
// Cache-first ONLY for static assets (images, fonts)
// This prevents stale JS/CSS after deployments

const SW_VERSION = 'v21-no-stale-js';
const STATIC_CACHE = 'nauti-static-v21';
const NAVIGATION_CACHE = 'nauti-nav-v21';

// Only precache truly static, non-code resources
const PRECACHE_RESOURCES = [
  '/offline.html',
  '/favicon.ico',
  '/favicon.png',
  '/icons/nauti-one-logo.png',
  '/manifest.json',
];

// Install - precache minimal resources
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// Activate - delete ALL old caches aggressively
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating - purging old caches`);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== NAVIGATION_CACHE)
          .map(k => {
            console.log(`[SW ${SW_VERSION}] Deleting: ${k}`);
            return caches.delete(k);
          })
      );
      await self.clients.claim();
    })()
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET, extensions, and API calls
  if (
    request.method !== 'GET' ||
    request.url.includes('chrome-extension') ||
    request.url.includes('supabase.co') ||
    request.url.includes('/rest/') ||
    request.url.includes('/auth/') ||
    request.url.includes('/functions/')
  ) return;

  // ============================================================
  // NAVIGATION: Network-first, offline.html fallback
  // ============================================================
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // ============================================================
  // JS & CSS: ALWAYS network-first (CRITICAL - prevents white screen)
  // Stale JS/CSS after deploy = broken app = white screen
  // ============================================================
  if (request.url.match(/\.(js|css|mjs)(\?.*)?$/)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(NAVIGATION_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(c => c || new Response('', { status: 503 })))
    );
    return;
  }

  // ============================================================
  // STATIC ASSETS (images, fonts): Cache-first (safe - content-hashed)
  // ============================================================
  if (
    request.url.match(/\.(woff2?|ttf|otf|png|jpg|jpeg|webp|gif|svg|ico|avif)(\?.*)?$/) ||
    request.url.includes('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }
});

// ====== MESSAGE HANDLERS ======
self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'CLEAR_CACHE' || type === 'CLEAR_ALL_CACHES') {
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(err => event.ports[0]?.postMessage({ success: false, error: err.message }));
  }

  if (type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }

  if (type === 'UNREGISTER') {
    self.registration.unregister()
      .then(() => event.ports[0]?.postMessage({ success: true }));
  }

  if (type === 'HEALTH_CHECK') {
    event.ports[0]?.postMessage({
      healthy: true,
      version: SW_VERSION,
      timestamp: Date.now(),
    });
  }
});

// ====== PUSH NOTIFICATIONS ======
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
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(event.notification.data?.url || '/');
          return client.focus();
        }
      }
      return self.clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

console.log(`[SW ${SW_VERSION}] Loaded - Network-first JS/CSS, push notifications`);
