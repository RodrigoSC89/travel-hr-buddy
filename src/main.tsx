/**
 * main.tsx - PATCH 852.0 - Definitive React Hook Fix
 * 
 * CRITICAL: This file ensures a single React instance is used throughout the app.
 * The solution is to use consistent imports and NOT lazy load context providers.
 */

// CRITICAL: Import React namespace FIRST before anything else
import * as React from "react";
import * as ReactDOM from "react-dom/client";

// Import styles
import "./index.css";

// Import HelmetProvider
import { HelmetProvider } from "react-helmet-async";

// Import App component
import App from "./App";

// Theme initialization (synchronous, before render)
function initTheme(): void {
  try {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", stored === "dark" || (!stored && prefersDark));
  } catch {
    // Silently ignore theme errors
  }
}

// Initialize theme before rendering
initTheme();

// Get root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root and render
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Deferred initialization for non-critical features
if (typeof window !== "undefined" && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    // Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
    
    // Web Vitals (deferred)
    setTimeout(async () => {
      try {
        const { webVitalsMonitor } = await import("@/lib/web-vitals-monitor");
        webVitalsMonitor.initialize();
      } catch {
        // Silently ignore
      }
    }, 5000);
  });
}
