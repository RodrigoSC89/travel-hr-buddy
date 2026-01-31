/**
 * PWA Enhancements
 * NAUTI ONE v4.0 - Progressive Web App Optimizations
 * 
 * Features: Install prompts, offline handling, app badges, shortcuts
 */

import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
    logger.debug('[PWA] Running as installed app');
  }
  
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pwaState.deferredPrompt = e as BeforeInstallPromptEvent;
    pwaState.isInstallable = true;
    logger.debug('[PWA] Install prompt available');
  });
  
  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    pwaState.isInstalled = true;
    pwaState.isInstallable = false;
    pwaState.deferredPrompt = null;
    logger.debug('[PWA] App installed successfully');
    toast.success('NAUTI ONE instalado com sucesso!');
  });
  
  // Register service worker updates
  registerServiceWorkerUpdates();
  
  // Initialize background sync
  initBackgroundSync();
  
  // Initialize push notifications
  initPushNotifications();
  
  logger.debug('[PWA] Initialized');
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
    logger.warn('[PWA] Install prompt not available');
    return false;
  }
  
  try {
    await pwaState.deferredPrompt.prompt();
    const { outcome } = await pwaState.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      logger.debug('[PWA] User accepted install');
      return true;
    } else {
      logger.debug('[PWA] User dismissed install');
      return false;
    }
  } catch (error) {
    logger.error('[PWA] Install prompt error:', error);
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
    logger.warn('[PWA] Service Worker not supported');
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
    logger.warn('[PWA] Background Sync not supported');
    return;
  }
  
  // Register sync event listener
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_COMPLETE') {
      logger.debug('[PWA] Background sync completed:', event.data.tag);
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
      logger.debug('[PWA] Background sync registered:', tag);
      return true;
    }
  } catch (error) {
    logger.error('[PWA] Background sync error:', error);
  }
  
  return false;
}

/**
 * Initialize push notifications
 */
async function initPushNotifications(): Promise<void> {
  if (!('Notification' in window)) {
    logger.warn('[PWA] Notifications not supported');
    return;
  }
  
  // Check current permission
  const permission = Notification.permission;
  logger.debug('[PWA] Notification permission:', permission);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  logger.debug('[PWA] Notification permission result:', permission);
  
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
    logger.warn('[PWA] Cannot show notification');
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
    logger.warn('[PWA] App Badge not supported');
    return;
  }
  
  try {
    if (count > 0) {
      await (navigator as any).setAppBadge(count);
    } else {
      await (navigator as any).clearAppBadge();
    }
    logger.debug('[PWA] App badge set:', count);
  } catch (error) {
    logger.error('[PWA] App badge error:', error);
  }
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    logger.warn('[PWA] Web Share API not supported');
    return false;
  }
  
  try {
    await navigator.share(data);
    logger.debug('[PWA] Content shared successfully');
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      logger.error('[PWA] Share error:', error);
    }
    return false;
  }
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Cache page for offline access
 */
export async function cacheForOffline(urls: string[]): Promise<void> {
  if (!('caches' in window)) {
    logger.warn('[PWA] Cache API not supported');
    return;
  }
  
  try {
    const cache = await caches.open('nauti-one-v4-pages');
    await cache.addAll(urls);
    logger.debug('[PWA] Pages cached for offline:', urls);
  } catch (error) {
    logger.error('[PWA] Cache error:', error);
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
