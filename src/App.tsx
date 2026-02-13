/**
 * App.tsx - Versão Limpa com Mega-Hubs + Rotas Essenciais
 * PATCH: Dead code cleanup - removed 100+ orphaned pages
 */
import * as React from "react";
import { Suspense, lazy, useEffect } from "react";
import { LazyLoadErrorBoundary } from "@/components/error/LazyLoadErrorBoundary";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/layout/app-sidebar";
import { ThemeProvider } from "./components/layout/theme-provider";
import { Header } from "./components/layout/header";
import { MobileBottomNav } from "./components/layout/mobile-bottom-nav";
import { ProductOnboardingTour } from "./components/onboarding/ProductOnboardingTour";
import { logger } from "@/lib/logger";
import { ShipLoader } from "@/components/ui/ship-loader";

// ============================================
// GLOBAL ERROR HANDLERS - Prevent white screens
// ============================================
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const ignorableErrors = ['ResizeObserver', 'Script error', 'Non-Error promise rejection', 'Loading chunk', 'ChunkLoadError'];
    const shouldIgnore = ignorableErrors.some(e => message.includes(e));
    if (!shouldIgnore) {
      logger.error('[App] Unhandled rejection:', { message });
      toast.error('Ocorreu um erro inesperado', { description: 'A operação será tentada novamente automaticamente.', duration: 3000 });
    }
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    const message = event.message || 'Unknown error';
    if (message.includes('Loading chunk') || message.includes('dynamically imported')) return;
    logger.error('[App] Global error:', { message, filename: event.filename });
  });
}

// ============================================
// LAZY LOAD - PÁGINAS PRINCIPAIS
// ============================================
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const CentralComando = lazy(() => import("@/pages/CentralComando"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DevRoutesDashboard = lazy(() => import("@/pages/DevRoutesDashboard"));
const Billing = lazy(() => import("@/pages/Settings"));
const BillingPortal = lazy(() => import("@/pages/Settings"));
const OnboardingDashboard = lazy(() => import("@/pages/OnboardingDashboard"));
const InteractiveOnboarding = lazy(() => import("@/pages/InteractiveOnboarding"));
const AnalyticsFeedback = lazy(() => import("@/pages/AnalyticsFeedback"));

// Central de Comando extras
const NOC = lazy(() => import("@/pages/NOC"));
const HealthMonitor = lazy(() => import("@/pages/HealthMonitor"));

// ============================================
// OPERAÇÕES MARÍTIMAS
// ============================================
const MaritimeCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
const FleetCommandCenter = lazy(() => import("@/pages/FleetCommandCenter"));
const VoyageCommandCenter = lazy(() => import("@/pages/VoyageCommandCenter"));
const MissionCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
const BridgeLink = lazy(() => import("@/pages/MaritimeCommandCenter"));

// Digital Twin & Advanced
const DigitalTwinPage = lazy(() => import("@/pages/DigitalTwinPage"));
const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
const AgentOrchestrationPage = lazy(() => import("@/pages/AgentOrchestrationPage"));
const BlockchainCompliancePage = lazy(() => import("@/pages/BlockchainCompliancePage"));
const CompanyFinancialPage = lazy(() => import("@/pages/CompanyFinancialPage"));

// Módulos Completos
const MedicalInfirmary = lazy(() => import("@/modules/medical-infirmary"));
const EnhancedWasteManagement = lazy(() => import("@/pages/ESGEmissionsPremium"));
const CentralComandoAprimorada = lazy(() => import("@/pages/dashboard/CentralComandoAprimorada"));
const MedicalInfirmaryEnhanced = lazy(() => import("@/pages/MedicalInfirmaryEnhanced"));
const SatcomDashboardEnhanced = lazy(() => import("@/pages/SatcomDashboardEnhanced"));

// ============================================
// MANUTENÇÃO
// ============================================
const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));
const FuelManagementPage = lazy(() => import("@/pages/FuelManagementPage"));

// ============================================
// OPERAÇÕES SUBMARINAS
// ============================================
const OceanSonar = lazy(() => import("@/pages/OceanSonar"));
const UnderwaterDrone = lazy(() => import("@/pages/UnderwaterDrone"));
const AutoSub = lazy(() => import("@/pages/AutoSub"));
const SonarAI = lazy(() => import("@/pages/SonarAI"));
const DeepRiskAI = lazy(() => import("@/pages/DeepRiskAI"));

