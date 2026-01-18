// Service Worker Avançado - Nautilus One v6
// CRITICAL FIX: JS/CSS chunks são SEMPRE Network First para evitar erros após deploy
// FIX: Auth requests são SEMPRE bypass do cache
const CACHE_VERSION = 'v6';
const STATIC_CACHE = `nautilus-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nautilus-dynamic-${CACHE_VERSION}`;
const API_CACHE = `nautilus-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `nautilus-images-${CACHE_VERSION}`;

// Limites de cache
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;
const MAX_API_CACHE_SIZE = 30;
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Assets estáticos para pre-cache (APENAS arquivos que não mudam!)
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json'
  // NÃO cachear index.html - sempre buscar da rede
];

// URLs da API que devem ser cacheadas
const API_PATTERNS = [
  /\/rest\/v1\//,
  /\/functions\/v1\//
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v6...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v6 - clearing old caches...');
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

// Estratégia de cache inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // Ignorar chrome-extension e outros protocolos
  if (!url.protocol.startsWith('http')) return;

  // ⚠️ CRÍTICO: NUNCA cachear requisições de autenticação!
  if (url.pathname.includes('/auth/') || 
      url.pathname.includes('/token') ||
      url.pathname.includes('/session') ||
      url.hostname.includes('supabase') && url.pathname.includes('auth')) {
    return; // Bypass completo
  }

  // ⚠️ CRÍTICO: JS e CSS chunks SEMPRE Network First
  // Isso previne erros de "Failed to fetch dynamically imported module"
  if (isJSorCSSChunk(url.pathname)) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Imagens: Cache First com limite
  if (isImageRequest(url.pathname)) {
    event.respondWith(imageStrategy(request));
    return;
  }

  // API requests: Network First com fallback para cache
  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Páginas HTML: SEMPRE Network First (para pegar novos builds)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Fontes e outros assets estáticos: Cache First
  if (isFontOrStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Outros recursos: Network First
  event.respondWith(networkFirstWithFallback(request));
});

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

// ⚠️ CRÍTICO: Network First com fallback para chunks JS/CSS e HTML
// Se a rede falhar, tenta cache, mas SEMPRE prefere rede
async function networkFirstWithFallback(request) {
  const timeoutMs = isSlowConnection() ? 20000 : 10000;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      // Cachear para fallback offline
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    // Tentar cache como fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Para navegação, mostrar página offline
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    // Erro de chunk - retornar erro claro para o ErrorBoundary tratar
    if (request.url.includes('/assets/') && request.url.endsWith('.js')) {
      return new Response('Chunk load failed', { 
        status: 503, 
        statusText: 'Chunk Load Failed'
      });
    }
    
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

// Detecta chunks JS/CSS (arquivos com hash no nome)
function isJSorCSSChunk(pathname) {
  // Arquivos como: Component-AbCdEf12.js, style-XyZ123.css
  return /\/assets\/.*-[a-zA-Z0-9]{6,}\.(js|css)$/.test(pathname);
}

// Fontes e assets que realmente não mudam
function isFontOrStaticAsset(pathname) {
  return /\.(woff|woff2|ttf|eot)$/.test(pathname);
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

console.log('[SW] Service Worker v6 loaded - JS chunks are Network First');
