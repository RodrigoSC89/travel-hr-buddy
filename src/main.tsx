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
// CRITICAL: Force SW update and cache clear on boot v11
// Estratégia mais agressiva - desregistra SW problemático
// ============================================
const forceUpdateIfNeeded = async () => {
  const SW_VERSION_KEY = 'nautilus_sw_version';
  const CURRENT_VERSION = 'v11';
  const RELOAD_KEY = 'nautilus_reload_count';
  
  try {
    const storedVersion = localStorage.getItem(SW_VERSION_KEY);
    const reloadCount = parseInt(sessionStorage.getItem(RELOAD_KEY) || '0', 10);
    
    // Detectar loop de reload (mais de 2 reloads em sequência)
    if (reloadCount > 2) {
      console.warn('[Boot] Reload loop detected! Disabling SW completely.');
      sessionStorage.removeItem(RELOAD_KEY);
      
      // Desregistrar TODOS os SWs permanentemente
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      
      // Limpar caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      
      // Marcar que SW está desabilitado
      localStorage.setItem('nautilus_sw_disabled', 'true');
      localStorage.setItem(SW_VERSION_KEY, CURRENT_VERSION);
      return true;
    }
    
    // Versão diferente = precisa atualizar
    if (storedVersion !== CURRENT_VERSION) {
      console.log('[Boot] Version mismatch:', { stored: storedVersion, current: CURRENT_VERSION });
      
      // 1. Desregistrar todos os SWs
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.unregister();
        }
        console.log('[Boot] SWs unregistered:', regs.length);
      }
      
      // 2. Limpar todos os caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[Boot] Caches cleared:', keys.length);
      }
      
      // 3. Atualizar versão e contador
      localStorage.setItem(SW_VERSION_KEY, CURRENT_VERSION);
      localStorage.removeItem('nautilus_sw_disabled');
      sessionStorage.setItem(RELOAD_KEY, (reloadCount + 1).toString());
      
      // 4. Reload para pegar arquivos novos
      console.log('[Boot] Reloading for fresh assets...');
      window.location.reload();
      return false;
    }
    
    // Versão OK - resetar contador
    sessionStorage.removeItem(RELOAD_KEY);
    return true;
    
  } catch (error) {
    console.error('[Boot] Error:', error);
    return true;
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