// ============================================
// IA & AUTOMAÇÃO
// ============================================
const NautilusCommand = lazy(() => import("@/pages/AIHubPage"));
const AICommandCenter = lazy(() => import("@/pages/AIHubPage"));
const AIHubPage = lazy(() => import("@/pages/AIHubPage"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const RevolutionaryFeaturesPage = lazy(() => import("@/pages/AIHubPage"));
const AIObservabilityDashboard = lazy(() => import("@/pages/AIObservabilityDashboard"));
const WorkflowCommandCenter = lazy(() => import("@/pages/WorkflowCommandCenter"));
const AIAudit = lazy(() => import("@/pages/AIAudit"));
const VoiceAssistant = lazy(() => import("@/pages/VoiceAssistant"));
const VoiceAssistantAIPage = lazy(() => import("@/pages/VoiceAssistantAIPage"));
const PortugueseVoiceAssistantPage = lazy(() => import("@/pages/PortugueseVoiceAssistantPage"));
const AIOperationsCenter = lazy(() => import("@/pages/AIHubPage"));
const QualityDashboard = lazy(() => import("@/pages/QualityDashboard"));
const AgentChat = lazy(() => import("@/pages/AIAgents/AgentChat"));

// ============================================
// INTELIGÊNCIA AVANÇADA
// ============================================
const Optimization = lazy(() => import("@/pages/Optimization"));
const UnifiedOptimizationPage = lazy(() => import("@/pages/UnifiedOptimizationPage"));

// ============================================
// TELEMETRIA & MONITORAMENTO
// ============================================
const TelemetriaCommand = lazy(() => import("@/pages/TelemetriaCommand"));
const PredictiveTelemetry = lazy(() => import("@/pages/PredictiveTelemetry"));
const SatelliteOptimizerPage = lazy(() => import("@/pages/SatelliteOptimizerPage"));
const VesselTrackingPage = lazy(() => import("@/pages/VesselTrackingPage"));
const IncidentSimulator = lazy(() => import("@/pages/IncidentSimulator"));
const CalendarView = lazy(() => import("@/pages/CalendarView"));

// ============================================
// APIs & INTEGRAÇÕES
// ============================================
const APICenter = lazy(() => import("@/pages/APICenter"));
const APIMonitor = lazy(() => import("@/pages/APIMonitor"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const WeatherMaritime = lazy(() => import("@/pages/WeatherMaritime"));
const AISTrackerPage = lazy(() => import("@/pages/AISTrackerPage"));
const PortAPI = lazy(() => import("@/pages/PortAPI"));
const FlightTracker = lazy(() => import("@/pages/FlightTracker"));
const NOAAWeather = lazy(() => import("@/pages/NOAAWeather"));
const OpenSkyFlights = lazy(() => import("@/pages/OpenSkyFlights"));
const EarthquakeMonitor = lazy(() => import("@/pages/EarthquakeMonitor"));
const VoiceTranscriber = lazy(() => import("@/pages/VoiceTranscriber"));

// ============================================
// RELATÓRIOS & DOCUMENTOS
// ============================================
const ReportsCommandCenter = lazy(() => import("@/pages/ReportsCommandCenter"));
const Documents = lazy(() => import("@/pages/Documents"));
const Templates = lazy(() => import("@/pages/Templates"));
const DocumentWorkflow = lazy(() => import("@/pages/DocumentWorkflow"));
const ExportCenterPage = lazy(() => import("@/pages/ExportCenterPage"));
const KnowledgeHubPage = lazy(() => import("@/pages/Documents"));

// ============================================
// AUDITORIAS & COMPLIANCE
// ============================================
const PEODP = lazy(() => import("@/pages/PEODP"));
const SGSO = lazy(() => import("@/pages/SGSO"));
const SGSOReportPage = lazy(() => import("@/pages/SGSOReportPage"));
const PreOVIDInspection = lazy(() => import("@/pages/PreOVIDInspection"));
const MLCInspection = lazy(() => import("@/pages/MLCInspection"));
const PSCPackage = lazy(() => import("@/pages/PSCPackage"));
const ExecutiveCompliancePage = lazy(() => import("@/pages/ExecutiveCompliancePage"));
const SecurityCenter = lazy(() => import("@/pages/SecurityCenter"));
const SecurityAuditCenter = lazy(() => import("@/pages/SecurityAuditCenter"));
const SecurityScanner = lazy(() => import("@/pages/SecurityScanner"));
const AuditAIChatPage = lazy(() => import("@/pages/AuditAIChatPage"));
const ComplianceRoadmapPage = lazy(() => import("@/pages/ComplianceRoadmapPage"));
const PreSIREInspection = lazy(() => import("@/pages/PreSIREInspection"));
const TMSAAssessment = lazy(() => import("@/pages/TMSAAssessment"));
const SOLASInspection = lazy(() => import("@/pages/SOLASInspection"));
const WhistleblowerV2 = lazy(() => import("@/pages/SecurityCenter"));

// Diagnostic Components Pages
const DiagnosticCertificatesPage = lazy(() => import("@/pages/DiagnosticCertificatesPage"));
const DiagnosticDashboardPage = lazy(() => import("@/pages/DiagnosticDashboardPage"));
const DiagnosticDocumentsPage = lazy(() => import("@/pages/DiagnosticDocumentsPage"));
const DiagnosticNCsPage = lazy(() => import("@/pages/DiagnosticNCsPage"));
const DiagnosticReportsPage = lazy(() => import("@/pages/DiagnosticReportsPage"));

// ============================================
// RH & PESSOAS
// ============================================
const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));
const Users = lazy(() => import("@/pages/Users"));
const HRDashboardPage = lazy(() => import("@/pages/HRDashboardPage"));
const EmployeePortalPage = lazy(() => import("@/pages/EmployeePortalPage"));
const PeopleAnalyticsPage = lazy(() => import("@/pages/PeopleAnalyticsPage"));
const Payroll = lazy(() => import("@/pages/Payroll"));
const TimeTracking = lazy(() => import("@/pages/TimeTracking"));
const HRChatbotPage = lazy(() => import("@/pages/HRChatbotPage"));
const HRDocumentOCRPage = lazy(() => import("@/pages/HRDocumentOCRPage"));
const HRTurnoverPredictionPage = lazy(() => import("@/pages/HRTurnoverPredictionPage"));

// ============================================
// TREINAMENTOS
// ============================================
const AITraining = lazy(() => import("@/pages/AITraining"));
const DPIntelligence = lazy(() => import("@/pages/AITraining"));

// ============================================
// FINANÇAS & PROCUREMENT
// ============================================
const VoyageAccountingPage = lazy(() => import("@/pages/VoyageAccountingPage"));
const VoyagePnLPage = lazy(() => import("@/pages/VoyagePnLPage"));
const CrewSchedulerPage = lazy(() => import("@/pages/CrewSchedulerPage"));
const AnalyticsCommandCenter = lazy(() => import("@/pages/AnalyticsCommandCenter"));
const OperationsCommandCenter = lazy(() => import("@/pages/OperationsCommandCenter"));
const FinanceProcurementAIPage = lazy(() => import("@/pages/FinanceProcurementAIPage"));

// ============================================
// ESG & SUSTENTABILIDADE
// ============================================
const SustainabilityScorePage = lazy(() => import("@/pages/SustainabilityScorePage"));
const ESGEmissionsPage = lazy(() => import("@/pages/ESGEmissionsPremium"));

// ============================================
// STCW/MLC
// ============================================
const STCWMLCCompliance = lazy(() => import("@/pages/STCWMLCCompliance"));
const SOLASISPSTrainingPage = lazy(() => import("@/pages/SOLASISPSTrainingPage"));

// ============================================
// SISTEMA & CONFIGURAÇÕES
// ============================================
const Settings = lazy(() => import("@/pages/Settings"));
const IntegrationsCenter = lazy(() => import("@/pages/IntegrationsCenter"));
const APIGateway = lazy(() => import("@/pages/IntegrationsCenter"));
const Collaboration = lazy(() => import("@/pages/Collaboration"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const StatusPage = lazy(() => import("@/pages/StatusPage"));
const DemoPage = lazy(() => import("@/pages/DemoPage"));
const SecuritySettings = lazy(() => import("@/pages/settings/Security"));

// ============================================
// AI MODULES HUB - All 11 AI Modules
// ============================================
const AIModulesHubPage = lazy(() => import("@/pages/ai/AIModulesHubPage"));
const VoyageLogisticsAIPage = lazy(() => import("@/pages/ai/VoyageLogisticsAIPage"));
const SafetyIncidentAIPage = lazy(() => import("@/pages/ai/SafetyIncidentAIPage"));
const InventorySparesAIPage = lazy(() => import("@/pages/ai/InventorySparesAIPage"));
const ComplianceAIPage = lazy(() => import("@/pages/ai/ComplianceAIPage"));
const EnvironmentalAIPage = lazy(() => import("@/pages/ai/EnvironmentalAIPage"));
const QualityManagementAIPage = lazy(() => import("@/pages/ai/QualityManagementAIPage"));
const ContractLegalAIPage = lazy(() => import("@/pages/ai/ContractLegalAIPage"));
const InsuranceClaimsAIPage = lazy(() => import("@/pages/ai/InsuranceClaimsAIPage"));
const CrewingPayrollAIPage = lazy(() => import("@/pages/ai/CrewingPayrollAIPage"));
const ReportingAnalyticsAIPage = lazy(() => import("@/pages/ai/ReportingAnalyticsAIPage"));
const MobileOfflineAIPage = lazy(() => import("@/pages/ai/MobileOfflineAIPage"));

// ============================================
// ENTERPRISE INTELLIGENCE SUITE
// ============================================
const RAGAssistantPage = lazy(() => import("@/pages/enterprise/RAGAssistantPage"));
const OCRCenterPage = lazy(() => import("@/pages/enterprise/OCRCenterPage"));
const FormsBuilderPage = lazy(() => import("@/pages/enterprise/FormsBuilderPage"));
const ChecklistsBuilderPage = lazy(() => import("@/pages/enterprise/ChecklistsBuilderPage"));
const OCIMFAssessmentPage = lazy(() => import("@/pages/enterprise/OCIMFAssessmentPage"));
const TMSAAnalyticsPage = lazy(() => import("@/pages/enterprise/TMSAAnalyticsPage"));
const FatigueRiskPage = lazy(() => import("@/pages/enterprise/FatigueRiskPage"));
const MLCWorkHoursPage = lazy(() => import("@/pages/enterprise/MLCWorkHoursPage"));
const CrewMatchingPage = lazy(() => import("@/pages/enterprise/CrewMatchingPage"));
const ContractAnalysisPage = lazy(() => import("@/pages/enterprise/ContractAnalysisPage"));
const RiskClausesPage = lazy(() => import("@/pages/enterprise/RiskClausesPage"));
const NCPredictionPage = lazy(() => import("@/pages/enterprise/NCPredictionPage"));
const CompliancePredictorPage = lazy(() => import("@/pages/enterprise/CompliancePredictorPage"));

// Audit Agents Hub
const AuditAgentsPage = lazy(() => import("@/pages/AuditAgentsPage"));
const AgentsDashboard = lazy(() => import("@/pages/audit-agents/AgentsDashboard"));
const AgentDetailPage = lazy(() => import("@/pages/audit-agents/AgentDetailPage"));

// ============================================
// ADVANCED MARITIME MODULES
// ============================================
const DigitalTwin3DPage = lazy(() => import("@/pages/advanced/DigitalTwin3DPage"));
const WeatherIntelligencePage = lazy(() => import("@/pages/advanced/WeatherIntelligencePage"));
const BunkerOptimizationPage = lazy(() => import("@/pages/advanced/BunkerOptimizationPage"));
const CargoPlanningPage = lazy(() => import("@/pages/advanced/CargoPlanningPage"));
const PSCReadinessPage = lazy(() => import("@/pages/advanced/PSCReadinessPage"));
const MARPOLTrackerPage = lazy(() => import("@/pages/advanced/MARPOLTrackerPage"));
const BlockchainCertificatesPage = lazy(() => import("@/pages/advanced/BlockchainCertificatesPage"));
const IncidentInvestigationPage = lazy(() => import("@/pages/advanced/IncidentInvestigationPage"));
const VRTrainingPage = lazy(() => import("@/pages/advanced/VRTrainingPage"));
const VoiceCommandsPage = lazy(() => import("@/pages/advanced/VoiceCommandsPage"));
const CrewWellnessAIAdvancedPage = lazy(() => import("@/pages/advanced/CrewWellnessAIPage"));
const ExecutiveDashboardAdvancedPage = lazy(() => import("@/pages/advanced/ExecutiveDashboardPage"));

// SYSTEM & QA
const InteractivityScoreboard = lazy(() => import("@/pages/System/InteractivityScoreboard"));

// ============================================
// 7 MEGA-HUBS CANÔNICOS - v8.0 MEGA-FUSION
// ============================================
const CommandMegaHub = lazy(() => import("@/pages/mega-hubs/CommandMegaHub"));
const OpsMegaHub = lazy(() => import("@/pages/mega-hubs/OpsMegaHub"));
const MaintenanceMegaHub = lazy(() => import("@/pages/mega-hubs/MaintenanceMegaHub"));
const AIMegaHub = lazy(() => import("@/pages/mega-hubs/AIMegaHub"));
const TrackingMegaHub = lazy(() => import("@/pages/mega-hubs/TrackingMegaHub"));
const ComplianceMegaHub = lazy(() => import("@/pages/mega-hubs/ComplianceMegaHub"));
const WorkbenchMegaHub = lazy(() => import("@/pages/mega-hubs/WorkbenchMegaHub"));

// ============================================
// ADMIN & DASHBOARDS
// ============================================
const Admin = lazy(() => import("@/pages/Admin"));
const AdminDocumentList = lazy(() => import("@/pages/admin/documents/DocumentList"));
const AdminDocumentsAI = lazy(() => import("@/pages/admin/documents-ai"));
const AdminDocumentView = lazy(() => import("@/pages/admin/documents/DocumentView"));
const AdminDocumentHistory = lazy(() => import("@/pages/admin/documents/DocumentHistory"));
const AdminDocumentEditorDemo = lazy(() => import("@/pages/admin/documents/DocumentEditorDemo"));
const AdminAIEditor = lazy(() => import("@/pages/admin/documents/ai-editor"));
const AdminAITemplates = lazy(() => import("@/pages/admin/documents/ai-templates"));
const AdminCollaborativeEditor = lazy(() => import("@/pages/admin/documents/CollaborativeEditor"));
const AdminTemplates = lazy(() => import("@/pages/admin/templates"));
const AdminTemplateEdit = lazy(() => import("@/pages/admin/templates/edit/[id]"));
const AdminSGSO = lazy(() => import("@/pages/admin/sgso"));
const AdminSGSOHistory = lazy(() => import("@/pages/admin/sgso/history/[vesselId]"));
const AdminAssistant = lazy(() => import("@/pages/admin/assistant"));
const AdminAssistantLogs = lazy(() => import("@/pages/admin/assistant-logs"));
const AdminReportsAssistant = lazy(() => import("@/pages/admin/reports/assistant"));
const AdminReportsLogs = lazy(() => import("@/pages/admin/reports/logs"));
const AdminReportsRestoreAnalytics = lazy(() => import("@/pages/admin/reports/restore-analytics"));
const AdminCollaboration = lazy(() => import("@/pages/admin/collaboration"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminChecklistsDashboard = lazy(() => import("@/pages/admin/checklists-dashboard"));
const AdminApiTester = lazy(() => import("@/pages/admin/api-tester"));

// AIEnterpriseEnginesHub
const AIEnterpriseEnginesHub = lazy(() => import("@/pages/AIEnterpriseEnginesHub"));

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10,
    },
  },
});

const Loader = () => {
  const [showRetry, setShowRetry] = React.useState(false);
  
  React.useEffect(() => {
    const retryTimeout = setTimeout(() => setShowRetry(true), 15000);
    return () => clearTimeout(retryTimeout);
  }, []);
  
  const handleRetry = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch {}
    window.location.href = window.location.origin + '/?_sw=' + Date.now();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <ShipLoader size="lg" label="Carregando Nauti One..." />
        {showRetry && (
          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">O carregamento está demorando mais que o normal.</p>
            <button onClick={handleRetry} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
              Limpar cache e recarregar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthenticatedLayout = () => {
  const OfflineStatusBar = lazy(() => 
    import("@/components/offline/OfflineStatusBar").then(mod => ({ default: mod.OfflineStatusBar }))
  );
  const CommandPalette = lazy(() => import("@/components/shared/CommandPalette"));
  const GlobalAIAssistant = lazy(() => 
    import("@/components/ai/GlobalAIAssistant").then(mod => ({ default: mod.GlobalAIAssistant }))
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 overflow-auto px-3 pb-20 md:px-6 md:pb-6">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
        <ProductOnboardingTour />
        <Suspense fallback={null}><OfflineStatusBar position="bottom" showDetails={true} /></Suspense>
        <Suspense fallback={null}><CommandPalette /></Suspense>
        <Suspense fallback={null}><GlobalAIAssistant /></Suspense>
      </div>
    </SidebarProvider>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [showLoader, setShowLoader] = React.useState(false);
  
  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timeout = setTimeout(() => setShowLoader(true), 300);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  if (isLoading) {
    if (showLoader) return <Loader />;
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AdminRoute = lazy(() => import('@/components/auth/RoleGuard').then(mod => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <mod.RoleGuard requiredRoles={['admin']}>{children}</mod.RoleGuard>
  )
})));

const AppRoutes = () => (
<Routes>
    {/* Public Routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/pricing" element={<LandingPage />} />
    <Route path="/status" element={<StatusPage />} />
    <Route path="/demo" element={<DemoPage />} />
    
    {/* Authenticated Routes */}
    <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
      <Route path="/" element={<Navigate to="/command" replace />} />
      
      {/* 7 MEGA-HUBS */}
      <Route path="/command" element={<CommandMegaHub />} />
      <Route path="/command/*" element={<CommandMegaHub />} />
      <Route path="/ops" element={<OpsMegaHub />} />
      <Route path="/ops/*" element={<OpsMegaHub />} />
      <Route path="/maintenance" element={<MaintenanceMegaHub />} />
      <Route path="/maintenance/*" element={<MaintenanceMegaHub />} />
      <Route path="/ai" element={<AIMegaHub />} />
      <Route path="/ai/agents/:agentId" element={<AgentChat />} />
      <Route path="/ai/*" element={<AIMegaHub />} />
      <Route path="/tracking" element={<TrackingMegaHub />} />
      <Route path="/tracking/*" element={<TrackingMegaHub />} />
      <Route path="/compliance" element={<ComplianceMegaHub />} />
      <Route path="/compliance/*" element={<ComplianceMegaHub />} />
      <Route path="/workbench" element={<WorkbenchMegaHub />} />
      <Route path="/workbench/*" element={<WorkbenchMegaHub />} />
      
      <Route path="/billing" element={<Billing />} />
      <Route path="/billing-portal" element={<BillingPortal />} />
      <Route path="/planos" element={<Billing />} />
      <Route path="/onboarding" element={<OnboardingDashboard />} />
      <Route path="/onboarding-tour" element={<InteractiveOnboarding />} />
      <Route path="/welcome" element={<InteractiveOnboarding />} />
      <Route path="/analytics-feedback" element={<AnalyticsFeedback />} />
      <Route path="/feedback" element={<AnalyticsFeedback />} />
      
      {/* Central de Comando */}
      <Route path="/central-comando/*" element={<CentralComando />} />
      <Route path="/noc" element={<NOC />} />
      <Route path="/health-monitor" element={<HealthMonitor />} />
      
      {/* Operações Marítimas */}
      <Route path="/maritime-command" element={<MaritimeCommandCenter />} />
      <Route path="/fleet-command" element={<FleetCommandCenter />} />
      <Route path="/voyage-command" element={<VoyageCommandCenter />} />
      <Route path="/mission-command" element={<MissionCommandCenter />} />
      <Route path="/bridge-link" element={<BridgeLink />} />
      <Route path="/digital-twin" element={<DigitalTwinPage />} />
      <Route path="/recruitment" element={<RecruitmentPage />} />
      <Route path="/agent-orchestration" element={<AgentOrchestrationPage />} />
      <Route path="/blockchain-compliance" element={<BlockchainCompliancePage />} />
      <Route path="/company-financials" element={<CompanyFinancialPage />} />
      <Route path="/satcom-dashboard" element={<SatcomDashboardEnhanced />} />
      
      {/* Manutenção */}
      <Route path="/maintenance-command" element={<MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenancePage />} />
      <Route path="/fuel-management" element={<FuelManagementPage />} />
      
      {/* Operações Submarinas */}
      <Route path="/ocean-sonar" element={<OceanSonar />} />
      <Route path="/underwater-drone" element={<UnderwaterDrone />} />
      <Route path="/auto-sub" element={<AutoSub />} />
      <Route path="/sonar-ai" element={<SonarAI />} />
      <Route path="/deep-risk-ai" element={<DeepRiskAI />} />
      
      {/* IA & Automação */}
      <Route path="/nauti-command" element={<NautilusCommand />} />
      <Route path="/revolutionary-ai" element={<AICommandCenter />} />
      <Route path="/ai-hub" element={<AIHubPage />} />
      <Route path="/ai-analytics" element={<AIAnalyticsDashboard />} />
      <Route path="/revolutionary-features" element={<RevolutionaryFeaturesPage />} />
      <Route path="/ai-ops/logs" element={<AIOperationsCenter />} />
      <Route path="/ai-observability" element={<AIObservabilityDashboard />} />
      <Route path="/workflow-command" element={<WorkflowCommandCenter />} />
      <Route path="/ai-journaling" element={<Documents />} />
      <Route path="/ai-audit" element={<AIAudit />} />
      <Route path="/voice-assistant" element={<VoiceAssistant />} />
      <Route path="/voice-assistant-ai" element={<VoiceAssistantAIPage />} />
      <Route path="/assistente-voz" element={<PortugueseVoiceAssistantPage />} />
      <Route path="/assistant/voice" element={<VoiceAssistant />} />
      
      {/* AI Modules Hub */}
      <Route path="/ai-modules" element={<AIModulesHubPage />} />
      <Route path="/ai/voyage-logistics" element={<VoyageLogisticsAIPage />} />
      <Route path="/ai/safety-incident" element={<SafetyIncidentAIPage />} />
      <Route path="/ai/inventory-spares" element={<InventorySparesAIPage />} />
      <Route path="/compliance-ai" element={<ComplianceAIPage />} />
      <Route path="/environmental-ai" element={<EnvironmentalAIPage />} />
      <Route path="/quality-ai" element={<QualityManagementAIPage />} />
      <Route path="/contract-legal-ai" element={<ContractLegalAIPage />} />
      <Route path="/insurance-claims-ai" element={<InsuranceClaimsAIPage />} />
      <Route path="/crewing-payroll-ai" element={<CrewingPayrollAIPage />} />
      <Route path="/reporting-analytics-ai" element={<ReportingAnalyticsAIPage />} />
      <Route path="/mobile-offline-ai" element={<MobileOfflineAIPage />} />
      
      {/* Inteligência Avançada */}
      <Route path="/optimization-dashboard" element={<Optimization />} />
      <Route path="/unified-optimization" element={<UnifiedOptimizationPage />} />
      <Route path="/intelligence/opec" element={<Optimization />} />
      <Route path="/intelligence/wellness" element={<CrewWellnessPage />} />
      <Route path="/intelligence/documents" element={<Documents />} />
      <Route path="/intelligence/blockchain" element={<RevolutionaryFeaturesPage />} />
      <Route path="/intelligence/competitive" element={<AISTrackerPage />} />
      
      {/* Telemetria & Monitoramento */}
      <Route path="/telemetria" element={<TelemetriaCommand />} />
      <Route path="/telemetria-command" element={<TelemetriaCommand />} />
      <Route path="/predictive-telemetry" element={<PredictiveTelemetry />} />
      <Route path="/satellite-optimizer" element={<SatelliteOptimizerPage />} />
      <Route path="/vessel-tracking" element={<VesselTrackingPage />} />
      <Route path="/tracking/gnss-live" element={<VesselTrackingPage />} />
      <Route path="/simulador" element={<IncidentSimulator />} />
      <Route path="/operational-calendar" element={<CalendarView />} />
      
      {/* APIs & Integrações */}
      <Route path="/integracoes/api-center" element={<APICenter />} />
      <Route path="/integracoes/api-monitor" element={<APIMonitor />} />
      <Route path="/integracoes" element={<Integrations />} />
      <Route path="/weather-maritime" element={<WeatherMaritime />} />
      <Route path="/ais-tracker-page" element={<AISTrackerPage />} />
      <Route path="/port-api" element={<PortAPI />} />
      <Route path="/flight-tracker" element={<FlightTracker />} />
      <Route path="/noaa-weather" element={<NOAAWeather />} />
      <Route path="/opensky-flights" element={<OpenSkyFlights />} />
      <Route path="/earthquake-monitor" element={<EarthquakeMonitor />} />
      <Route path="/voice-transcriber" element={<VoiceTranscriber />} />
      
      {/* Relatórios & Documentos */}
      <Route path="/reports-command" element={<ReportsCommandCenter />} />
      <Route path="/reports" element={<ReportsCommandCenter />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/document-workflow" element={<DocumentWorkflow />} />
      <Route path="/export-center" element={<ExportCenterPage />} />
      <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
      <Route path="/documentation" element={<Documents />} />
      
      {/* Auditorias & Compliance */}
      <Route path="/audit-ai-chat" element={<AuditAIChatPage />} />
      <Route path="/peo-dp" element={<PEODP />} />
      <Route path="/sgso" element={<SGSO />} />
      <Route path="/sgso/report" element={<SGSOReportPage />} />
      <Route path="/pre-ovid" element={<PreOVIDInspection />} />
      <Route path="/pre-ovid-inspection" element={<PreOVIDInspection />} />
      <Route path="/mlc-inspection" element={<MLCInspection />} />
      <Route path="/psc-package" element={<PSCPackage />} />
      <Route path="/whistleblower" element={<WhistleblowerV2 />} />
      <Route path="/security-center" element={<SecurityCenter />} />
      <Route path="/ai-operations-center" element={<AIOperationsCenter />} />
      <Route path="/auditoria-seguranca" element={<SecurityAuditCenter />} />
      <Route path="/security-scanner" element={<SecurityScanner />} />
      <Route path="/compliance-roadmap" element={<ComplianceRoadmapPage />} />
      <Route path="/compliance-dashboard" element={<ComplianceRoadmapPage />} />
      <Route path="/compliance-executive" element={<ExecutiveCompliancePage />} />
      <Route path="/executive-compliance" element={<ExecutiveCompliancePage />} />
      <Route path="/audit-agents" element={<AgentsDashboard />} />
      <Route path="/audit-agents/:agentId" element={<AgentDetailPage />} />
      <Route path="/pre-sire" element={<PreSIREInspection />} />
      <Route path="/pre-sire-2" element={<PreSIREInspection />} />
      <Route path="/tmsa-assessment" element={<TMSAAssessment />} />
      <Route path="/tmsa" element={<TMSAAssessment />} />
      <Route path="/solas-inspection" element={<SOLASInspection />} />
      <Route path="/solas-lsa-ffe" element={<SOLASInspection />} />
      
      {/* Diagnostic Components */}
      <Route path="/diagnostic-certificates" element={<DiagnosticCertificatesPage />} />
      <Route path="/diagnostic-dashboard" element={<DiagnosticDashboardPage />} />
      <Route path="/diagnostic-documents" element={<DiagnosticDocumentsPage />} />
      <Route path="/diagnostic-ncs" element={<DiagnosticNCsPage />} />
      <Route path="/diagnostic-reports" element={<DiagnosticReportsPage />} />
      
      {/* RH & Pessoas */}
      <Route path="/nautilus-people" element={<MaritimeCommandCenter />} />
      <Route path="/crew-management" element={<MaritimeCommandCenter />} />
      <Route path="/crew-wellness" element={<CrewWellnessPage />} />
      <Route path="/medical-infirmary" element={<MedicalInfirmary />} />
      <Route path="/enfermaria-digital" element={<MedicalInfirmary />} />
      <Route path="/users" element={<Users />} />
      <Route path="/hr-dashboard" element={<HRDashboardPage />} />
      <Route path="/hr/dashboard" element={<HRDashboardPage />} />
      <Route path="/hr/employees" element={<HRDashboardPage />} />
      <Route path="/hr/payroll" element={<Payroll />} />
      <Route path="/payroll" element={<Payroll />} />
      <Route path="/folha-pagamento" element={<Payroll />} />
      <Route path="/time-tracking" element={<TimeTracking />} />
      <Route path="/controle-ponto" element={<TimeTracking />} />
      <Route path="/hr/admissions" element={<HRDashboardPage />} />
      <Route path="/hr/vacations" element={<HRDashboardPage />} />
      <Route path="/employee-portal" element={<EmployeePortalPage />} />
      <Route path="/portal-colaborador" element={<EmployeePortalPage />} />
      <Route path="/people-analytics" element={<PeopleAnalyticsPage />} />
      <Route path="/hr/analytics" element={<PeopleAnalyticsPage />} />
      <Route path="/hr/turnover" element={<HRTurnoverPredictionPage />} />
      <Route path="/hr-chatbot" element={<HRChatbotPage />} />
      <Route path="/hr/chatbot" element={<HRChatbotPage />} />
      <Route path="/assistente-rh" element={<HRChatbotPage />} />
      <Route path="/hr-ocr" element={<HRDocumentOCRPage />} />
      <Route path="/hr/document-ocr" element={<HRDocumentOCRPage />} />
      <Route path="/admissao-digital" element={<HRDocumentOCRPage />} />
      <Route path="/hr-turnover" element={<HRTurnoverPredictionPage />} />
      <Route path="/hr/turnover-prediction" element={<HRTurnoverPredictionPage />} />
      <Route path="/predicao-turnover" element={<HRTurnoverPredictionPage />} />
      
      {/* Treinamentos */}
      <Route path="/nautilus-academy" element={<AITraining />} />
      <Route path="/solas-isps-training" element={<SOLASISPSTrainingPage />} />
      <Route path="/dp-intelligence" element={<DPIntelligence />} />
      
      {/* Finanças & Procurement */}
      <Route path="/finance-ai" element={<FinanceProcurementAIPage />} />
      <Route path="/finance-procurement-ai" element={<FinanceProcurementAIPage />} />
      <Route path="/voyage-accounting" element={<VoyageAccountingPage />} />
      <Route path="/voyage-pnl" element={<VoyagePnLPage />} />
      <Route path="/crew-scheduler" element={<CrewSchedulerPage />} />
      <Route path="/analytics-command" element={<AnalyticsCommandCenter />} />
      <Route path="/operations-command" element={<OperationsCommandCenter />} />
      
      {/* ESG & Sustentabilidade */}
      <Route path="/esg-emissions" element={<ESGEmissionsPage />} />
      <Route path="/waste-management" element={<EnhancedWasteManagement />} />
      <Route path="/sustainability-score" element={<SustainabilityScorePage />} />
      
      {/* STCW/MLC */}
      <Route path="/stcw-mlc" element={<STCWMLCCompliance />} />
      
      {/* Sistema & Configurações */}
      <Route path="/quality-dashboard" element={<QualityDashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/security" element={<SecuritySettings />} />
      <Route path="/integrations" element={<IntegrationsCenter />} />
      <Route path="/api-gateway" element={<APIGateway />} />
      <Route path="/collaboration" element={<Collaboration />} />
      <Route path="/roadmap" element={<Roadmap />} />
      
      {/* Enterprise Intelligence Suite */}
      <Route path="/enterprise/rag-assistant" element={<RAGAssistantPage />} />
      <Route path="/enterprise/ocr-center" element={<OCRCenterPage />} />
      <Route path="/enterprise/document-processor" element={<OCRCenterPage />} />
      <Route path="/enterprise/forms-builder" element={<FormsBuilderPage />} />
      <Route path="/enterprise/checklists-builder" element={<ChecklistsBuilderPage />} />
      <Route path="/enterprise/ocimf-assessment" element={<OCIMFAssessmentPage />} />
      <Route path="/enterprise/tmsa-analytics" element={<TMSAAnalyticsPage />} />
      <Route path="/enterprise/fatigue-risk" element={<FatigueRiskPage />} />
      <Route path="/enterprise/mlc-hours" element={<MLCWorkHoursPage />} />
      <Route path="/enterprise/crew-matching" element={<CrewMatchingPage />} />
      <Route path="/enterprise/talent-pool" element={<CrewMatchingPage />} />
      <Route path="/enterprise/contract-analysis" element={<ContractAnalysisPage />} />
      <Route path="/enterprise/risk-clauses" element={<RiskClausesPage />} />
      <Route path="/enterprise/compliance-predictor" element={<CompliancePredictorPage />} />
      <Route path="/enterprise/nc-prediction" element={<NCPredictionPage />} />
      
      {/* Advanced Maritime Modules */}
      <Route path="/advanced/digital-twin-3d" element={<DigitalTwin3DPage />} />
      <Route path="/advanced/weather-intelligence" element={<WeatherIntelligencePage />} />
      <Route path="/advanced/bunker-optimization" element={<BunkerOptimizationPage />} />
      <Route path="/advanced/cargo-planning" element={<CargoPlanningPage />} />
      <Route path="/advanced/psc-readiness" element={<PSCReadinessPage />} />
      <Route path="/advanced/marpol-tracker" element={<MARPOLTrackerPage />} />
      <Route path="/advanced/blockchain-certificates" element={<BlockchainCertificatesPage />} />
      <Route path="/advanced/incident-investigation" element={<IncidentInvestigationPage />} />
      <Route path="/advanced/vr-training" element={<VRTrainingPage />} />
      <Route path="/advanced/voice-commands" element={<VoiceCommandsPage />} />
      <Route path="/advanced/crew-wellness-ai" element={<CrewWellnessAIAdvancedPage />} />
      <Route path="/advanced/executive-dashboard" element={<ExecutiveDashboardAdvancedPage />} />
      
      {/* System & QA */}
      <Route path="/system/interactivity" element={<InteractivityScoreboard />} />
      <Route path="/system/qa-scoreboard" element={<InteractivityScoreboard />} />
      <Route path="/qa-dashboard" element={<InteractivityScoreboard />} />
      
      {/* Unified Hubs (redirects to mega-hubs) */}
      <Route path="/operations-command-hub" element={<Navigate to="/ops" replace />} />
      <Route path="/ai-control-tower" element={<Navigate to="/ai" replace />} />
      <Route path="/people-hub" element={<Navigate to="/workbench" replace />} />
      <Route path="/tracking-telemetry" element={<Navigate to="/tracking" replace />} />
      <Route path="/document-center" element={<Navigate to="/workbench" replace />} />
      <Route path="/comms-alerts" element={<Navigate to="/command" replace />} />
      <Route path="/ai-enterprise-engines" element={<AIEnterpriseEnginesHub />} />
      <Route path="/compliance-unified" element={<Navigate to="/compliance" replace />} />
      <Route path="/system-hub" element={<Navigate to="/command?tab=monitoring" replace />} />
      <Route path="/maintenance-hub" element={<Navigate to="/maintenance" replace />} />
      <Route path="/finance-hub" element={<Navigate to="/workbench" replace />} />
      <Route path="/finance-command" element={<Navigate to="/workbench" replace />} />
      
      {/* ADMIN */}
      <Route path="/admin" element={<Suspense fallback={<Loader />}><AdminRoute><Admin /></AdminRoute></Suspense>} />
      <Route path="/admin/dashboard" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDashboard /></AdminRoute></Suspense>} />
      <Route path="/admin/documents" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentList /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/ai" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAIEditor /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/ai/templates" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAITemplates /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/view/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentView /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/history/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentHistory /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/editor/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentEditorDemo /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/collaborate/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminCollaborativeEditor /></AdminRoute></Suspense>} />
      <Route path="/admin/templates" element={<Suspense fallback={<Loader />}><AdminRoute><AdminTemplates /></AdminRoute></Suspense>} />
      <Route path="/admin/templates/edit/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminTemplateEdit /></AdminRoute></Suspense>} />
      <Route path="/admin/sgso" element={<Suspense fallback={<Loader />}><AdminRoute><AdminSGSO /></AdminRoute></Suspense>} />
      <Route path="/admin/sgso/history/:vesselId" element={<Suspense fallback={<Loader />}><AdminRoute><AdminSGSOHistory /></AdminRoute></Suspense>} />
      <Route path="/admin/assistant" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAssistant /></AdminRoute></Suspense>} />
      <Route path="/admin/assistant/logs" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAssistantLogs /></AdminRoute></Suspense>} />
      <Route path="/admin/reports/assistant" element={<Suspense fallback={<Loader />}><AdminRoute><AdminReportsAssistant /></AdminRoute></Suspense>} />
      <Route path="/admin/reports/logs" element={<Suspense fallback={<Loader />}><AdminRoute><AdminReportsLogs /></AdminRoute></Suspense>} />
      <Route path="/admin/reports/restore-analytics" element={<Suspense fallback={<Loader />}><AdminRoute><AdminReportsRestoreAnalytics /></AdminRoute></Suspense>} />
      <Route path="/admin/collaboration" element={<Suspense fallback={<Loader />}><AdminRoute><AdminCollaboration /></AdminRoute></Suspense>} />
      <Route path="/admin/checklists" element={<Suspense fallback={<Loader />}><AdminRoute><MaritimeCommandCenter /></AdminRoute></Suspense>} />
      <Route path="/admin/checklists/dashboard" element={<Suspense fallback={<Loader />}><AdminRoute><AdminChecklistsDashboard /></AdminRoute></Suspense>} />
      <Route path="/admin/api-tester" element={<Suspense fallback={<Loader />}><AdminRoute><AdminApiTester /></AdminRoute></Suspense>} />
      
      <Route path="/dashboard" element={<CentralComando />} />
      <Route path="/executive-dashboard" element={<CentralComando />} />
      <Route path="/system-overview" element={<CentralComando />} />
      <Route path="/analytics" element={<AnalyticsCommandCenter />} />
      <Route path="/backup-audit" element={<SecurityAuditCenter />} />
      <Route path="/saas-manager" element={<Admin />} />
      <Route path="/docs" element={<Documents />} />
      
      {/* Legacy Redirects */}
      <Route path="/operations" element={<Navigate to="/ops" replace />} />
      <Route path="/operations/*" element={<Navigate to="/ops" replace />} />
      <Route path="/manutencao" element={<Navigate to="/maintenance" replace />} />
      <Route path="/digital-infirmary" element={<Navigate to="/medical-infirmary" replace />} />
      <Route path="/settings/sessions" element={<Navigate to="/settings" replace />} />
      <Route path="/crew" element={<Navigate to="/crew-management" replace />} />
      <Route path="/fleet-dashboard" element={<Navigate to="/fleet-command" replace />} />
      <Route path="/fleet-tracking" element={<Navigate to="/tracking" replace />} />
      <Route path="/fleet-management" element={<Navigate to="/fleet-command" replace />} />
      <Route path="/maritime-certifications" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/checklists" element={<Navigate to="/admin/checklists" replace />} />
      <Route path="/nautilus-command" element={<Navigate to="/nauti-command" replace />} />
      <Route path="/maintenance/planner" element={<Navigate to="/maintenance" replace />} />
      <Route path="/sistema-maritimo" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/compliance-center" element={<Navigate to="/compliance" replace />} />
      <Route path="/compliance-center/*" element={<Navigate to="/compliance" replace />} />
      <Route path="/intelligent-alerts" element={<Navigate to="/command" replace />} />
      <Route path="/human-resources" element={<Navigate to="/hr-dashboard" replace />} />
      <Route path="/sgso-report" element={<Navigate to="/sgso/report" replace />} />
      <Route path="/executive-bi" element={<Navigate to="/command" replace />} />
      <Route path="/forecast-console" element={<Navigate to="/weather-maritime" replace />} />
      <Route path="/fuel-manager" element={<Navigate to="/fuel-management" replace />} />
      <Route path="/executive" element={<Navigate to="/command" replace />} />
      <Route path="/notification-center" element={<Navigate to="/command" replace />} />
      <Route path="/pre-psc" element={<Navigate to="/advanced/psc-readiness" replace />} />
      <Route path="/psc-readiness" element={<Navigate to="/advanced/psc-readiness" replace />} />
      <Route path="/nautilus-documents" element={<Navigate to="/documents" replace />} />
      <Route path="/maritime" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/vessels" element={<Navigate to="/fleet-command" replace />} />
      <Route path="/price-alerts" element={<Navigate to="/command" replace />} />
      <Route path="/alerts-command" element={<Navigate to="/command" replace />} />
      <Route path="/notifications-center" element={<Navigate to="/command" replace />} />
      <Route path="/communication" element={<Navigate to="/command" replace />} />
      <Route path="/communication-command" element={<Navigate to="/command" replace />} />
      <Route path="/intelligence" element={<Navigate to="/revolutionary-features" replace />} />
      <Route path="/peotram" element={<Navigate to="/compliance" replace />} />
      <Route path="/peotram-ai" element={<Navigate to="/compliance" replace />} />
      <Route path="/gmud" element={<Navigate to="/compliance" replace />} />
      <Route path="/gmud-workflow" element={<Navigate to="/compliance" replace />} />
      <Route path="/responsibility-matrix" element={<Navigate to="/compliance" replace />} />
      <Route path="/safety-human-factors" element={<Navigate to="/compliance" replace />} />
      <Route path="/safety-imca" element={<Navigate to="/compliance" replace />} />
      <Route path="/imca-audit" element={<Navigate to="/compliance" replace />} />
      <Route path="/isps-security" element={<Navigate to="/compliance" replace />} />
      <Route path="/drill-simulator" element={<Navigate to="/compliance" replace />} />
      <Route path="/compliance-one" element={<Navigate to="/compliance" replace />} />
      <Route path="/compliance-hub" element={<Navigate to="/compliance" replace />} />
      <Route path="/regulations" element={<Navigate to="/compliance" replace />} />
      <Route path="/risk-matrix" element={<Navigate to="/compliance" replace />} />
      <Route path="/evidences" element={<Navigate to="/compliance" replace />} />
      <Route path="/due-diligence" element={<Navigate to="/compliance" replace />} />
      <Route path="/safety-guardian" element={<Navigate to="/compliance" replace />} />
      <Route path="/crew/rotations" element={<Navigate to="/crew-management" replace />} />
      <Route path="/settings/integrations" element={<Navigate to="/integrations" replace />} />
      <Route path="/integrations-center" element={<Navigate to="/integrations" replace />} />
      <Route path="/hr" element={<Navigate to="/hr-dashboard" replace />} />
      <Route path="/training" element={<Navigate to="/nautilus-academy" replace />} />
      <Route path="/voyage-planner" element={<Navigate to="/voyage-command" replace />} />
      <Route path="/maintenance-planner" element={<Navigate to="/maintenance" replace />} />
      <Route path="/subsea-operations" element={<Navigate to="/ocean-sonar" replace />} />
      <Route path="/finance-command-center" element={<Navigate to="/workbench" replace />} />
      <Route path="/about" element={<Navigate to="/landing" replace />} />
      <Route path="/blog" element={<Navigate to="/landing" replace />} />
      <Route path="/contact" element={<Navigate to="/landing" replace />} />
      <Route path="/terms" element={<Navigate to="/landing" replace />} />
      <Route path="/privacy" element={<Navigate to="/landing" replace />} />
      <Route path="/privacy-policy" element={<Navigate to="/landing" replace />} />
      <Route path="/notifications" element={<Navigate to="/command" replace />} />
      <Route path="/profile" element={<Navigate to="/settings" replace />} />
      <Route path="/help" element={<Navigate to="/roadmap" replace />} />
      <Route path="/fleet" element={<Navigate to="/fleet-command" replace />} />
      <Route path="/calendar" element={<Navigate to="/operational-calendar" replace />} />
      <Route path="/approvals" element={<Navigate to="/workbench" replace />} />
      <Route path="/alerts" element={<Navigate to="/command" replace />} />
      <Route path="/admin/integrations" element={<Navigate to="/integrations" replace />} />
      <Route path="/admin/reports" element={<Navigate to="/reports-command" replace />} />
      <Route path="/tasks" element={<Navigate to="/workbench" replace />} />
      <Route path="/task-management" element={<Navigate to="/workbench" replace />} />
      <Route path="/noc-monitoring" element={<Navigate to="/noc" replace />} />
      <Route path="/soc" element={<Navigate to="/command" replace />} />
      <Route path="/route-optimizer" element={<Navigate to="/ops" replace />} />
      <Route path="/drydock-management" element={<Navigate to="/maintenance" replace />} />
      <Route path="/vessel-contracts" element={<Navigate to="/ops" replace />} />
      <Route path="/charter-party" element={<Navigate to="/ops" replace />} />
      <Route path="/cargo-management" element={<Navigate to="/ops" replace />} />
      <Route path="/port-call" element={<Navigate to="/ops" replace />} />
      <Route path="/vessel-cts" element={<Navigate to="/ops" replace />} />
      <Route path="/vessel-history" element={<Navigate to="/ops" replace />} />
      <Route path="/logistics-command" element={<Navigate to="/ops" replace />} />
      <Route path="/fleet-pulse" element={<Navigate to="/fleet-command" replace />} />
      <Route path="/voyage-simulator" element={<Navigate to="/voyage-command" replace />} />
      <Route path="/crew-wellbeing" element={<Navigate to="/crew-wellness" replace />} />
      <Route path="/mlc-scheduling" element={<Navigate to="/workbench" replace />} />
      <Route path="/crew-scheduling" element={<Navigate to="/workbench" replace />} />
      <Route path="/supplier-portal" element={<Navigate to="/workbench" replace />} />
      <Route path="/iot-dashboard" element={<Navigate to="/command" replace />} />
      <Route path="/iot" element={<Navigate to="/command" replace />} />
      <Route path="/gamification" element={<Navigate to="/command" replace />} />
      <Route path="/production-deploy" element={<Navigate to="/command" replace />} />
      <Route path="/autonomous-command" element={<Navigate to="/ai" replace />} />
      <Route path="/advanced-search" element={<Navigate to="/documents" replace />} />
      <Route path="/tracking/alerts" element={<Navigate to="/tracking" replace />} />
      <Route path="/emergency-mode" element={<Navigate to="/command" replace />} />
      <Route path="/weather-command" element={<Navigate to="/weather-maritime" replace />} />
      <Route path="/travel-command" element={<Navigate to="/workbench" replace />} />
      <Route path="/procurement-command" element={<Navigate to="/workbench" replace />} />
      <Route path="/mentor-dp" element={<Navigate to="/dp-intelligence" replace />} />
      <Route path="/intelligence/accidents" element={<Navigate to="/compliance" replace />} />
      <Route path="/maritime-connectivity" element={<Navigate to="/command" replace />} />
      <Route path="/real-time-workspace" element={<Collaboration />} />
      <Route path="/schedule" element={<Navigate to="/operational-calendar" replace />} />
      <Route path="/schedules" element={<Navigate to="/operational-calendar" replace />} />
      <Route path="/missions" element={<Navigate to="/mission-command" replace />} />
      <Route path="/monitoring" element={<Navigate to="/central-comando" replace />} />
      <Route path="/testing" element={<CentralComando />} />
      <Route path="/qa/preview" element={<CentralComando />} />

      {/* DEV ONLY */}
      <Route path="/dev-routes" element={<DevRoutesDashboard />} />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
        <AuthProvider>
          <Router>
            <TooltipProvider>
              <LazyLoadErrorBoundary>
                <Suspense fallback={<Loader />}>
                  <AppRoutes />
                </Suspense>
              </LazyLoadErrorBoundary>
              <Toaster />
            </TooltipProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
