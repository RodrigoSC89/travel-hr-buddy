// @ts-nocheck
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "../sentry.client.config";
import { logger } from "@/lib/logger";
import { initFailoverSystem } from "@/lib/failover/failover-core";
import { initLogSync } from "@/lib/monitoring/logsync";

// Iniciar monitor de failover na inicialização
initFailoverSystem();

// Iniciar sistema de sincronização de logs em tempo real
initLogSync();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        logger.info("✅ PWA Service Worker registered:", registration);
      })
      .catch((error) => {
        logger.error("❌ Service Worker registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
