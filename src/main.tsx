// main.tsx - PATCH APEX v1.0 - Lighthouse 100 Target
// Import React singleton FIRST to ensure single instance
import "@/lib/react-singleton";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "@/styles/low-bandwidth.css";
import "@/styles/extreme-performance.css"; // APEX: Extreme performance styles
import { logger } from "@/lib/logger";
import { ultraStartupOptimizer } from "@/lib/performance/ultra-startup-optimizer";
import { initExtremePerformance } from "@/lib/performance/extreme-performance"; // APEX

// Initialize BOTH performance optimizations IMMEDIATELY
ultraStartupOptimizer.init();
initExtremePerformance();

// Lazy import performance init for non-blocking startup
const initPerformanceAsync = async () => {
  const { initPerformance } = await import("@/lib/performance/performance-init");
  initPerformance();
};

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
  // Wait for app to be interactive first
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Initialize accessibility checker in dev
    await initializeAccessibilityChecker();
    
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
// PATCH v52: Simplified boot - cache clearing now in index.html
// This just handles SW registration after app loads
// ============================================

// Register minimal service worker (only for push notifications)
const initServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  
  // Skip SW in development
  if (!import.meta.env.PROD) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });
    console.log('[Boot v53] SW registered', { scope: registration.scope });
  } catch (error) {
    console.warn('[Boot v53] SW registration failed (non-critical)', error);
  }
};

// PATCH v52: SW init happens on load event
window.addEventListener("load", initServiceWorker);

// Initialize optional features after render
if (typeof requestIdleCallback !== "undefined") {
  requestIdleCallback(() => initializeOptionalFeatures());
} else {
  setTimeout(initializeOptionalFeatures, 3000);
}

// Render the app - PATCH v61 FORCE DEPLOY
// Update boot status helper
const updateStatus = (msg: string) => {
  const win = window as { __updateBootStatus?: (msg: string) => void };
  if (win.__updateBootStatus) {
    win.__updateBootStatus(msg);
  } else {
    console.log('[Boot v61]', msg);
  }
};

console.log('[Boot v61] JavaScript bundle loaded - build timestamp:', Date.now());
updateStatus('Bundle carregado');

const container = document.getElementById("root");
if (container) {
  updateStatus('Container encontrado');
  
  // Mark app as loaded FIRST to prevent recovery UI
  (window as { __NAUTI_APP_LOADED__?: boolean }).__NAUTI_APP_LOADED__ = true;
  
  // Remove HTML loader
  const initialLoader = document.getElementById("initial-loader");
  if (initialLoader) {
    initialLoader.remove();
    updateStatus('Loader removido');
  }
  
  console.log('[Boot v61] React mounting...');
  updateStatus('Montando React...');
  
  try {
    createRoot(container).render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
    
    console.log('[Boot v61] React mounted OK');
    updateStatus('React OK');
  } catch (error) {
    console.error('[Boot v61] React mount FAILED:', error);
    updateStatus('ERRO: ' + (error instanceof Error ? error.message : 'Unknown'));
    
    // Show error in UI
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-background p-4">
        <div class="text-center space-y-4 max-w-sm">
          <p class="text-foreground text-lg font-semibold">Erro ao carregar</p>
          <p class="text-muted text-sm">${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
          <button onclick="window.clearCacheAndReload()" class="btn">Limpar cache e recarregar</button>
        </div>
      </div>
    `;
  }
  
  // Mark TTI after render
  requestAnimationFrame(() => {
    ultraStartupOptimizer.markTTI();
  });
} else {
  console.error('[Boot v61] CRITICAL: #root container not found!');
}
