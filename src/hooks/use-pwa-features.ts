/**
 * PWA Features Hook
 * Provides offline support, background sync, and push notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  swVersion: string | null;
  pushEnabled: boolean;
  syncSupported: boolean;
  cacheStatus: CacheStatus | null;
}

export interface CacheStatus {
  version: string;
  caches: string[];
  sizes: Record<string, number>;
  totalEntries: number;
}

export function usePWAFeatures() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    canInstall: false,
    swVersion: null,
    pushEnabled: false,
    syncSupported: 'sync' in window && 'serviceWorker' in navigator,
    cacheStatus: null,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  // Check if installed
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setStatus(prev => ({ ...prev, isInstalled: isStandalone }));
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      toast.success('Conexão restaurada');
      triggerSync('sync-pending-data');
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      toast.warning('Você está offline. Os dados serão sincronizados quando a conexão voltar.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Get SW version on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      getSWVersion();
    }
  }, []);

  // Get Service Worker version
  const getSWVersion = useCallback(async () => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return null;

    return new Promise<string>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => {
        const version = e.data?.version || null;
        setStatus(prev => ({ ...prev, swVersion: version }));
        resolve(version);
      };
      controller.postMessage(
        { type: 'GET_VERSION' },
        [channel.port2]
      );
    });
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      
      if (outcome === 'accepted') {
        setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
        setDeferredPrompt(null);
        toast.success('App instalado com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('Install failed:', error);
    }
    return false;
  }, [deferredPrompt]);

  // Trigger background sync
  const triggerSync = useCallback(async (tag: string = 'sync-pending-data') => {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Sync registration failed:', error);
      return false;
    }
  }, []);

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      setStatus(prev => ({ ...prev, pushEnabled: enabled }));
      
      if (enabled) {
        toast.success('Notificações ativadas!');
      } else {
        toast.info('Notificações não foram permitidas');
      }
      
      return enabled;
    } catch (error) {
      console.error('Push permission failed:', error);
      return false;
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, []);

  // Show local notification
  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission !== 'granted') {
      const granted = await requestPushPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/nauti-one-logo.png',
        badge: '/icons/nauti-one-logo.png',
        ...options
      });
      return true;
    } catch (error) {
      console.error('Show notification failed:', error);
      return false;
    }
  }, [requestPushPermission]);

  // Clear all caches
  const clearCache = useCallback(async () => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return false;

    return new Promise<boolean>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => {
        resolve(e.data?.success || false);
        toast.success('Cache limpo com sucesso');
      };
      controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
    });
  }, []);

  // Get cache status
  const getCacheStatus = useCallback(async () => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return null;

    return new Promise<CacheStatus>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => {
        const cacheStatus = e.data as CacheStatus;
        setStatus(prev => ({ ...prev, cacheStatus }));
        resolve(cacheStatus);
      };
      controller.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [channel.port2]
      );
    });
  }, []);

  // Queue data for background sync
  const queueForSync = useCallback(async (data: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
  }) => {
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.open('nautilus-sync', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pending')) {
          db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction('pending', 'readwrite');
        const store = tx.objectStore('pending');
        
        store.add({
          ...data,
          timestamp: Date.now()
        });

        tx.oncomplete = () => {
          triggerSync('sync-pending-data');
          resolve(true);
        };
        tx.onerror = () => resolve(false);
      };

      request.onerror = () => resolve(false);
    });
  }, [triggerSync]);

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      toast.success('Verificando atualizações...');
      return true;
    } catch (error) {
      console.error('SW update failed:', error);
      return false;
    }
  }, []);

  return {
    status,
    installPWA,
    triggerSync,
    requestPushPermission,
    subscribeToPush,
    showNotification,
    clearCache,
    getCacheStatus,
    queueForSync,
    updateServiceWorker,
    getSWVersion
  };
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePWAFeatures;
