import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SmartLayout } from "./components/layout/SmartLayout";
import { NAVIGATION, SuspenseFallback } from "@/config/navigation";
import { initializeMonitoring } from "@/lib/monitoring/init";
import { CommandPalette } from "@/components/CommandPalette";
import { OfflineBanner } from "@/components/OfflineBanner";
import { systemWatchdog } from "@/ai/watchdog";
import { webVitalsService } from "@/services/web-vitals-service";
import { OffshoreLoader, PageSkeleton } from "@/components/LoadingStates";
import { lazyWithPreload, preloadStrategy } from "@/lib/performance/lazy-with-preload";

// Páginas mais usadas - carregamento prioritário
import Index from "@/pages/Index";
const Dashboard = lazyWithPreload(() => import("@/pages/Dashboard"));
const Travel = lazyWithPreload(() => import("@/pages/Travel"));

// Páginas secundárias - carregamento normal
const PriceAlerts = React.lazy(() => import("@/modules/features/price-alerts"));
const SensorsHub = React.lazy(() => import("@/modules/sensors-hub"));
const CrewValidation = React.lazy(() => import("@/pages/admin/crew/validation"));
const IntegrationsValidation = React.lazy(() => import("@/pages/admin/integrations/validation"));
const AnalyticsValidation = React.lazy(() => import("@/pages/admin/analytics/validation"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Reservations = React.lazy(() => import("@/pages/Reservations"));
const ChecklistsInteligentes = React.lazy(() => import("@/pages/ChecklistsInteligentes"));
const BridgeLink = React.lazy(() => import("@/pages/BridgeLink"));
const PEODP = React.lazy(() => import("@/pages/PEODP"));
const DPIncidents = React.lazy(() => import("@/pages/DPIncidents"));
const DPIntelligence = React.lazy(() => import("@/pages/DPIntelligence"));
const DPSyncEngine = React.lazy(() => import("@/pages/DPSyncEngine"));
const SGSO = React.lazy(() => import("@/pages/SGSO"));
const SGSOReportPage = React.lazy(() => import("@/pages/SGSOReportPage"));
const SGSOAuditPage = React.lazy(() => import("@/pages/SGSOAuditPage"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Documents = React.lazy(() => import("@/modules/document-hub/components/DocumentsAI"));
const DocumentHub = React.lazy(() => import("@/modules/document-hub"));
const AIAssistant = React.lazy(() => import("@/pages/AIAssistant"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));
const HumanResources = React.lazy(() => import("@/pages/HumanResources"));
const Communication = React.lazy(() => import("@/modules/connectivity/communication"));
const Intelligence = React.lazy(() => import("@/pages/Intelligence"));
const Maritime = React.lazy(() => import("@/pages/Maritime"));
const MaritimeSupremo = React.lazy(() => import("@/pages/MaritimeSupremo"));
const NautilusOne = React.lazy(() => import("@/pages/NautilusOne"));
const FuelOptimizerPage = React.lazy(() => import("@/pages/FuelOptimizerPage"));
const ForecastPage = React.lazy(() => import("@/pages/Forecast"));
const ForecastGlobal = React.lazy(() => import("@/pages/ForecastGlobal"));
const MaintenanceDashboard = React.lazy(() => import("@/pages/Maintenance"));
const ComplianceHub = React.lazy(() => import("@/pages/compliance/ComplianceHub"));
const DPIntelligenceCenter = React.lazy(() => import("@/modules/intelligence/dp-intelligence"));
const Innovation = React.lazy(() => import("@/pages/Innovation"));
const Optimization = React.lazy(() => import("@/pages/Optimization"));
const Collaboration = React.lazy(() => import("@/pages/Collaboration"));
const Voice = React.lazy(() => import("@/modules/assistants/voice-assistant"));
const Portal = React.lazy(() => import("@/modules/hr/employee-portal"));
const AR = React.lazy(() => import("@/pages/AR"));
const IoT = React.lazy(() => import("@/pages/IoT"));
const Blockchain = React.lazy(() => import("@/pages/Blockchain"));
const Gamification = React.lazy(() => import("@/pages/Gamification"));
const PredictiveAnalytics = React.lazy(() => import("@/pages/PredictiveAnalytics"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const ControlHub = React.lazy(() => import("@/pages/ControlHub"));
const APITester = React.lazy(() => import("@/pages/admin/api-tester"));
const APIStatus = React.lazy(() => import("@/pages/admin/api-status"));
const ControlPanel = React.lazy(() => import("@/pages/admin/control-panel"));
const TestDashboard = React.lazy(() => import("@/pages/admin/tests"));
const CIHistory = React.lazy(() => import("@/pages/admin/ci-history"));
const AdminAnalytics = React.lazy(() => import("@/pages/admin/analytics"));
const AdminBI = React.lazy(() => import("@/pages/admin/bi"));
const AdminWall = React.lazy(() => import("@/pages/admin/wall"));
const AdminChecklists = React.lazy(() => import("@/pages/admin/checklists"));
const AdminChecklistsDashboard = React.lazy(() => import("@/pages/admin/checklists-dashboard"));
const SystemHealth = React.lazy(() => import("@/pages/admin/system-health"));
const Forecast = React.lazy(() => import("@/pages/admin/forecast"));
const DocumentsAI = React.lazy(() => import("@/pages/admin/documents-ai"));
const DocumentAIEditor = React.lazy(() => import("@/pages/admin/documents/ai-editor"));
const Assistant = React.lazy(() => import("@/pages/admin/assistant"));
const AssistantLogs = React.lazy(() => import("@/pages/admin/assistant-logs"));
const AdminCollaboration = React.lazy(() => import("@/pages/admin/collaboration"));
const DocumentList = React.lazy(() => import("@/pages/admin/documents/DocumentList"));
const DocumentView = React.lazy(() => import("@/pages/admin/documents/DocumentView"));
const DocumentHistory = React.lazy(() => import("@/pages/admin/documents/DocumentHistory"));
const DocumentEditorPage = React.lazy(() => import("@/pages/admin/documents/DocumentEditorPage"));
const CollaborativeEditor = React.lazy(() => import("@/pages/admin/documents/CollaborativeEditor"));
const DocumentEditorDemo = React.lazy(() => import("@/pages/admin/documents/DocumentEditorDemo"));
const RestoreDashboard = React.lazy(() => import("@/pages/admin/documents/restore-dashboard"));
const ExecutionLogs = React.lazy(() => import("@/pages/admin/automation/execution-logs"));
const RestoreReportLogs = React.lazy(() => import("@/pages/admin/reports/logs"));
const AssistantReportLogs = React.lazy(() => import("@/pages/admin/reports/assistant"));
const DashboardLogs = React.lazy(() => import("@/pages/admin/reports/dashboard-logs"));
const RestoreAnalytics = React.lazy(() => import("@/pages/admin/reports/restore-analytics"));
const PersonalRestoreDashboard = React.lazy(() => import("@/pages/admin/restore/personal"));
const AdminDashboard = React.lazy(() => import("@/pages/admin/dashboard"));
const SmartWorkflows = React.lazy(() => import("@/pages/admin/workflows"));
const WorkflowDetail = React.lazy(() => import("@/pages/admin/workflows/detail"));
const Templates = React.lazy(() => import("@/pages/admin/templates"));
const EditTemplatePage = React.lazy(() => import("@/pages/admin/templates/edit/[id]"));
const HealthMonitorDemo = React.lazy(() => import("@/pages/HealthMonitorDemo"));
const Health = React.lazy(() => import("@/pages/Health"));
const Offline = React.lazy(() => import("@/pages/Offline"));
const Modules = React.lazy(() => import("@/pages/Modules"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const SmartLayoutDemo = React.lazy(() => import("@/pages/SmartLayoutDemo"));
const TemplateEditorDemo = React.lazy(() => import("@/pages/TemplateEditorDemo"));
const Unauthorized = React.lazy(() => import("@/pages/Unauthorized"));
const RestoreChartEmbed = React.lazy(() => import("@/pages/embed/RestoreChartEmbed"));
const TVWallLogs = React.lazy(() => import("@/pages/tv/LogsPage"));
const TemplateEditorPage = React.lazy(() => import("@/pages/admin/templates/editor"));
const TemplateValidationPage = React.lazy(() => import("@/pages/admin/templates/validation"));
const CrewConsolidationValidationPage = React.lazy(() => import("@/pages/admin/crew/consolidation-validation"));
const DocumentHubValidationPage = React.lazy(() => import("@/pages/admin/document-hub/validation"));
const MissionControlValidationPage = React.lazy(() => import("@/pages/admin/mission-control/validation"));
const DocumentationValidationPage = React.lazy(() => import("@/pages/admin/documentation/validation"));
const DocumentTemplatesValidationPage = React.lazy(() => import("@/pages/admin/document-templates/validation"));
const SatelliteTrackerValidationPage = React.lazy(() => import("@/pages/admin/satellite-tracker/validation"));
const NavigationCopilotValidationPage = React.lazy(() => import("@/pages/admin/navigation-copilot/validation"));
const TemplateEditorValidationPage = React.lazy(() => import("@/pages/admin/template-editor/validation"));
const DocumentsConsolidationValidationPage = React.lazy(() => import("@/pages/admin/documents-consolidation/validation"));
const PriceAlertsValidationPage = React.lazy(() => import("@/pages/admin/price-alerts/validation"));
const IncidentsConsolidationValidationPage = React.lazy(() => import("@/pages/admin/incidents-consolidation/validation"));
const SensorHubValidationPage = React.lazy(() => import("@/pages/admin/sensor-hub/validation"));
const TestsValidationPage = React.lazy(() => import("@/pages/admin/tests"));
const MMIJobsPanel = React.lazy(() => import("@/pages/MMIJobsPanel"));
const MmiBI = React.lazy(() => import("@/pages/MmiBI"));
const MMIHistory = React.lazy(() => import("@/pages/MMIHistory"));
const MMIHistoryAdmin = React.lazy(() => import("@/pages/admin/mmi/history"));
const MMIForecast = React.lazy(() => import("@/pages/admin/mmi/forecast/page"));
const MMIOrders = React.lazy(() => import("@/pages/admin/mmi/orders"));
const MMITasks = React.lazy(() => import("@/pages/MMITasks"));
const MMIForecastPage = React.lazy(() => import("@/pages/MMIForecastPage"));
const PerformanceAnalysis = React.lazy(() => import("@/pages/admin/PerformanceAnalysis"));
const JobCreationWithSimilarExamples = React.lazy(() => import("@/pages/JobCreationWithSimilarExamples"));
const CopilotJobForm = React.lazy(() => import("@/pages/CopilotJobForm"));
const CopilotJobFormAdmin = React.lazy(() => import("@/pages/admin/copilot-job-form"));
const DashboardAuditorias = React.lazy(() => import("@/pages/admin/dashboard-auditorias"));
const MetricasRisco = React.lazy(() => import("@/pages/admin/metricas-risco"));
const AdminSGSO = React.lazy(() => import("@/pages/admin/sgso"));
const SGSOHistoryPage = React.lazy(() => import("@/pages/admin/sgso/history/[vesselId]"));
const SGSOAuditHistory = React.lazy(() => import("@/pages/admin/sgso/history"));
const SGSOAuditReview = React.lazy(() => import("@/pages/admin/sgso/review/[id]"));
const AuditoriasIMCA = React.lazy(() => import("@/pages/admin/auditorias-imca"));
const AuditoriasLista = React.lazy(() => import("@/pages/admin/auditorias-lista"));
const IMCAAudit = React.lazy(() => import("@/pages/IMCAAudit"));
const Simulations = React.lazy(() => import("@/pages/admin/simulations"));
const CronMonitor = React.lazy(() => import("@/pages/admin/cron-monitor"));
const TrainingManagement = React.lazy(() => import("@/pages/admin/training"));
const TrainingAcademyAdmin = React.lazy(() => import("@/pages/admin/training-academy"));
const TrainingAcademyEnhanced = React.lazy(() => import("@/pages/admin/training-academy-enhanced"));
const IncidentsPage = React.lazy(() => import("@/pages/admin/incidents"));
const IncidentReportsComplete = React.lazy(() => import("@/pages/admin/incident-reports-complete"));
const PerformanceDashboard = React.lazy(() => import("@/pages/admin/performance-dashboard"));
const BackupAudit = React.lazy(() => import("@/pages/BackupAudit"));
const RiskAudit = React.lazy(() => import("@/pages/admin/risk-audit"));
const CertViewer = React.lazy(() => import("@/components/cert/CertViewer"));
const QuizPage = React.lazy(() => import("@/pages/admin/QuizPage"));
const ExternalAuditSystem = React.lazy(() => import("@/pages/ExternalAuditSystem"));
const ForecastHistoryPage = React.lazy(() => import("@/pages/admin/mmi/forecast/ForecastHistory"));
const BIForecastsPage = React.lazy(() => import("@/pages/admin/bi/forecasts"));
const PEODPAuditPage = React.lazy(() => import("@/pages/admin/peodp-audit"));
const PEODPWizardComplete = React.lazy(() => import("@/pages/admin/peodp-wizard-complete"));
const VaultAI = React.lazy(() => import("@/modules/vault_ai/pages/VaultAIPage"));
const VaultAIComplete = React.lazy(() => import("@/pages/admin/vault-ai-complete"));
const Patch66Dashboard = React.lazy(() => import("@/pages/Patch66Dashboard"));
const CrewDossierPage = React.lazy(() => import("@/pages/CrewDossier"));
const ChannelManagerHub = React.lazy(() => import("@/components/channel-manager/ChannelManagerHub"));
const TrainingAcademyHub = React.lazy(() => import("@/components/academy/TrainingAcademy"));
const CrewWellbeingNew = React.lazy(() => import("@/components/crew-wellbeing/CrewWellbeingHub"));
const ConsolidatedCrew = React.lazy(() => import("@/pages/crew"));
const SGSOManagerPage = React.lazy(() => import("@/components/sgso/SGSOManager"));

// New Module Imports - PATCH 66.0 Updated Paths
const FeedbackModule = React.lazy(() => import("@/modules/operations/feedback"));
// PATCH 191.0: Consolidated Fleet Module
const FleetModule = React.lazy(() => import("@/modules/fleet"));
const PerformanceModule = React.lazy(() => import("@/modules/operations/performance"));
const ReportsModule = React.lazy(() => import("@/modules/compliance/reports"));
const RealTimeWorkspace = React.lazy(() => import("@/modules/workspace/real-time-workspace"));
const ChannelManager = React.lazy(() => import("@/modules/connectivity/channel-manager"));
const TrainingAcademy = React.lazy(() => import("@/modules/hr/training-academy"));
const MaintenancePlanner = React.lazy(() => import("@/modules/maintenance-planner"));
const MissionLogs = React.lazy(() => import("@/pages/MissionLogsPage"));
const TravelManagementPage = React.lazy(() => import("@/pages/TravelManagementPage"));
const IncidentReports = React.lazy(() => import("@/modules/incident-reports"));
const FuelOptimizer = React.lazy(() => import("@/modules/logistics/fuel-optimizer"));
const WeatherDashboard = React.lazy(() => import("@/modules/weather-dashboard"));
const VoyagePlanner = React.lazy(() => import("@/modules/planning/voyage-planner"));
const TaskAutomation = React.lazy(() => import("@/modules/task-automation"));
const AuditCenter = React.lazy(() => import("@/modules/compliance/audit-center"));
const DeveloperStatus = React.lazy(() => import("@/pages/developer/status"));
const ModuleStatus = React.lazy(() => import("@/pages/developer/ModuleStatus"));
const TestsDashboard = React.lazy(() => import("@/pages/developer/TestsDashboard"));
const EmergencyResponse = React.lazy(() => import("@/modules/emergency/emergency-response"));
const ExecutiveReport = React.lazy(() => import("@/pages/ExecutiveReport"));
const ComplianceHubModule = React.lazy(() => import("@/modules/compliance/compliance-hub"));
const AIInsights = React.lazy(() => import("@/modules/intelligence/ai-insights"));
const ModuleHealth = React.lazy(() => import("@/pages/developer/module-health"));
const WatchdogMonitor = React.lazy(() => import("@/pages/developer/watchdog-monitor"));
// PATCH 89: Consolidated Dashboards
const OperationsDashboard = React.lazy(() => import("@/modules/operations/operations-dashboard"));
const PEOTRAM = React.lazy(() => import("@/pages/PEOTRAM"));
const LogisticsHub = React.lazy(() => import("@/modules/logistics/logistics-hub"));
const CrewWellbeing = React.lazy(() => import("@/modules/operations/crew-wellbeing"));
const SatelliteTracker = React.lazy(() => import("@/modules/logistics/satellite-tracker"));
const ProjectTimeline = React.lazy(() => import("@/modules/project-timeline"));
const UserManagement = React.lazy(() => import("@/modules/user-management"));
// PATCH 426-430: Consolidated Mission Engine
const MissionEngine = React.lazy(() => import("@/modules/mission-engine"));
// PATCH 427: Drone Commander
const DroneCommander = React.lazy(() => import("@/pages/DroneCommander"));
// PATCH 428: Sensors Hub
const SensorsHubPage = React.lazy(() => import("@/pages/SensorsHub"));
// PATCH 429: Satcom
const SatcomPage = React.lazy(() => import("@/pages/Satcom"));
const MissionControl = React.lazy(() => import("@/modules/emergency/mission-control"));
const InsightDashboard = React.lazy(() => import("@/pages/mission-control/insight-dashboard"));
const AutonomyConsole = React.lazy(() => import("@/pages/mission-control/autonomy"));
const AICommandCenter = React.lazy(() => import("@/pages/mission-control/ai-command-center"));
const WorkflowEngine = React.lazy(() => import("@/pages/mission-control/workflow-engine"));
const NautilusLLM = React.lazy(() => import("@/pages/mission-control/nautilus-llm"));
const ThoughtChain = React.lazy(() => import("@/pages/mission-control/thought-chain"));
const NautilusOS = React.lazy(() => import("@/pages/NautilusOS"));
const FinanceHub = React.lazy(() => import("@/modules/finance-hub"));
const APIGateway = React.lazy(() => import("@/modules/connectivity/api-gateway"));
const APIGatewayDocs = React.lazy(() => import("@/pages/api-gateway-docs"));
const AutomationModule = React.lazy(() => import("@/modules/intelligence/automation"));
const RiskManagementModule = React.lazy(() => import("@/modules/emergency/risk-management"));
const AnalyticsCoreModule = React.lazy(() => import("@/modules/intelligence/analytics-core"));
const VoiceAssistantModule = React.lazy(() => import("@/modules/assistants/voice-assistant"));
const NotificationsCenterModule = React.lazy(() => import("@/modules/connectivity/notifications-center"));
const AIModulesStatus = React.lazy(() => import("@/pages/AIModulesStatus"));
// PATCH 466: Consolidated Crew Management (crew-management → crew)
const CrewManagement = React.lazy(() => import("@/modules/crew"));
// PATCH 407: Sonar AI Module
const SonarAI = React.lazy(() => import("@/modules/sonar-ai"));
// Validation Pages - Patches 401-410
const TemplateEditorValidation = React.lazy(() => import("@/pages/admin/template-editor/validation"));
const DocumentsConsolidationValidation = React.lazy(() => import("@/pages/admin/documents-consolidation/validation"));
const PriceAlertsValidation = React.lazy(() => import("@/pages/admin/price-alerts/validation"));
const IncidentsConsolidationValidation = React.lazy(() => import("@/pages/admin/incidents-consolidation/validation"));
const SensorHubValidation = React.lazy(() => import("@/pages/admin/sensor-hub/validation"));
const CrewConsolidationValidation = React.lazy(() => import("@/pages/admin/crew-consolidation/validation"));
const SonarAIValidation = React.lazy(() => import("@/pages/admin/sonar-ai/validation"));
const TestAutomationValidation = React.lazy(() => import("@/pages/admin/test-automation/validation"));
const TemplatesApplicationValidation = React.lazy(() => import("@/pages/admin/templates-application/validation"));
const MissionControlConsolidationValidation = React.lazy(() => import("@/pages/admin/mission-control-consolidation/validation"));
// PATCH 411-415 Validation Pages
const PriceAlertsFinalizadoValidation = React.lazy(() => import("@/pages/admin/price-alerts-finalizado/validation"));
const DocumentsConsolidadoValidation = React.lazy(() => import("@/pages/admin/documents-consolidado/validation"));
const UnifiedLogsPanelValidation = React.lazy(() => import("@/pages/admin/unified-logs-panel/validation"));
const CoordinationAIValidation = React.lazy(() => import("@/pages/admin/coordination-ai/validation"));
const ExperimentalModulesValidation = React.lazy(() => import("@/pages/admin/experimental-modules/validation"));
// PATCH 416-420 Validation Pages
const CrewConsolidadoValidation = React.lazy(() => import("@/pages/admin/crew-consolidado/validation"));
const TemplatesEditorValidation = React.lazy(() => import("@/pages/admin/templates-editor/validation"));
const PriceAlertsNotificationValidation = React.lazy(() => import("@/pages/admin/price-alerts-notification/validation"));
const MissionControlRealtimeValidation = React.lazy(() => import("@/pages/admin/mission-control-realtime/validation"));
const SatcomSimulationValidation = React.lazy(() => import("@/pages/admin/satcom-simulation/validation"));
// PATCH 421-425 Validation Pages
const DocumentsConsolidatedValidation = React.lazy(() => import("@/pages/admin/documents-consolidated/validation"));
const OceanSonarValidation = React.lazy(() => import("@/pages/admin/ocean-sonar/validation"));
const UnderwaterDroneValidation = React.lazy(() => import("@/pages/admin/underwater-drone/validation"));
// PATCH 426-430 Validation Pages
const MissionEngineValidation = React.lazy(() => import("@/pages/admin/mission-engine/validation"));
const DroneCommanderValidation = React.lazy(() => import("@/pages/admin/drone-commander/validation"));
const SatcomValidation = React.lazy(() => import("@/pages/admin/satcom/validation"));
const MissionConsolidationValidation = React.lazy(() => import("@/pages/admin/mission-consolidation/validation"));
// PATCH 431-435 Validation Pages
const RoutePlannerValidation = React.lazy(() => import("@/pages/admin/route-planner/validation"));
const NavigationCopilotV2Validation = React.lazy(() => import("@/pages/admin/navigation-copilot-v2/validation"));
const DeepRiskAIValidation = React.lazy(() => import("@/pages/admin/deep-risk-ai/validation"));
const TemplatesSystemValidation = React.lazy(() => import("@/pages/admin/templates-system/validation"));
const SonarAIValidationV2 = React.lazy(() => import("@/pages/admin/sonar-ai/validation"));
// PATCH 436-440 Validation Pages
const CrewConsolidationValidationPatch437 = React.lazy(() => import("@/pages/admin/crew-consolidation/validation"));
const PriceAlertsValidationPatch438 = React.lazy(() => import("@/pages/admin/price-alerts/validation"));
const IncidentReportsV2Validation = React.lazy(() => import("@/pages/admin/incident-reports-v2/validation"));
const AICoordinationValidation = React.lazy(() => import("@/pages/admin/ai-coordination/validation"));
// PATCH 441-445 Validation Pages
const SensorHubV2Validation = React.lazy(() => import("@/pages/admin/sensor-hub-v2/validation"));
const SATCOMv2Validation = React.lazy(() => import("@/pages/admin/satcom-v2/validation"));
const OceanSonarV3Validation = React.lazy(() => import("@/pages/admin/ocean-sonar-v3/validation"));
const DocumentsUnificationValidation = React.lazy(() => import("@/pages/admin/documents-unification/validation"));
const MissionEngineV2Validation = React.lazy(() => import("@/pages/admin/mission-engine-v2/validation"));

// Loading component otimizado para offshore
const LoadingSpinner = () => {
  console.log("🔄 LoadingSpinner renderizado");
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    </div>
  );
};

// Create QueryClient com configurações otimizadas para offshore
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - manter em cache (antes cacheTime)
      retry: 3, // Tentar 3 vezes em caso de falha
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Não recarregar ao focar janela
      refetchOnReconnect: true, // Recarregar ao reconectar
    },
  },
});

// Component to handle redirect from 404.html
// This component restores the original route when the app loads after a 404 redirect
const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      // Check if there's a stored redirect path from 404.html
      const redirectPath = sessionStorage.getItem("redirectPath");
      
      // Only redirect if:
      // 1. There is a stored path
      // 2. The stored path is not the home page
      // 3. We are currently on the home page (to prevent redirect loops)
      if (redirectPath && redirectPath !== "/" && location.pathname === "/") {
        // Clear the stored path to prevent future redirects
        sessionStorage.removeItem("redirectPath");
        
        // Navigate to the stored path with replace to avoid adding to history
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      // Handle cases where sessionStorage is not available
      console.warn("Failed to restore navigation path:", error);
    }
  }, [navigate, location]);

  return null;
};

