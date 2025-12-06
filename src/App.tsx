import React, { useEffect, Suspense, useMemo } from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SmartLayout } from "./components/layout/SmartLayout";
import { initializeMonitoring } from "@/lib/monitoring/init";
import { initializePerformance } from "@/lib/performance/init";
import { logger } from "@/lib/logger";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp } from "@/components/help/KeyboardShortcuts";
import { QuickStartGuide } from "@/components/help/QuickStartGuide";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OffshoreLoader } from "@/components/LoadingStates";
import { ErrorDebugBanner } from "@/components/debug/ErrorDebugBanner";
import { Toaster } from "@/components/ui/toaster";
import { SmartPrefetchProvider } from "@/components/performance/SmartPrefetchProvider";
import { BandwidthIndicator } from "@/components/performance/BandwidthIndicator";
// PATCH 700: Web Vitals Overlay for development
const WebVitalsOverlay = React.lazy(() => import("@/components/WebVitalsOverlay"));

// PATCH 68.2 - Module Loader System
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";

// Core pages - Lazy loading for better performance
const Index = React.lazy(() => import("@/pages/Index"));

// Essential pages - Lazy loading
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const HealthCheck = React.lazy(() => import("@/pages/HealthCheck"));
const NotFound = React.lazy(() => import("@/pages/NotFoundProfessional"));
const Unauthorized = React.lazy(() => import("@/pages/Unauthorized"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const UserProfilePage = React.lazy(() => import("@/pages/user/profile"));

// Protected Route wrappers - PATCH 68.5
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";

// Initialize monitoring & services with optimized query client
const queryClient = createOptimizedQueryClient();

// RouterType based on environment
const RouterType = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : Router;

function App() {
  useEffect(() => {
    // Initialize performance first (critical for slow networks)
    initializePerformance();
    
    // Then monitoring (light mode by default)
    initializeMonitoring();
    
    logger.info("Nautilus One initialized", {
      version: "68.3",
      moduleLoader: "active",
      performanceOptimized: true,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // PATCH 68.2/68.7 - Get module routes automatically from MODULE_REGISTRY (memoized)
  const moduleRoutes = useMemo(() => {
    const routes = getModuleRoutes();
    logger.info(`Loaded ${routes.length} module routes from registry`);
    return routes;
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <OrganizationProvider>
              <RouterType>
                <SmartPrefetchProvider>
                <CommandPalette />
                <KeyboardShortcutsHelp />
                <OfflineBanner />
                <ErrorDebugBanner />
                
                <Routes>
                  {/* Public Routes */}
                  <Route path="/auth" element={
                    <Suspense fallback={<OffshoreLoader />}>
                      <Auth />
                    </Suspense>
                  } />
                  <Route path="/unauthorized" element={
                    <Suspense fallback={<OffshoreLoader />}>
                      <Unauthorized />
                    </Suspense>
                  } />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <SmartLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <Index />
                      </Suspense>
                    } />
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
                    
                    {/* Admin Routes - PATCH 68.5: Role-protected */}
                    <Route path="admin/*" element={
                      <AdminRoute>
                        <Suspense fallback={<OffshoreLoader />}>
                          <Admin />
                        </Suspense>
                      </AdminRoute>
                    } />
                    
                    {/* Settings */}
                    <Route path="settings" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <Settings />
                      </Suspense>
                    } />
                    
                    {/* Profile */}
                    <Route path="profile" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <UserProfilePage />
                      </Suspense>
                    } />
                    
                    {/* Health Check */}
                    <Route path="health" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <HealthCheck />
                      </Suspense>
                    } />
                    
                    {/* Route Redirects - Duplicate/Legacy Routes */}
                    <Route path="intelligent-documents" element={<Navigate to="/documents" replace />} />
                    <Route path="document-ai" element={<Navigate to="/documents" replace />} />
                    <Route path="ai-assistant" element={<Navigate to="/assistant/voice" replace />} />
                    <Route path="voice" element={<Navigate to="/assistant/voice" replace />} />
                    <Route path="voice-assistant" element={<Navigate to="/assistant/voice" replace />} />
                    <Route path="task-automation" element={<Navigate to="/automation" replace />} />
                    <Route path="comunicacao" element={<Navigate to="/communication" replace />} />
                    <Route path="communication-center" element={<Navigate to="/communication" replace />} />
                    <Route path="notification-center" element={<Navigate to="/notifications-center" replace />} />
                    <Route path="documentos" element={<Navigate to="/documents" replace />} />
                    <Route path="checklists" element={<Navigate to="/admin/checklists" replace />} />
                    <Route path="checklists-inteligentes" element={<Navigate to="/admin/checklists" replace />} />
                    <Route path="finance-hub" element={<Navigate to="/finance" replace />} />
                    <Route path="reports-module" element={<Navigate to="/reports" replace />} />
                    <Route path="smart-workflow" element={<Navigate to="/workflow" replace />} />
                    <Route path="user-management" element={<Navigate to="/users" replace />} />
                    <Route path="project-timeline" element={<Navigate to="/projects/timeline" replace />} />
                    <Route path="analytics-core" element={<Navigate to="/analytics" replace />} />
                    <Route path="portal" element={<Navigate to="/training-academy" replace />} />
                    <Route path="portal-funcionario" element={<Navigate to="/training-academy" replace />} />
                    <Route path="mobile-optimization" element={<Navigate to="/optimization" replace />} />
                    <Route path="alertas-precos" element={<Navigate to="/price-alerts" replace />} />
                    <Route path="help" element={<Navigate to="/notifications-center" replace />} />
                    <Route path="audit-center" element={<Navigate to="/compliance-hub" replace />} />
                    
                    {/* PATCH 951: Fix missing navigation routes */}
                    <Route path="crew-management" element={<Navigate to="/crew" replace />} />
                    <Route path="vessels" element={<Navigate to="/fleet" replace />} />
                    <Route path="schedule" element={<Navigate to="/calendar" replace />} />
                    <Route path="schedules" element={<Navigate to="/calendar" replace />} />
                    
                    {/* PATCH 960: Fix missing missions route */}
                    <Route path="missions/new" element={<Navigate to="/mission-logs" replace />} />
                    <Route path="missions" element={<Navigate to="/mission-logs" replace />} />
                    
                    {/* PATCH 981: Fix maintenance/planner route */}
                    <Route path="maintenance/planner" element={<Navigate to="/maintenance-planner" replace />} />
                    
                    {/* 404 Route */}
                    <Route path="*" element={
                      <Suspense fallback={<OffshoreLoader />}>
                        <NotFound />
                      </Suspense>
                    } />
                  </Route>
                </Routes>
                
                {/* PATCH 700: Toast notifications */}
                <Toaster />
                
                {/* PATCH 835: Bandwidth indicator for slow connections */}
                <BandwidthIndicator />
                
                {/* PATCH 838: Quick Start Guide for new users */}
                <QuickStartGuide />
                
                {/* PATCH 700: Web Vitals Overlay (dev only) */}
                {import.meta.env.DEV && (
                  <Suspense fallback={null}>
                    <WebVitalsOverlay position="bottom-right" />
                  </Suspense>
                )}
                </SmartPrefetchProvider>
              </RouterType>
            </OrganizationProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
