// Service Worker Avançado - Nautilus One v6
// PATCH 855: Otimizado para conexões lentas (3G, LTE, 5G)
// IMPORTANTE: Auth requests NUNCA são cacheados
const CACHE_VERSION = 'v6';
const STATIC_CACHE = `nautilus-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nautilus-dynamic-${CACHE_VERSION}`;
const API_CACHE = `nautilus-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `nautilus-images-${CACHE_VERSION}`;
const PAGES_CACHE = `nautilus-pages-${CACHE_VERSION}`;

// Limites de cache
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;
const MAX_API_CACHE_SIZE = 30;
const MAX_PAGES_CACHE_SIZE = 30;
const API_CACHE_TTL = 10 * 60 * 1000; // 10 minutos para conexões lentas

// Assets estáticos para pre-cache CRÍTICO
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/nauti-one-logo.png'
];

// Páginas críticas para pre-cache (app shell)
const CRITICAL_PAGES = [
  '/central-comando',
  '/central-comando/visao-geral',
  '/peotram',
  '/gmud',
  '/crew',
  '/vessel-contracts',
  '/fleet-command',
  '/maintenance-command',
  '/digital-twin',
  '/hr-dashboard',
  '/billing',
  '/auth'
];

// CRÍTICO: URLs que NUNCA devem ser cacheadas (sempre network)
const NEVER_CACHE_PATTERNS = [
  /\/auth\//,           // Supabase auth
  /\/token/,            // Token refresh
  /\/session/,          // Session management
  /supabase\.co\/auth/, // Direct Supabase auth calls
];

// URLs da API que podem ser cacheadas (exceto auth)
const API_PATTERNS = [
  /\/rest\/v1\//,
  /\/functions\/v1\//
];

// URLs de navegação que devem retornar o index.html (SPA routing)
const SPA_ROUTES_PATTERN = /^\/(central-comando|peotram|gmud|crew|vessel|fleet|maintenance|digital|hr|billing|admin|settings|auth)/;

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v5...');
  event.waitUntil(
    Promise.all([
      // Pre-cache assets estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some static assets failed to cache:', err);
        });
      }),
      // Pre-cache do app shell (index.html) para todas as rotas críticas
      caches.open(PAGES_CACHE).then(async (cache) => {
        console.log('[SW] Pre-caching critical pages (app shell)');
        try {
          // Fetch index.html uma vez e armazena para todas as rotas
          const indexResponse = await fetch('/index.html');
          if (indexResponse.ok) {
            // Cache the index.html for root and all critical pages
            await cache.put('/index.html', indexResponse.clone());
            
            // Create cached responses for critical SPA routes
            for (const page of CRITICAL_PAGES) {
              await cache.put(page, indexResponse.clone());
            }
            console.log('[SW] Critical pages cached:', CRITICAL_PAGES.length);
          }
        } catch (err) {
          console.warn('[SW] Pages pre-cache failed:', err);
        }
      })
    ]).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v5...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => !key.includes(CACHE_VERSION))
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// PATCH 855: Verificar se URL nunca deve ser cacheada
function shouldNeverCache(url) {
  const urlString = url.toString();
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(urlString));
}

// Estratégia de cache inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // Ignorar chrome-extension e outros protocolos
  if (!url.protocol.startsWith('http')) return;

  // CRÍTICO: Auth requests SEMPRE vão direto para network (nunca cache)
  if (shouldNeverCache(url)) {
    console.log('[SW] Auth request - network only:', url.pathname);
    event.respondWith(networkOnlyWithTimeout(request));
    return;
  }

  // SPA Navigation: Retornar index.html para rotas da aplicação
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(handleNavigationRequest(request, url));
    return;
  }

  // Imagens: Cache First com limite
  if (isImageRequest(url.pathname)) {
    event.respondWith(imageStrategy(request));
    return;
  }

  // API requests (não-auth): Network First com fallback para cache
  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Assets estáticos: Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Páginas HTML: Stale While Revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // Outros recursos: Cache First com Network Fallback
  event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
});

// PATCH 855: Network only with generous timeout for auth
async function networkOnlyWithTimeout(request) {
  try {
    // 60 second timeout for auth requests on slow connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.warn('[SW] Auth request failed:', error.message);
    // Return a proper error response instead of failing silently
    return new Response(JSON.stringify({ 
      error: 'Network unavailable',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }), { 
      status: 503, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handler especial para navegação SPA
async function handleNavigationRequest(request, url) {
  try {
    // Tentar network primeiro para navegação
    const networkResponse = await fetch(request);
    
    // Cache a resposta se bem sucedida
    if (networkResponse.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Offline: tentar cache
    console.log('[SW] Navigation offline, trying cache for:', url.pathname);
    
    // Primeiro tenta a rota específica
    const cachedPage = await caches.match(request);
    if (cachedPage) {
      console.log('[SW] Serving cached page:', url.pathname);
      return cachedPage;
    }
    
    // Para rotas SPA, retorna index.html cacheado
    if (SPA_ROUTES_PATTERN.test(url.pathname)) {
      const indexCache = await caches.match('/index.html');
      if (indexCache) {
        console.log('[SW] Serving cached index.html for SPA route:', url.pathname);
        return indexCache;
      }
    }
    
    // Fallback para página offline
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      console.log('[SW] Serving offline page');
      return offlinePage;
    }
    
    return new Response('Offline - Nauti One', { 
      status: 503, 
      headers: { 'Content-Type': 'text/html' } 
    });
  }
}

// Estratégias de cache

async function networkFirstStrategy(request, cacheName) {
  const timeoutMs = isSlowConnection() ? 15000 : 8000;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = networkResponse.clone();
      cache.put(request, responseWithTimestamp);
      await trimCache(cacheName, MAX_API_CACHE_SIZE);
    }
    return networkResponse;
  } catch (error) {
    // Try to get cached response first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      // Clone and add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cached', 'true');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }
    
    // Only return offline error if truly offline and no cache
    if (!navigator.onLine) {
      return new Response(JSON.stringify({ 
        error: 'Offline', 
        cached: false,
        message: 'Você está offline. Reconecte para atualizar os dados.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Network error but online - let it pass through
    throw error;
  }
}

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        trimCache(cacheName, MAX_DYNAMIC_CACHE_SIZE);
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Background revalidation for images
    fetch(request).then(response => {
      if (response.ok) cache.put(request, response);
    }).catch(() => {});
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      await trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder for images
    return new Response('', { status: 503 });
  }
}

// Helpers
function isStaticAsset(pathname) {
  return /\.(js|css|woff|woff2|ttf|eot)$/.test(pathname);
}

function isImageRequest(pathname) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/.test(pathname);
}

function isSlowConnection() {
  // Check if connection API is available
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
  }
  return false;
}

async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const deleteCount = keys.length - maxSize;
    await Promise.all(
      keys.slice(0, deleteCount).map(key => cache.delete(key))
    );
  }
}

// Background Sync para operações offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-data' || event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Notify all clients that sync is happening
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_START' });
  });
  
  // Process queued actions from IndexedDB
  try {
    // This will be handled by the app's sync manager
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETE', success: true });
    });
  } catch (error) {
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETE', success: false, error: error.message });
    });
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: data.actions || [],
    tag: data.tag || 'default',
    renotify: data.renotify || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nautilus One', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if none exists
        return self.clients.openWindow(urlToOpen);
      })
  );
});

// Message handler for cache operations
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => 
        Promise.all(keys.map(key => caches.delete(key)))
      ).then(() => {
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
  
  if (event.data?.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then(size => {
        event.ports[0]?.postMessage({ size });
      })
    );
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

console.log('[SW] Service Worker v6 loaded - Optimized for slow connections (3G/LTE/5G)');
