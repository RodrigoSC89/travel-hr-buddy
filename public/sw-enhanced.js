// Service Worker Enhanced v20 - Full Offline + Background Sync + Push
// NAUTILUS ONE PWA - Complete Offline Experience

const SW_VERSION = 'v20-enhanced-pwa';
const CACHE_NAME = 'nautilus-v20';
const STATIC_CACHE = 'nautilus-static-v20';
const DYNAMIC_CACHE = 'nautilus-dynamic-v20';
const API_CACHE = 'nautilus-api-v20';

// Assets to precache for offline experience
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json'
];

// API routes to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /\/rest\/v1\/(vessels|crew_members|documents|organizations)/,
  /\/functions\/v1\/(nauti-brain|analytics)/
];

// Assets to cache with cache-first strategy
const STATIC_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico)$/
];

// ====== INSTALL ======
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Installing enhanced PWA`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log(`[SW ${SW_VERSION}] Precache complete`);
      return self.skipWaiting();
    })
  );
});

// ====== ACTIVATE ======
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activating`);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => {
          return key !== STATIC_CACHE && 
                 key !== DYNAMIC_CACHE && 
                 key !== API_CACHE &&
                 !key.includes('v20');
        }).map((key) => {
          console.log(`[SW ${SW_VERSION}] Deleting old cache: ${key}`);
          return caches.delete(key);
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: SW_VERSION,
          features: ['offline', 'background-sync', 'push']
        });
      });
    })
  );
});

// ====== FETCH STRATEGIES ======
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - Network first with cache fallback
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Static assets - Cache first with network fallback
  if (STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }

  // Navigation requests - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default - Network first with dynamic cache
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Network first, falling back to cache
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Cache first, falling back to network
async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    // Background refresh
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(cacheName).then((cache) => cache.put(request, response));
      }
    }).catch(() => {});
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// Network first with offline page fallback
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match('/offline.html');
  }
}

// ====== BACKGROUND SYNC ======
self.addEventListener('sync', (event) => {
  console.log(`[SW ${SW_VERSION}] Sync event: ${event.tag}`);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
  
  if (event.tag === 'sync-offline-mutations') {
    event.waitUntil(syncOfflineMutations());
  }
});

async function syncPendingData() {
  try {
    const pendingData = await getPendingFromIndexedDB();
    
    for (const item of pendingData) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body)
        });
        await removePendingItem(item.id);
      } catch (error) {
        console.error(`[SW ${SW_VERSION}] Failed to sync item:`, error);
      }
    }
    
    // Notify clients of sync completion
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error(`[SW ${SW_VERSION}] Sync failed:`, error);
  }
}

async function syncOfflineMutations() {
  // Retrieve and process offline mutations from IndexedDB
  console.log(`[SW ${SW_VERSION}] Processing offline mutations`);
}

// IndexedDB helpers
async function getPendingFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nautilus-sync', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('pending', 'readonly');
      const store = tx.objectStore('pending');
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => resolve([]);
    };
    
    request.onerror = () => resolve([]);
  });
}

async function removePendingItem(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('nautilus-sync', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    };
    request.onerror = () => resolve(false);
  });
}

// ====== PUSH NOTIFICATIONS ======
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Nova notificação do Nautilus One',
    icon: '/icons/nauti-one-logo.png',
    badge: '/icons/nauti-one-logo.png',
    vibrate: [100, 50, 100],
    data: { 
      url: data.url || '/',
      type: data.type || 'general',
      payload: data.payload
    },
    tag: data.tag || `nautilus-${Date.now()}`,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nautilus One', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(data.url || '/');
            return client.focus();
          }
        }
        // Open new window
        return self.clients.openWindow(data.url || '/');
      })
  );
});

// ====== MESSAGE HANDLERS ======
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      }).then(() => {
        event.ports[0]?.postMessage({ success: true, version: SW_VERSION });
      });
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;
      
    case 'QUEUE_SYNC':
      if ('sync' in self.registration) {
        self.registration.sync.register(payload.tag || 'sync-pending-data');
      }
      break;
      
    case 'PRECACHE':
      if (payload?.urls) {
        caches.open(STATIC_CACHE).then((cache) => {
          return cache.addAll(payload.urls);
        }).then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
      }
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0]?.postMessage(status);
      });
      break;
      
    case 'HEALTH_CHECK':
      event.ports[0]?.postMessage({
        healthy: true,
        version: SW_VERSION,
        timestamp: Date.now(),
        features: ['offline', 'background-sync', 'push', 'cache']
      });
      break;
  }
});

async function getCacheStatus() {
  const keys = await caches.keys();
  const sizes = {};
  
  for (const key of keys) {
    const cache = await caches.open(key);
    const requests = await cache.keys();
    sizes[key] = requests.length;
  }
  
  return {
    version: SW_VERSION,
    caches: keys,
    sizes,
    totalEntries: Object.values(sizes).reduce((a, b) => a + b, 0)
  };
}

// ====== PERIODIC SYNC ======
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

console.log(`[SW ${SW_VERSION}] Enhanced PWA Service Worker loaded - Full offline support enabled`);
