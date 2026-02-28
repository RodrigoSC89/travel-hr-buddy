/**
 * App.tsx - Clean entry point with providers only
 * All routes extracted to src/routes/
 */
/**
 * App.tsx - Clean entry point with providers only
 * All routes extracted to src/routes/
 */
import * as React from "react";
import { Suspense, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DemoProvider } from "./contexts/DemoContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/layout/theme-provider";
import { LazyLoadErrorBoundary } from "@/components/error/LazyLoadErrorBoundary";
import { logger } from "@/lib/logger";
import "@/lib/i18next-config";
import { AppRoutes } from "@/routes/AppRoutes";
import { AppLoader } from "@/routes/AppLoader";
import { prefetchCriticalRoutes } from "@/lib/performance/route-prefetch";
import { initNautiOneDB } from "@/lib/offline/db";
import { initAutoSync } from "@/lib/offline/sync-queue";
import { PerformanceProvider } from "@/components/ui/PerformanceProvider";
import { installAutoIntegration } from "@/lib/integration/install-auto-integration";
import { ExpirationMonitorProvider } from "@/components/monitors/ExpirationMonitorProvider";

// ============================================
// GLOBAL ERROR HANDLERS - Prevent white screens
// ============================================
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const ignorableErrors = ['ResizeObserver', 'Script error', 'Non-Error promise rejection', 'Loading chunk', 'ChunkLoadError'];
    const shouldIgnore = ignorableErrors.some(e => message.includes(e));
    if (!shouldIgnore) {
      logger.error('[App] Unhandled rejection:', { message });
      toast.error('Ocorreu um erro inesperado', { description: 'A operação será tentada novamente automaticamente.', duration: 3000 });
    }
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    const message = event.message || 'Unknown error';
    if (message.includes('Loading chunk') || message.includes('dynamically imported')) return;
    logger.error('[App] Global error:', { message, filename: event.filename });
  });
}

// Query client - Optimized for maritime low-bandwidth (satellite/VSAT ~256kbps-2Mbps)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,      // 10 min - minimize refetches on slow satellite
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000),
      refetchOnWindowFocus: false,     // Never refetch on focus - saves bandwidth
      refetchOnMount: false,           // Use cached data when revisiting pages
      gcTime: 1000 * 60 * 60,         // 60 min - keep cache much longer
      refetchOnReconnect: 'always',    // Refetch on network recovery (maritime)
      networkMode: 'offlineFirst',     // Use cache first, then network
      placeholderData: (prev: unknown) => prev, // Show stale data while revalidating
    },
    mutations: {
      retry: 2,
      retryDelay: 2000,
      networkMode: 'offlineFirst',
    },
  },
});

function App() {
  // Prefetch critical routes and init offline DB after initial render
  useEffect(() => {
    // Install auto-integration interceptor (makes ALL mutations publish events)
    installAutoIntegration();
    prefetchCriticalRoutes();
    // Initialize IndexedDB for offline-first support
    initNautiOneDB().catch((err) => {
      logger.warn('[App] IndexedDB init skipped:', err);
    });
    // Initialize offline sync queue auto-flush on network recovery
    const cleanupSync = initAutoSync();
    return () => cleanupSync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
        <PerformanceProvider>
          <AuthProvider>
            <DemoProvider>
              <ExpirationMonitorProvider />
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <TooltipProvider>
                  <LazyLoadErrorBoundary>
                    <SkipToContent />
                    <main id="main-content" role="main">
                      <Suspense fallback={<AppLoader />}>
                        <AppRoutes />
                      </Suspense>
                    </main>
                  </LazyLoadErrorBoundary>
                  <Toaster />
                </TooltipProvider>
              </Router>
            </DemoProvider>
          </AuthProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
