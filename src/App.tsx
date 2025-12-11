/**
 * App.tsx - PATCH 852.0 - Definitive React Hook Fix
 * 
 * CRITICAL FIX: Context providers are NOT lazy loaded.
 * Lazy loading context providers causes React hooks to fail.
 */

// CRITICAL: Use consistent React namespace import
import * as React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

// CRITICAL: Import context providers directly - DO NOT LAZY LOAD
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";

// UI Components - can be lazy loaded safely
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Utils and config
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";

// Core pages - Lazy loading is safe for pages
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

// Protected Route wrappers
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";

// Lazy load heavy components (NOT context providers)
const SmartLayout = React.lazy(() => 
  import("./components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
);
const GlobalBrainProvider = React.lazy(() => 
  import("./components/global/GlobalBrainProvider").then(m => ({ default: m.GlobalBrainProvider }))
);

// Query client (singleton)
const queryClient = createOptimizedQueryClient();

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

// Error display component
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-destructive">Erro ao carregar</h1>
        <p className="text-muted-foreground">{message}</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recarregar página
        </button>
      </div>
    </div>
  );
}

// Routes component (uses hooks safely inside providers)
function AppRoutes(): JSX.Element {
  // Get module routes with memoization
  const moduleRoutes = React.useMemo(() => {
    try {
      return getModuleRoutes();
    } catch (e) {
      console.warn("Failed to load module routes:", e);
      return [];
    }
  }, []);

  return (
    <RouterComponent>
      <React.Suspense fallback={<Loader />}>
        <GlobalBrainProvider showTrigger={true}>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={
              <React.Suspense fallback={<Loader />}>
                <Auth />
              </React.Suspense>
            } />
            <Route path="/unauthorized" element={
              <React.Suspense fallback={<Loader />}>
                <Unauthorized />
              </React.Suspense>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <React.Suspense fallback={<Loader />}>
                  <SmartLayout />
                </React.Suspense>
              </ProtectedRoute>
            }>
              <Route index element={
                <React.Suspense fallback={<Loader />}>
                  <Index />
                </React.Suspense>
              } />
              <Route path="dashboard" element={
                <React.Suspense fallback={<Loader />}>
                  <Dashboard />
                </React.Suspense>
              } />
              
              {/* Module Routes from Registry */}
              {moduleRoutes.map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={
                    <React.Suspense fallback={<Loader />}>
                      <route.component />
                    </React.Suspense>
                  }
                />
              ))}
              
              {/* Admin Routes */}
              <Route path="admin/*" element={
                <AdminRoute>
                  <React.Suspense fallback={<Loader />}>
                    <Admin />
                  </React.Suspense>
                </AdminRoute>
              } />
              
              {/* Settings */}
              <Route path="settings" element={
                <React.Suspense fallback={<Loader />}>
                  <Settings />
                </React.Suspense>
              } />
              
              {/* Profile */}
              <Route path="profile" element={
                <React.Suspense fallback={<Loader />}>
                  <UserProfilePage />
                </React.Suspense>
              } />
              
              {/* Health Check */}
              <Route path="health" element={
                <React.Suspense fallback={<Loader />}>
                  <HealthCheck />
                </React.Suspense>
              } />
              
              {/* Revolutionary AI Hub */}
              <Route path="revolutionary-ai/*" element={
                <React.Suspense fallback={<Loader />}>
                  <RevolutionaryAI />
                </React.Suspense>
              } />
              
              {/* AI Enhanced Modules */}
              <Route path="ai-modules" element={
                <React.Suspense fallback={<Loader />}>
                  <AIEnhancedModules />
                </React.Suspense>
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
                <React.Suspense fallback={<Loader />}>
                  <NotFound />
                </React.Suspense>
              } />
            </Route>
          </Routes>
          
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </GlobalBrainProvider>
      </React.Suspense>
    </RouterComponent>
  );
}

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Main App component - Class component for error boundary
class App extends React.Component<Record<string, never>, ErrorBoundaryState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("App Error:", error, errorInfo);
  }

  handleRetry = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          message={this.state.error?.message || "Erro desconhecido"} 
          onRetry={this.handleRetry} 
        />
      );
    }

    // CRITICAL: Context providers are NOT lazy loaded
    // They must be imported directly and rendered synchronously
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <OrganizationProvider>
              <AppRoutes />
            </OrganizationProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }
}

export default App;
