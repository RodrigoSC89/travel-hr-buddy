import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "../sentry.client.config";
import { logger } from "@/lib/logger";
import { initializeTheme } from "@/lib/theme/theme-utils";
import { registerServiceWorker, isSecureContext, addConnectivityListeners } from "@/utils/pwa-utils";
// import { initFailoverSystem } from "@/lib/failover/failover-core";

// PATCH 129.0: Initialize theme before rendering
initializeTheme();

// Iniciar monitor de failover na inicialização
// initFailoverSystem(); // Desabilitado temporariamente - sem heartbeats configurados

// PATCH 598-600: Enhanced PWA initialization
if ("serviceWorker" in navigator) {
  // PATCH 600: Security check - only in secure context (HTTPS or localhost)
  if (!isSecureContext()) {
    logger.warn("⚠️ Service Worker requires secure context (HTTPS)");
  } else {
    window.addEventListener("load", async () => {
      try {
        const registration = await registerServiceWorker();
        
        if (registration) {
          logger.info("✅ PWA Service Worker registered:", registration.scope);
          
          // PATCH 599: Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  logger.info("🔄 New version available! Please refresh.");
                  // Optional: Show notification to user
                }
              });
            }
          });
        }
      } catch (error) {
        logger.error("❌ Service Worker registration failed:", error);
      }
    });
    
    // PATCH 599: Monitor connectivity
    addConnectivityListeners(
      () => {
        logger.info("🌐 Online - Connection restored");
        // Optional: Sync pending actions
      },
      () => {
        logger.warn("📡 Offline - Working in offline mode");
        // Optional: Show offline indicator
      }
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
