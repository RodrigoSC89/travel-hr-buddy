import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/components/layout/theme-provider";
// Critical imports - loaded immediately for fast initial load
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import EnterpriseLayout from "./components/layout/enterprise-layout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/protected-route";

// Lazy load all non-critical pages for better performance
const Admin = React.lazy(() => import("./pages/Admin"));
const PriceAlerts = React.lazy(() => import("./pages/PriceAlerts"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Reservations = React.lazy(() => import("./pages/Reservations"));
const ChecklistsInteligentes = React.lazy(() => import("./pages/ChecklistsInteligentes"));
const PEOTRAM = React.lazy(() => import("./pages/PEOTRAM"));
const PEODP = React.lazy(() => import("./pages/PEODP"));
const SGSO = React.lazy(() => import("./pages/SGSO"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Travel = React.lazy(() => import("./pages/Travel"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const HumanResources = React.lazy(() => import("./pages/HumanResources"));
const Communication = React.lazy(() => import("./pages/Communication"));
const Intelligence = React.lazy(() => import("./pages/Intelligence"));
const Maritime = React.lazy(() => import("./pages/Maritime"));
const MaritimeSupremo = React.lazy(() => import("./pages/MaritimeSupremo"));
const Innovation = React.lazy(() => import("./pages/Innovation"));
const Optimization = React.lazy(() => import("./pages/Optimization"));
const Collaboration = React.lazy(() => import("./pages/Collaboration"));
const Voice = React.lazy(() => import("./pages/Voice"));
const Portal = React.lazy(() => import("./pages/Portal"));
const AR = React.lazy(() => import("./pages/AR"));
const IoT = React.lazy(() => import("./pages/IoT"));
const Blockchain = React.lazy(() => import("./pages/Blockchain"));
const Gamification = React.lazy(() => import("./pages/Gamification"));
const PredictiveAnalytics = React.lazy(() => import("./pages/PredictiveAnalytics"));
const WorkflowPage = React.lazy(() => import("./pages/Workflow"));
const AdvancedReports = React.lazy(() => import("./pages/AdvancedReports"));
const Executive = React.lazy(() => import("./pages/Executive"));
const SystemMonitor = React.lazy(() => import("./pages/SystemMonitor"));
const NotificationCenter = React.lazy(() => import("./pages/NotificationCenter"));
const BackupAudit = React.lazy(() => import("./pages/BackupAudit"));
const SecurityPage = React.lazy(() => import("./pages/Security"));
const UsersPage = React.lazy(() => import("./pages/Users"));
const CollaborationPage = React.lazy(() => import("./pages/Collaboration"));
const MobileOptimizationPage = React.lazy(() => import("./pages/MobileOptimization"));
const AdvancedAnalyticsPage = React.lazy(() => import("./pages/AdvancedAnalytics"));
const AdvancedSystemMonitorPage = React.lazy(() => import("./pages/AdvancedSystemMonitor"));
const IntelligentDocumentsPage = React.lazy(() => import("./pages/IntelligentDocuments"));
const AIAssistantPage = React.lazy(() => import("./pages/AIAssistant"));
const BusinessIntelligencePage = React.lazy(() => import("./pages/BusinessIntelligence"));
const SmartWorkflowPage = React.lazy(() => import("./pages/SmartWorkflow"));
const Help = React.lazy(() => import("./pages/Help"));
const Templates = React.lazy(() => import("./pages/Templates"));
const SystemOverviewPage = React.lazy(() => import("./pages/SystemOverview"));
const EnhancedMetrics = React.lazy(() => import("./pages/EnhancedMetrics"));
const PerformanceOptimizerPage = React.lazy(() => import("./pages/PerformanceOptimizer"));
const OptimizationGeneral = React.lazy(() => import("./pages/OptimizationGeneral"));
const AIInsights = React.lazy(() => import("./pages/AIInsights"));
const TestingDashboard = React.lazy(() => import("./pages/TestingDashboard"));
const FeedbackPage = React.lazy(() => import("./pages/Feedback"));
const RealTimeAnalyticsPage = React.lazy(() => import("./pages/RealTimeAnalytics"));
const OfflineSyncPage = React.lazy(() => import("./pages/OfflineSync"));
const FleetManagement = React.lazy(() => import("./pages/FleetManagement"));
const CrewManagement = React.lazy(() => import("./pages/CrewManagement"));
const CrewDossier = React.lazy(() => import("./pages/CrewDossier"));
const MaritimeCertifications = React.lazy(() => import("./pages/MaritimeCertifications"));
const MaritimeChecklists = React.lazy(() => import("./pages/MaritimeChecklists"));
const OrganizationSettings = React.lazy(() => import("./pages/OrganizationSettings"));
const OrganizationSetup = React.lazy(() => import("./pages/OrganizationSetup"));
const SuperAdmin = React.lazy(() => import("./pages/SuperAdmin"));
const TaskManagement = React.lazy(() => import("./pages/TaskManagement"));
const DocumentManagement = React.lazy(() => import("./pages/DocumentManagement"));
const FleetDashboard = React.lazy(() => import("./pages/FleetDashboard"));
const FleetTracking = React.lazy(() => import("./pages/FleetTracking"));
const ExecutiveDashboard = React.lazy(() => import("./pages/ExecutiveDashboard"));
const IntelligentAlerts = React.lazy(() => import("./pages/IntelligentAlerts"));
const Automation = React.lazy(() => import("./pages/Automation"));
const DropdownTests = React.lazy(() => import("./pages/DropdownTests"));
const SystemValidation = React.lazy(() => import("./pages/SystemValidation"));
const FABDemo = React.lazy(() => import("./pages/FABDemo"));

// Advanced pages - lazy loaded
const AdvancedDocuments = React.lazy(() => import("./pages/AdvancedDocuments"));
const MobileApp = React.lazy(() => import("./pages/MobileApp"));
const SaaSManager = React.lazy(() => import("./pages/SaaSManager"));
const Academy = React.lazy(() => import("./pages/Academy"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const RealTimeMonitoring = React.lazy(() => import("./pages/RealTimeMonitoring"));
const AdvancedAuth = React.lazy(() => import("./pages/AdvancedAuth"));
const BusinessContinuityPlan = React.lazy(() => import("./pages/BusinessContinuityPlan"));
const ProductRoadmapPage = React.lazy(() => import("./pages/ProductRoadmap"));
const SystemAuditorPage = React.lazy(() => import("./pages/SystemAuditor"));
const ProductionDeployPage = React.lazy(() => import("./pages/ProductionDeploy"));
const UserOnboardingPage = React.lazy(() => import("./pages/UserOnboarding"));
const Strategic = React.lazy(() => import("./pages/Strategic"));
const NotificationCenterPage = React.lazy(() => import("./pages/NotificationCenterPage"));
const SystemMonitorPage = React.lazy(() => import("./pages/SystemMonitorPage"));
const AdvancedSettingsPage = React.lazy(() => import("./pages/AdvancedSettingsPage"));
const NautilusOne = React.lazy(() => import("./pages/NautilusOne"));

// Lazy load components
const WorkflowAutomationHub = React.lazy(() => import("./components/automation/workflow-automation-hub").then(m => ({ default: m.WorkflowAutomationHub })));
const AdvancedDocumentCenter = React.lazy(() => import("./components/documents/advanced-document-center").then(m => ({ default: m.AdvancedDocumentCenter })));
const IntegrationsHub = React.lazy(() => import("./components/integration/integrations-hub").then(m => ({ default: m.default })));
const IntelligentHelpCenter = React.lazy(() => import("@/components/help/intelligent-help-center").then(m => ({ default: m.default })));
const KnowledgeManagement = React.lazy(() => import("@/components/admin/knowledge-management").then(m => ({ default: m.default })));

const queryClient = new QueryClient();

// Common loading component for lazy loaded routes
const RouteLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const App = () => {
  // Service Worker registration for PWA capabilities
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          // Service Worker registered successfully
        })
        .catch(() => {
          // Service Worker registration failed
        });
    }
  }, []);

  return (
    <ErrorBoundaryWrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <OrganizationProvider>
            <TenantProvider>
              <TooltipProvider>
                <OfflineIndicator />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/fab-demo" element={
                  <React.Suspense fallback={<RouteLoader />}>
                    <FABDemo />
                  </React.Suspense>
                } />
                <Route path="/" element={
                  <ProtectedRoute>
                    <EnterpriseLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="admin" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Admin />
                    </React.Suspense>
                  } />
                  <Route path="price-alerts" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <PriceAlerts />
                    </React.Suspense>
                  } />
                  <Route path="reports" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Reports />
                    </React.Suspense>
                  } />
                  <Route path="settings" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Settings />
                    </React.Suspense>
                  } />
                  <Route path="travel" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Travel />
                    </React.Suspense>
                  } />
                  <Route path="analytics" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Analytics />
                    </React.Suspense>
                  } />
                  <Route path="hr" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <HumanResources />
                    </React.Suspense>
                  } />
                  <Route path="reservations" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Reservations />
                    </React.Suspense>
                  } />
                  <Route path="maritime" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Maritime />
                    </React.Suspense>
                  } />
                  <Route path="maritime-supremo" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <MaritimeSupremo />
                    </React.Suspense>
                  } />
                  <Route path="communication" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Communication />
                    </React.Suspense>
                  } />
                  <Route path="intelligence" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Intelligence />
                    </React.Suspense>
                  } />
                  <Route path="optimization" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Optimization />
                    </React.Suspense>
                  } />
                  <Route path="optimization-general" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <OptimizationGeneral />
                    </React.Suspense>
                  } />
                  <Route path="innovation" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Innovation />
                    </React.Suspense>
                  } />
                  <Route path="collaboration" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Collaboration />
                    </React.Suspense>
                  } />
                  <Route path="voice" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Voice />
                    </React.Suspense>
                  } />
                  <Route path="portal" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Portal />
                    </React.Suspense>
                  } />
                  <Route path="ar" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <AR />
                    </React.Suspense>
                  } />
                  <Route path="iot" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <IoT />
                    </React.Suspense>
                  } />
                  <Route path="blockchain" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Blockchain />
                    </React.Suspense>
                  } />
                  <Route path="gamification" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Gamification />
                    </React.Suspense>
                  } />
                  <Route path="predictive-analytics" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <PredictiveAnalytics />
                    </React.Suspense>
                  } />
                  <Route path="workflow" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <WorkflowPage />
                    </React.Suspense>
                  } />
                  <Route path="documents" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <div className="container mx-auto p-6">
                        <AdvancedDocumentCenter />
                      </div>
                    </React.Suspense>
                  } />
                  <Route path="mobile-optimization" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <MobileOptimizationPage />
                    </React.Suspense>
                  } />
                  <Route path="advanced-reports" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <AdvancedReports />
                    </React.Suspense>
                  } />
                  <Route path="executive" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Executive />
                    </React.Suspense>
                  } />
                  <Route path="system-monitor" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SystemMonitor />
                    </React.Suspense>
                  } />
                  <Route path="notification-center" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <NotificationCenter />
                    </React.Suspense>
                  } />
                  <Route path="integrations" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <div className="container mx-auto p-6">
                        <IntegrationsHub />
                      </div>
                    </React.Suspense>
                  } />
                  <Route path="backup-audit" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <BackupAudit />
                    </React.Suspense>
                  } />
                  <Route path="security" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SecurityPage />
                    </React.Suspense>
                  } />
                  <Route path="users" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <UsersPage />
                    </React.Suspense>
                  } />
                  <Route path="collaboration" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <CollaborationPage />
                    </React.Suspense>
                  } />
                  <Route path="advanced-analytics" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <AdvancedAnalyticsPage />
                    </React.Suspense>
                  } />
                  <Route path="advanced-system-monitor" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <AdvancedSystemMonitorPage />
                    </React.Suspense>
                  } />
                  <Route path="intelligent-documents" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <IntelligentDocumentsPage />
                    </React.Suspense>
                  } />
                  <Route path="ai-assistant" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <AIAssistantPage />
                    </React.Suspense>
                  } />
                  <Route path="business-intelligence" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <BusinessIntelligencePage />
                    </React.Suspense>
                  } />
                  <Route path="smart-workflow" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SmartWorkflowPage />
                    </React.Suspense>
                  } />
                   <Route path="help" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Help />
                    </React.Suspense>
                  } />
                   <Route path="checklists-inteligentes" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <ChecklistsInteligentes />
                    </React.Suspense>
                  } />
                   <Route path="peotram" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <PEOTRAM />
                    </React.Suspense>
                  } />
                   <Route path="peo-dp" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <PEODP />
                    </React.Suspense>
                  } />
                   <Route path="sgso" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SGSO />
                    </React.Suspense>
                  } />
                   <Route path="templates" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Templates />
                    </React.Suspense>
                  } />
                  <Route path="system-overview" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SystemOverviewPage />
                    </React.Suspense>
                  } />
                  <Route path="enhanced-metrics" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <EnhancedMetrics />
                    </React.Suspense>
                  } />
                  <Route path="performance-optimizer" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <PerformanceOptimizerPage />
                    </React.Suspense>
                  } />
                  <Route path="ai-insights" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <AIInsights />
                    </React.Suspense>
                  } />
                  <Route path="testing" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <TestingDashboard />
                    </React.Suspense>
                  } />
                  <Route path="feedback" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <FeedbackPage />
                    </React.Suspense>
                  } />
                  <Route path="real-time-analytics" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <RealTimeAnalyticsPage />
                    </React.Suspense>
                  } />
                  <Route path="offline-sync" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <OfflineSyncPage />
                    </React.Suspense>
                  } />
                  <Route path="help-center" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <div className="container mx-auto p-6">
                        <IntelligentHelpCenter />
                      </div>
                    </React.Suspense>
                  } />
                  <Route path="knowledge-management" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <div className="container mx-auto p-6">
                        <KnowledgeManagement />
                      </div>
                    </React.Suspense>
                  } />
                  <Route path="fleet-management" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <FleetManagement />
                    </React.Suspense>
                  } />
                  <Route path="fleet-dashboard" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <FleetDashboard />
                    </React.Suspense>
                  } />
                  <Route path="fleet-tracking" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <FleetTracking />
                    </React.Suspense>
                  } />
                   <Route path="crew-management" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <CrewManagement />
                    </React.Suspense>
                  } />
                   <Route path="crew-dossier" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <CrewDossier />
                    </React.Suspense>
                  } />
                  <Route path="maritime-certifications" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <MaritimeCertifications />
                    </React.Suspense>
                  } />
                  <Route path="maritime-checklists" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <MaritimeChecklists />
                    </React.Suspense>
                  } />
                  <Route path="automation" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <Automation />
                    </React.Suspense>
                  } />
                  <Route path="organization-settings" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <div className="container mx-auto p-6">
                        <OrganizationSettings />
                      </div>
                    </React.Suspense>
                  } />
                   <Route path="organization-setup" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <OrganizationSetup />
                    </React.Suspense>
                  } />
                  <Route path="super-admin" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SuperAdmin />
                    </React.Suspense>
                  } />
                  <Route path="saas-manager" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <SaaSManager />
                    </React.Suspense>
                  } />
                  <Route path="executive-dashboard" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <ExecutiveDashboard />
                    </React.Suspense>
                  } />
                   <Route path="intelligent-alerts" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <IntelligentAlerts />
                    </React.Suspense>
                  } />
                   <Route path="task-management" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <TaskManagement />
                    </React.Suspense>
                  } />
                   <Route path="document-management" element={
                    <React.Suspense fallback={<RouteLoader />}>
                      <DocumentManagement />
                    </React.Suspense>
                  } />
                   <Route path="advanced-documents" element={
                     <React.Suspense fallback={<RouteLoader />}>
                       <AdvancedDocuments />
                     </React.Suspense>
                   } />
                    <Route path="mobile-app" element={
                      <React.Suspense fallback={<RouteLoader />}>
                        <MobileApp />
                      </React.Suspense>
                    } />
                    <Route path="academy" element={
                      <React.Suspense fallback={<RouteLoader />}>
                        <Academy />
                      </React.Suspense>
                    } />
                    <Route path="marketplace" element={
                      <React.Suspense fallback={<RouteLoader />}>
                        <Marketplace />
                      </React.Suspense>
                    } />
                    <Route path="real-time-monitoring" element={
                      <React.Suspense fallback={<RouteLoader />}>
                        <RealTimeMonitoring />
                      </React.Suspense>
                    } />
                    <Route path="advanced-auth" element={
                      <React.Suspense fallback={<RouteLoader />}>
                        <AdvancedAuth />
                      </React.Suspense>
                    } />
                     <Route path="business-continuity" element={
                       <React.Suspense fallback={<RouteLoader />}>
                         <BusinessContinuityPlan />
                       </React.Suspense>
                     } />
                     <Route path="roadmap" element={
                       <React.Suspense fallback={<RouteLoader />}>
                         <ProductRoadmapPage />
                       </React.Suspense>
                     } />
                     <Route path="system-auditor" element={
                       <React.Suspense fallback={<RouteLoader />}>
                         <SystemAuditorPage />
                       </React.Suspense>
                     } />
                     <Route path="nautilus-one" element={
                       <React.Suspense fallback={<RouteLoader />}>
                         <NautilusOne />
                       </React.Suspense>
                     } />
                     <Route path="production-deploy" element={
                       <React.Suspense fallback={<RouteLoader />}>
                         <ProductionDeployPage />
                       </React.Suspense>
                     } />
                      <Route path="user-onboarding" element={
                        <React.Suspense fallback={<RouteLoader />}>
                          <UserOnboardingPage />
                        </React.Suspense>
                      } />
                      <Route path="strategic" element={
                        <React.Suspense fallback={<RouteLoader />}>
                          <Strategic />
                        </React.Suspense>
                      } />
                      <Route path="notification-center-page" element={
                        <React.Suspense fallback={<RouteLoader />}>
                          <NotificationCenterPage />
                        </React.Suspense>
                      } />
                      <Route path="system-monitor-page" element={
                        <React.Suspense fallback={<RouteLoader />}>
                          <SystemMonitorPage />
                        </React.Suspense>
                      } />
                      <Route path="advanced-settings-page" element={
                        <React.Suspense fallback={<RouteLoader />}>
                          <AdvancedSettingsPage />
                        </React.Suspense>
                       } />
                      <Route path="system-validation" element={
                        <React.Suspense fallback={<RouteLoader />}>
                          <SystemValidation />
                        </React.Suspense>
                      } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
              <Toaster />
              <Sonner />
            </TooltipProvider>
            </TenantProvider>
          </OrganizationProvider>
        </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryWrapper>
  );
};

export default App;
