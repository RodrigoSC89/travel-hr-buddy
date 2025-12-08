import React, { useEffect, Suspense, useMemo } from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

// Simple inline error boundary for maximum reliability
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-destructive">Erro ao carregar</h1>
            <p className="text-muted-foreground">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple loader component
const OffshoreLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// PATCH 68.2 - Module Loader System
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";

// Core pages - Lazy loading for better performance
const Index = React.lazy(() => import("@/pages/Index"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const HealthCheck = React.lazy(() => import("@/pages/HealthCheck"));
const NotFound = React.lazy(() => import("@/pages/NotFoundProfessional"));
const Unauthorized = React.lazy(() => import("@/pages/Unauthorized"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const UserProfilePage = React.lazy(() => import("@/pages/user/profile"));
const RevolutionaryAI = React.lazy(() => import("@/pages/RevolutionaryAI"));
const AIEnhancedModules = React.lazy(() => import("@/pages/AIEnhancedModules"));

// Protected Route wrappers - PATCH 68.5
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";

// Lazy load heavy components
const SmartLayout = React.lazy(() => 
  import("./components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
);
const TenantProvider = React.lazy(() => 
  import("./contexts/TenantContext").then(m => ({ default: m.TenantProvider }))
);
const OrganizationProvider = React.lazy(() => 
  import("./contexts/OrganizationContext").then(m => ({ default: m.OrganizationProvider }))
);
const GlobalBrainProvider = React.lazy(() => 
  import("./components/global/GlobalBrainProvider").then(m => ({ default: m.GlobalBrainProvider }))
);

// Initialize monitoring & services with optimized query client
const queryClient = createOptimizedQueryClient();

// RouterType based on environment
const RouterType = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : Router;

function App() {
  // PATCH 68.2/68.7 - Get module routes automatically from MODULE_REGISTRY (memoized)
  const moduleRoutes = useMemo(() => {
    try {
      return getModuleRoutes();
    } catch (e) {
      console.warn("Failed to load module routes:", e);
      return [];
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<OffshoreLoader />}>
            <TenantProvider>
              <OrganizationProvider>
                <GlobalBrainProvider showTrigger={true}>
                <RouterType>
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
                        <Suspense fallback={<OffshoreLoader />}>
                          <SmartLayout />
                        </Suspense>
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
                      
                      {/* Admin Routes */}
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
                      
                      {/* Revolutionary AI Hub */}
                      <Route path="revolutionary-ai/*" element={
                        <Suspense fallback={<OffshoreLoader />}>
                          <RevolutionaryAI />
                        </Suspense>
                      } />
                      
                      {/* AI Enhanced Modules */}
                      <Route path="ai-modules" element={
                        <Suspense fallback={<OffshoreLoader />}>
                          <AIEnhancedModules />
                        </Suspense>
                      } />
                      
                      {/* Route Redirects - Legacy Routes */}
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
                      <Route path="portal" element={<Navigate to="/nautilus-academy" replace />} />
                      <Route path="portal-funcionario" element={<Navigate to="/nautilus-academy" replace />} />
                      <Route path="training-academy" element={<Navigate to="/nautilus-academy" replace />} />
                      <Route path="mobile-optimization" element={<Navigate to="/optimization" replace />} />
                      <Route path="alertas-precos" element={<Navigate to="/price-alerts" replace />} />
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
                        <Suspense fallback={<OffshoreLoader />}>
                          <NotFound />
                        </Suspense>
                      } />
                    </Route>
                  </Routes>
                  
                  <Toaster />
                </RouterType>
                </GlobalBrainProvider>
              </OrganizationProvider>
            </TenantProvider>
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;