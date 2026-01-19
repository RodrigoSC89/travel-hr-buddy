// Service Worker Nautilus One v11
// ESTRATÉGIA MINIMALISTA: Máxima estabilidade
// v11: Desabilita cache de JS/CSS completamente para evitar loops
const CACHE_VERSION = 'v11';
const IMAGE_CACHE = `nautilus-images-${CACHE_VERSION}`;

// NENHUM precaching - instalação instantânea
self.addEventListener('install', (event) => {
  console.log('[SW v11] Installing - Zero precache mode');
  self.skipWaiting();
});

// Ativação: limpar TODOS os caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW v11] Activating - Purging ALL old caches');
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !key.includes(CACHE_VERSION))
          .map((key) => {
            console.log('[SW v11] Deleting cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// Estratégia ULTRA SIMPLES: 
// - Auth/API/Code = BYPASS total (network only, sem SW)
// - Imagens = Cache First
// - Todo o resto = Network Only
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar non-http
  if (!url.protocol.startsWith('http')) return;

  // Ignorar non-GET
  if (request.method !== 'GET') return;

  // ⚠️ BYPASS TOTAL: Auth, API, Supabase, Code assets
  if (shouldBypass(url, request)) {
    return; // Browser faz fetch normal
  }

  // Apenas imagens são cacheadas
  if (isImage(url.pathname)) {
    event.respondWith(imageCacheFirst(request));
    return;
  }

  // Todo o resto: deixa o browser fazer
  return;
});

// ====== HELPERS ======

function shouldBypass(url, request) {
  const path = url.pathname.toLowerCase();
  const host = url.hostname.toLowerCase();
  
  // Auth paths
  if (path.includes('/auth') || path.includes('/token') || 
      path.includes('/session') || path.includes('/callback') ||
      path.includes('/login') || path.includes('/signup') ||
      path.includes('/verify') || path.includes('/recover') ||
      path.includes('/user') || path.includes('/logout')) {
    return true;
  }
  
  // Supabase
  if (host.includes('supabase')) {
    return true;
  }
  
  // API
  if (path.includes('/rest/') || path.includes('/functions/') || path.includes('/api/')) {
    return true;
  }
  
  // Code assets (JS, CSS, chunks)
  if (/\.(js|mjs|css)(\?.*)?$/.test(path)) {
    return true;
  }
  
  // HTML navigation
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    return true;
  }
  
  return false;
}

function isImage(pathname) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)(\?.*)?$/.test(pathname);
}

// Cache First apenas para imagens
async function imageCacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone()).catch(() => {});
      trimImageCache();
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function trimImageCache() {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const keys = await cache.keys();
    if (keys.length > 50) {
      await Promise.all(keys.slice(0, keys.length - 50).map(k => cache.delete(k)));
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
  
  if (type === 'UNREGISTER') {
    self.registration.unregister()
      .then(() => event.ports[0]?.postMessage({ success: true }))
      .catch(() => event.ports[0]?.postMessage({ success: false }));
  }
});

console.log('[SW v11] Minimal Service Worker - Images only cache');
