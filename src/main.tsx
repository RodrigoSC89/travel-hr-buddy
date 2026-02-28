// main.tsx - PATCH 901 - No top-level await (es2020 compatible)
import * as React from "react";
import { createRoot } from "react-dom/client";

function bootLog(step: string, status: 'ok' | 'fail' = 'ok') {
  try {
    const msg = `[Boot] ${step}: ${status}`;
    if (status === 'fail') console.error(msg);
    else console.info(msg);
  } catch { /* ignore */ }
}

// Theme (sync, no await)
try {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
} catch { /* ignore */ }

// Wrap all async imports in IIFE
(async function boot() {
  try {
    const { initializeSentry } = await import("@/lib/monitoring/sentry-init");
    initializeSentry();
    bootLog('sentry');
  } catch { bootLog('sentry', 'fail'); }

  try {
    await import("@/i18n");
    bootLog('i18n');
  } catch { bootLog('i18n', 'fail'); }

  try {
    await import("./index.css");
    bootLog('css');
  } catch { bootLog('css', 'fail'); }

  let App: React.ComponentType;
  try {
    const module = await import("./App.tsx");
    App = module.default;
    bootLog('App import');
  } catch (err) {
    bootLog('App import', 'fail');
    console.error('[Boot] FATAL:', err);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;flex-direction:column;"><h2>Nauti One - Erro de Carregamento</h2><pre style="color:#f87171;font-size:12px;max-width:80vw;overflow:auto;padding:8px;background:#1e293b;border-radius:4px;margin:8px 0;">${err instanceof Error ? err.message : String(err)}</pre><button onclick="sessionStorage.clear();localStorage.clear();location.reload();" style="padding:10px 24px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;">Limpar Cache e Recarregar</button></div>`;
    }
    const loader = document.getElementById('initial-loader');
    if (loader) loader.remove();
    return;
  }

  let HelmetProvider: React.ComponentType<{ children?: React.ReactNode }>;
  try {
    const helmet = await import("react-helmet-async");
    HelmetProvider = helmet.HelmetProvider as unknown as React.ComponentType<{ children?: React.ReactNode }>;
    bootLog('helmet');
  } catch {
    bootLog('helmet', 'fail');
    HelmetProvider = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  }

  // Remove loader
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loader.remove(), 300);
  }

  const container = document.getElementById("root");
  if (!container) return;

  try {
    createRoot(container).render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
    bootLog('render');
  } catch (err) {
    bootLog('render', 'fail');
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;flex-direction:column;"><h2>Nauti One - Erro</h2><button onclick="sessionStorage.clear();localStorage.clear();location.reload();" style="padding:10px 24px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;">Recarregar</button></div>`;
  }

  // Deferred
  setTimeout(async () => {
    try {
      const { prefetchCriticalRoutes } = await import("@/lib/performance/route-prefetch");
      prefetchCriticalRoutes();
    } catch { /* silent */ }
  }, 5000);

  if (import.meta.env.PROD) {
    window.addEventListener("load", async () => {
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        }
      } catch { /* not critical */ }
    });
  }
})();
