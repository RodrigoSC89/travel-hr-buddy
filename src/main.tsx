/**
 * main.tsx - PATCH 856 - Fixed React hooks error definitively
 * 
 * This file uses ONLY the standard 'react' and 'react-dom' packages.
 * Do NOT import React from any other source.
 */

import * as React from "react";
import * as ReactDOM from "react-dom/client";
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

// Get root element
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Create root and render
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
