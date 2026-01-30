/**
 * App.tsx - Versão Completa com Todas as Rotas do Sidebar
 * PATCH: Rotas completas para 100+ módulos + Mobile/PWA optimizations
 */
import * as React from "react";
import { Suspense, lazy } from "react";
import { LazyLoadErrorBoundary } from "@/components/error/LazyLoadErrorBoundary";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/layout/app-sidebar";
import { ThemeProvider } from "./components/layout/theme-provider";
import { Header } from "./components/layout/header";
import { MobileBottomNav } from "./components/layout/mobile-bottom-nav";
import { ProductOnboardingTour } from "./components/onboarding/ProductOnboardingTour";
import { UserFeedbackWidget } from "./components/feedback/UserFeedbackWidget";
import { usageTracker } from "./lib/analytics/usage-tracker";

// ============================================
// LAZY LOAD - PÁGINAS PRINCIPAIS
// ============================================
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const CentralComando = lazy(() => import("@/pages/CentralComando"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DevRoutesDashboard = lazy(() => import("@/pages/DevRoutesDashboard"));
const Billing = lazy(() => import("@/pages/Billing"));
const BillingPortal = lazy(() => import("@/pages/BillingPortal"));
const OnboardingDashboard = lazy(() => import("@/pages/OnboardingDashboard"));
const InteractiveOnboarding = lazy(() => import("@/pages/InteractiveOnboarding"));
const AnalyticsFeedback = lazy(() => import("@/pages/AnalyticsFeedback"));

// Central de Comando extras
const NOC = lazy(() => import("@/pages/NOC"));
const NOCMonitoring = lazy(() => import("@/pages/NOCMonitoring"));
const SOCPage = lazy(() => import("@/pages/SOCPage"));
const HealthMonitor = lazy(() => import("@/pages/HealthMonitor"));

// ============================================
// OPERAÇÕES MARÍTIMAS
// ============================================
const MaritimeCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
const FleetCommandCenter = lazy(() => import("@/pages/FleetCommandCenter"));
const VoyageCommandCenter = lazy(() => import("@/pages/VoyageCommandCenter"));
const RouteOptimizerPage = lazy(() => import("@/pages/RouteOptimizerPage"));
const MissionCommandCenter = lazy(() => import("@/pages/MissionCommandCenter"));
const BridgeLink = lazy(() => import("@/pages/BridgeLink"));
const DrydockManagement = lazy(() => import("@/pages/DrydockManagement"));
const VesselContractsUnified = lazy(() => import("@/pages/VesselContractsUnified"));
const CharterPartyV2 = lazy(() => import("@/pages/CharterPartyV2"));
const CargoManagementV2 = lazy(() => import("@/pages/CargoManagementV2"));
const PortCallOptimizationV2 = lazy(() => import("@/pages/PortCallOptimizationV2"));
const VesselCTSV2 = lazy(() => import("@/pages/VesselCTSV2"));
const VesselHistoryV2 = lazy(() => import("@/pages/VesselHistoryV2"));

// Digital Twin & Logistics (v4.0)
const DigitalTwinPage = lazy(() => import("@/pages/DigitalTwinPage"));
const VesselDigitalTwinPage = lazy(() => import("@/pages/vessel-digital-twin"));
const LogisticsCommandPage = lazy(() => import("@/pages/LogisticsCommandPage"));
const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
const AgentOrchestrationPage = lazy(() => import("@/pages/AgentOrchestrationPage"));
const BlockchainCompliancePage = lazy(() => import("@/pages/BlockchainCompliancePage"));
const CompanyFinancialPage = lazy(() => import("@/pages/CompanyFinancialPage"));
const MLCSchedulingPage = lazy(() => import("@/pages/MLCSchedulingPage"));
const SupplierPortalPage = lazy(() => import("@/pages/SupplierPortalPage"));
const IoTDashboardPage = lazy(() => import("@/pages/IoTDashboardPage"));
const IoTIntegrationPage = lazy(() => import("@/pages/IoTIntegrationPage"));

// ============================================
// REVOLUTIONARY MODULES v6.0
// ============================================
const OperationsIntelligencePage = lazy(() => import("@/pages/OperationsIntelligencePage"));
const HRIntelligencePage = lazy(() => import("@/pages/HRIntelligencePage"));
const PredictiveMaintenanceMLPage = lazy(() => import("@/pages/PredictiveMaintenanceMLPage"));
const PredictiveAuditPage = lazy(() => import("@/pages/PredictiveAuditPage"));
const FinanceHubAIPage = lazy(() => import("@/pages/FinanceHubAIPage"));
const SmartLogisticsAIPage = lazy(() => import("@/pages/SmartLogisticsAIPage"));

// ============================================
// MANUTENÇÃO
// ============================================
const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));

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
const NautilusCommand = lazy(() => import("@/pages/NautilusCommand"));
// RevolutionaryAI moved to AICommandCenter
const AICommandCenter = lazy(() => import("@/pages/AICommandCenter"));
const AICommandCenterPage = lazy(() => import("@/pages/AICommandCenterPage"));
const AIHubPage = lazy(() => import("@/pages/AIHubPage"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const RevolutionaryFeaturesPage = lazy(() => import("@/pages/RevolutionaryFeaturesPage"));
const AutonomousCommandCenter = lazy(() => import("@/pages/AutonomousCommandCenter"));
const AIObservabilityDashboard = lazy(() => import("@/pages/AIObservabilityDashboard"));
const WorkflowCommandCenter = lazy(() => import("@/pages/WorkflowCommandCenter"));
const AIAudit = lazy(() => import("@/pages/AIAudit"));
const VoiceAssistant = lazy(() => import("@/pages/VoiceAssistant"));
const AIOperationsCenter = lazy(() => import("@/pages/AIOperationsCenter"));
const QualityDashboard = lazy(() => import("@/pages/QualityDashboard"));
const SupportCenterPage = lazy(() => import("@/pages/SupportCenterPage"));
const SubscriptionPlansPage = lazy(() => import("@/pages/SubscriptionPlansPage"));

// ============================================
// INTELIGÊNCIA AVANÇADA
// ============================================
const Optimization = lazy(() => import("@/pages/Optimization"));

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
// MaritimeChecklists moved to MaritimeCommandCenter
const DocumentWorkflow = lazy(() => import("@/pages/DocumentWorkflow"));
const ExportCenterPage = lazy(() => import("@/pages/ExportCenterPage"));
const EnterpriseDocumentCenterPage = lazy(() => import("@/pages/EnterpriseDocumentCenterPage"));
const TrainingDocumentsPage = lazy(() => import("@/pages/TrainingDocumentsPage"));
const VesselAccessManagementPage = lazy(() => import("@/pages/VesselAccessManagementPage"));
const AdvancedSearchPage = lazy(() => import("@/pages/AdvancedSearchPage"));

// ============================================
// COMUNICAÇÃO & ALERTAS
// ============================================
const CommunicationCommandCenter = lazy(() => import("@/pages/CommunicationCommandCenter"));
const AlertsCommandCenter = lazy(() => import("@/pages/AlertsCommandCenter"));

// ============================================
// AUDITORIAS & COMPLIANCE
// ============================================
const PEODP = lazy(() => import("@/pages/PEODP"));
const PEOTRAM = lazy(() => import("@/pages/PEOTRAM"));
const SGSO = lazy(() => import("@/pages/SGSO"));
const SafetyIMCAV2 = lazy(() => import("@/pages/SafetyIMCAV2"));
const PreOVIDInspection = lazy(() => import("@/pages/PreOVIDInspection"));
const MLCInspection = lazy(() => import("@/pages/MLCInspection"));
const PSCPackage = lazy(() => import("@/pages/PSCPackage"));
const GMUDV2 = lazy(() => import("@/pages/GMUDV2"));
const ResponsibilityMatrixV2 = lazy(() => import("@/pages/ResponsibilityMatrixV2"));
const SafetyHumanFactorsV2 = lazy(() => import("@/pages/SafetyHumanFactorsV2"));
const ISPSSecurityV2 = lazy(() => import("@/pages/ISPSSecurityV2"));
const DrillSimulatorV2 = lazy(() => import("@/pages/DrillSimulatorV2"));
const ComplianceOneV2 = lazy(() => import("@/pages/ComplianceOneV2"));
const ExecutiveCompliancePage = lazy(() => import("@/pages/ExecutiveCompliancePage"));
const RegulationsV2 = lazy(() => import("@/pages/RegulationsV2"));
const RiskMatrixV2 = lazy(() => import("@/pages/RiskMatrixV2"));
const EvidencesV2 = lazy(() => import("@/pages/EvidencesV2"));
const DueDiligenceV2 = lazy(() => import("@/pages/DueDiligenceV2"));
const WhistleblowerV2 = lazy(() => import("@/pages/WhistleblowerV2"));
const SecurityCenter = lazy(() => import("@/pages/SecurityCenter"));
const SecurityAuditCenter = lazy(() => import("@/pages/SecurityAuditCenter"));
const SecurityScanner = lazy(() => import("@/pages/SecurityScanner"));
const AuditAIChatPage = lazy(() => import("@/pages/AuditAIChatPage"));
const ComplianceRoadmapPage = lazy(() => import("@/pages/ComplianceRoadmapPage"));

// Diagnostic Components Pages
const DiagnosticCertificatesPage = lazy(() => import("@/pages/DiagnosticCertificatesPage"));
const DiagnosticDashboardPage = lazy(() => import("@/pages/DiagnosticDashboardPage"));
const DiagnosticDocumentsPage = lazy(() => import("@/pages/DiagnosticDocumentsPage"));
const DiagnosticNCsPage = lazy(() => import("@/pages/DiagnosticNCsPage"));
const DiagnosticReportsPage = lazy(() => import("@/pages/DiagnosticReportsPage"));

// ============================================
// RH & PESSOAS (HR/DP MODULE)
// ============================================
// CrewManagement moved to MaritimeCommandCenter
const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));
const Users = lazy(() => import("@/pages/Users"));

