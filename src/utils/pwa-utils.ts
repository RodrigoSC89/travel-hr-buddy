/**
 * PWA Utilities - PATCHES 598-600
 * Service Worker registration, push notifications, and offline support
 */

// PATCH 598: Service Worker Registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // PATCH 600: Always check for updates
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // PATCH 599: Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// PATCH 598: Push Notification Support
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// PATCH 598: Subscribe to Push Notifications
export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // PATCH 600: Secure push subscription with applicationServerKey
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      )
    });

    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

// PATCH 600: Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// PATCH 598: Show local notification
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(title, {
    icon: '/nautilus-logo.png',
    badge: '/icons/icon.svg',
    ...options
  });
}

// PATCH 599: Check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// PATCH 599: Listen to online/offline events
export function addConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// PATCH 599: Cache API utilities
export async function getCachedData<T>(cacheName: string, url: string): Promise<T | null> {
  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(url);
    
    if (!response) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export async function setCachedData<T>(
  cacheName: string,
  url: string,
  data: T
): Promise<void> {
  try {
    const cache = await caches.open(cacheName);
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300' // 5 minutes
      }
    });
    
    await cache.put(url, response);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// PATCH 599: Clear old caches
export async function clearOldCaches(currentCacheNames: string[]): Promise<void> {
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames
      .filter(name => !currentCacheNames.includes(name))
      .map(name => caches.delete(name))
  );
}

// PATCH 600: Check if app is installed as PWA
export function isPWAInstalled(): boolean {
  // Check if running in standalone mode (installed as PWA)
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// PATCH 598: Prompt user to install PWA
export function addInstallPromptListener(
  onPromptAvailable: (event: Event) => void
): () => void {
  window.addEventListener('beforeinstallprompt', onPromptAvailable);
  
  return () => {
    window.removeEventListener('beforeinstallprompt', onPromptAvailable);
  };
}

// PATCH 598: Show install prompt
export async function promptPWAInstall(event: any): Promise<boolean> {
  if (!event) {
    return false;
  }

  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();
  
  // Show the install prompt
  event.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await event.userChoice;
  
  return outcome === 'accepted';
}

// PATCH 600: Security - Check HTTPS
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

// PATCH 599: Background sync support
export async function registerBackgroundSync(
  tag: string,
  registration: ServiceWorkerRegistration
): Promise<void> {
  if (!('sync' in registration)) {
    console.warn('Background Sync not supported');
    return;
  }

  try {
    await (registration as any).sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
  } catch (error) {
    console.error('Background sync registration failed:', error);
  }
}

// PATCH 598: Get app manifest
export async function getManifest(): Promise<any> {
  try {
    const response = await fetch('/manifest.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch manifest:', error);
    return null;
  }
}

// PATCH 600: Security - Validate service worker origin
export function validateServiceWorkerOrigin(registration: ServiceWorkerRegistration): boolean {
  const swUrl = new URL(registration.active?.scriptURL || '');
  return swUrl.origin === window.location.origin;
}
