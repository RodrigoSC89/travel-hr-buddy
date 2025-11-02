import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "../sentry.client.config";
import { logger } from "@/lib/logger";
import { initializeTheme } from "@/lib/theme/theme-utils";
// PATCH 598: Enhanced PWA utilities
import { 
  registerServiceWorker, 
  monitorNetworkStatus,
  setupInstallPrompt,
  isPWAInstalled
} from "@/utils/pwa-utils";
// import { initFailoverSystem } from "@/lib/failover/failover-core";

// PATCH 129.0: Initialize theme before rendering
initializeTheme();

// Iniciar monitor de failover na inicialização
// initFailoverSystem(); // Desabilitado temporariamente - sem heartbeats configurados

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
