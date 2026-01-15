/**
 * Push Notifications Service
 * PATCH PUSH-1.0: Service worker e Push API para notificações em tempo real
 */

import { logger } from "@/lib/logger";

// Notification types
export type NotificationType = "critical" | "warning" | "info" | "success";

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  type?: NotificationType;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

// Get current permission status
export function getPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) return "denied";
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushSupported()) {
    logger.warn("Push notifications not supported");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    logger.info("Notification permission:", { permission });
    return permission === "granted";
  } catch (error) {
    logger.error("Error requesting notification permission:", { error });
    return false;
  }
}

// Show a local notification
export async function showNotification(options: PushNotificationOptions): Promise<boolean> {
  if (!isPushSupported()) {
    logger.warn("Notifications not supported");
    return false;
  }

  if (Notification.permission !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  try {
    // Get icon based on type
    const typeIcons: Record<NotificationType, string> = {
      critical: "🚨",
      warning: "⚠️",
      info: "ℹ️",
      success: "✅"
    };

    const icon = options.icon || "/favicon.ico";
    const badge = options.badge || "/favicon.ico";
    
    // Check for service worker
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      // Use service worker notification API which supports actions
      await registration.showNotification(options.title, {
        body: options.body,
        icon,
        badge,
        tag: options.tag || `nauti-${Date.now()}`,
        data: {
          ...options.data,
          type: options.type || "info",
          timestamp: Date.now(),
          url: window.location.href,
          actions: options.actions // Store actions in data for SW to handle
        },
        requireInteraction: options.requireInteraction ?? options.type === "critical",
        silent: options.silent ?? false
      } as NotificationOptions);
    } else {
      // Fallback to regular notification (no actions support)
      new Notification(options.title, {
        body: options.body,
        icon,
        badge,
        tag: options.tag || `nauti-${Date.now()}`,
        data: options.data,
        silent: options.silent ?? false
      });
    }

    logger.info("Notification shown:", { title: options.title, type: options.type });
    return true;
  } catch (error) {
    logger.error("Error showing notification:", { error });
    return false;
  }
}

// Show critical alert notification
export async function showCriticalAlert(title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
  return showNotification({
    title: `🚨 ${title}`,
    body,
    type: "critical",
    requireInteraction: true,
    data,
    actions: [
      { action: "view", title: "Ver Detalhes" },
      { action: "dismiss", title: "Dispensar" }
    ]
  });
}

// Show warning notification
export async function showWarning(title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
  return showNotification({
    title: `⚠️ ${title}`,
    body,
    type: "warning",
    data
  });
}

// Show info notification
export async function showInfo(title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
  return showNotification({
    title,
    body,
    type: "info",
    data,
    silent: true
  });
}

// Show success notification
export async function showSuccess(title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
  return showNotification({
    title: `✅ ${title}`,
    body,
    type: "success",
    data,
    silent: true
  });
}

// Register service worker for push notifications
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    logger.warn("Service Worker not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw-push.js", {
      scope: "/"
    });
    
    logger.info("Push service worker registered:", { scope: registration.scope });
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    logger.error("Error registering push service worker:", { error });
    return null;
  }
}

// Subscribe to push notifications (for future server-side push)
export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // For now, we'll just use local notifications
    // Server-side push would require VAPID keys
    logger.info("Push subscription ready for future server-side implementation");
    return null;
  } catch (error) {
    logger.error("Error subscribing to push:", { error });
    return null;
  }
}

// Initialize push notifications system
export async function initializePushNotifications(): Promise<boolean> {
  if (!isPushSupported()) {
    logger.warn("Push notifications not supported in this browser");
    return false;
  }

  // Register service worker
  const registration = await registerPushServiceWorker();
  if (!registration) return false;

  // Request permission if not already granted
  if (Notification.permission === "default") {
    // Don't auto-request, let the user trigger it
    logger.info("Push notifications ready, waiting for user permission");
  }

  return true;
}

// Hook for React components
export function usePushNotifications() {
  const isSupported = isPushSupported();
  const permission = getPermissionStatus();

  return {
    isSupported,
    permission,
    requestPermission: requestNotificationPermission,
    showNotification,
    showCriticalAlert,
    showWarning,
    showInfo,
    showSuccess
  };
}