/**
 * main.tsx - PATCH 861 - MINIMAL BOOTSTRAP
 * 
 * CRITICAL: React and ReactDOM must be imported FIRST, before anything else.
 * No providers here - all providers go inside App.tsx
 */
import React from "react";
import ReactDOM from "react-dom/client";

// CSS must come after React imports
import "./index.css";

// App comes last
import App from "./App";

// Initialize theme via DOM manipulation (no React hooks)
const initializeTheme = () => {
  try {
    const stored = localStorage.getItem("vite-ui-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.classList.add(theme);
  } catch {
    document.documentElement.classList.add("dark");
  }
};

initializeTheme();

// Get root element
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Create root and render - MINIMAL, no extra providers
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker AFTER render
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js", { 
        scope: "/",
        updateViaCache: "none"
      });
    } catch {
      // Ignore SW errors
    }
  });
}
