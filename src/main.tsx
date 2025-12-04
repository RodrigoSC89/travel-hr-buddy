import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "../sentry.client.config";
import { logger } from "@/lib/logger";
import { initializeTheme } from "@/lib/theme/theme-utils";
import { initHealthCheck } from "@/lib/module-health";
// PATCH 598: Enhanced PWA utilities
import { 
  registerServiceWorker, 
  monitorNetworkStatus,
  setupInstallPrompt,
  isPWAInstalled
} from "@/utils/pwa-utils";
// PATCH 700: Performance optimizations
import { webVitalsMonitor } from "@/lib/web-vitals-monitor";
import { imageOptimizer } from "@/lib/image-optimizer";

// PATCH 129.0: Initialize theme before rendering
initializeTheme();

// PATCH 651.0: Run health check on startup
initHealthCheck();

// PATCH 700: Initialize performance monitoring
webVitalsMonitor.initialize({
  onMetric: (metric) => {
    logger.debug(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  },
  onAlert: (metric, message) => {
    logger.warn(`[WebVitals Alert] ${message}`);
  }
});

// Initialize image optimizer
imageOptimizer.initialize().then(() => {
  const support = imageOptimizer.getSupport();
  logger.info(`[ImageOptimizer] WebP: ${support?.webp}, AVIF: ${support?.avif}`);
});

// PATCH 598: Enhanced PWA initialization with utilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    // Register service worker with enhanced error handling
    const result = await registerServiceWorker("/sw.js", { scope: "/" });
    
    if (result.success) {
      logger.info("✅ PWA Service Worker registered successfully");
      
      // Monitor network status
      monitorNetworkStatus((status) => {
        if (!status.online) {
          logger.warn("⚠️ Application is offline - using cached resources");
        } else {
          logger.info("✅ Application is online");
        }
      });

      // Check if PWA is installed
      if (isPWAInstalled()) {
        logger.info("✅ Running as installed PWA");
      }

      // Setup install prompt handler
      setupInstallPrompt(
        (prompt) => {
          logger.info("💡 PWA can be installed");
          // Store prompt for later use in UI
          (window as any).__pwa_install_prompt = prompt;
        },
        () => {
          logger.info("✅ PWA installed successfully");
        }
      );
    } else {
      logger.error("❌ Service Worker registration failed:", result.error);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
