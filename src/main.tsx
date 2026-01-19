// main.tsx - PATCH 851 - React singleton initialization
// Import React singleton FIRST to ensure single instance
import "@/lib/react-singleton";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { logger } from "@/lib/logger";

// Initialize i18n
import "@/i18n";

// Initialize theme before rendering
const initializeTheme = () => {
  try {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    // Ignore theme errors
  }
};

initializeTheme();

// Defer non-critical initializations - only after app is loaded
const initializeOptionalFeatures = async () => {
  // Wait for app to be interactive first
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Initialize route prefetching for better navigation
    const { initRoutePrefetch } = await import("@/lib/performance/route-prefetch");
    initRoutePrefetch();
    
    // Only initialize monitoring in production
    if (import.meta.env.PROD) {
      const { webVitalsMonitor } = await import("@/lib/web-vitals-monitor");
      webVitalsMonitor.initialize();
    }
  } catch (error) {
    logger.warn("Optional features init failed:", error instanceof Error ? { message: error.message } : undefined);
  }
};

// ============================================
// CRITICAL: Force SW cleanup on boot v12
// Estratégia FINAL: Limpar caches e garantir SW mínimo
// ============================================
const forceUpdateIfNeeded = async () => {
  const SW_VERSION_KEY = 'nautilus_sw_version';
  const CURRENT_VERSION = 'v12-minimal';
  
  try {
    const storedVersion = localStorage.getItem(SW_VERSION_KEY);
    
    // Sempre limpar caches se versão diferente
    if (storedVersion !== CURRENT_VERSION) {
      console.log('[Boot v12] Version mismatch, cleaning up...', { stored: storedVersion, current: CURRENT_VERSION });
      
      // Limpar TODOS os caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[Boot v12] Caches cleared:', keys.length);
      }
      
      // Atualizar SW se existir
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update();
        }
      }
      
      localStorage.setItem(SW_VERSION_KEY, CURRENT_VERSION);
      localStorage.removeItem('nautilus_sw_disabled');
    }
    
    return true;
  } catch (error) {
    console.error('[Boot v12] Error:', error);
    return true;
  }
};

// Register minimal service worker (only for push notifications)
const initServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  
  // Em desenvolvimento, não registrar SW
  if (!import.meta.env.PROD) {
    console.log('[Boot v12] Dev mode - skipping SW registration');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });
    console.log('[Boot v12] Minimal SW registered:', registration.scope);
  } catch (error) {
    console.warn('[Boot v12] SW registration failed (not critical):', error);
  }
};

// Execute cleanup on load
forceUpdateIfNeeded().then(() => {
  window.addEventListener("load", initServiceWorker);
});

// Initialize optional features after render
if (typeof requestIdleCallback !== "undefined") {
  requestIdleCallback(() => initializeOptionalFeatures());
} else {
  setTimeout(initializeOptionalFeatures, 3000);
}

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
