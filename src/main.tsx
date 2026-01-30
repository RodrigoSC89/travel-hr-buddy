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
    console.log('[Boot v47] SW registered', { scope: registration.scope });
  } catch (error) {
    console.warn('[Boot v47] SW registration failed (non-critical)', error);
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

// Render the app
const container = document.getElementById("root");
if (container) {
  // CRITICAL: Mark app as loaded to prevent emergency recovery UI
  (window as { __NAUTI_APP_LOADED__?: boolean }).__NAUTI_APP_LOADED__ = true;
  
  // Clear the initial loading spinner from index.html
  const initialLoader = document.getElementById("initial-loader");
  const recoveryUi = document.getElementById("recovery-ui");
  if (initialLoader) initialLoader.remove();
  if (recoveryUi) recoveryUi.remove();
  
  createRoot(container).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
  
  // Mark Time to Interactive after render
  requestAnimationFrame(() => {
    ultraStartupOptimizer.markTTI();
  });
}
