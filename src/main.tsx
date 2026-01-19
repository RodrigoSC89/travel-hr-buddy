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
// CRITICAL: Force SW update and cache clear on boot
// This runs BEFORE React to prevent stale chunk issues
// ============================================
const forceUpdateIfNeeded = async () => {
  const SW_VERSION_KEY = 'nautilus_sw_version';
  const CURRENT_VERSION = 'v10'; // Increment to force update
  
  try {
    const storedVersion = localStorage.getItem(SW_VERSION_KEY);
    
    // Se versão diferente, fazer limpeza total
    if (storedVersion !== CURRENT_VERSION) {
      console.log('[Boot] Version mismatch, clearing all caches...', { stored: storedVersion, current: CURRENT_VERSION });
      
      // 1. Desregistrar TODOS os Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => {
          if (r.waiting) r.waiting.postMessage({ type: 'SKIP_WAITING' });
          return r.unregister();
        }));
        console.log('[Boot] All SWs unregistered');
      }
      
      // 2. Limpar TODOS os caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[Boot] All caches cleared');
      }
      
      // 3. Atualizar versão
      localStorage.setItem(SW_VERSION_KEY, CURRENT_VERSION);
      
      // 4. Se não veio de reload recente, recarregar para pegar arquivos novos
      const lastReload = sessionStorage.getItem('nautilus_last_reload');
      const now = Date.now();
      if (!lastReload || (now - parseInt(lastReload, 10)) > 10000) {
        sessionStorage.setItem('nautilus_last_reload', now.toString());
        console.log('[Boot] Reloading to get fresh assets...');
        window.location.reload();
        return false; // Não continuar
      }
    }
    
    return true; // Continuar normalmente
  } catch (error) {
    console.error('[Boot] Cache cleanup error:', error);
    return true; // Continuar mesmo com erro
  }
};

// Register and manage service worker (only in production)
const initServiceWorker = async () => {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;
  
  try {
    const { registerServiceWorker, checkAndUpdateServiceWorker } = await import("@/lib/sw-update-manager");
    await registerServiceWorker();
    await checkAndUpdateServiceWorker();
    logger.info("Service Worker registered");
  } catch (error) {
    logger.warn("SW registration failed:", error instanceof Error ? { message: error.message } : undefined);
  }
};

// Execute cleanup IMMEDIATELY on load
forceUpdateIfNeeded().then(shouldContinue => {
  if (shouldContinue) {
    // Register SW after boot cleanup
    window.addEventListener("load", initServiceWorker);
  }
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
