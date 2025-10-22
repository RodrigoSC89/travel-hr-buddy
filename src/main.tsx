// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "../sentry.client.config";
import { logger } from "@/lib/logger";
import { initFailoverSystem } from "@/lib/failover/failover-core";

// Iniciar monitor de failover na inicialização
initFailoverSystem();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        logger.info("✅ PWA Service Worker registered:", registration);
      })
      .catch((error) => {
        logger.error("❌ Service Worker registration failed:", error);
      });
  });
}

class RootErrorBoundary extends React.Component<{children: React.ReactNode},{hasError:boolean}>{
  constructor(p:any){ super(p); this.state={hasError:false}; }
  static getDerivedStateFromError(){ return {hasError:true}; }
  componentDidCatch(e:any){ console.error("Root error:", e); }
  render(){ return this.state.hasError ? <div>App failed to render.</div> : this.props.children; }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </RootErrorBoundary>
);
