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

    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Only register in production
    if (import.meta.env.DEV) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      this.registration = registration;

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                config.onUpdate?.(registration);
              } else {
                // Content cached for offline use
                config.onSuccess?.(registration);
              }
            }
          });
        }
      });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SYNC_COMPLETE") {
        }
      });

    } catch (error) {
      console.error("[SW] Service Worker registration failed:", error);
      console.error("[SW] Service Worker registration failed:", error);
    }

    // Network status listeners
    window.addEventListener("online", () => {
      config.onOnline?.();
    });

    window.addEventListener("offline", () => {
      config.onOffline?.();
    });
  }

  async unregister() {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    } catch (error) {
      console.error("[SW] Unregister failed:", error);
      console.error("[SW] Unregister failed:", error);
    }
  }

  async update() {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.error("[SW] Update failed:", error);
        console.error("[SW] Update failed:", error);
      }
    }
  }

  skipWaiting() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  clearCache() {
    navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_CACHE" });
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
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
      console.error("[SW] Push subscription failed:", error);
      console.error("[SW] Push subscription failed:", error);
      return null;
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

export const swManager = new ServiceWorkerManager();

// React hook for PWA status
import { useState, useEffect } from "react";

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Register service worker
    swManager.register({
      onUpdate: () => setHasUpdate(true),
      onOffline: () => setIsOffline(true),
      onOnline: () => setIsOffline(false),
    });

    // Network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    });
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === "accepted";
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
