/**
 * PWA Utilities - PATCH 598
 * 
 * Provides utilities for Progressive Web App functionality including:
 * - Service worker registration and management
 * - Push notifications with VAPID
 * - Network connectivity monitoring
 * - Update handling
 */

import { logger } from "@/lib/logger";

export interface ServiceWorkerRegistrationResult {
  success: boolean;
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

export interface PushSubscriptionResult {
  success: boolean;
  subscription?: PushSubscription;
  error?: Error;
}

export interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Register service worker with enhanced error handling
 */
export async function registerServiceWorker(
  scriptURL: string = "/sw.js",
  options?: RegistrationOptions
): Promise<ServiceWorkerRegistrationResult> {
  if (!("serviceWorker" in navigator)) {
    return {
      success: false,
      error: new Error("Service Worker not supported in this browser")
    };
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptURL, options);
    logger.info("✅ PWA Service Worker registered successfully", { scope: registration.scope });
    
    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            logger.info("🔄 New service worker available - update ready");
            // Emit custom event for UI to handle
            window.dispatchEvent(new CustomEvent("sw-update-available", { detail: registration }));
          }
        });
      }
    });

    return { success: true, registration };
  } catch (error) {
    logger.error("❌ Service Worker registration failed", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Request permission for push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    logger.warn("Push notifications not supported");
    return "denied";
  }

  const permission = await Notification.requestPermission();
  logger.info("Notification permission:", permission);
  return permission;
}

/**
 * Subscribe to push notifications with VAPID
 */
export async function subscribeToPushNotifications(
  vapidPublicKey: string,
  registration?: ServiceWorkerRegistration
): Promise<PushSubscriptionResult> {
  try {
    const swRegistration = registration || await navigator.serviceWorker.ready;
    
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: new Error("Notification permission denied")
      };
    }

    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    logger.info("✅ Push notification subscription created");
    return { success: true, subscription };
  } catch (error) {
    logger.error("❌ Push subscription failed", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    logger.error("Failed to get push subscription", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getCurrentSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      logger.info("✅ Unsubscribed from push notifications");
      return true;
    }
    return false;
  } catch (error) {
    logger.error("❌ Failed to unsubscribe", error);
    return false;
  }
}

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

/**
 * Monitor network connectivity status
 */
export function monitorNetworkStatus(callback: (status: NetworkStatus) => void): () => void {
  const updateStatus = () => {
    const status: NetworkStatus = {
      online: navigator.onLine
    };

    // Add connection info if available
    if ("connection" in navigator) {
      const conn = (navigator as any).connection as NetworkInformation;
      status.effectiveType = conn?.effectiveType;
      status.downlink = conn?.downlink;
      status.rtt = conn?.rtt;
    }

    callback(status);
  };

  // Initial status
  updateStatus();

  // Listen for changes
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);

  if ("connection" in navigator) {
    const conn = (navigator as any).connection as NetworkInformation;
    conn?.addEventListener?.("change", updateStatus);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener("online", updateStatus);
    window.removeEventListener("offline", updateStatus);
    if ("connection" in navigator) {
      const conn = (navigator as any).connection as NetworkInformation;
      conn?.removeEventListener?.("change", updateStatus);
    }
  };
}

/**
 * Check if app is installed as PWA
 */
export function isPWAInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
}

/**
 * Prompt user to install PWA
 */
export function setupInstallPrompt(
  onInstallable: (prompt: any) => void,
  onInstalled: () => void
): () => void {
  let deferredPrompt: any;

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    onInstallable(deferredPrompt);
  };

  const handleAppInstalled = () => {
    deferredPrompt = null;
    onInstalled();
    logger.info("✅ PWA installed successfully");
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  return () => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaitingAndActivate(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

/**
 * Get service worker state
 */
export async function getServiceWorkerState(): Promise<{
  controller: boolean;
  waiting: boolean;
  installing: boolean;
}> {
  const registration = await navigator.serviceWorker.ready;
  return {
    controller: !!navigator.serviceWorker.controller,
    waiting: !!registration.waiting,
    installing: !!registration.installing
  };
}
