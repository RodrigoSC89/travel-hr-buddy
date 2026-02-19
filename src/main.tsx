// main.tsx - PATCH 900 - Ultra-resilient boot sequence
// Every step wrapped in try-catch to prevent white screen

// Step 1: Minimal imports only
import * as React from "react";
import { createRoot } from "react-dom/client";

// Boot diagnostics helper - writes to DOM if console fails
function bootLog(step: string, status: 'ok' | 'fail' | 'start' = 'ok') {
  try {
    const msg = `[Boot] ${step}: ${status}`;
    if (status === 'fail') {
      console.error(msg);
    } else {
      console.log(msg);
    }
  } catch { /* ignore */ }
}

// Step 2: Theme initialization (before any React)
try {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
  bootLog('theme', 'ok');
} catch {
  bootLog('theme', 'fail');
}

// Step 3: Sentry (optional, non-blocking)
try {
  const { initializeSentry } = await import("@/lib/monitoring/sentry-init");
  initializeSentry();
  bootLog('sentry', 'ok');
} catch {
  bootLog('sentry', 'fail');
}

// Step 4: i18n (optional, non-blocking)
try {
  await import("@/i18n");
  bootLog('i18n', 'ok');
} catch {
  bootLog('i18n', 'fail');
}

// Step 5: CSS (critical but should not crash)
try {
  await import("./index.css");
  bootLog('css', 'ok');
} catch {
  bootLog('css', 'fail');
}

// Step 6: Import App component
let App: React.ComponentType;
try {
  const module = await import("./App.tsx");
  App = module.default;
  bootLog('App import', 'ok');
} catch (err) {
  bootLog('App import', 'fail');
  console.error('[Boot] FATAL: Failed to import App:', err);
  // Show error UI
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;flex-direction:column;">
      <h2 style="margin-bottom:8px;">Nauti One - Erro de Carregamento</h2>
      <p style="color:#94a3b8;margin-bottom:8px;">Falha ao importar módulos da aplicação.</p>
      <pre style="color:#f87171;font-size:12px;max-width:80vw;overflow:auto;margin-bottom:16px;padding:8px;background:#1e293b;border-radius:4px;">${err instanceof Error ? err.message : String(err)}</pre>
      <button onclick="sessionStorage.clear();localStorage.clear();location.reload();" style="padding:10px 24px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;">Limpar Cache e Recarregar</button>
    </div>`;
  }
  const loader = document.getElementById('initial-loader');
  if (loader) loader.remove();
  throw err; // Stop execution
}

// Step 7: Optional HelmetProvider
let HelmetProvider: React.ComponentType<{ children?: React.ReactNode }>;
try {
  const helmet = await import("react-helmet-async");
  HelmetProvider = helmet.HelmetProvider as unknown as React.ComponentType<{ children?: React.ReactNode }>;
  bootLog('helmet', 'ok');
} catch {
  bootLog('helmet', 'fail');
  // Fallback: just render children
  HelmetProvider = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
}

// Step 8: Remove loader and render
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loader.remove(), 300);
  }
};

const container = document.getElementById("root");
if (container) {
  removeInitialLoader();
  
  try {
    createRoot(container).render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
    bootLog('render', 'ok');
  } catch (err) {
    bootLog('render', 'fail');
    console.error('[Boot] FATAL: React render failed:', err);
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;flex-direction:column;">
      <h2 style="margin-bottom:8px;">Nauti One - Erro de Renderização</h2>
      <p style="color:#94a3b8;margin-bottom:8px;">Falha ao renderizar a aplicação.</p>
      <pre style="color:#f87171;font-size:12px;max-width:80vw;overflow:auto;margin-bottom:16px;padding:8px;background:#1e293b;border-radius:4px;">${err instanceof Error ? err.message : String(err)}</pre>
      <button onclick="sessionStorage.clear();localStorage.clear();location.reload();" style="padding:10px 24px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;">Limpar Cache e Recarregar</button>
    </div>`;
  }
} else {
  removeInitialLoader();
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff;font-family:system-ui;"><div style="text-align:center"><h1>Erro de inicialização</h1><p>Elemento root não encontrado.</p><button onclick="location.reload()" style="margin-top:16px;padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">Recarregar</button></div></div>';
}

// Step 9: Deferred initializations (fully optional, non-blocking)
setTimeout(async () => {
  try {
    const { prefetchCriticalRoutes } = await import("@/lib/performance/route-prefetch");
    prefetchCriticalRoutes();
  } catch { /* silent */ }
}, 5000);

// Step 10: Service Worker (production only, deferred)
if (import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      }
    } catch { /* not critical */ }
  });
}
