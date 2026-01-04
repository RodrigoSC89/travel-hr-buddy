/**
 * PWA Status Hook
 * Monitors PWA installation, offline status, and service worker updates
 * PATCH: Roadmap v3.2.0 - PWA & Mobile Ready
 */

import { useState, useEffect, useCallback } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  isStandalone: boolean;
  serviceWorkerStatus: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'unknown';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isUpdateAvailable: false,
    isStandalone: false,
    serviceWorkerStatus: 'unknown',
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if app is running in standalone mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setStatus(prev => ({ ...prev, isStandalone, isInstalled: isStandalone }));
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Monitor service worker status
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const checkServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) {
          setStatus(prev => ({ ...prev, serviceWorkerStatus: 'unknown' }));
          return;
        }

        const sw = registration.installing || registration.waiting || registration.active;
        
        if (sw) {
          setStatus(prev => ({ 
            ...prev, 
            serviceWorkerStatus: sw.state as PWAStatus['serviceWorkerStatus'],
            isUpdateAvailable: !!registration.waiting,
          }));

          sw.addEventListener('statechange', () => {
            setStatus(prev => ({ 
              ...prev, 
              serviceWorkerStatus: sw.state as PWAStatus['serviceWorkerStatus'],
            }));
          });
        }

        // Listen for update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });
      } catch (error) {
        console.error('[PWA] Error checking service worker:', error);
      }
    };

    checkServiceWorker();
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setStatus(prev => ({ ...prev, isInstalled: true }));
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Install error:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setStatus(prev => ({ ...prev, isUpdateAvailable: false }));
        window.location.reload();
      }
    } catch (error) {
      console.error('[PWA] Update error:', error);
    }
  }, []);

  return {
    ...status,
    canInstall: !!deferredPrompt,
    installPWA,
    updateServiceWorker,
  };
}