// HR/DP Module - New Pages
const HRDashboardPage = lazy(() => import("@/pages/HRDashboardPage"));
const EmployeePortalPage = lazy(() => import("@/pages/EmployeePortalPage"));
const PeopleAnalyticsPage = lazy(() => import("@/pages/PeopleAnalyticsPage"));
const Payroll = lazy(() => import("@/pages/Payroll"));
const TimeTracking = lazy(() => import("@/pages/TimeTracking"));

// HR/DP AI Modules
const HRChatbotPage = lazy(() => import("@/pages/HRChatbotPage"));
const HRDocumentOCRPage = lazy(() => import("@/pages/HRDocumentOCRPage"));
const HRTurnoverPredictionPage = lazy(() => import("@/pages/HRTurnoverPredictionPage"));

// ===== REVOLUTIONARY AI MODULES =====
const CrewAICopilotPage = lazy(() => import("@/pages/CrewAICopilotPage"));
const AdvancedFinanceAIPage = lazy(() => import("@/pages/AdvancedFinanceAIPage"));
const SmartAuditEnginePage = lazy(() => import("@/pages/SmartAuditEnginePage"));
const AdvancedTrainingAIPage = lazy(() => import("@/pages/AdvancedTrainingAIPage"));

// ===== NEW REVOLUTIONARY MODULES v4.1 =====
const MaritimeAICommandPage = lazy(() => import("@/pages/MaritimeAICommandPage"));
const MaintenanceAICommandPage = lazy(() => import("@/pages/MaintenanceAICommandPage"));
const LogisticsAIHubPage = lazy(() => import("@/pages/LogisticsAIHubPage"));
const HRCommandCenterPage = lazy(() => import("@/pages/HRCommandCenterPage"));

