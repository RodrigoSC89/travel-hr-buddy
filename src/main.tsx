// main.tsx - PATCH 852 - React initialization + Sentry
import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { logger } from "@/lib/logger";
import { initializeSentry } from "@/lib/monitoring/sentry-init";

// Initialize Sentry before anything else
initializeSentry();

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

// Initialize axe-core accessibility checker in development
const initializeAccessibilityChecker = async () => {
  if (import.meta.env.DEV) {
    try {
      const axe = await import("@axe-core/react");
      const React = await import("react");
      const ReactDOM = await import("react-dom");
      axe.default(React, ReactDOM, 1000);
      logger.info("[A11y] axe-core accessibility checker initialized");
    } catch {
      // axe-core is optional, fail silently
    }
  }
};

// Defer non-critical initializations - only after app is loaded
const initializeOptionalFeatures = async () => {
  // Wait for app to be interactive first (use requestIdleCallback when available)
  await new Promise<void>(resolve => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve());
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
  
  try {
    // Initialize accessibility checker in dev
    await initializeAccessibilityChecker();
    
    // Route prefetching removed during dead code cleanup
    
    // Only initialize monitoring in production
    // Web vitals monitoring removed during dead code cleanup
  } catch (error) {
    logger.warn("Optional features init failed:", error instanceof Error ? { message: error.message } : undefined);
  }
};

// ============================================
// CRITICAL: Force SW cleanup on boot v16 - iOS PWA ULTIMATE FIX
// Estratégia: Limpar caches e sincronizar versões
// ============================================
const forceUpdateIfNeeded = async () => {
  const SW_VERSION_KEY = 'nautilus_sw_version';
  const CURRENT_VERSION = 'v21-no-stale-js'; // SYNC with public/sw.js

  try {
    // Always purge ALL caches on version mismatch (prevents stale JS white screen)
    const storedVersion = localStorage.getItem(SW_VERSION_KEY);

    if (storedVersion !== CURRENT_VERSION) {
      logger.info('[Boot v21] Version mismatch — purging all caches', { stored: storedVersion, current: CURRENT_VERSION });

      // 1. Delete all Cache API entries
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        logger.info('[Boot v21] Caches purged', { count: keys.length });
      }

      // 2. Force-update any existing SW
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          await reg.update().catch(() => {});
        }
      }

      localStorage.setItem(SW_VERSION_KEY, CURRENT_VERSION);
    }

    // Reload-loop detection (> 3 reloads in 15s)
    const RELOAD_KEY = 'nautilus_reload_count';
    const reloadCount = parseInt(localStorage.getItem(RELOAD_KEY) || '0', 10);
    const reloadTime = parseInt(localStorage.getItem(RELOAD_KEY + '_t') || '0', 10);
    const now = Date.now();

    if (now - reloadTime < 15000 && reloadCount > 3) {
      logger.warn('[Boot v21] Reload loop! Unregistering all SWs');
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem(RELOAD_KEY);
      localStorage.removeItem(RELOAD_KEY + '_t');
      return true;
    }

    localStorage.setItem(RELOAD_KEY, String(reloadCount + 1));
    localStorage.setItem(RELOAD_KEY + '_t', String(now));
    setTimeout(() => {
      localStorage.removeItem(RELOAD_KEY);
      localStorage.removeItem(RELOAD_KEY + '_t');
    }, 15000);

    return true;
  } catch (error) {
    logger.error('[Boot v21] Cleanup error', error);
    return true;
  }
};

// Register minimal service worker (only for push notifications)
const initServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  
  // Em desenvolvimento, não registrar SW
  if (!import.meta.env.PROD) {
    logger.info('[Boot v16] Dev mode - skipping SW registration');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });
    logger.info('[Boot v16] Minimal SW registered', { scope: registration.scope });
  } catch (error) {
    logger.warn('[Boot v16] SW registration failed (not critical)', error instanceof Error ? { message: error.message } : undefined);
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

// Remove initial HTML loader before React mounts
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loader.remove(), 300);
  }
};

// Render the app
const container = document.getElementById("root");
if (container) {
  // Remove loader immediately before render
  removeInitialLoader();
  
  createRoot(container).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  // Fallback error display if root is missing
  removeInitialLoader();
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;"><div style="text-align:center"><h1>Erro de inicialização</h1><p>Não foi possível carregar a aplicação.</p><button onclick="location.reload()" style="margin-top:16px;padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">Recarregar</button></div></div>';
}