// Flag global para evitar dupla inicialização
let isInitialized = false;

function App() {
  // Initialize monitoring systems on app start
  useEffect(() => {
    // Evita dupla inicialização causada por React StrictMode
    if (isInitialized) {
      console.log("⚠️ App já inicializado, pulando inicialização duplicada");
      return;
    }
    
    isInitialized = true;
    console.log("🚀 Nautilus One - Inicializando sistema...");
    
    try {
      initializeMonitoring();
      console.log("✅ Monitoring inicializado");
    } catch (error) {
      console.error("❌ Erro ao inicializar monitoring:", error);
    }
    
    // PATCH 85.0 - Iniciar System Watchdog automaticamente
    try {
      systemWatchdog.start();
      console.log("✅ System Watchdog iniciado");
    } catch (error) {
      console.error("❌ Erro ao iniciar watchdog:", error);
    }
    
    // Preload módulos críticos durante idle time (simplificado)
    try {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          console.log("⏳ Iniciando preload de módulos críticos...");
          Dashboard.preload().then(() => console.log("✅ Dashboard preloaded"));
          Travel.preload().then(() => console.log("✅ Travel preloaded"));
        });
      } else {
        setTimeout(() => {
          console.log("⏳ Iniciando preload de módulos críticos (fallback)...");
          Dashboard.preload().then(() => console.log("✅ Dashboard preloaded"));
          Travel.preload().then(() => console.log("✅ Travel preloaded"));
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Erro no preload:", error);
    }
    
    console.log("✅ App inicializado com sucesso");
    
    return () => {
      systemWatchdog.stop();
      isInitialized = false; // Reset para hot-reload em dev
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <OrganizationProvider>
            <QueryClientProvider client={queryClient}>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <CommandPalette />
                <OfflineBanner />
                <RedirectHandler />
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Routes outside SmartLayout (no auth, no navigation) */}
                    <Route path="/embed/restore-chart" element={<RestoreChartEmbed />} />
                    <Route path="/tv/logs" element={<TVWallLogs />} />
                    <Route path="/cert/:token" element={<CertViewer />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* All routes wrapped in SmartLayout */}
                    <Route element={<SmartLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/price-alerts" element={<PriceAlerts />} />
                      <Route path="/sensors-hub" element={<SensorsHub />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/reservations" element={<Reservations />} />
                      <Route path="/checklists" element={<ChecklistsInteligentes />} />
                      <Route path="/checklists-inteligentes" element={<ChecklistsInteligentes />} />
                      <Route path="/peotram" element={<PEOTRAM />} />
                      <Route path="/peo-tram" element={<PEOTRAM />} />
                      <Route path="/peo-dp" element={<PEODP />} />
                      <Route path="/dp-incidents" element={<DPIncidents />} />
                      <Route path="/dp-intelligence" element={<DPIntelligence />} />
                      <Route path="/dp-sync-engine" element={<DPSyncEngine />} />
                      <Route path="/bridgelink" element={<BridgeLink />} />
                      <Route path="/sgso" element={<SGSO />} />
                      <Route path="/sgso/report" element={<SGSOReportPage />} />
                      <Route path="/sgso/audit" element={<SGSOAuditPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/intelligent-documents" element={<Documents />} />
                      <Route path="/dashboard/document-hub" element={<DocumentHub />} />
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/travel" element={<Travel />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/hr" element={<HumanResources />} />
                      <Route path="/communication" element={<Communication />} />
                      <Route path="/intelligence" element={<Intelligence />} />
                      {/* PATCH 191.0: Deprecated - Consolidated into /modules/fleet */}
                      {/* <Route path="/maritime" element={<Maritime />} /> */}
                      {/* <Route path="/maritime-supremo" element={<MaritimeSupremo />} /> */}
                      <Route path="/maritime" element={<FleetModule />} />
                      <Route path="/maritime-supremo" element={<FleetModule />} />
                      <Route path="/nautilus-one" element={<NautilusOne />} />
                      <Route path="/forecast" element={<ForecastPage />} />
                      <Route path="/forecast/global" element={<ForecastGlobal />} />
                      <Route path="/forecast-global" element={<ForecastGlobal />} />
                      <Route path="/maintenance" element={<MaintenanceDashboard />} />
                      <Route path="/compliance" element={<ComplianceHub />} />
                      <Route path="/control-hub" element={<ControlHub />} />
                      <Route path="/vault-ai" element={<VaultAI />} />
                      <Route path="/admin/vault-ai-search" element={<VaultAIComplete />} />
                      <Route path="/patch66" element={<Patch66Dashboard />} />
                      <Route path="/patch-66" element={<Patch66Dashboard />} />
                      <Route path="/mmi/jobs" element={<MMIJobsPanel />} />
                      <Route path="/mmi/bi" element={<MmiBI />} />
                      <Route path="/mmi/history" element={<MMIHistory />} />
                      <Route path="/mmi/tasks" element={<MMITasks />} />
                      <Route path="/mmi/forecast" element={<MMIForecastPage />} />
                      <Route path="/mmi/job-creation-demo" element={<JobCreationWithSimilarExamples />} />
                      <Route path="/admin/mmi/forecast/history" element={<ForecastHistoryPage />} />
                      <Route path="/admin/bi/forecasts" element={<BIForecastsPage />} />
                      <Route path="/copilot/job-form" element={<CopilotJobForm />} />
                      <Route path="/innovation" element={<Innovation />} />
                      <Route path="/optimization" element={<Optimization />} />
                      <Route path="/collaboration" element={<Collaboration />} />
                      <Route path="/voice" element={<Voice />} />
                      <Route path="/portal" element={<Portal />} />
                      <Route path="/crew-dossier" element={<CrewDossierPage />} />
                      <Route path="/crew" element={<ConsolidatedCrew />} />
                      <Route path="/hr/crew" element={<ConsolidatedCrew />} />
                      <Route path="/channel-manager-new" element={<ChannelManagerHub />} />
                      <Route path="/academy-new" element={<TrainingAcademyHub />} />
                      <Route path="/crew-wellbeing-new" element={<CrewWellbeingNew />} />
                      <Route path="/sgso-manager" element={<SGSOManagerPage />} />
                      <Route path="/ar" element={<AR />} />
                      <Route path="/iot" element={<IoT />} />
                      <Route path="/blockchain" element={<Blockchain />} />
                      <Route path="/gamification" element={<Gamification />} />
                      <Route path="/predictive" element={<PredictiveAnalytics />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/api-tester" element={<APITester />} />
                      <Route path="/admin/api-status" element={<APIStatus />} />
                      <Route path="/admin/control-panel" element={<ControlPanel />} />
                      <Route path="/admin/tests" element={<TestDashboard />} />
                      <Route path="/admin/ci-history" element={<CIHistory />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/admin/bi" element={<AdminBI />} />
                      <Route path="/admin/performance-analysis" element={<PerformanceAnalysis />} />
                      <Route path="/admin/wall" element={<AdminWall />} />
                      <Route path="/admin/checklists" element={<AdminChecklists />} />
                      <Route path="/admin/checklists/dashboard" element={<AdminChecklistsDashboard />} />
                      <Route path="/admin/system-health" element={<SystemHealth />} />
                      <Route path="/admin/forecast" element={<Forecast />} />
                      <Route path="/admin/assistant" element={<Assistant />} />
                      <Route path="/admin/ai-assistant" element={<Assistant />} />
                      <Route path="/admin/mmi" element={<MMIJobsPanel />} />
                      <Route path="/admin/mmi/history" element={<MMIHistoryAdmin />} />
                      <Route path="/admin/mmi/forecast" element={<MMIForecast />} />
                      <Route path="/admin/mmi/orders" element={<MMIOrders />} />
                      <Route path="/admin/assistant/logs" element={<AssistantLogs />} />
                      <Route path="/admin/assistant/history" element={<AssistantLogs />} />
                      <Route path="/admin/collaboration" element={<AdminCollaboration />} />
                      <Route path="/admin/copilot-job-form" element={<CopilotJobFormAdmin />} />
                      <Route path="/admin/workflows" element={<SmartWorkflows />} />
                      <Route path="/admin/workflows/:id" element={<WorkflowDetail />} />
                      <Route path="/admin/documents" element={<DocumentList />} />
                      <Route path="/admin/documents/ai" element={<DocumentAIEditor />} />
                      <Route path="/admin/documents/editor" element={<DocumentEditorPage />} />
                      <Route path="/admin/templates" element={<Templates />} />
                      <Route path="/admin/templates/edit/:id" element={<EditTemplatePage />} />
                      <Route path="/admin/documents/demo" element={<DocumentEditorDemo />} />
                      <Route path="/admin/templates/editor" element={<TemplateEditorPage />} />
                      <Route path="/admin/templates/validation" element={<TemplateValidationPage />} />
                      <Route path="/admin/crew/consolidation-validation" element={<CrewConsolidationValidationPage />} />
                      <Route path="/admin/crew/validation" element={<CrewValidation />} />
                      <Route path="/admin/integrations/validation" element={<IntegrationsValidation />} />
                      <Route path="/admin/analytics/validation" element={<AnalyticsValidation />} />
                      <Route path="/admin/document-hub/validation" element={<DocumentHubValidationPage />} />
                      <Route path="/admin/mission-control/validation" element={<MissionControlValidationPage />} />
                      <Route path="/admin/documentation/validation" element={<DocumentationValidationPage />} />
                      <Route path="/admin/document-templates/validation" element={<DocumentTemplatesValidationPage />} />
                      <Route path="/admin/satellite-tracker/validation" element={<SatelliteTrackerValidationPage />} />
                      <Route path="/admin/navigation-copilot/validation" element={<NavigationCopilotValidationPage />} />
                      <Route path="/admin/template-editor/validation" element={<TemplateEditorValidationPage />} />
                      <Route path="/admin/documents-consolidation/validation" element={<DocumentsConsolidationValidationPage />} />
                      <Route path="/admin/price-alerts/validation" element={<PriceAlertsValidationPage />} />
                      <Route path="/admin/incidents-consolidation/validation" element={<IncidentsConsolidationValidationPage />} />
                      <Route path="/admin/sensor-hub/validation" element={<SensorHubValidationPage />} />
                      <Route path="/admin/tests/validation" element={<TestsValidationPage />} />
                      <Route path="/admin/documents-consolidated/validation" element={<DocumentsConsolidatedValidation />} />
                      <Route path="/admin/ocean-sonar/validation" element={<OceanSonarValidation />} />
                      <Route path="/admin/underwater-drone/validation" element={<UnderwaterDroneValidation />} />
                      <Route path="/admin/mission-engine/validation" element={<MissionEngineValidation />} />
                      <Route path="/admin/drone-commander/validation" element={<DroneCommanderValidation />} />
                      <Route path="/admin/satcom/validation" element={<SatcomValidation />} />
                      <Route path="/admin/mission-consolidation/validation" element={<MissionConsolidationValidation />} />
                      <Route path="/admin/route-planner/validation" element={<RoutePlannerValidation />} />
                      <Route path="/admin/navigation-copilot-v2/validation" element={<NavigationCopilotV2Validation />} />
                      <Route path="/admin/deep-risk-ai/validation" element={<DeepRiskAIValidation />} />
                      <Route path="/admin/templates-system/validation" element={<TemplatesSystemValidation />} />
                      <Route path="/admin/sonar-ai-v2/validation" element={<SonarAIValidationV2 />} />
                      
                      {/* Validation Routes - Patches 436-440 */}
                      <Route path="/admin/underwater-drone/validation" element={<UnderwaterDroneValidation />} />
                      <Route path="/admin/crew-consolidation/validation" element={<CrewConsolidationValidationPatch437 />} />
                      <Route path="/admin/price-alerts/validation" element={<PriceAlertsValidationPatch438 />} />
                      <Route path="/admin/incident-reports-v2/validation" element={<IncidentReportsV2Validation />} />
                      <Route path="/admin/ai-coordination/validation" element={<AICoordinationValidation />} />
                      
                      {/* Validation Routes - Patches 441-445 */}
                      <Route path="/admin/sensor-hub-v2/validation" element={<SensorHubV2Validation />} />
                      <Route path="/admin/satcom-v2/validation" element={<SATCOMv2Validation />} />
                      <Route path="/admin/ocean-sonar-v3/validation" element={<OceanSonarV3Validation />} />
                      <Route path="/admin/documents-unification/validation" element={<DocumentsUnificationValidation />} />
                      <Route path="/admin/mission-engine-v2/validation" element={<MissionEngineV2Validation />} />
                      <Route path="/admin/documents/edit/:id" element={<CollaborativeEditor />} />
                      <Route path="/admin/documents/view/:id" element={<DocumentView />} />
                      <Route path="/admin/documents/history/:id" element={<DocumentHistory />} />
                      <Route path="/admin/documents/restore-dashboard" element={<RestoreDashboard />} />
                      <Route path="/admin/restore/personal" element={<PersonalRestoreDashboard />} />
                      <Route path="/admin/automation/execution-logs" element={<ExecutionLogs />} />
                      <Route path="/admin/reports/logs" element={<RestoreReportLogs />} />
                      <Route path="/admin/reports/assistant" element={<AssistantReportLogs />} />
                      <Route path="/admin/reports/dashboard-logs" element={<DashboardLogs />} />
                      <Route path="/admin/reports/restore-analytics" element={<RestoreAnalytics />} />
                      <Route path="/admin/dashboard-auditorias" element={<DashboardAuditorias />} />
                      <Route path="/admin/metricas-risco" element={<MetricasRisco />} />
                      <Route path="/admin/sgso" element={<AdminSGSO />} />
                      <Route path="/admin/sgso/history/:vesselId" element={<SGSOHistoryPage />} />
                      <Route path="/admin/sgso/history" element={<SGSOAuditHistory />} />
                      <Route path="/admin/sgso/review/:id" element={<SGSOAuditReview />} />
                      <Route path="/admin/auditorias-imca" element={<AuditoriasIMCA />} />
                      <Route path="/admin/auditorias-lista" element={<AuditoriasLista />} />
                      <Route path="/admin/peodp-audit" element={<PEODPAuditPage />} />
                      <Route path="/admin/peodp-wizard" element={<PEODPWizardComplete />} />
                      <Route path="/admin/simulations" element={<Simulations />} />
                      <Route path="/admin/cron-monitor" element={<CronMonitor />} />
                      <Route path="/admin/training" element={<TrainingManagement />} />
                      <Route path="/admin/training-academy" element={<TrainingAcademyAdmin />} />
                      <Route path="/admin/training-progress" element={<TrainingAcademyEnhanced />} />
                      <Route path="/admin/incidents" element={<IncidentsPage />} />
                      <Route path="/admin/incident-reports" element={<IncidentReportsComplete />} />
                      <Route path="/admin/performance-dashboard" element={<PerformanceDashboard />} />
                      <Route path="/developer/module-health" element={<ModuleHealth />} />
                      <Route path="/developer/watchdog" element={<WatchdogMonitor />} />
                      <Route path="/developer/ai-modules-status" element={<AIModulesStatus />} />
                      <Route path="/admin/risk-audit" element={<RiskAudit />} />
                      <Route path="/admin/quiz" element={<QuizPage />} />
                      <Route path="/admin/audit" element={<BackupAudit />} />
                      <Route path="/backup-audit" element={<BackupAudit />} />
                      <Route path="/imca-audit" element={<IMCAAudit />} />
                      <Route path="/external-audit" element={<ExternalAuditSystem />} />
                      <Route path="/health-monitor" element={<HealthMonitorDemo />} />
                      <Route path="/health" element={<Health />} />
                      <Route path="/modules" element={<Modules />} />
                      <Route path="/smart-layout-demo" element={<SmartLayoutDemo />} />
                      <Route path="/template-editor-demo" element={<TemplateEditorDemo />} />
                      <Route path="/_offline" element={<Offline />} />
                      
                      {/* New Module Routes */}
                      <Route path="/feedback" element={<FeedbackModule />} />
                      {/* PATCH 191.0: Consolidated Fleet Module */}
                      <Route path="/fleet" element={<FleetModule />} />
                      <Route path="/modules/fleet" element={<FleetModule />} />
                      <Route path="/performance" element={<PerformanceModule />} />
                      <Route path="/reports-module" element={<ReportsModule />} />
                      <Route path="/real-time-workspace" element={<RealTimeWorkspace />} />
                      <Route path="/channel-manager" element={<ChannelManager />} />
                      <Route path="/training-academy" element={<TrainingAcademy />} />
                      <Route path="/maintenance-planner" element={<MaintenancePlanner />} />
                      <Route path="/mission-logs" element={<MissionLogs />} />
                      <Route path="/travel" element={<TravelManagementPage />} />
                      <Route path="/incident-reports" element={<IncidentReports />} />
                      <Route path="/fuel-optimizer" element={<FuelOptimizer />} />
                      <Route path="/weather-dashboard" element={<WeatherDashboard />} />
                      <Route path="/weather" element={<WeatherDashboard />} />
                      <Route path="/voyage-planner" element={<VoyagePlanner />} />
                      <Route path="/voyage" element={<VoyagePlanner />} />
                      <Route path="/task-automation" element={<TaskAutomation />} />
                      <Route path="/audit-center" element={<AuditCenter />} />
                      <Route path="/developer/status" element={<DeveloperStatus />} />
                      <Route path="/developer/modules" element={<ModuleStatus />} />
                      <Route path="/modules/status" element={<ModuleStatus />} />
                      <Route path="/developer/tests" element={<TestsDashboard />} />
                      <Route path="/tests" element={<TestsDashboard />} />
                      <Route path="/emergency-response" element={<EmergencyResponse />} />
                      <Route path="/executive-report" element={<ExecutiveReport />} />
                      <Route path="/compliance-hub" element={<ComplianceHubModule />} />
                      <Route path="/ai-insights" element={<AIInsights />} />
                      {/* PATCH 89: Consolidated Dashboards */}
                      <Route path="/operations-dashboard" element={<OperationsDashboard />} />
                      <Route path="/operations" element={<OperationsDashboard />} />
                      <Route path="/logistics-hub" element={<LogisticsHub />} />
                      <Route path="/logistics" element={<LogisticsHub />} />
                      <Route path="/crew-wellbeing" element={<CrewWellbeing />} />
                      <Route path="/wellbeing" element={<CrewWellbeing />} />
                      <Route path="/portal/crew/wellbeing" element={<CrewWellbeing />} />
                      <Route path="/satellite-tracker" element={<SatelliteTracker />} />
                      <Route path="/satellite" element={<SatelliteTracker />} />
                      <Route path="/project-timeline" element={<ProjectTimeline />} />
                      <Route path="/timeline" element={<ProjectTimeline />} />
                      <Route path="/user-management" element={<UserManagement />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/emergency-response" element={<EmergencyResponse />} />
                      <Route path="/emergency" element={<EmergencyResponse />} />
                      {/* PATCH 426-430: Unified Mission Engine */}
                      <Route path="/mission-engine" element={<MissionEngine />} />
                      {/* Legacy mission routes - redirect to mission-engine */}
                      <Route path="/mission-control" element={<MissionEngine />} />
                      <Route path="/mission-logs" element={<MissionEngine />} />
                      {/* Mission control sub-pages */}
                      {/* PATCH 89: Redirect insight-dashboard to ai-insights for consolidation */}
                      <Route path="/mission-control/insight-dashboard" element={<InsightDashboard />} />
                      <Route path="/insights" element={<AIInsights />} />
                      <Route path="/mission-control/autonomy" element={<AutonomyConsole />} />
                      <Route path="/mission-control/ai-command" element={<AICommandCenter />} />
                      <Route path="/mission-control/workflows" element={<WorkflowEngine />} />
                      <Route path="/mission-control/llm" element={<NautilusLLM />} />
                      <Route path="/mission-control/thought-chain" element={<ThoughtChain />} />
                      {/* PATCH 427: Drone Commander */}
                      <Route path="/drone-commander" element={<DroneCommander />} />
                      {/* PATCH 428: Sensors Hub */}
                      <Route path="/sensors-hub" element={<SensorsHubPage />} />
                      {/* PATCH 429: Satcom */}
                      <Route path="/satcom" element={<SatcomPage />} />
                      <Route path="/nautilus-os" element={<NautilusOS />} />
                      <Route path="/finance-hub" element={<FinanceHub />} />
                      <Route path="/finance" element={<FinanceHub />} />
                      <Route path="/api-gateway" element={<APIGateway />} />
                      <Route path="/api-gateway/docs" element={<APIGatewayDocs />} />
                      <Route path="/automation" element={<AutomationModule />} />
                      <Route path="/risk-management" element={<RiskManagementModule />} />
                      <Route path="/risk" element={<RiskManagementModule />} />
                      <Route path="/analytics-core" element={<AnalyticsCoreModule />} />
                      <Route path="/voice-assistant" element={<VoiceAssistantModule />} />
                      <Route path="/notifications-center" element={<NotificationsCenterModule />} />
                      <Route path="/notifications" element={<NotificationsCenterModule />} />
                      
                      {/* PATCH 406: Consolidated Crew Management */}
                      <Route path="/crew-management" element={<CrewManagement />} />
                      {/* Legacy crew redirects */}
                      <Route path="/crew" element={<CrewManagement />} />
                      <Route path="/operations/crew" element={<CrewManagement />} />
                      
                      {/* PATCH 407: Sonar AI Module */}
                      <Route path="/sonar-ai" element={<SonarAI />} />
                      
                      {/* Validation Routes - Patches 401-410 */}
                      <Route path="/admin/template-editor/validation" element={<TemplateEditorValidation />} />
                      <Route path="/admin/documents-consolidation/validation" element={<DocumentsConsolidationValidation />} />
                      <Route path="/admin/price-alerts/validation" element={<PriceAlertsValidation />} />
                      <Route path="/admin/incidents-consolidation/validation" element={<IncidentsConsolidationValidation />} />
                      <Route path="/admin/sensor-hub/validation" element={<SensorHubValidation />} />
                      <Route path="/admin/crew-consolidation/validation" element={<CrewConsolidationValidation />} />
                      <Route path="/admin/sonar-ai/validation" element={<SonarAIValidation />} />
                      <Route path="/admin/test-automation/validation" element={<TestAutomationValidation />} />
                      <Route path="/admin/templates-application/validation" element={<TemplatesApplicationValidation />} />
                      <Route path="/admin/mission-control-consolidation/validation" element={<MissionControlConsolidationValidation />} />
                      
                      {/* Validation Routes - Patches 411-415 */}
                      <Route path="/admin/price-alerts-finalizado/validation" element={<PriceAlertsFinalizadoValidation />} />
                      <Route path="/admin/documents-consolidado/validation" element={<DocumentsConsolidadoValidation />} />
                      <Route path="/admin/unified-logs-panel/validation" element={<UnifiedLogsPanelValidation />} />
                      <Route path="/admin/coordination-ai/validation" element={<CoordinationAIValidation />} />
                      <Route path="/admin/experimental-modules/validation" element={<ExperimentalModulesValidation />} />
                      
                      {/* Validation Routes - Patches 416-420 */}
                      <Route path="/admin/crew-consolidado/validation" element={<CrewConsolidadoValidation />} />
                      <Route path="/admin/templates-editor/validation" element={<TemplatesEditorValidation />} />
                      <Route path="/admin/price-alerts-notification/validation" element={<PriceAlertsNotificationValidation />} />
                      <Route path="/admin/mission-control-realtime/validation" element={<MissionControlRealtimeValidation />} />
                      <Route path="/admin/satcom-simulation/validation" element={<SatcomSimulationValidation />} />
                      
                      {/* Portuguese Module Routes with English Aliases */}
                      <Route path="/comunicacao" element={<Communication />} />
                      <Route path="/portal-funcionario" element={<Portal />} />
                      <Route path="/alertas-precos" element={<PriceAlerts />} />
                      <Route path="/checklists-inteligentes" element={<ChecklistsInteligentes />} />
                      <Route path="/real-time-workspace" element={<RealTimeWorkspace />} />
                      <Route path="/voice-assistant-new" element={<VoiceAssistantModule />} />
                      
                      {/* Additional navigation routes from config */}
                      {NAVIGATION.map(({ path, component: Component }) => (
                        <Route key={path} path={path} element={<Suspense fallback={SuspenseFallback}><Component /></Suspense>} />
                      ))}
                      
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </React.Suspense>
              </Router>
            </QueryClientProvider>
          </OrganizationProvider>
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
