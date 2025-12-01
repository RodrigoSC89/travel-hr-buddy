import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SmartLayout } from "./components/layout/SmartLayout";
import { initializeMonitoring } from "@/lib/monitoring/init";
import { logger } from "@/lib/logger";
import { CommandPalette } from "@/components/CommandPalette";
import { OfflineBanner } from "@/components/OfflineBanner";
import { systemWatchdog } from "@/ai/watchdog";
import { webVitalsService } from "@/services/web-vitals-service";
import { OffshoreLoader } from "@/components/LoadingStates";
import { ErrorDebugBanner } from "@/components/debug/ErrorDebugBanner";

// PATCH 68.2 - Module Loader System
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";

// Core pages - Eager loading
import Index from "@/pages/Index";

// Essential pages - Lazy loading
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const HealthCheck = React.lazy(() => import("@/pages/HealthCheck"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Unauthorized = React.lazy(() => import("@/pages/Unauthorized"));

// Initialize monitoring & services with optimized query client
const queryClient = createOptimizedQueryClient();

// RouterType based on environment
const RouterType = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : Router;

function App() {
  useEffect(() => {
    initializeMonitoring();
    systemWatchdog.start();
    
    logger.info("Nautilus One initialized", {
      version: "68.2",
      moduleLoader: "active",
      timestamp: new Date().toISOString(),
    });
  }, []);

  // PATCH 68.2 - Get module routes automatically from MODULE_REGISTRY
  const moduleRoutes = getModuleRoutes();
  
  logger.info(`Loaded ${moduleRoutes.length} module routes from registry`);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <OrganizationProvider>
              <RouterType>
                <CommandPalette />
                <OfflineBanner />
                <ErrorDebugBanner />
                
                <Routes>
                  {/* Core Routes */}
                  <Route path="/" element={<SmartLayout />}>
                    <Route index element={<Index />} />
                    <Route path="dashboard" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <Dashboard />
                      </Suspense>
                    } />
                    
                    {/* PATCH 68.2 - Module Routes from Registry */}
                    {moduleRoutes.map((route) => (
                      <Route
                        key={route.id}
                        path={route.path}
                        element={
                          <Suspense fallback={<OffshoreLoader />}>
                            <route.component />
                          </Suspense>
                        }
                      />
                    ))}
                    
                    {/* Admin Routes */}
                    <Route path="admin/*" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <Admin />
                      </Suspense>
                    } />
                    
                    {/* Settings */}
                    <Route path="settings" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <Settings />
                      </Suspense>
                    } />
                    
                    {/* Health Check */}
                    <Route path="health" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <HealthCheck />
                      </Suspense>
                    } />
                    
                    {/* Error Routes */}
                    <Route path="unauthorized" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <Unauthorized />
                      </Suspense>
                    } />
                    <Route path="*" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <NotFound />
                      </Suspense>
                    } />
                  </Route>
                </Routes>
              </RouterType>
            </OrganizationProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
