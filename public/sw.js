/**
 * Enhanced Service Worker for PWA Features
 */

const CACHE_NAME = 'nautilus-one-v2';
const RUNTIME_CACHE = 'nautilus-runtime-v2';
const IMAGE_CACHE = 'nautilus-images-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

const MAX_RUNTIME_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

/**
 * Install event - precache assets
 */
self.addEventListener('install', (event) => {
  console.log('SW: Installing v2...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Precaching assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v2...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - smart caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API/Supabase calls for real-time data
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/supabase/') ||
      url.pathname.includes('/functions/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache images
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(networkFirst(request));
});

/**
 * Network first strategy
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      await limitCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

/**
 * Cache first strategy
 */
async function cacheFirst(request, cacheName, maxSize) {
  const cached = await caches.match(request);
  
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await limitCache(cacheName, maxSize);
    }
    
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Limit cache size
 */
async function limitCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    await cache.delete(keys[0]);
    await limitCache(cacheName, maxSize);
  }
}

/**
 * Background sync
 */
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('SW: Syncing offline data...');
  // Implement actual sync logic as needed
  return Promise.resolve();
}

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
  };
  
  event.waitUntil(
    self.registration.showNotification('Nautilus One', options)
  );
});

/**
 * Notification click
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

console.log('SW: Enhanced service worker loaded');