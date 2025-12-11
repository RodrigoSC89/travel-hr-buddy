/**
 * App.tsx - PATCH 853.0 - Definitive React Hook Fix + FASE 3.3 Error Boundaries
 * 
 * Uses standard React import pattern and loads context providers synchronously.
 * Includes global error boundary and error tracking.
 */

import React, { useMemo, Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

// CRITICAL: Import context providers directly - NOT lazy loaded
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";

// FASE 3.3: Error Boundaries
import { GlobalErrorBoundary, RouteErrorBoundary, DashboardErrorBoundary } from "@/components/errors";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Utils and config
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";

// Core pages - Lazy loading is safe for pages
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Admin = lazy(() => import("@/pages/Admin"));
const Settings = lazy(() => import("@/pages/Settings"));
const HealthCheck = lazy(() => import("@/pages/HealthCheck"));
const NotFound = lazy(() => import("@/pages/NotFoundProfessional"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const Auth = lazy(() => import("@/pages/Auth"));
const UserProfilePage = lazy(() => import("@/pages/user/profile"));
const RevolutionaryAI = lazy(() => import("@/pages/RevolutionaryAI"));
const AIEnhancedModules = lazy(() => import("@/pages/AIEnhancedModules"));

// Protected Route wrappers
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";

// Lazy load heavy components (NOT context providers)
const SmartLayout = lazy(() => 
  import("./components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
);
const GlobalBrainProvider = lazy(() => 
  import("./components/global/GlobalBrainProvider").then(m => ({ default: m.GlobalBrainProvider }))
);

// CRITICAL FIX: Query client initialization moved inside component to ensure React is fully loaded
// This prevents "Cannot read properties of null (reading 'useEffect')" error
let queryClientInstance: ReturnType<typeof createOptimizedQueryClient> | null = null;

function getQueryClient(): ReturnType<typeof createOptimizedQueryClient> {
  if (!queryClientInstance) {
    queryClientInstance = createOptimizedQueryClient();
  }
  return queryClientInstance;
}

// Router selection
const RouterComponent = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : BrowserRouter;

// Simple loader
function Loader(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

// Routes component (uses hooks safely inside providers)
function AppRoutes(): JSX.Element {
  // FASE 2.5: Lazy preload hook para otimizar carregamento
  const { useLazyPreload } = React.useMemo(() => {
    return { useLazyPreload: () => {
      // Preload será feito dentro do RouterComponent
    }};
  }, []);

  // Get module routes with memoization
  const moduleRoutes = useMemo(() => {
    try {
      return getModuleRoutes();
    } catch (e) {
      console.warn("Failed to load module routes:", e);
      return [];
    }
  }, []);

  return (
    <RouterComponent>
      <Suspense fallback={<Loader />}>
        <GlobalBrainProvider showTrigger={true}>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={
              <Suspense fallback={<Loader />}>
                <Auth />
              </Suspense>
            } />
            <Route path="/unauthorized" element={
              <Suspense fallback={<Loader />}>
                <Unauthorized />
              </Suspense>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <SmartLayout />
                </Suspense>
              </ProtectedRoute>
            }>
              <Route index element={
                <RouteErrorBoundary routePath="/">
                  <Suspense fallback={<Loader />}>
                    <Index />
                  </Suspense>
                </RouteErrorBoundary>
              } />
              <Route path="dashboard" element={
                <DashboardErrorBoundary>
                  <Suspense fallback={<Loader />}>
                    <Dashboard />
                  </Suspense>
                </DashboardErrorBoundary>
              } />
              
              {/* Module Routes from Registry */}
              {moduleRoutes.map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={
                    <Suspense fallback={<Loader />}>
                      <route.component />
                    </Suspense>
                  }
                />
              ))}
              
              {/* Admin Routes */}
              <Route path="admin/*" element={
                <AdminRoute>
                  <Suspense fallback={<Loader />}>
                    <Admin />
                  </Suspense>
                </AdminRoute>
              } />
              
              {/* Settings */}
              <Route path="settings" element={
                <Suspense fallback={<Loader />}>
                  <Settings />
                </Suspense>
              } />
              
              {/* Profile */}
              <Route path="profile" element={
                <Suspense fallback={<Loader />}>
                  <UserProfilePage />
                </Suspense>
              } />
              
              {/* Health Check */}
              <Route path="health" element={
                <Suspense fallback={<Loader />}>
                  <HealthCheck />
                </Suspense>
              } />
              
              {/* Revolutionary AI Hub */}
              <Route path="revolutionary-ai/*" element={
                <Suspense fallback={<Loader />}>
                  <RevolutionaryAI />
                </Suspense>
              } />
              
              {/* AI Enhanced Modules */}
              <Route path="ai-modules" element={
                <Suspense fallback={<Loader />}>
                  <AIEnhancedModules />
                </Suspense>
              } />
              
              {/* Legacy Route Redirects */}
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
              <Route path="reports-module" element={<Navigate to="/reports-command" replace />} />
              <Route path="smart-workflow" element={<Navigate to="/workflow" replace />} />
              <Route path="user-management" element={<Navigate to="/users" replace />} />
              <Route path="project-timeline" element={<Navigate to="/projects/timeline" replace />} />
              <Route path="analytics-core" element={<Navigate to="/analytics-command" replace />} />
              <Route path="analytics" element={<Navigate to="/analytics-command" replace />} />
              <Route path="advanced-analytics" element={<Navigate to="/analytics-command" replace />} />
              <Route path="predictive-analytics" element={<Navigate to="/analytics-command" replace />} />
              <Route path="portal" element={<Navigate to="/nautilus-academy" replace />} />
              <Route path="portal-funcionario" element={<Navigate to="/nautilus-academy" replace />} />
              <Route path="training-academy" element={<Navigate to="/nautilus-academy" replace />} />
              <Route path="mobile-optimization" element={<Navigate to="/optimization" replace />} />
              <Route path="alertas-precos" element={<Navigate to="/alerts-command" replace />} />
              <Route path="price-alerts" element={<Navigate to="/alerts-command" replace />} />
              <Route path="intelligent-alerts" element={<Navigate to="/alerts-command" replace />} />
              <Route path="help" element={<Navigate to="/notifications-center" replace />} />
              <Route path="audit-center" element={<Navigate to="/compliance-hub" replace />} />
              <Route path="crew-management" element={<Navigate to="/crew" replace />} />
              <Route path="vessels" element={<Navigate to="/fleet" replace />} />
              <Route path="schedule" element={<Navigate to="/calendar" replace />} />
              <Route path="schedules" element={<Navigate to="/calendar" replace />} />
              <Route path="missions/new" element={<Navigate to="/mission-logs" replace />} />
              <Route path="missions" element={<Navigate to="/mission-logs" replace />} />
              <Route path="maintenance/planner" element={<Navigate to="/maintenance-planner" replace />} />
              
              {/* 404 Route */}
              <Route path="*" element={
                <Suspense fallback={<Loader />}>
                  <NotFound />
                </Suspense>
              } />
            </Route>
          </Routes>
          
        </GlobalBrainProvider>
      </Suspense>
      {/* CRITICAL: Toasters OUTSIDE lazy-loaded components to prevent React instance mismatch */}
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </RouterComponent>
  );
}

// Main App component - FASE 3.3: Now with GlobalErrorBoundary
function App(): JSX.Element {
  // CRITICAL FIX: Get QueryClient instance lazily to ensure React is fully initialized
  // This prevents "Cannot read properties of null (reading 'useEffect')" error
  // Context providers are NOT lazy loaded - they must be imported directly and rendered synchronously
  const queryClient = getQueryClient();
  
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <OrganizationProvider>
              <AppRoutes />
            </OrganizationProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
