// Service Worker Nauti One v20 - Offline-First Maritime PWA
// ESTRATÉGIA: Push notifications + App Shell caching para offline
// Cache de navegação com fallback offline para uso marítimo

const SW_VERSION = 'v22-maritime-optimized';
const APP_SHELL_CACHE = 'nauti-app-shell-v22';
const RUNTIME_CACHE = 'nauti-runtime-v22';
const API_CACHE = 'nauti-api-cache-v22';
const MAX_API_CACHE_AGE = 1000 * 60 * 30; // 30 min for API responses

// App shell resources to precache for offline
const APP_SHELL_RESOURCES = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/favicon.png',
  '/icons/nauti-one-logo.png',
  '/manifest.json',
];

// Instalação - precache app shell
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing - Caching app shell`);
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL_RESOURCES))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn(`[SW ${SW_VERSION}] App shell cache failed (non-critical):`, err);
        self.skipWaiting();
      })
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating`);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE && k !== API_CACHE)
          .map(k => {
            console.log(`[SW ${SW_VERSION}] Deleting old cache: ${k}`);
            return caches.delete(k);
          })
      );
      await self.clients.claim();
      
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION, timestamp: Date.now() });
      });
    })()
  );
});

// Fetch strategy: Network-first with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET, chrome-extension, auth calls
  if (
    request.method !== 'GET' ||
    request.url.includes('chrome-extension') ||
    request.url.includes('/auth/')
  ) return;

  // Supabase API calls: stale-while-revalidate for maritime bandwidth savings
  if (request.url.includes('supabase.co') && request.url.includes('/rest/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // Network failed, return cached if available
          if (cached) return cached;
          return new Response(JSON.stringify([]), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', 'X-From-SW-Cache': 'true' } 
          });
        });
        // Return cached immediately, revalidate in background
        if (cached) {
          // Check age - if too old, wait for network
          const cachedDate = cached.headers.get('date');
          const age = cachedDate ? Date.now() - new Date(cachedDate).getTime() : MAX_API_CACHE_AGE + 1;
          if (age < MAX_API_CACHE_AGE) {
            // Fresh enough - return cached, revalidate in background
            fetchPromise.catch(() => {}); // fire and forget
            return cached;
          }
        }
        return fetchPromise;
      })
    );
    return;
  }

  // Navigation requests: network-first with offline.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigations for offline
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Static assets: JS uses network-first (prevents stale chunk errors after deploy)
  // Other assets (fonts, images, css) use cache-first
  if (
    request.url.includes('/assets/') ||
    request.url.includes('/icons/') ||
    request.url.match(/\.(woff2?|ttf|otf|png|jpg|svg|ico|css|js)$/)
  ) {
    const isJS = request.url.endsWith('.js');
    
    if (isJS) {
      // JS chunks: network-first to avoid stale module errors
      event.respondWith(
        fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => caches.match(request).then(cached => cached || new Response('', { status: 503 })))
      );
    } else {
      // Non-JS assets: cache-first (fonts, images, css)
      event.respondWith(
        caches.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
            }
            return response;
          }).catch(() => new Response('', { status: 503 }));
        })
      );
    }
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
      .then(() => event.ports[0]?.postMessage({ success: true, version: SW_VERSION }))
      .catch(err => event.ports[0]?.postMessage({ success: false, error: err.message }));
  }
  
  if (type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
  
  if (type === 'UNREGISTER') {
    self.registration.unregister()
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(err => event.ports[0]?.postMessage({ success: false, error: err.message }));
  }
  
  if (type === 'FORCE_UPDATE') {
    self.registration.update()
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(() => event.ports[0]?.postMessage({ success: false }));
  }

  if (type === 'CHECK_UPDATE') {
    self.registration.update()
      .then(() => event.ports[0]?.postMessage({ success: true, currentVersion: SW_VERSION }))
      .catch(err => event.ports[0]?.postMessage({ success: false, error: err.message }));
  }
  
  if (type === 'HEALTH_CHECK') {
    event.ports[0]?.postMessage({ 
      healthy: true, 
      version: SW_VERSION,
      timestamp: Date.now(),
      cacheEnabled: true,
      fetchInterceptionEnabled: true,
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

console.log(`[SW ${SW_VERSION}] Maritime PWA SW loaded - Offline-first + Push notifications`);
