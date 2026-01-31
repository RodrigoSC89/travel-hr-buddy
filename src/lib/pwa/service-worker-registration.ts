/**
 * Service Worker Registration
 * PATCH 833: PWA Service Worker lifecycle management
 */

interface SWConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: SWConfig = {};

  async register(config: SWConfig = {}) {
    this.config = config;

    if (!('serviceWorker' in navigator)) {
      logger.debug('[SW] Service Workers not supported');
      return;
    }

    // Only register in production
    if (import.meta.env.DEV) {
      logger.debug('[SW] Skipping SW registration in development');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration = registration;

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                logger.debug('[SW] New content available');
                config.onUpdate?.(registration);
              } else {
                // Content cached for offline use
                logger.debug('[SW] Content cached for offline use');
                config.onSuccess?.(registration);
              }
            }
          });
        }
      });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.debug('[SW] Controller changed');
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_COMPLETE') {
          logger.debug('[SW] Background sync completed');
        }
      });

      logger.debug('[SW] Service Worker registered successfully');
    } catch (error) {
      logger.error('[SW] Service Worker registration failed:', error);
    }

    // PATCH v21: Listeners de rede SIMPLIFICADOS - apenas 'online' para trigger de sync
    // NÃO escutar 'offline' - causa falsos positivos no iOS PWA
    window.addEventListener('online', () => {
      logger.debug('[SW] Back online - triggering sync');
      config.onOnline?.();
    });
    // REMOVIDO: listener 'offline' que bloqueava login no iOS
  }

  async unregister() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      logger.debug('[SW] Service Worker unregistered');
    } catch (error) {
      logger.error('[SW] Unregister failed:', error);
    }
  }

  async update() {
    if (this.registration) {
      try {
        await this.registration.update();
        logger.debug('[SW] Service Worker updated');
      } catch (error) {
        logger.error('[SW] Update failed:', error);
      }
    }
  }

  skipWaiting() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  clearCache() {
    navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    return await Notification.requestPermission();
  }

  async subscribeToPush(vapidPublicKey?: string): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      return subscription;
    } catch (error) {
      logger.error('[SW] Push subscription failed:', error);
      return null;
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

export const swManager = new ServiceWorkerManager();

// React hook for PWA status
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  // PATCH v16 iOS PWA: SEMPRE false - navigator.onLine causa falsos positivos
  const [isOffline] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register service worker
    swManager.register({
      onUpdate: () => setHasUpdate(true),
      // PATCH v17: Removido handlers de online/offline - causam falsos positivos no iOS PWA
      onOffline: () => {}, // No-op
      onOnline: () => {}, // No-op
    });

    // PATCH v16 iOS PWA: REMOVIDO event listeners de online/offline
    // Estes causavam falsos positivos no iOS Safari PWA

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === 'accepted';
  };

  const updateApp = () => {
    swManager.skipWaiting();
    window.location.reload();
  };

  return {
    isInstalled,
    isInstallable,
    isOffline,
    hasUpdate,
    install,
    updateApp,
    clearCache: () => swManager.clearCache(),
  };
}
