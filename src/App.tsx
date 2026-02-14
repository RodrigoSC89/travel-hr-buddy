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
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/layout/theme-provider";
import { LazyLoadErrorBoundary } from "@/components/error/LazyLoadErrorBoundary";
import { logger } from "@/lib/logger";
import { AppRoutes } from "@/routes/AppRoutes";
import { AppLoader } from "@/routes/AppLoader";
import { prefetchCriticalRoutes } from "@/lib/performance/route-prefetch";

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

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min - reduce refetches
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 15,         // 15 min - keep cache longer
      refetchOnReconnect: 'always',    // Refetch on network recovery (maritime)
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  // Prefetch critical routes after initial render
  useEffect(() => {
    prefetchCriticalRoutes();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
        <AuthProvider>
          <Router>
            <TooltipProvider>
               <LazyLoadErrorBoundary>
                <main id="main-content" role="main">
                  <Suspense fallback={<AppLoader />}>
                    <AppRoutes />
                  </Suspense>
                </main>
               </LazyLoadErrorBoundary>
              <Toaster />
            </TooltipProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
