/**
 * main.tsx - PATCH 854 - Fixed React hooks + slow connection optimizations
 * 
 * CRITICAL: This file uses ONLY standard React imports.
 * Do NOT import React from anywhere else.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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

// Handle redirect path from 404.html (SPA routing)
const handleRedirectPath = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectFromUrl = urlParams.get('redirect');
    
    if (redirectFromUrl && redirectFromUrl !== '/' && redirectFromUrl !== '/index.html') {
      window.history.replaceState(null, '', decodeURIComponent(redirectFromUrl));
      return;
    }
    
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && redirectPath !== '/' && redirectPath !== '/index.html') {
      sessionStorage.removeItem('redirectPath');
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.history.replaceState(null, '', redirectPath);
      }
    }
  } catch {
    // Ignore errors in private browsing
  }
};

handleRedirectPath();

// Register service worker after page load
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Unregister old service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (registration.active?.scriptURL?.includes('sw.js')) {
          // Keep the main SW
          continue;
        }
        // Unregister others
        await registration.unregister();
      }
      
      // Register main service worker
      await navigator.serviceWorker.register("/sw.js", { 
        scope: "/",
        updateViaCache: "none"
      });
      console.log("✅ Service Worker registered");
    } catch (err) {
      console.warn("Service Worker registration failed:", err);
    }
  });
}

// Render the app using standard ReactDOM
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
