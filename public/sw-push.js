/**
 * Push Notifications Service Worker
 * PATCH PUSH-1.0: Handles push notifications for Nautilus One
 */

// Cache name for offline support
const CACHE_NAME = "nautilus-push-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("[SW Push] Installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("[SW Push] Activating...");
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW Push] Push received:", event);

  let data = {
    title: "Nautilus One",
    body: "Nova notificação",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {}
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    tag: data.tag || `nautilus-${Date.now()}`,
    data: data.data,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: "view", title: "Ver" },
      { action: "dismiss", title: "Fechar" }
    ],
    vibrate: data.type === "critical" ? [200, 100, 200, 100, 200] : [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW Push] Notification clicked:", event.action);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === "dismiss") {
    return;
  }

  // Default: open the app or focus existing window
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // Navigate to the relevant page if URL is provided
            if (data.url) {
              client.navigate(data.url);
            }
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (self.clients.openWindow) {
          const url = data.url || "/nautilus-command";
          return self.clients.openWindow(url);
        }
      })
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[SW Push] Notification closed");
});

// Message event - handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("[SW Push] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

// Periodic sync for background updates (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "nautilus-alerts-sync") {
    console.log("[SW Push] Periodic sync: checking alerts");
    // Future: Check for new alerts from server
  }
});

console.log("[SW Push] Service worker loaded");