/**
 * App.tsx - Versão Completa com Todas as Rotas do Sidebar
 * PATCH: Rotas completas para 100+ módulos
 */
import * as React from "react";
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/layout/app-sidebar";
import { ThemeProvider } from "./components/layout/theme-provider";

// ============================================
// LAZY LOAD - PÁGINAS PRINCIPAIS
// ============================================
const Auth = lazy(() => import("@/pages/Auth"));
const CentralComando = lazy(() => import("@/pages/CentralComando"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Central de Comando extras
const NOC = lazy(() => import("@/pages/NOC"));
const NOCMonitoring = lazy(() => import("@/pages/NOCMonitoring"));

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

// ============================================
// MANUTENÇÃO
// ============================================
const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));

// ============================================
// OPERAÇÕES SUBMARINAS
// ============================================
// Placeholder para módulos futuros - usar NotFound por enquanto

// ============================================
// IA & AUTOMAÇÃO
// ============================================
const NautilusCommand = lazy(() => import("@/pages/NautilusCommand"));
const RevolutionaryAI = lazy(() => import("@/pages/RevolutionaryAI"));
const AICommandCenter = lazy(() => import("@/pages/AICommandCenter"));
const AIHubPage = lazy(() => import("@/pages/AIHubPage"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const RevolutionaryFeaturesPage = lazy(() => import("@/pages/RevolutionaryFeaturesPage"));
const AutonomousCommandCenter = lazy(() => import("@/pages/AutonomousCommandCenter"));
const AIObservabilityDashboard = lazy(() => import("@/pages/AIObservabilityDashboard"));
const WorkflowCommandCenter = lazy(() => import("@/pages/WorkflowCommandCenter"));
const AIAudit = lazy(() => import("@/pages/AIAudit"));
const VoiceAssistant = lazy(() => import("@/pages/VoiceAssistant"));
const AIOperationsCenter = lazy(() => import("@/pages/AIOperationsCenter"));

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
const MaritimeChecklists = lazy(() => import("@/pages/MaritimeChecklists"));
const DocumentWorkflow = lazy(() => import("@/pages/DocumentWorkflow"));
const ExportCenterPage = lazy(() => import("@/pages/ExportCenterPage"));
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
const RegulationsV2 = lazy(() => import("@/pages/RegulationsV2"));
const RiskMatrixV2 = lazy(() => import("@/pages/RiskMatrixV2"));
const EvidencesV2 = lazy(() => import("@/pages/EvidencesV2"));
const DueDiligenceV2 = lazy(() => import("@/pages/DueDiligenceV2"));
const WhistleblowerV2 = lazy(() => import("@/pages/WhistleblowerV2"));
const SecurityCenter = lazy(() => import("@/pages/SecurityCenter"));
const SecurityAuditCenter = lazy(() => import("@/pages/SecurityAuditCenter"));
const SecurityScanner = lazy(() => import("@/pages/SecurityScanner"));

// ============================================
// RH & PESSOAS
// ============================================
const CrewManagement = lazy(() => import("@/pages/CrewManagement"));
const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));
const Users = lazy(() => import("@/pages/Users"));

// ============================================
// TREINAMENTOS
// ============================================
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
const WeatherCommandCenter = lazy(() => import("@/pages/WeatherCommandCenter"));

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

// ============================================
// ADMIN & DASHBOARDS
// ============================================
const Admin = lazy(() => import("@/pages/Admin"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// Loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-foreground">Carregando Nautilus One...</p>
    </div>
  </div>
);

// Layout com Sidebar para rotas autenticadas
const AuthenticatedLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Rotas internas
const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    
    {/* Rotas autenticadas com Sidebar */}
    <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
      <Route path="/" element={<Navigate to="/central-comando" replace />} />
      
      {/* ============================================ */}
      {/* CENTRAL DE COMANDO */}
      {/* ============================================ */}
      <Route path="/central-comando/*" element={<CentralComando />} />
      <Route path="/noc" element={<NOC />} />
      <Route path="/noc-monitoring" element={<NOCMonitoring />} />
      
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
      
      {/* ============================================ */}
      {/* MANUTENÇÃO */}
      {/* ============================================ */}
      <Route path="/maintenance-command" element={<MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenancePage />} />
      
      {/* ============================================ */}
      {/* IA & AUTOMAÇÃO */}
      {/* ============================================ */}
      <Route path="/nautilus-command" element={<NautilusCommand />} />
      <Route path="/revolutionary-ai" element={<RevolutionaryAI />} />
      <Route path="/ai-command" element={<AICommandCenter />} />
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
      <Route path="/admin/checklists" element={<MaritimeChecklists />} />
      <Route path="/document-workflow" element={<DocumentWorkflow />} />
      <Route path="/export-center" element={<ExportCenterPage />} />
      <Route path="/advanced-search" element={<AdvancedSearchPage />} />
      <Route path="/documentation" element={<Documents />} />
      
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
      <Route path="/safety-guardian" element={<SafetyHumanFactorsV2 />} />
      
      {/* ============================================ */}
      {/* RH & PESSOAS */}
      {/* ============================================ */}
      <Route path="/nautilus-people" element={<CrewManagement />} />
      <Route path="/crew-management" element={<CrewManagement />} />
      <Route path="/crew-wellness" element={<CrewWellnessPage />} />
      <Route path="/crew-wellbeing" element={<CrewWellnessPage />} />
      <Route path="/medical-infirmary" element={<CrewWellnessPage />} />
      <Route path="/users" element={<Users />} />
      
      {/* ============================================ */}
      {/* TREINAMENTOS */}
      {/* ============================================ */}
      <Route path="/nautilus-academy" element={<AITraining />} />
      <Route path="/solas-isps-training" element={<AITraining />} />
      <Route path="/mentor-dp" element={<MentorDP />} />
      <Route path="/dp-intelligence" element={<DPIntelligence />} />
      
      {/* ============================================ */}
      {/* FINANÇAS & PROCUREMENT */}
      {/* ============================================ */}
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
      <Route path="/travel-command" element={<TravelCommandCenter />} />
      <Route path="/weather-command" element={<WeatherCommandCenter />} />
      
      {/* ============================================ */}
      {/* SISTEMA & CONFIGURAÇÕES */}
      {/* ============================================ */}
      <Route path="/settings" element={<Settings />} />
      <Route path="/integrations" element={<IntegrationsCenter />} />
      <Route path="/api-gateway" element={<APIGateway />} />
      <Route path="/collaboration" element={<Collaboration />} />
      <Route path="/iot" element={<IoT />} />
      <Route path="/gamification" element={<Gamification />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/qa/preview" element={<Dashboard />} />
      <Route path="/production-deploy" element={<ProductionDeploy />} />
      
      {/* ============================================ */}
      {/* ADMIN & DASHBOARDS */}
      {/* ============================================ */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
      <Route path="/system-overview" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/backup-audit" element={<SecurityAuditCenter />} />
      <Route path="/testing" element={<Dashboard />} />
      <Route path="/feedback" element={<Dashboard />} />
      <Route path="/saas-manager" element={<Admin />} />
    </Route>
    
    {/* Catch-all: Redirecionar para central de comando */}
    <Route path="*" element={<Navigate to="/central-comando" replace />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
        <AuthProvider>
          <Router>
            <TooltipProvider>
              <Suspense fallback={<Loader />}>
                <AppRoutes />
              </Suspense>
              <Toaster />
            </TooltipProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
