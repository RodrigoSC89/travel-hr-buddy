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

// Register service worker after page load (only in production)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      logger.info("Service Worker registered");
    } catch (error) {
      logger.warn("Service worker registration failed:", error instanceof Error ? { message: error.message } : undefined);
    }
  });
}

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