// ============================================
// TREINAMENTOS
// ============================================
const TrainingLXPPage = lazy(() => import("@/pages/TrainingLXPPage"));
const AITraining = lazy(() => import("@/pages/AITraining"));
const MentorDP = lazy(() => import("@/pages/MentorDP"));
const DPIntelligence = lazy(() => import("@/pages/DPIntelligence"));

// ============================================
// FINANÇAS & PROCUREMENT
// ============================================
const FinanceCommandCenter = lazy(() => import("@/pages/FinanceCommandCenter"));
const VoyageAccountingPage = lazy(() => import("@/pages/VoyageAccountingPage"));
const AnalyticsCommandCenter = lazy(() => import("@/pages/AnalyticsCommandCenter"));
const OperationsCommandCenter = lazy(() => import("@/pages/OperationsCommandCenter"));
const ProcurementCommandCenter = lazy(() => import("@/pages/ProcurementCommandCenter"));
const TaskManagement = lazy(() => import("@/pages/TaskManagement"));

// ============================================
// ESG & SUSTENTABILIDADE
// ============================================
const SustainabilityScorePage = lazy(() => import("@/pages/SustainabilityScorePage"));

// ============================================
// VIAGENS & LOGÍSTICA
// ============================================
const TravelCommandCenter = lazy(() => import("@/pages/TravelCommandCenter"));
const TravelAIEnginePage = lazy(() => import("@/pages/TravelAIEnginePage"));
const WeatherCommandCenter = lazy(() => import("@/pages/WeatherCommandCenter"));
const WeatherRoutePlannerPage = lazy(() => import("@/pages/WeatherRoutePlannerPage"));

