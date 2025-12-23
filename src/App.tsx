// App.tsx - PATCH 850.3 - Simplified to fix React hooks issue
import * as React from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Import AuthProvider from contexts
import { AuthProvider } from "./contexts/AuthContext";

// Simple inline error boundary
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

// Import after React to avoid potential circular issues
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";

// Direct imports for context providers to avoid React instance issues with lazy loading
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { GlobalBrainProvider } from "./components/global/GlobalBrainProvider";

// Core pages - Lazy loading
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
const SmartLayout = React.lazy(() => 
  import("./components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
);

// Initialize query client
const queryClient = createOptimizedQueryClient();

// RouterType based on environment
const RouterType = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : Router;

function App() {
  // Memoize module routes
  const moduleRoutes = React.useMemo(() => {
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
          <React.Suspense fallback={<OffshoreLoader />}>
            <TenantProvider>
              <OrganizationProvider>
                <RouterType>
                  <GlobalBrainProvider showTrigger={true}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/auth" element={
                        <React.Suspense fallback={<OffshoreLoader />}>
                          <Auth />
                        </React.Suspense>
                      } />
                      <Route path="/unauthorized" element={
                        <React.Suspense fallback={<OffshoreLoader />}>
                          <Unauthorized />
                        </React.Suspense>
                      } />
                      
                      {/* Protected Routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <SmartLayout />
                          </React.Suspense>
                        </ProtectedRoute>
                      }>
                        <Route index element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <Index />
                          </React.Suspense>
                        } />
                        <Route path="dashboard" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <Dashboard />
                          </React.Suspense>
                        } />
                        
                        {/* Module Routes from Registry */}
                        {moduleRoutes.map((route) => (
                          <Route
                            key={route.id}
                            path={route.path}
                            element={
                              <React.Suspense fallback={<OffshoreLoader />}>
                                <route.component />
                              </React.Suspense>
                            }
                          />
                        ))}
                        
                        {/* Admin Routes */}
                        <Route path="admin/*" element={
                          <AdminRoute>
                            <React.Suspense fallback={<OffshoreLoader />}>
                              <Admin />
                            </React.Suspense>
                          </AdminRoute>
                        } />
                        
                        {/* Settings */}
                        <Route path="settings" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <Settings />
                          </React.Suspense>
                        } />
                        
                        {/* Profile */}
                        <Route path="profile" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <UserProfilePage />
                          </React.Suspense>
                        } />
                        
                        {/* Health Check */}
                        <Route path="health" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <HealthCheck />
                          </React.Suspense>
                        } />
                        
                        {/* Revolutionary AI Hub */}
                        <Route path="revolutionary-ai/*" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <RevolutionaryAI />
                          </React.Suspense>
                        } />
                        
                        {/* AI Enhanced Modules */}
                        <Route path="ai-modules" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <AIEnhancedModules />
                          </React.Suspense>
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
                        
                        {/* Executive Dashboard - redirect to command center */}
                        <Route path="executive-dashboard" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <Navigate to="/command-center" replace />
                          </React.Suspense>
                        } />
                        
                        {/* Additional Legacy Redirects */}
                        <Route path="maritime" element={<Navigate to="/maritime-command" replace />} />
                        <Route path="maritime-checklists" element={<Navigate to="/maritime-command" replace />} />
                        <Route path="maritime-certifications" element={<Navigate to="/maritime-command" replace />} />
                        <Route path="fleet" element={<Navigate to="/fleet-command" replace />} />
                        <Route path="fleet-dashboard" element={<Navigate to="/fleet-command" replace />} />
                        <Route path="fleet-tracking" element={<Navigate to="/fleet-command" replace />} />
                        <Route path="operations-dashboard" element={<Navigate to="/operations-command" replace />} />
                        <Route path="ai-insights" element={<Navigate to="/ai-command" replace />} />
                        <Route path="intelligent-alerts" element={<Navigate to="/alerts-command" replace />} />
                        <Route path="smart-mobility" element={<Navigate to="/travel-command" replace />} />
                        <Route path="voyage-planner" element={<Navigate to="/voyage-command" replace />} />
                        <Route path="mission-control" element={<Navigate to="/mission-command" replace />} />
                        <Route path="maintenance-planner" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="intelligent-maintenance" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="mmi" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="mmi-tasks" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="mmi-forecast" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="mmi-history" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="mmi-jobs-panel" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="mmi-dashboard" element={<Navigate to="/maintenance-command" replace />} />
                        <Route path="channel-manager" element={<Navigate to="/communication-command" replace />} />
                        <Route path="weather-dashboard" element={<Navigate to="/weather-command" replace />} />
                        <Route path="smart-workflow" element={<Navigate to="/workflow-command" replace />} />
                        <Route path="workflow" element={<Navigate to="/workflow-command" replace />} />
                        <Route path="finance" element={<Navigate to="/finance-command" replace />} />
                        <Route path="reports" element={<Navigate to="/reports-command" replace />} />
                        <Route path="incident-reports" element={<Navigate to="/reports-command" replace />} />
                        
                        {/* Additional missing routes */}
                        <Route path="procurement-inventory" element={<Navigate to="/procurement-command" replace />} />
                        <Route path="crew" element={<Navigate to="/maritime-command" replace />} />
                        <Route path="fleet-operations" element={<Navigate to="/fleet-command" replace />} />
                        <Route path="logistics" element={<Navigate to="/logistics-command" replace />} />
                        <Route path="procurement" element={<Navigate to="/procurement-command" replace />} />
                        <Route path="inventory" element={<Navigate to="/procurement-command" replace />} />
                        <Route path="crew-members" element={<Navigate to="/maritime-command" replace />} />
                        <Route path="crew-schedule" element={<Navigate to="/maritime-command" replace />} />
                        <Route path="fleet-management" element={<Navigate to="/fleet-command" replace />} />
                        <Route path="fleet-status" element={<Navigate to="/fleet-command" replace />} />
                        <Route path="operations" element={<Navigate to="/operations-command" replace />} />
                        <Route path="monitoring" element={<Navigate to="/nautilus-command" replace />} />
                        
                        {/* 404 Route */}
                        <Route path="*" element={
                          <React.Suspense fallback={<OffshoreLoader />}>
                            <NotFound />
                          </React.Suspense>
                        } />
                      </Route>
                    </Routes>
                    
                    <Toaster />
                  </GlobalBrainProvider>
                </RouterType>
              </OrganizationProvider>
            </TenantProvider>
          </React.Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
