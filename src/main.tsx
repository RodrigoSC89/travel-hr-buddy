// main.tsx - PATCH 853 - Resilient boot with error diagnostics
import * as React from "react";
import { createRoot } from "react-dom/client";

// ============================================
// CRASH FALLBACK - must be defined BEFORE any complex imports
// ============================================
const showCrashFallback = (error?: unknown) => {
  const loader = document.getElementById('initial-loader');
  if (loader) loader.remove();

  const msg = error instanceof Error ? error.message : String(error || 'Erro desconhecido');
  console.error('[Boot] React failed to mount:', msg);

  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;">
    <div style="text-align:center;max-width:400px;padding:20px;">
      <h1 style="font-size:1.5rem;margin-bottom:8px;">Erro de inicialização</h1>
      <p style="color:#94a3b8;margin-bottom:16px;">Não foi possível carregar a aplicação.</p>
      <p style="color:#64748b;font-size:12px;margin-bottom:16px;word-break:break-all;">${msg}</p>
      <button onclick="(async function(){try{if('caches' in window){var k=await caches.keys();await Promise.all(k.map(function(c){return caches.delete(c)}))}if('serviceWorker' in navigator){var r=await navigator.serviceWorker.getRegistrations();await Promise.all(r.map(function(s){return s.unregister()}))}localStorage.clear();sessionStorage.clear()}catch(e){}location.href=location.origin+'/?_sw='+Date.now()})()" style="padding:10px 24px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Limpar cache e recarregar</button>
    </div>
  </div>`;
};

// ============================================
// THEME INIT (no dependencies)
// ============================================
try {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
} catch { /* ignore */ }

// ============================================
// BOOT APP - all complex imports inside async function
// ============================================
async function bootApp() {
  // Import heavy dependencies one by one for better error isolation
  const { HelmetProvider } = await import("react-helmet-async");
  
  // i18n
  await import("@/i18n");
  
  // CSS
  await import("./index.css");
  
  // App component (triggers entire import chain)
  const { default: App } = await import("./App.tsx");

  const container = document.getElementById("root");
  if (!container) throw new Error("Root element not found");

  createRoot(container).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
}

// Execute boot with error catching
bootApp().catch((error) => {
  console.error('[Boot] Failed to initialize app:', error);
  showCrashFallback(error);
});

// ============================================
// DEFERRED: Service Worker + optional features
// ============================================
window.addEventListener("load", () => {
  // Service Worker registration (production only)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .catch(() => { /* non-critical */ });
  }

  // SW version sync for cache management
  try {
    const SW_VERSION_KEY = 'nautilus_sw_version';
    const CURRENT_VERSION = 'v21-no-stale-js';
    const storedVersion = localStorage.getItem(SW_VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      if ('caches' in window) {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
      }
      localStorage.setItem(SW_VERSION_KEY, CURRENT_VERSION);
    }
  } catch { /* ignore */ }
});

// Remove initial HTML loader - called AFTER React successfully mounts
export const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loader.remove(), 300);
  }
};
