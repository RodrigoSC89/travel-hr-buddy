/**
 * main.tsx - PATCH 861 - Fixed React singleton
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
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

// Handle redirect path from 404.html
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

// Register service worker after page load (only in production)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    } catch {
      // Ignore SW errors
    }
  });
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