// ============================================
// SISTEMA & CONFIGURAÇÕES
// ============================================
const Settings = lazy(() => import("@/pages/Settings"));
const IntegrationsCenter = lazy(() => import("@/pages/IntegrationsCenter"));
const APIGateway = lazy(() => import("@/pages/APIGateway"));
const Collaboration = lazy(() => import("@/pages/Collaboration"));
const IoT = lazy(() => import("@/pages/IoT"));
const Gamification = lazy(() => import("@/pages/Gamification"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const ProductionDeploy = lazy(() => import("@/pages/ProductionDeploy"));

// NEW: PWA, Analytics, i18n, Tests
const PWASettingsPage = lazy(() => import("@/pages/PWASettingsPage"));
const AdvancedAnalyticsPage = lazy(() => import("@/pages/AdvancedAnalyticsPage"));
const LanguageSettingsPage = lazy(() => import("@/pages/LanguageSettingsPage"));
const TestSuitePage = lazy(() => import("@/pages/TestSuitePage"));
const StatusPage = lazy(() => import("@/pages/StatusPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const SecuritySettings = lazy(() => import("@/pages/settings/Security"));

// ============================================
// ADMIN & DASHBOARDS
// ============================================
const Admin = lazy(() => import("@/pages/Admin"));
// Dashboard, ExecutiveDashboard, Analytics → CentralComando/AnalyticsCommandCenter

// Admin Dashboards - Infraestrutura v4.0
const DevOpsDashboard = lazy(() => import("@/pages/admin/DevOpsDashboard"));
const MLAnalyticsDashboard = lazy(() => import("@/pages/admin/MLAnalyticsDashboard"));
const ScalingDashboard = lazy(() => import("@/pages/admin/ScalingDashboard"));
const QATestingDashboard = lazy(() => import("@/pages/admin/QATestingDashboard"));
const AdminDocumentationHub = lazy(() => import("@/pages/admin/DocumentationHub"));
const AdminSupportCenter = lazy(() => import("@/pages/admin/SupportCenter"));

// Admin - API & Integrations v4.0
const APIKeysManagement = lazy(() => import("@/pages/admin/APIKeysManagement"));
const WebhooksManagement = lazy(() => import("@/pages/admin/WebhooksManagement"));
const APIDocs = lazy(() => import("@/pages/admin/APIDocs"));

// Integrations Hub
const ExternalIntegrationsHub = lazy(() => import("@/pages/admin/ExternalIntegrationsHub"));
const NotificationCenterPage = lazy(() => import("@/pages/NotificationCenterPage"));

// AI Intelligence Suite v6.0
const AIIntelligenceSuitePage = lazy(() => import("@/pages/AIIntelligenceSuitePage"));

// Query client - otimizado para conexões lentas/satélite
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      staleTime: 1000 * 60 * 5, // 5 minutos - evita refetch desnecessário
      gcTime: 1000 * 60 * 30, // 30 minutos de cache
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Desabilitado para economizar dados
      refetchOnReconnect: 'always',
      networkMode: 'offlineFirst', // Prioriza cache em conexões lentas
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
      networkMode: 'offlineFirst',
    },
  },
});

// Analytics Tracker inicializado via useEffect no AppInitializer

// ============================================
// LOADER v34 - Spinner simples, SEM timeout/redirect
// O Suspense fallback é apenas visual enquanto JS carrega
// NÃO deve ter lógica de redirect - isso causa loops
// ============================================
// PATCH v51: Loader ULTRA SIMPLES - Apenas visual, SEM timeout que causa loops
// Qualquer lógica de timeout/recovery fica no index.html
const Loader = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-3">
      <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
));

// ============================================
// PROTECTED ROUTE v51 - INSTANT decision, ZERO loading states
// Auth context now starts with isLoading=false, so we can decide immediately
// ============================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // PATCH v51: User logged in = show content IMMEDIATELY
  if (user) {
    return <>{children}</>;
  }
  
  // PATCH v51: If not loading OR no user = redirect INSTANTLY
  // AuthContext now initializes with isLoading=false so this is immediate
  if (!isLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  // Very brief loading (only while auth is actually checking - max 100ms in practice)
  return <Loader />;
};

