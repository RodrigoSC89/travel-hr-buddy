// Service Worker Nautilus One v10
// CRITICAL FIX: Bypass completo para auth + chunks SEMPRE da rede
// CRITICAL FIX: Instalação mais rápida, menos cache agressivo
// CRITICAL FIX: Detecção de erros e auto-limpeza
// v10: Sincronizado com boot cleanup em main.tsx
const CACHE_VERSION = 'v10';
const STATIC_CACHE = `nautilus-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nautilus-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `nautilus-images-${CACHE_VERSION}`;

// Limites de cache reduzidos para PWA mais leve
const MAX_DYNAMIC_CACHE_SIZE = 30;
const MAX_IMAGE_CACHE_SIZE = 50;

// APENAS arquivos absolutamente estáticos
const STATIC_ASSETS = [
  '/offline.html',
  '/favicon.ico'
];

// Instalação RÁPIDA - não bloquear em cache
self.addEventListener('install', (event) => {
  console.log('[SW v9] Installing - Fast install mode');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Ativação com limpeza AGRESSIVA de caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW v9] Activating - Clearing ALL old caches');
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !key.includes(CACHE_VERSION))
          .map((key) => {
            console.log('[SW v9] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// Estratégia principal: Network First para TUDO exceto imagens
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar chrome-extension e outros protocolos
  if (!url.protocol.startsWith('http')) return;

  // ⚠️ CRÍTICO: BYPASS TOTAL para autenticação
  if (isAuthRequest(url)) {
    console.log('[SW v9] Auth bypass:', url.pathname);
    return; // Deixa o browser fazer fetch normal
  }

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // ⚠️ CRÍTICO: Chunks JS/CSS - SEMPRE Network First (sem fallback de cache)
  if (isCodeAsset(url.pathname)) {
    event.respondWith(fetchNetworkOnly(request));
    return;
  }

  // HTML - SEMPRE da rede
  if (request.headers.get('accept')?.includes('text/html') || url.pathname === '/') {
    event.respondWith(fetchNetworkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Imagens: Cache First (ok pra cachear)
  if (isImageRequest(url.pathname)) {
    event.respondWith(fetchCacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Fontes: Cache First
  if (isFontRequest(url.pathname)) {
    event.respondWith(fetchCacheFirst(request, STATIC_CACHE));
    return;
  }

  // API: Network First com cache curto
  if (isAPIRequest(url.pathname)) {
    event.respondWith(fetchNetworkFirst(request, DYNAMIC_CACHE, 8000));
    return;
  }

  // Default: Network First
  event.respondWith(fetchNetworkFirst(request, DYNAMIC_CACHE));
});

// ====== HELPERS ======

function isAuthRequest(url) {
  const path = url.pathname.toLowerCase();
  const host = url.hostname.toLowerCase();
  
  return (
    path.includes('/auth') ||
    path.includes('/token') ||
    path.includes('/session') ||
    path.includes('/callback') ||
    path.includes('/signup') ||
    path.includes('/login') ||
    path.includes('/verify') ||
    path.includes('/recover') ||
    path.includes('/user') ||
    path.includes('/logout') ||
    (host.includes('supabase') && (path.includes('auth') || path.includes('token')))
  );
}

function isCodeAsset(pathname) {
  // JS e CSS com hash no nome = chunks do Vite
  return /\.(js|css|mjs)(\?.*)?$/.test(pathname);
}

function isImageRequest(pathname) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)(\?.*)?$/.test(pathname);
}

function isFontRequest(pathname) {
  return /\.(woff|woff2|ttf|eot|otf)(\?.*)?$/.test(pathname);
}

function isAPIRequest(pathname) {
  return pathname.includes('/rest/v1/') || pathname.includes('/functions/v1/');
}

// ====== ESTRATÉGIAS ======

// Network Only - NUNCA usa cache (para code assets)
async function fetchNetworkOnly(request) {
  const timeout = isSlowConnection() ? 30000 : 15000;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { 
      signal: controller.signal,
      cache: 'no-store' // Força bypass de cache do browser
    });
    clearTimeout(timeoutId);
    
    return response;
  } catch (error) {
    console.error('[SW v9] Network fetch failed:', request.url, error.message);
    
    // Para chunks, retornar erro claro (não tentar cache velho!)
    return new Response('// Chunk load failed - please refresh', {
      status: 503,
      statusText: 'Network Error',
      headers: { 'Content-Type': 'application/javascript' }
    });
  }
}

// Network First com fallback para cache
async function fetchNetworkFirst(request, cacheName, timeoutMs = null) {
  const timeout = timeoutMs || (isSlowConnection() ? 25000 : 12000);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Cachear apenas respostas OK
    if (response.ok && response.status < 400) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => {});
      trimCache(cacheName, MAX_DYNAMIC_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    console.log('[SW v9] Network failed, trying cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Para navegação, mostrar offline page
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }
    
    // Erro genérico
    return new Response('Network error', { status: 503 });
  }
}

// Cache First com revalidation
async function fetchCacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Background revalidation
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(cacheName).then(cache => cache.put(request, response));
      }
    }).catch(() => {});
    
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

// Detectar conexão lenta
function isSlowConnection() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return conn.saveData || 
           conn.effectiveType === '2g' || 
           conn.effectiveType === 'slow-2g' ||
           conn.effectiveType === '3g' ||
           (conn.downlink && conn.downlink < 2);
  }
  return false;
}

// Limitar tamanho do cache
async function trimCache(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxSize) {
      await Promise.all(keys.slice(0, keys.length - maxSize).map(k => cache.delete(k)));
    }
  } catch {}
}

// ====== MESSAGE HANDLERS ======

self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(() => event.ports[0]?.postMessage({ success: false }));
  }
  
  if (type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});

// ====== BACKGROUND SYNC ======

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data' || event.tag === 'background-sync') {
    event.waitUntil(notifyClients('SYNC_COMPLETE'));
  }
});

async function notifyClients(type) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type }));
}

// ====== PUSH NOTIFICATIONS ======

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nautilus One', {
      body: data.body || 'Nova notificação',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clients) => {
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

console.log('[SW v10] Service Worker loaded - Network First for all code assets');
