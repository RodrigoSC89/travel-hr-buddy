/**
 * Compliance Push Notifications Service Worker
 * PATCH COMPLIANCE-SW-1.0: Handles push notifications for compliance alerts
 * Works in background even when app is closed
 */

const CACHE_NAME = "nautilus-compliance-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("[SW Compliance] Installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("[SW Compliance] Activating...");
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW Compliance] Push received:", event);

  let data = {
    title: "Alerta de Compliance",
    body: "Novo alerta de compliance requer atenção",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      module: "compliance",
      url: "/compliance-center"
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    tag: data.tag || `compliance-${Date.now()}`,
    data: data.data,
    requireInteraction: data.type === "critical",
    vibrate: data.type === "critical" ? [200, 100, 200, 100, 200] : [100, 50, 100],
    actions: [
      { action: "view", title: "Ver Detalhes" },
      { action: "dismiss", title: "Ignorar" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW Compliance] Notification clicked:", event.action);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === "dismiss") {
    return;
  }

  // Navigate to compliance center or specific module
  const targetUrl = data.url || "/compliance-center";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[SW Compliance] Notification closed");
  
  // Track dismissed alerts for analytics
  const data = event.notification.data;
  if (data && data.alertId) {
    // Could send analytics event here
  }
});

// Message event - handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("[SW Compliance] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "SHOW_COMPLIANCE_ALERT") {
    const { title, body, module, type, url } = event.data;
    
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `compliance-${module}-${Date.now()}`,
      data: { module, type, url },
      requireInteraction: type === "critical",
      vibrate: type === "critical" ? [200, 100, 200, 100, 200] : [100, 50, 100],
      actions: [
        { action: "view", title: "Ver Detalhes" },
        { action: "dismiss", title: "Ignorar" }
      ]
    });
  }

  // Handle periodic compliance check request
  if (event.data && event.data.type === "CHECK_COMPLIANCE") {
    // Respond back with status
    event.ports[0]?.postMessage({ status: "checked", timestamp: Date.now() });
  }
});

// Periodic sync for background compliance checks (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "compliance-check") {
    console.log("[SW Compliance] Periodic sync: checking compliance status");
    
    event.waitUntil(
      checkComplianceInBackground()
    );
  }
});

// Background check function
async function checkComplianceInBackground() {
  try {
    // This would fetch from your API to check for critical compliance issues
    // For now, we just log
    console.log("[SW Compliance] Background compliance check completed");
  } catch (error) {
    console.error("[SW Compliance] Background check failed:", error);
  }
}

console.log("[SW Compliance] Service worker loaded");
