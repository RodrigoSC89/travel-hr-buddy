// App.tsx - PATCH 850.4 - Optimized lazy loading & extracted redirects
import * as React from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Import AuthProvider from contexts
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { GlobalBrainProvider } from "./components/global/GlobalBrainProvider";

// Performance utilities
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";
import { legacyRedirectRoutes } from "@/config/legacy-redirects";

// Simple loader component
const OffshoreLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

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

// Core pages - Lazy loading with named chunks
const Index = React.lazy(() => import(/* webpackChunkName: "page-index" */ "@/pages/Index"));
const Dashboard = React.lazy(() => import(/* webpackChunkName: "page-dashboard" */ "@/pages/Dashboard"));
const Admin = React.lazy(() => import(/* webpackChunkName: "page-admin" */ "@/pages/Admin"));
const Settings = React.lazy(() => import(/* webpackChunkName: "page-settings" */ "@/pages/Settings"));
const HealthCheck = React.lazy(() => import(/* webpackChunkName: "page-health" */ "@/pages/HealthCheck"));
const NotFound = React.lazy(() => import(/* webpackChunkName: "page-notfound" */ "@/pages/NotFoundProfessional"));
const Unauthorized = React.lazy(() => import(/* webpackChunkName: "page-unauthorized" */ "@/pages/Unauthorized"));
const Auth = React.lazy(() => import(/* webpackChunkName: "page-auth" */ "@/pages/Auth"));
const UserProfilePage = React.lazy(() => import(/* webpackChunkName: "page-profile" */ "@/pages/user/profile"));
const RevolutionaryAI = React.lazy(() => import(/* webpackChunkName: "page-ai" */ "@/pages/RevolutionaryAI"));
const AIEnhancedModules = React.lazy(() => import(/* webpackChunkName: "page-ai-modules" */ "@/pages/AIEnhancedModules"));
const SystemDebug = React.lazy(() => import(/* webpackChunkName: "page-debug" */ "@/pages/SystemDebug"));
const SmartLayout = React.lazy(() => 
  import(/* webpackChunkName: "layout-smart" */ "./components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
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
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      
                      {/* Protected Routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <SmartLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<Index />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        
                        {/* Module Routes from Registry */}
                        {moduleRoutes.map((route) => (
                          <Route
                            key={route.id}
                            path={route.path}
                            element={<route.component />}
                          />
                        ))}
                        
                        {/* Admin Routes */}
                        <Route path="admin/*" element={
                          <AdminRoute>
                            <Admin />
                          </AdminRoute>
                        } />
                        
                        {/* Core Pages */}
                        <Route path="settings" element={<Settings />} />
                        <Route path="profile" element={<UserProfilePage />} />
                        <Route path="health" element={<HealthCheck />} />
                        <Route path="__debug__" element={<SystemDebug />} />
                        <Route path="revolutionary-ai/*" element={<RevolutionaryAI />} />
                        <Route path="ai-modules" element={<AIEnhancedModules />} />
                        
                        {/* Legacy Redirects - Extracted */}
                        {legacyRedirectRoutes}
                        
                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />
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