// Layout com Sidebar para rotas autenticadas
const AuthenticatedLayout = () => {
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
        <UserFeedbackWidget position="bottom-right" />
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

// Rotas internas
const AppRoutes = () => (
<Routes>
    {/* Public Routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/pricing" element={<LandingPage />} />
    <Route path="/status" element={<StatusPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    
    {/* Rotas autenticadas com Sidebar */}
    <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
      <Route path="/" element={<Navigate to="/central-comando" replace />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/billing-portal" element={<BillingPortal />} />
      <Route path="/planos" element={<Billing />} />
      <Route path="/onboarding" element={<OnboardingDashboard />} />
      <Route path="/onboarding-tour" element={<InteractiveOnboarding />} />
      <Route path="/welcome" element={<InteractiveOnboarding />} />
      <Route path="/analytics-feedback" element={<AnalyticsFeedback />} />
      <Route path="/feedback" element={<AnalyticsFeedback />} />
      
      {/* ============================================ */}
      {/* CENTRAL DE COMANDO */}
      {/* ============================================ */}
      <Route path="/central-comando/*" element={<CentralComando />} />
      <Route path="/noc" element={<NOC />} />
      <Route path="/noc-monitoring" element={<NOCMonitoring />} />
      <Route path="/health-monitor" element={<HealthMonitor />} />
      <Route path="/soc" element={<SOCPage />} />
      <Route path="/soc-dashboard" element={<SOCPage />} />
      
      {/* ============================================ */}
      {/* OPERAÇÕES MARÍTIMAS */}
      {/* ============================================ */}
      <Route path="/maritime-command" element={<MaritimeCommandCenter />} />
      <Route path="/fleet-command" element={<FleetCommandCenter />} />
      <Route path="/voyage-command" element={<VoyageCommandCenter />} />
      <Route path="/route-optimizer" element={<RouteOptimizerPage />} />
      <Route path="/mission-command" element={<MissionCommandCenter />} />
      <Route path="/bridge-link" element={<BridgeLink />} />
      <Route path="/drydock-management" element={<DrydockManagement />} />
      <Route path="/vessel-contracts" element={<VesselContractsUnified />} />
      <Route path="/charter-party" element={<CharterPartyV2 />} />
      <Route path="/cargo-management" element={<CargoManagementV2 />} />
      <Route path="/port-call" element={<PortCallOptimizationV2 />} />
      <Route path="/vessel-cts" element={<VesselCTSV2 />} />
      <Route path="/vessel-history" element={<VesselHistoryV2 />} />
      <Route path="/digital-twin" element={<DigitalTwinPage />} />
      <Route path="/vessel-digital-twin" element={<VesselDigitalTwinPage />} />
      <Route path="/logistics-command" element={<LogisticsCommandPage />} />
      <Route path="/recruitment" element={<RecruitmentPage />} />
      <Route path="/agent-orchestration" element={<AgentOrchestrationPage />} />
      <Route path="/blockchain-compliance" element={<BlockchainCompliancePage />} />
      <Route path="/company-financials" element={<CompanyFinancialPage />} />
      <Route path="/mlc-scheduling" element={<MLCSchedulingPage />} />
      <Route path="/supplier-portal" element={<SupplierPortalPage />} />
      <Route path="/iot-dashboard" element={<IoTDashboardPage />} />
      {/* ============================================ */}
      {/* MANUTENÇÃO */}
      {/* ============================================ */}
      <Route path="/maintenance-command" element={<MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenancePage />} />
      <Route path="/predictive-maintenance-ml" element={<PredictiveMaintenanceMLPage />} />
      <Route path="/maintenance-ai-command" element={<MaintenanceAICommandPage />} />
      <Route path="/maritime-ai-command" element={<MaritimeAICommandPage />} />
      <Route path="/operations-intelligence" element={<OperationsIntelligencePage />} />
      <Route path="/hr-intelligence" element={<HRIntelligencePage />} />
      <Route path="/logistics-ai-hub" element={<LogisticsAIHubPage />} />
      <Route path="/hr-command-center" element={<HRCommandCenterPage />} />
      
      {/* ============================================ */}
      {/* OPERAÇÕES SUBMARINAS */}
      {/* ============================================ */}
      <Route path="/ocean-sonar" element={<OceanSonar />} />
      <Route path="/underwater-drone" element={<UnderwaterDrone />} />
      <Route path="/auto-sub" element={<AutoSub />} />
      <Route path="/sonar-ai" element={<SonarAI />} />
      <Route path="/deep-risk-ai" element={<DeepRiskAI />} />
      
      {/* ============================================ */}
      {/* IA & AUTOMAÇÃO */}
      {/* ============================================ */}
      <Route path="/nauti-command" element={<NautilusCommand />} />
      <Route path="/revolutionary-ai" element={<AICommandCenter />} />
      <Route path="/ai-command" element={<AICommandCenter />} />
      <Route path="/ai-command-center" element={<AICommandCenterPage />} />
      <Route path="/ai-hub" element={<AIHubPage />} />
      <Route path="/ai-analytics" element={<AIAnalyticsDashboard />} />
      <Route path="/revolutionary-features" element={<RevolutionaryFeaturesPage />} />
      <Route path="/autonomous-command" element={<AutonomousCommandCenter />} />
      <Route path="/ai-ops/logs" element={<AIOperationsCenter />} />
      <Route path="/ai-observability" element={<AIObservabilityDashboard />} />
      <Route path="/workflow-command" element={<WorkflowCommandCenter />} />
      <Route path="/ai-journaling" element={<Documents />} />
      <Route path="/ai-audit" element={<AIAudit />} />
      <Route path="/voice-assistant" element={<VoiceAssistant />} />
      <Route path="/assistant/voice" element={<VoiceAssistant />} />
      <Route path="/ai-intelligence-suite" element={<AIIntelligenceSuitePage />} />
      <Route path="/ai-suite" element={<AIIntelligenceSuitePage />} />
      
      {/* ============================================ */}
      {/* INTELIGÊNCIA AVANÇADA */}
      {/* ============================================ */}
      <Route path="/optimization-dashboard" element={<Optimization />} />
      <Route path="/intelligence/opec" element={<Optimization />} />
      <Route path="/intelligence/wellness" element={<CrewWellnessPage />} />
      <Route path="/intelligence/documents" element={<Documents />} />
      <Route path="/intelligence/accidents" element={<SafetyHumanFactorsV2 />} />
      <Route path="/intelligence/blockchain" element={<RevolutionaryFeaturesPage />} />
      <Route path="/intelligence/competitive" element={<AISTrackerPage />} />
      
      {/* ============================================ */}
      {/* TELEMETRIA & MONITORAMENTO */}
      {/* ============================================ */}
      <Route path="/iot-integration" element={<IoTIntegrationPage />} />
      <Route path="/telemetria" element={<TelemetriaCommand />} />
      <Route path="/telemetria-command" element={<TelemetriaCommand />} />
      <Route path="/predictive-telemetry" element={<PredictiveTelemetry />} />
      <Route path="/satellite-optimizer" element={<SatelliteOptimizerPage />} />
      <Route path="/tracking" element={<VesselTrackingPage />} />
      <Route path="/tracking/gnss-live" element={<VesselTrackingPage />} />
      <Route path="/tracking/alerts" element={<AlertsCommandCenter />} />
      <Route path="/simulador" element={<IncidentSimulator />} />
      <Route path="/emergency-mode" element={<AlertsCommandCenter />} />
      <Route path="/operational-calendar" element={<CalendarView />} />
      
      {/* ============================================ */}
      {/* APIs & INTEGRAÇÕES */}
      {/* ============================================ */}
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
      
      {/* ============================================ */}
      {/* RELATÓRIOS & DOCUMENTOS */}
      {/* ============================================ */}
      <Route path="/reports-command" element={<ReportsCommandCenter />} />
      <Route path="/reports" element={<ReportsCommandCenter />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/admin/checklists" element={<MaritimeCommandCenter />} />
      <Route path="/document-workflow" element={<DocumentWorkflow />} />
      <Route path="/export-center" element={<ExportCenterPage />} />
      <Route path="/advanced-search" element={<AdvancedSearchPage />} />
      <Route path="/documentation" element={<Documents />} />
      {/* Enterprise Document Management System */}
      <Route path="/enterprise-documents" element={<EnterpriseDocumentCenterPage />} />
      <Route path="/document-center" element={<EnterpriseDocumentCenterPage />} />
      <Route path="/training-documents" element={<TrainingDocumentsPage />} />
      <Route path="/vessel-access-management" element={<VesselAccessManagementPage />} />
      
      {/* ============================================ */}
      {/* COMUNICAÇÃO & ALERTAS */}
      {/* ============================================ */}
      <Route path="/communication-command" element={<CommunicationCommandCenter />} />
      <Route path="/alerts-command" element={<AlertsCommandCenter />} />
      <Route path="/maritime-connectivity" element={<CommunicationCommandCenter />} />
      <Route path="/real-time-workspace" element={<Collaboration />} />
      
      {/* ============================================ */}
      {/* AUDITORIAS & COMPLIANCE */}
      {/* ============================================ */}
      <Route path="/predictive-audit" element={<PredictiveAuditPage />} />
      <Route path="/smart-audit-engine" element={<SmartAuditEnginePage />} />
      <Route path="/audit-ai-chat" element={<AuditAIChatPage />} />
      <Route path="/peo-dp" element={<PEODP />} />
      <Route path="/peotram" element={<PEOTRAM />} />
      <Route path="/sgso" element={<SGSO />} />
      <Route path="/imca-audit" element={<SafetyIMCAV2 />} />
      <Route path="/pre-ovid" element={<PreOVIDInspection />} />
      <Route path="/pre-ovid-inspection" element={<PreOVIDInspection />} />
      <Route path="/mlc-inspection" element={<MLCInspection />} />
      <Route path="/psc-package" element={<PSCPackage />} />
      <Route path="/gmud" element={<GMUDV2 />} />
      <Route path="/responsibility-matrix" element={<ResponsibilityMatrixV2 />} />
      <Route path="/safety-human-factors" element={<SafetyHumanFactorsV2 />} />
      <Route path="/safety-imca" element={<SafetyIMCAV2 />} />
      <Route path="/isps-security" element={<ISPSSecurityV2 />} />
      <Route path="/drill-simulator" element={<DrillSimulatorV2 />} />
      <Route path="/compliance-one" element={<ComplianceOneV2 />} />
      <Route path="/regulations" element={<RegulationsV2 />} />
      <Route path="/risk-matrix" element={<RiskMatrixV2 />} />
      <Route path="/evidences" element={<EvidencesV2 />} />
      <Route path="/due-diligence" element={<DueDiligenceV2 />} />
      <Route path="/whistleblower" element={<WhistleblowerV2 />} />
      <Route path="/security-center" element={<SecurityCenter />} />
      <Route path="/ai-operations-center" element={<AIOperationsCenter />} />
      <Route path="/auditoria-seguranca" element={<SecurityAuditCenter />} />
      <Route path="/security-scanner" element={<SecurityScanner />} />
      <Route path="/compliance-hub" element={<ComplianceOneV2 />} />
      <Route path="/compliance-roadmap" element={<ComplianceRoadmapPage />} />
      <Route path="/compliance-dashboard" element={<ComplianceRoadmapPage />} />
      <Route path="/compliance-alerts" element={<ComplianceRoadmapPage />} />
      <Route path="/compliance-scoring" element={<ComplianceRoadmapPage />} />
      <Route path="/nc-workflow" element={<ComplianceRoadmapPage />} />
      <Route path="/predictive-compliance" element={<ComplianceRoadmapPage />} />
      <Route path="/compliance-executive" element={<ExecutiveCompliancePage />} />
      <Route path="/executive-compliance" element={<ExecutiveCompliancePage />} />
      <Route path="/safety-guardian" element={<SafetyHumanFactorsV2 />} />
      
      {/* Diagnostic Components - 5 Soluções */}
      <Route path="/diagnostic-certificates" element={<DiagnosticCertificatesPage />} />
      <Route path="/diagnostic-dashboard" element={<DiagnosticDashboardPage />} />
      <Route path="/diagnostic-documents" element={<DiagnosticDocumentsPage />} />
      <Route path="/diagnostic-ncs" element={<DiagnosticNCsPage />} />
      <Route path="/diagnostic-reports" element={<DiagnosticReportsPage />} />
      
      {/* ============================================ */}
      {/* RH & PESSOAS (HR/DP MODULE) */}
      {/* ============================================ */}
      <Route path="/crew-ai-copilot" element={<CrewAICopilotPage />} />
      <Route path="/nautilus-people" element={<MaritimeCommandCenter />} />
      <Route path="/crew-management" element={<MaritimeCommandCenter />} />
      <Route path="/crew-wellness" element={<CrewWellnessPage />} />
      <Route path="/crew-wellbeing" element={<CrewWellnessPage />} />
      <Route path="/recruitment" element={<RecruitmentPage />} />
      <Route path="/agent-orchestration" element={<AgentOrchestrationPage />} />
      <Route path="/blockchain-compliance" element={<BlockchainCompliancePage />} />
      <Route path="/company-financials" element={<CompanyFinancialPage />} />
      <Route path="/medical-infirmary" element={<CrewWellnessPage />} />
      <Route path="/users" element={<Users />} />
      
      {/* HR/DP Module - New Routes */}
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
      
      {/* HR AI Modules */}
      <Route path="/hr-chatbot" element={<HRChatbotPage />} />
      <Route path="/hr/chatbot" element={<HRChatbotPage />} />
      <Route path="/assistente-rh" element={<HRChatbotPage />} />
      <Route path="/hr-ocr" element={<HRDocumentOCRPage />} />
      <Route path="/hr/document-ocr" element={<HRDocumentOCRPage />} />
      <Route path="/admissao-digital" element={<HRDocumentOCRPage />} />
      <Route path="/hr-turnover" element={<HRTurnoverPredictionPage />} />
      <Route path="/hr/turnover-prediction" element={<HRTurnoverPredictionPage />} />
      <Route path="/predicao-turnover" element={<HRTurnoverPredictionPage />} />
      
      {/* HR Payroll & Time Tracking */}
      <Route path="/hr-payroll" element={<Payroll />} />
      <Route path="/hr-time-tracking" element={<TimeTracking />} />
      
      {/* ============================================ */}
      {/* TREINAMENTOS */}
      {/* ============================================ */}
      <Route path="/training-lxp" element={<TrainingLXPPage />} />
      <Route path="/advanced-training-ai" element={<AdvancedTrainingAIPage />} />
      <Route path="/nautilus-academy" element={<AITraining />} />
      <Route path="/solas-isps-training" element={<AITraining />} />
      <Route path="/mentor-dp" element={<MentorDP />} />
      <Route path="/dp-intelligence" element={<DPIntelligence />} />
      
      {/* ============================================ */}
      {/* FINANÇAS & PROCUREMENT */}
      {/* ============================================ */}
      <Route path="/advanced-finance-ai" element={<AdvancedFinanceAIPage />} />
      <Route path="/finance-hub-ai" element={<FinanceHubAIPage />} />
      <Route path="/finance-command" element={<FinanceCommandCenter />} />
      <Route path="/voyage-accounting" element={<VoyageAccountingPage />} />
      <Route path="/analytics-command" element={<AnalyticsCommandCenter />} />
      <Route path="/operations-command" element={<OperationsCommandCenter />} />
      <Route path="/procurement-command" element={<ProcurementCommandCenter />} />
      <Route path="/task-management" element={<TaskManagement />} />
      
      {/* ============================================ */}
      {/* ESG & SUSTENTABILIDADE */}
      {/* ============================================ */}
      <Route path="/esg-emissions" element={<SustainabilityScorePage />} />
      <Route path="/waste-management" element={<SustainabilityScorePage />} />
      <Route path="/sustainability-score" element={<SustainabilityScorePage />} />
      
      {/* ============================================ */}
      {/* VIAGENS & LOGÍSTICA */}
      {/* ============================================ */}
      <Route path="/smart-logistics-ai" element={<SmartLogisticsAIPage />} />
      <Route path="/travel-command" element={<TravelCommandCenter />} />
      <Route path="/travel-ai-engine" element={<TravelAIEnginePage />} />
      <Route path="/weather-command" element={<WeatherCommandCenter />} />
      <Route path="/weather-route-planner" element={<WeatherRoutePlannerPage />} />
      
      {/* ============================================ */}
      {/* SISTEMA & CONFIGURAÇÕES */}
      {/* ============================================ */}
      <Route path="/quality-dashboard" element={<QualityDashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/security" element={<SecuritySettings />} />
      <Route path="/pwa-settings" element={<PWASettingsPage />} />
      <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
      <Route path="/language-settings" element={<LanguageSettingsPage />} />
      <Route path="/test-suite" element={<TestSuitePage />} />
      <Route path="/integrations" element={<IntegrationsCenter />} />
      <Route path="/api-gateway" element={<APIGateway />} />
      <Route path="/collaboration" element={<Collaboration />} />
      <Route path="/iot" element={<IoT />} />
      <Route path="/gamification" element={<Gamification />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/qa/preview" element={<CentralComando />} />
      <Route path="/production-deploy" element={<ProductionDeploy />} />
      
      {/* ============================================ */}
      {/* ADMIN & DASHBOARDS */}
      {/* ============================================ */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<CentralComando />} />
      <Route path="/executive-dashboard" element={<CentralComando />} />
      <Route path="/system-overview" element={<CentralComando />} />
      <Route path="/analytics" element={<AnalyticsCommandCenter />} />
      <Route path="/backup-audit" element={<SecurityAuditCenter />} />
      <Route path="/testing" element={<CentralComando />} />
      <Route path="/feedback" element={<CentralComando />} />
      <Route path="/saas-manager" element={<Admin />} />
      <Route path="/support-center" element={<SupportCenterPage />} />
      <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
      
      {/* ============================================ */}
      {/* ADMIN - INFRAESTRUTURA v4.0 */}
      {/* ============================================ */}
      <Route path="/admin/devops" element={<DevOpsDashboard />} />
      <Route path="/admin/ml-analytics" element={<MLAnalyticsDashboard />} />
      <Route path="/admin/scaling" element={<ScalingDashboard />} />
      <Route path="/admin/qa-testing" element={<QATestingDashboard />} />
      <Route path="/admin/documentation" element={<AdminDocumentationHub />} />
      <Route path="/admin/support" element={<AdminSupportCenter />} />
      
      {/* ============================================ */}
      {/* ADMIN - API & INTEGRAÇÕES v4.0 */}
      {/* ============================================ */}
      <Route path="/admin/api-keys" element={<APIKeysManagement />} />
      <Route path="/admin/webhooks" element={<WebhooksManagement />} />
      <Route path="/admin/api-docs" element={<APIDocs />} />
      <Route path="/admin/external-integrations" element={<ExternalIntegrationsHub />} />
      <Route path="/notifications-center" element={<NotificationCenterPage />} />
      
      {/* DEV ONLY - Route Dashboard */}
      <Route path="/dev-routes" element={<DevRoutesDashboard />} />
    </Route>
    
    {/* Catch-all: Redirecionar para central de comando */}
    <Route path="*" element={<Navigate to="/central-comando" replace />} />
  </Routes>
);

function App() {
  // PATCH v51: Mark app as loaded IMMEDIATELY on function call
  // This must happen as early as possible to prevent recovery UI from showing
  if (typeof window !== 'undefined') {
    (window as any).__NAUTI_APP_LOADED__ = true;
    
    // Remove initial loader synchronously
    const loader = document.getElementById('initial-loader');
    if (loader) loader.style.display = 'none';
  }

  React.useEffect(() => {
    console.log('[App v51] React app mounted');
    
    // Ensure loader is removed
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) initialLoader.remove();
    
    const recoveryUi = document.getElementById('recovery-ui');
    if (recoveryUi) recoveryUi.remove();
    
    return () => {
      console.log('[App v51] React app unmounting');
    };
  }, []);

  // ============================================
  // CRITICAL v33: Global unhandledrejection handler
  // Prevents async errors from crashing the app / causing infinite loops
  // ============================================
  React.useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn('[App] Unhandled promise rejection caught:', event.reason);
      event.preventDefault(); // Prevent default browser error handling
      
      // If it's an auth-related error, clear session and redirect
      const reason = String(event.reason || '');
      if (reason.includes('auth') || reason.includes('session') || reason.includes('token')) {
        try {
          Object.keys(localStorage)
            .filter(k => k.includes('supabase') || k.includes('sb-'))
            .forEach(k => localStorage.removeItem(k));
        } catch {}
        // Don't redirect here - let user continue
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Initialize analytics safely after component mount
  React.useEffect(() => {
    // Defer to avoid blocking initial render
    const timer = setTimeout(() => {
      try {
        usageTracker.init();
      } catch (e) {
        console.warn('[App] Analytics init failed:', e);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
