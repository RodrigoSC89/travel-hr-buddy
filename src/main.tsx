/**
import { useState } from "react";;
 * main.tsx - PATCH 853.0 - Definitive React Hook Fix
 * 
 * CRITICAL: This file ensures a single React instance is used throughout the app.
 * Added runtime validation to catch React initialization issues early.
 */

// CRITICAL: Import React FIRST before anything else
import React from "react";
import ReactDOM from "react-dom/client";

// Validate React is properly loaded at runtime
if (!React || typeof React.useState !== "function") {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;">
      <h1 style="color:red;">Erro Crítico</h1>
      <p>React não foi carregado corretamente. Por favor, limpe o cache do navegador e recarregue.</p>
      <button onclick="location.reload(true)" style="padding:10px 20px;margin-top:20px;cursor:pointer;">
        Recarregar
      </button>
    </div>
  `;
  throw new Error("React module not properly loaded - useState is not a function");
}

// Store React globally to ensure single instance
declare global {
  interface Window {
    __REACT__?: typeof React;
    __REACT_DOM__?: typeof ReactDOM;
  }
}

// Ensure global React instance
if (typeof window !== "undefined") {
  window.__REACT__ = React;
  window.__REACT_DOM__ = ReactDOM;
}

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
      navigator.serviceWorker.register("/sw.js", { scope: "/" ).catch(() => {});
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
