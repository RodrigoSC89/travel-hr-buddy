import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "../sentry.client.config";
import { logger } from "@/lib/logger";
import { initializeTheme } from "@/lib/theme/theme-utils";

// Initialize theme before rendering
initializeTheme();

// Defer non-critical initializations
const initializeApp = async () => {
  try {
    // PATCH 651.0: Run health check on startup
    const { initHealthCheck } = await import("@/lib/module-health");
    initHealthCheck();
    
    // PATCH 815: Initialize performance optimizations
    const { initializePerformance } = await import("@/lib/performance/init");
    initializePerformance();
    
    // PATCH 800: Initialize offline sync manager
    const { initializeSyncManager } = await import("@/lib/offline/sync-manager");
    initializeSyncManager();
    
    // PATCH 700: Initialize performance monitoring (only in production)
    if (import.meta.env.PROD) {
      const { webVitalsMonitor } = await import("@/lib/web-vitals-monitor");
      webVitalsMonitor.initialize({
        onMetric: (metric) => {
          logger.debug(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
        },
        onAlert: (metric, message) => {
          logger.warn(`[WebVitals Alert] ${message}`);
        }
      });
    }
  } catch (error) {
    logger.warn("Non-critical initialization failed:", { error: String(error) });
  }
};

// Register service worker after page load
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const { registerServiceWorker, monitorNetworkStatus, setupInstallPrompt, isPWAInstalled } = 
        await import("@/utils/pwa-utils");
      
      const result = await registerServiceWorker("/sw.js", { scope: "/" });
      
      if (result.success) {
        logger.info("✅ PWA Service Worker registered");
        
        monitorNetworkStatus((status) => {
          if (!status.online) {
            logger.warn("⚠️ Application offline");
          }
        });

        if (isPWAInstalled()) {
          logger.info("✅ Running as installed PWA");
        }

        setupInstallPrompt(
          (prompt) => {
            (window as any).__pwa_install_prompt = prompt;
          },
          () => {
            logger.info("✅ PWA installed");
          }
        );
      }
    } catch (error) {
      logger.warn("Service worker registration failed:", { error: String(error) });
    }
  });
}

// Initialize non-critical features after render
requestIdleCallback?.(() => initializeApp()) || setTimeout(initializeApp, 100);

// Render the app
const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
}
