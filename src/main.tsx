/**
 * main.tsx - PATCH 851.0 - Definitive React Hook Fix
 * 
 * Root cause: React hooks require a stable React instance.
 * Solution: Ensure React is imported FIRST and used consistently.
 */

// CRITICAL: Import React FIRST before anything else
import * as React from "react";
import * as ReactDOM from "react-dom/client";

// Validate React is available
if (!React || !React.useState) {
  throw new Error("React module not properly loaded");
}

// Store React globally to prevent multiple instances
if (typeof window !== "undefined") {
  const win = window as typeof window & { 
    __REACT__?: typeof React;
    __REACT_DOM__?: typeof ReactDOM;
  };
  
  if (!win.__REACT__) {
    win.__REACT__ = React;
    win.__REACT_DOM__ = ReactDOM;
  }
}

// Now import other dependencies
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Theme initialization (synchronous, before render)
const initTheme = (): void => {
  try {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", stored === "dark" || (!stored && prefersDark));
  } catch {
    // Silently ignore theme errors
  }
};

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
