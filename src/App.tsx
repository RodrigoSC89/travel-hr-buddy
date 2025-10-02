import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { RouteLoading } from "@/components/ui/route-loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/components/layout/theme-provider";
// Core pages - eagerly loaded
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EnterpriseLayout from "./components/layout/enterprise-layout";
import ProtectedRoute from "./components/auth/protected-route";
import NotFound from "./pages/NotFound";

// Lazy load all other pages for better code splitting
const Admin = React.lazy(() => import("./pages/Admin"));
const PriceAlerts = React.lazy(() => import("./pages/PriceAlerts"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Reservations = React.lazy(() => import("./pages/Reservations"));
const ChecklistsInteligentes = React.lazy(() => import("./pages/ChecklistsInteligentes"));
const PEOTRAM = React.lazy(() => import("./pages/PEOTRAM"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Travel = React.lazy(() => import("./pages/Travel"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const HumanResources = React.lazy(() => import("./pages/HumanResources"));
const Communication = React.lazy(() => import("./pages/Communication"));
const Intelligence = React.lazy(() => import("./pages/Intelligence"));
const Maritime = React.lazy(() => import("./pages/Maritime"));
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
const SystemValidation = React.lazy(() => import("./pages/SystemValidation"));

// Lazy load components used in routes
const WorkflowAutomationHub = React.lazy(() => import("./components/automation/workflow-automation-hub").then(m => ({ default: m.WorkflowAutomationHub })));
const AdvancedDocumentCenter = React.lazy(() => import("./components/documents/advanced-document-center").then(m => ({ default: m.AdvancedDocumentCenter })));
const IntegrationsHub = React.lazy(() => import("./components/integration/integrations-hub").then(m => ({ default: m.default })));
const IntelligentHelpCenter = React.lazy(() => import("@/components/help/intelligent-help-center").then(m => ({ default: m.default })));
const KnowledgeManagement = React.lazy(() => import("@/components/admin/knowledge-management").then(m => ({ default: m.default })));

// Advanced pages already lazy
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

const queryClient = new QueryClient();

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
                <Route path="/" element={
                  <ProtectedRoute>
                    <EnterpriseLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="admin" element={<Suspense fallback={<RouteLoading />}><Admin /></Suspense>} />
                  <Route path="price-alerts" element={<Suspense fallback={<RouteLoading />}><PriceAlerts /></Suspense>} />
                  <Route path="reports" element={<Suspense fallback={<RouteLoading />}><Reports /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<RouteLoading />}><Settings /></Suspense>} />
                  <Route path="travel" element={<Suspense fallback={<RouteLoading />}><Travel /></Suspense>} />
                  <Route path="analytics" element={<Suspense fallback={<RouteLoading />}><Analytics /></Suspense>} />
                  <Route path="hr" element={<Suspense fallback={<RouteLoading />}><HumanResources /></Suspense>} />
                  <Route path="reservations" element={<Suspense fallback={<RouteLoading />}><Reservations /></Suspense>} />
                  <Route path="maritime" element={<Suspense fallback={<RouteLoading />}><Maritime /></Suspense>} />
                  <Route path="communication" element={<Suspense fallback={<RouteLoading />}><Communication /></Suspense>} />
                  <Route path="intelligence" element={<Suspense fallback={<RouteLoading />}><Intelligence /></Suspense>} />
                  <Route path="optimization" element={<Suspense fallback={<RouteLoading />}><Optimization /></Suspense>} />
                  <Route path="optimization-general" element={<Suspense fallback={<RouteLoading />}><OptimizationGeneral /></Suspense>} />
                  <Route path="innovation" element={<Suspense fallback={<RouteLoading />}><Innovation /></Suspense>} />
                  <Route path="collaboration" element={<Suspense fallback={<RouteLoading />}><Collaboration /></Suspense>} />
                  <Route path="voice" element={<Suspense fallback={<RouteLoading />}><Voice /></Suspense>} />
                  <Route path="portal" element={<Suspense fallback={<RouteLoading />}><Portal /></Suspense>} />
                  <Route path="ar" element={<Suspense fallback={<RouteLoading />}><AR /></Suspense>} />
                  <Route path="iot" element={<Suspense fallback={<RouteLoading />}><IoT /></Suspense>} />
                  <Route path="blockchain" element={<Suspense fallback={<RouteLoading />}><Blockchain /></Suspense>} />
                  <Route path="gamification" element={<Suspense fallback={<RouteLoading />}><Gamification /></Suspense>} />
                  <Route path="predictive-analytics" element={<Suspense fallback={<RouteLoading />}><PredictiveAnalytics /></Suspense>} />
                  <Route path="workflow" element={
                    <Suspense fallback={<RouteLoading />}>
                      <WorkflowPage />
                    </Suspense>
                  } />
                  <Route path="documents" element={
                    <Suspense fallback={<RouteLoading />}>
                      <div className="container mx-auto p-6">
                        <AdvancedDocumentCenter />
                      </div>
                    </Suspense>
                  } />
                  <Route path="mobile-optimization" element={<MobileOptimizationPage />} />
                  <Route path="advanced-reports" element={<AdvancedReports />} />
                  <Route path="executive" element={<Executive />} />
                  <Route path="system-monitor" element={<SystemMonitor />} />
                  <Route path="notification-center" element={<NotificationCenter />} />
                  <Route path="integrations" element={
                    <Suspense fallback={<RouteLoading />}>
                      <div className="container mx-auto p-6">
                        <IntegrationsHub />
                      </div>
                    </Suspense>
                  } />
                  <Route path="backup-audit" element={<BackupAudit />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="collaboration" element={<CollaborationPage />} />
                  <Route path="advanced-analytics" element={<AdvancedAnalyticsPage />} />
                  <Route path="advanced-system-monitor" element={<AdvancedSystemMonitorPage />} />
                  <Route path="intelligent-documents" element={<IntelligentDocumentsPage />} />
                  <Route path="ai-assistant" element={<AIAssistantPage />} />
                  <Route path="business-intelligence" element={<BusinessIntelligencePage />} />
                  <Route path="smart-workflow" element={<SmartWorkflowPage />} />
                   <Route path="help" element={<Help />} />
                   <Route path="checklists-inteligentes" element={<ChecklistsInteligentes />} />
                   <Route path="peotram" element={<PEOTRAM />} />
                   <Route path="templates" element={<Templates />} />
                  <Route path="system-overview" element={<SystemOverviewPage />} />
                  <Route path="enhanced-metrics" element={<EnhancedMetrics />} />
                  <Route path="performance-optimizer" element={<PerformanceOptimizerPage />} />
                  <Route path="ai-insights" element={<AIInsights />} />
                  <Route path="testing" element={<TestingDashboard />} />
                  <Route path="feedback" element={<FeedbackPage />} />
                  <Route path="real-time-analytics" element={<RealTimeAnalyticsPage />} />
                  <Route path="offline-sync" element={<OfflineSyncPage />} />
                  <Route path="help-center" element={
                    <Suspense fallback={<RouteLoading />}>
                      <div className="container mx-auto p-6">
                        <IntelligentHelpCenter />
                      </div>
                    </Suspense>
                  } />
                  <Route path="knowledge-management" element={
                    <Suspense fallback={<RouteLoading />}>
                      <div className="container mx-auto p-6">
                        <KnowledgeManagement />
                      </div>
                    </Suspense>
                  } />
                  <Route path="fleet-management" element={<FleetManagement />} />
                  <Route path="fleet-dashboard" element={<FleetDashboard />} />
                  <Route path="fleet-tracking" element={<FleetTracking />} />
                   <Route path="crew-management" element={<CrewManagement />} />
                   <Route path="crew-dossier" element={<CrewDossier />} />
                  <Route path="maritime-certifications" element={<MaritimeCertifications />} />
                  <Route path="maritime-checklists" element={<MaritimeChecklists />} />
                  <Route path="automation" element={<Automation />} />
                  <Route path="organization-settings" element={
                    <Suspense fallback={<RouteLoading />}>
                      <div className="container mx-auto p-6">
                        <OrganizationSettings />
                      </div>
                    </Suspense>
                  } />
                   <Route path="organization-setup" element={<OrganizationSetup />} />
                  <Route path="super-admin" element={<SuperAdmin />} />
                  <Route path="saas-manager" element={<SaaSManager />} />
                  <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
                   <Route path="intelligent-alerts" element={<IntelligentAlerts />} />
                   <Route path="task-management" element={<TaskManagement />} />
                   <Route path="document-management" element={<DocumentManagement />} />
                   <Route path="advanced-documents" element={
                     <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                       <AdvancedDocuments />
                     </React.Suspense>
                   } />
                    <Route path="mobile-app" element={
                      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                        <MobileApp />
                      </React.Suspense>
                    } />
                    <Route path="academy" element={
                      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                        <Academy />
                      </React.Suspense>
                    } />
                    <Route path="marketplace" element={
                      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                        <Marketplace />
                      </React.Suspense>
                    } />
                    <Route path="real-time-monitoring" element={
                      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                        <RealTimeMonitoring />
                      </React.Suspense>
                    } />
                    <Route path="advanced-auth" element={
                      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                        <AdvancedAuth />
                      </React.Suspense>
                    } />
                     <Route path="business-continuity" element={
                       <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                         <BusinessContinuityPlan />
                       </React.Suspense>
                     } />
                     <Route path="roadmap" element={
                       <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                         <ProductRoadmapPage />
                       </React.Suspense>
                     } />
                     <Route path="system-auditor" element={
                       <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                         <SystemAuditorPage />
                       </React.Suspense>
                     } />
                     <Route path="production-deploy" element={
                       <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                         <ProductionDeployPage />
                       </React.Suspense>
                     } />
                      <Route path="user-onboarding" element={
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                          <UserOnboardingPage />
                        </React.Suspense>
                      } />
                      <Route path="strategic" element={
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                          <Strategic />
                        </React.Suspense>
                      } />
                      <Route path="notification-center-page" element={
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                          <NotificationCenterPage />
                        </React.Suspense>
                      } />
                      <Route path="system-monitor-page" element={
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                          <SystemMonitorPage />
                        </React.Suspense>
                      } />
                      <Route path="advanced-settings-page" element={
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                          <AdvancedSettingsPage />
                        </React.Suspense>
                       } />
                      <Route path="system-validation" element={<SystemValidation />} />
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
