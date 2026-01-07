/**
 * App.tsx - Main application entry point
 * Refactored to use modular route system (P2 Cleanup)
 */
import { Suspense, useMemo, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { logger } from "@/lib/logger";
import { reportCriticalError } from "@/lib/alerts/slack-error-reporter";
import * as Sentry from "@sentry/react";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { GlobalBrainProvider } from "./components/global/GlobalBrainProvider";
import { LiteModeProvider } from "./components/performance/LiteMode";
import { TooltipProvider } from "./components/ui/tooltip";

// Global components
import { GlobalVoiceButton } from "./components/voice/GlobalVoiceButton";
import { GlobalAILevel3Button } from "./components/ai/GlobalAILevel3Button";
import { GlobalAIButton } from "./components/ai/GlobalAIButton";
import { FloatingButtonsContainer } from "./components/global/FloatingButtonsContainer";
import { NautilusBrainButton } from "./components/global/NautilusBrainButton";
import { OfflineIndicator } from "./components/offline/OfflineIndicator";
import { VoiceNLUInlineButton } from "./components/voice/VoiceNLUInlineButton";
import { SyncStatusBadge } from "./components/mobile/SyncStatusBadge";

// Performance & Auth
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";
import { legacyRedirectRoutes } from "@/config/legacy-redirects";

// Route modules (modularized)
import {
  aiRoutes,
  securityRoutes,
  operationsRoutes,
  complianceRoutes,
  v2ModulesRoutes,
  integrationsRoutes,
  executiveRoutes,
} from "./routes";

// Core lazy-loaded pages - imported directly to avoid barrel export memory issues
import {
  Auth,
  Unauthorized,
  Settings,
  UserProfilePage,
  HealthCheck,
  SystemDebug,
  Billing,
  OfflinePage,
  MMIJobsPanel,
  SidebarCheck,
  CentralComando,
  Admin,
  NotFound,
  SmartLayout,
} from "./routes/lazy-imports";

// PWA Install Page
import InstallPage from "./pages/install";

// Intelligence Dashboards
import EnergyOptimizerDashboard from "./pages/intelligence/EnergyOptimizerDashboard";
import WellnessPredictiveDashboard from "./pages/intelligence/WellnessPredictiveDashboard";
import DocumentIntelligenceDashboard from "./pages/intelligence/DocumentIntelligenceDashboard";
import AccidentIntelligenceDashboard from "./pages/intelligence/AccidentIntelligenceDashboard";
import BlockchainGovernanceDashboard from "./pages/intelligence/BlockchainGovernanceDashboard";
import CompetitiveIntelligenceDashboard from "./pages/intelligence/CompetitiveIntelligenceDashboard";
import UnifiedOptimizationDashboard from "./pages/optimization/UnifiedOptimizationDashboard";

// Simple loader component
const OffshoreLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Global error boundary with Sentry integration
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report to Sentry
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
      tags: { boundary: "global", severity: "critical" },
    });
    
    // Report to Slack/Discord
    reportCriticalError(error, {
      module: "GlobalErrorBoundary",
      componentStack: errorInfo.componentStack?.slice(0, 500),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }).catch(err => logger.error("Failed to report to Slack/Discord:", err));
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

// Initialize query client
const queryClient = createOptimizedQueryClient();

// RouterType based on environment
const RouterType = import.meta.env.VITE_USE_HASH_ROUTER === "true" ? HashRouter : Router;

function App() {
  // Memoize module routes
  const moduleRoutes = useMemo(() => {
    try {
      return getModuleRoutes();
    } catch (e) {
      logger.warn("Failed to load module routes:", { error: e });
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
                <RouterType>
                  <LiteModeProvider autoEnable={true}>
                    <GlobalBrainProvider showTrigger={false}>
                      <TooltipProvider>
                        <Routes>
                        {/* Public Routes */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/install" element={<InstallPage />} />
                        
                        {/* Protected Routes */}
                        <Route path="/" element={
                          <ProtectedRoute>
                            <SmartLayout />
                          </ProtectedRoute>
                        }>
                          {/* Central de Comando - Main Hub */}
                          <Route index element={<Navigate to="/central-comando" replace />} />
                          <Route path="dashboard" element={<Navigate to="/central-comando/visao-geral" replace />} />
                          <Route path="central-comando/*" element={<CentralComando />} />
                          
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
                          <Route path="billing" element={<Billing />} />
                          <Route path="offline" element={<OfflinePage />} />
                          <Route path="mmi-jobs" element={<MMIJobsPanel />} />
                          <Route path="__debug__" element={<SystemDebug />} />
                          <Route path="dev/sidebar-check" element={<SidebarCheck />} />
                          
                          {/* Intelligence Dashboards */}
                          <Route path="intelligence/opec" element={<EnergyOptimizerDashboard />} />
                          <Route path="intelligence/wellness" element={<WellnessPredictiveDashboard />} />
                          <Route path="intelligence/documents" element={<DocumentIntelligenceDashboard />} />
                          <Route path="intelligence/accidents" element={<AccidentIntelligenceDashboard />} />
                          <Route path="intelligence/blockchain" element={<BlockchainGovernanceDashboard />} />
                          <Route path="intelligence/competitive" element={<CompetitiveIntelligenceDashboard />} />
                          <Route path="optimization-dashboard" element={<UnifiedOptimizationDashboard />} />
                          
                          {/* Modular Route Groups */}
                          {aiRoutes}
                          {securityRoutes}
                          {operationsRoutes}
                          {complianceRoutes}
                          {v2ModulesRoutes}
                          {integrationsRoutes}
                          {executiveRoutes}
                          
                          {/* Legacy Redirects */}
                          {legacyRedirectRoutes}
                          
                          {/* 404 Route */}
                          <Route path="*" element={<NotFound />} />
                        </Route>
                      </Routes>
                      
                      <Toaster />
                      <OfflineIndicator />
                      <SyncStatusBadge className="fixed top-4 right-4 z-40" />
                      <FloatingButtonsContainer>
                        <GlobalAIButton />
                        <GlobalAILevel3Button />
                        <GlobalVoiceButton />
                        <VoiceNLUInlineButton />
                        <NautilusBrainButton />
                      </FloatingButtonsContainer>
                      </TooltipProvider>
                    </GlobalBrainProvider>
                  </LiteModeProvider>
                </RouterType>
              </OrganizationProvider>
            </TenantProvider>
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
