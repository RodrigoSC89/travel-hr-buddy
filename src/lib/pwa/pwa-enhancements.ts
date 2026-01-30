/**
 * PWA Enhancements
 * NAUTI ONE v4.0 - Progressive Web App Optimizations
 * 
 * Features: Install prompts, offline handling, app badges, shortcuts
 */

import { toast } from 'sonner';

// PWA Install State
interface PWAInstallState {
  isInstalled: boolean;
  isInstallable: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const pwaState: PWAInstallState = {
  isInstalled: false,
  isInstallable: false,
  deferredPrompt: null
};

/**
 * Initialize PWA features
 */
export function initPWA(): void {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    pwaState.isInstalled = true;
    console.log('[PWA] Running as installed app');
  }
  
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pwaState.deferredPrompt = e as BeforeInstallPromptEvent;
    pwaState.isInstallable = true;
    console.log('[PWA] Install prompt available');
  });
  
  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    pwaState.isInstalled = true;
    pwaState.isInstallable = false;
    pwaState.deferredPrompt = null;
    console.log('[PWA] App installed successfully');
    toast.success('NAUTI ONE instalado com sucesso!');
  });
  
  // Register service worker updates
  registerServiceWorkerUpdates();
  
  // Initialize background sync
  initBackgroundSync();
  
  // Initialize push notifications
  initPushNotifications();
  
  console.log('[PWA] Initialized');
}

/**
 * Check if PWA is installable
 */
export function isPWAInstallable(): boolean {
  return pwaState.isInstallable && !pwaState.isInstalled;
}

/**
 * Check if running as installed PWA
 */
export function isPWAInstalled(): boolean {
  return pwaState.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * Prompt user to install PWA
 */
export async function promptInstall(): Promise<boolean> {
  if (!pwaState.deferredPrompt) {
    console.warn('[PWA] Install prompt not available');
    return false;
  }
  
  try {
    await pwaState.deferredPrompt.prompt();
    const { outcome } = await pwaState.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
      return true;
    } else {
      console.log('[PWA] User dismissed install');
      return false;
    }
  } catch (error) {
    console.error('[PWA] Install prompt error:', error);
    return false;
  } finally {
    pwaState.deferredPrompt = null;
    pwaState.isInstallable = false;
  }
}

/**
 * Register service worker and handle updates
 */
function registerServiceWorkerUpdates(): void {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker not supported');
    return;
  }
  
  navigator.serviceWorker.ready.then((registration) => {
    // Check for updates every 5 minutes
    setInterval(() => {
      registration.update();
    }, 5 * 60 * 1000);
    
    // Listen for update found
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateNotification(registration);
          }
        });
      }
    });
  });
}

/**
 * Show update notification
 */
function showUpdateNotification(registration: ServiceWorkerRegistration): void {
  toast('Nova versão disponível!', {
    description: 'Clique para atualizar o aplicativo.',
    action: {
      label: 'Atualizar',
      onClick: () => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
    duration: Infinity
  });
}

/**
 * Initialize background sync
 */
async function initBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('sync' in (await navigator.serviceWorker.ready))) {
    console.warn('[PWA] Background Sync not supported');
    return;
  }
  
  // Register sync event listener
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_COMPLETE') {
      console.log('[PWA] Background sync completed:', event.data.tag);
      toast.success('Dados sincronizados com sucesso!');
    }
  });
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log('[PWA] Background sync registered:', tag);
      return true;
    }
  } catch (error) {
    console.error('[PWA] Background sync error:', error);
  }
  
  return false;
}

/**
 * Initialize push notifications
 */
async function initPushNotifications(): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications not supported');
    return;
  }
  
  // Check current permission
  const permission = Notification.permission;
  console.log('[PWA] Notification permission:', permission);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  console.log('[PWA] Notification permission result:', permission);
  
  if (permission === 'granted') {
    toast.success('Notificações ativadas!');
  }
  
  return permission;
}

/**
 * Show local notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('[PWA] Cannot show notification');
    return;
  }
  
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    ...options
  });
}

/**
 * Set app badge (notification count)
 */
export async function setAppBadge(count: number): Promise<void> {
  if (!('setAppBadge' in navigator)) {
    console.warn('[PWA] App Badge not supported');
    return;
  }
  
  try {
    if (count > 0) {
      await (navigator as any).setAppBadge(count);
    } else {
      await (navigator as any).clearAppBadge();
    }
    console.log('[PWA] App badge set:', count);
  } catch (error) {
    console.error('[PWA] App badge error:', error);
  }
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    console.warn('[PWA] Web Share API not supported');
    return false;
  }
  
  try {
    await navigator.share(data);
    console.log('[PWA] Content shared successfully');
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('[PWA] Share error:', error);
    }
    return false;
  }
}

/**
 * Check online status
 * PATCH v37: Sempre retorna true - navigator.onLine não é confiável no iOS PWA
 */
export function isOnline(): boolean {
  // PATCH v37: Sempre retornar true para evitar falsos positivos no iOS PWA
  return true;
}

/**
 * Listen for online/offline events
 * PATCH v37: Apenas escuta 'online' - ignora 'offline' para evitar falsos positivos
 */
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  // PATCH v37: REMOVIDO handleOffline - causaria falsos positivos no iOS PWA
  
  window.addEventListener('online', handleOnline);
  // PATCH v37: REMOVIDO listener offline
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

/**
 * Cache page for offline access
 */
export async function cacheForOffline(urls: string[]): Promise<void> {
  if (!('caches' in window)) {
    console.warn('[PWA] Cache API not supported');
    return;
  }
  
  try {
    const cache = await caches.open('nauti-one-v4-pages');
    await cache.addAll(urls);
    console.log('[PWA] Pages cached for offline:', urls);
  } catch (error) {
    console.error('[PWA] Cache error:', error);
  }
}

/**
 * Get PWA status
 */
export function getPWAStatus(): {
  installed: boolean;
  installable: boolean;
  online: boolean;
  notificationsEnabled: boolean;
  serviceWorkerActive: boolean;
} {
  return {
    installed: isPWAInstalled(),
    installable: isPWAInstallable(),
    online: isOnline(),
    notificationsEnabled: 'Notification' in window && Notification.permission === 'granted',
    serviceWorkerActive: 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
  };
}

export default {
  initPWA,
  isPWAInstallable,
  isPWAInstalled,
  promptInstall,
  requestBackgroundSync,
  requestNotificationPermission,
  showNotification,
  setAppBadge,
  shareContent,
  isOnline,
  onConnectionChange,
  cacheForOffline,
  getPWAStatus
};
