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
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import EnterpriseLayout from "./components/layout/enterprise-layout";
import PriceAlerts from "./pages/PriceAlerts";
import Reports from "./pages/Reports";
import Reservations from "./pages/Reservations";
import ChecklistsInteligentes from "./pages/ChecklistsInteligentes";
import PEOTRAM from "./pages/PEOTRAM";
import Settings from "./pages/Settings";
import Travel from "./pages/Travel";
import Analytics from "./pages/Analytics";
import HumanResources from "./pages/HumanResources";
import Communication from "./pages/Communication";
import Intelligence from "./pages/Intelligence";
import Maritime from "./pages/Maritime";
import Innovation from "./pages/Innovation";
import Optimization from "./pages/Optimization";
import Collaboration from "./pages/Collaboration";
import Voice from "./pages/Voice";
import Portal from "./pages/Portal";
import AR from "./pages/AR";
import IoT from "./pages/IoT";
import Blockchain from "./pages/Blockchain";
import Gamification from "./pages/Gamification";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/protected-route";
import WorkflowPage from "./pages/Workflow";
import { WorkflowAutomationHub } from "./components/automation/workflow-automation-hub";
import { AdvancedDocumentCenter } from "./components/documents/advanced-document-center";
import { MobileOptimizationCenter } from "./components/mobile/mobile-optimization-center";
import AdvancedReports from "./pages/AdvancedReports";
import Executive from "./pages/Executive";
import SystemMonitor from "./pages/SystemMonitor";
import NotificationCenter from "./pages/NotificationCenter";
import IntegrationsHub from "./components/integration/integrations-hub";
import BackupAudit from "./pages/BackupAudit";
import SecurityPage from "./pages/Security";
import UsersPage from "./pages/Users";
import CollaborationPage from "./pages/Collaboration";
import MobileOptimizationPage from "./pages/MobileOptimization";
import AdvancedAnalyticsPage from "./pages/AdvancedAnalytics";
import AdvancedSystemMonitorPage from "./pages/AdvancedSystemMonitor";
import IntelligentDocumentsPage from "./pages/IntelligentDocuments";
import AIAssistantPage from "./pages/AIAssistant";
import BusinessIntelligencePage from "./pages/BusinessIntelligence";
import SmartWorkflowPage from "./pages/SmartWorkflow";
import Help from "./pages/Help";
import Templates from "./pages/Templates";
import SystemOverviewPage from "./pages/SystemOverview";
import EnhancedMetrics from "./pages/EnhancedMetrics";
import PerformanceOptimizerPage from "./pages/PerformanceOptimizer";
import OptimizationGeneral from "./pages/OptimizationGeneral";
import AIInsights from "./pages/AIInsights";
import TestingDashboard from "./pages/TestingDashboard";
import FeedbackPage from "./pages/Feedback";
import RealTimeAnalyticsPage from "./pages/RealTimeAnalytics";
import OfflineSyncPage from "./pages/OfflineSync";
import IntelligentHelpCenter from "@/components/help/intelligent-help-center";
import KnowledgeManagement from "@/components/admin/knowledge-management";
import FleetManagement from "./pages/FleetManagement";
import CrewManagement from "./pages/CrewManagement";
import CrewDossier from "./pages/CrewDossier";
import MaritimeCertifications from "./pages/MaritimeCertifications";
import MaritimeChecklists from "./pages/MaritimeChecklists";
import OrganizationSettings from "./pages/OrganizationSettings";
import OrganizationSetup from "./pages/OrganizationSetup";
import SuperAdmin from "./pages/SuperAdmin";
import TaskManagement from "./pages/TaskManagement";
import DocumentManagement from "./pages/DocumentManagement";
import FleetDashboard from "./pages/FleetDashboard";
import FleetTracking from "./pages/FleetTracking";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import IntelligentAlerts from "./pages/IntelligentAlerts";
import Automation from "./pages/Automation";
import DropdownTests from "./pages/DropdownTests";
import SystemValidation from "./pages/SystemValidation";

// Lazy load the new advanced pages
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
const SpecializedModules = React.lazy(() => import("./pages/SpecializedModules"));

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
                  <Route path="admin" element={<Admin />} />
                  <Route path="price-alerts" element={<PriceAlerts />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="travel" element={<Travel />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="hr" element={<HumanResources />} />
                  <Route path="reservations" element={<Reservations />} />
                  <Route path="maritime" element={<Maritime />} />
                  <Route path="communication" element={<Communication />} />
                  <Route path="intelligence" element={<Intelligence />} />
                  <Route path="optimization" element={<Optimization />} />
                  <Route path="optimization-general" element={<OptimizationGeneral />} />
                  <Route path="innovation" element={<Innovation />} />
                  <Route path="collaboration" element={<Collaboration />} />
                  <Route path="voice" element={<Voice />} />
                  <Route path="portal" element={<Portal />} />
                  <Route path="ar" element={<AR />} />
                  <Route path="iot" element={<IoT />} />
                  <Route path="blockchain" element={<Blockchain />} />
                  <Route path="gamification" element={<Gamification />} />
                  <Route path="predictive-analytics" element={<PredictiveAnalytics />} />
                  <Route path="workflow" element={<WorkflowPage />} />
                  <Route path="documents" element={
                    <div className="container mx-auto p-6">
                      <AdvancedDocumentCenter />
                    </div>
                  } />
                  <Route path="mobile-optimization" element={<MobileOptimizationPage />} />
                  <Route path="advanced-reports" element={<AdvancedReports />} />
                  <Route path="executive" element={<Executive />} />
                  <Route path="system-monitor" element={<SystemMonitor />} />
                  <Route path="notification-center" element={<NotificationCenter />} />
                  <Route path="integrations" element={
                    <div className="container mx-auto p-6">
                      <IntegrationsHub />
                    </div>
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
                    <div className="container mx-auto p-6">
                      <IntelligentHelpCenter />
                    </div>
                  } />
                  <Route path="knowledge-management" element={
                    <div className="container mx-auto p-6">
                      <KnowledgeManagement />
                    </div>
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
                    <div className="container mx-auto p-6">
                      <OrganizationSettings />
                    </div>
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
                      <Route path="specialized-modules" element={
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64">Carregando...</div>}>
                          <SpecializedModules />
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
