/**
 * App.tsx - PATCH 856 - Fixed React hooks error definitively
 * 
 * CRITICAL: Use namespace imports to ensure consistent React instance
 */
import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/layout/app-sidebar";
import { ThemeProvider } from "./components/layout/theme-provider";
import { Header } from "./components/layout/header";
import { MobileBottomNav } from "./components/layout/mobile-bottom-nav";

// CRITICAL: Create QueryClient inside App.tsx (not imported)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
      networkMode: 'offlineFirst',
    },
  },
});

// ============================================
// LAZY LOAD - All pages use React.lazy
// ============================================
const Auth = React.lazy(() => import("@/pages/Auth"));
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const CentralComando = React.lazy(() => import("@/pages/CentralComando"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const DevRoutesDashboard = React.lazy(() => import("@/pages/DevRoutesDashboard"));
const Billing = React.lazy(() => import("@/pages/Billing"));
const BillingPortal = React.lazy(() => import("@/pages/BillingPortal"));
const OnboardingDashboard = React.lazy(() => import("@/pages/OnboardingDashboard"));
const InteractiveOnboarding = React.lazy(() => import("@/pages/InteractiveOnboarding"));
const AnalyticsFeedback = React.lazy(() => import("@/pages/AnalyticsFeedback"));
const NOC = React.lazy(() => import("@/pages/NOC"));
const NOCMonitoring = React.lazy(() => import("@/pages/NOCMonitoring"));
const MaritimeCommandCenter = React.lazy(() => import("@/pages/MaritimeCommandCenter"));
const FleetCommandCenter = React.lazy(() => import("@/pages/FleetCommandCenter"));
const VoyageCommandCenter = React.lazy(() => import("@/pages/VoyageCommandCenter"));
const RouteOptimizerPage = React.lazy(() => import("@/pages/RouteOptimizerPage"));
const MissionCommandCenter = React.lazy(() => import("@/pages/MissionCommandCenter"));
const BridgeLink = React.lazy(() => import("@/pages/BridgeLink"));
const DrydockManagement = React.lazy(() => import("@/pages/DrydockManagement"));
const VesselContractsUnified = React.lazy(() => import("@/pages/VesselContractsUnified"));
const CharterPartyV2 = React.lazy(() => import("@/pages/CharterPartyV2"));
const CargoManagementV2 = React.lazy(() => import("@/pages/CargoManagementV2"));
const PortCallOptimizationV2 = React.lazy(() => import("@/pages/PortCallOptimizationV2"));
const VesselCTSV2 = React.lazy(() => import("@/pages/VesselCTSV2"));
const VesselHistoryV2 = React.lazy(() => import("@/pages/VesselHistoryV2"));
const DigitalTwinPage = React.lazy(() => import("@/pages/DigitalTwinPage"));
const LogisticsCommandPage = React.lazy(() => import("@/pages/LogisticsCommandPage"));
const RecruitmentPage = React.lazy(() => import("@/pages/RecruitmentPage"));
const AgentOrchestrationPage = React.lazy(() => import("@/pages/AgentOrchestrationPage"));
const BlockchainCompliancePage = React.lazy(() => import("@/pages/BlockchainCompliancePage"));
const CompanyFinancialPage = React.lazy(() => import("@/pages/CompanyFinancialPage"));
const MLCSchedulingPage = React.lazy(() => import("@/pages/MLCSchedulingPage"));
const SupplierPortalPage = React.lazy(() => import("@/pages/SupplierPortalPage"));
const IoTDashboardPage = React.lazy(() => import("@/pages/IoTDashboardPage"));
const MaintenanceCommandCenter = React.lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = React.lazy(() => import("@/pages/PredictiveMaintenancePage"));
const OceanSonar = React.lazy(() => import("@/pages/OceanSonar"));
const UnderwaterDrone = React.lazy(() => import("@/pages/UnderwaterDrone"));
const AutoSub = React.lazy(() => import("@/pages/AutoSub"));
const SonarAI = React.lazy(() => import("@/pages/SonarAI"));
const DeepRiskAI = React.lazy(() => import("@/pages/DeepRiskAI"));
const NautilusCommand = React.lazy(() => import("@/pages/NautilusCommand"));
const RevolutionaryAI = React.lazy(() => import("@/pages/RevolutionaryAI"));
const AICommandCenter = React.lazy(() => import("@/pages/AICommandCenter"));
const AIHubPage = React.lazy(() => import("@/pages/AIHubPage"));
const AIAnalyticsDashboard = React.lazy(() => import("@/pages/AIAnalyticsDashboard"));
const RevolutionaryFeaturesPage = React.lazy(() => import("@/pages/RevolutionaryFeaturesPage"));
const AutonomousCommandCenter = React.lazy(() => import("@/pages/AutonomousCommandCenter"));
const AIObservabilityDashboard = React.lazy(() => import("@/pages/AIObservabilityDashboard"));
const WorkflowCommandCenter = React.lazy(() => import("@/pages/WorkflowCommandCenter"));
const AIAudit = React.lazy(() => import("@/pages/AIAudit"));
const VoiceAssistant = React.lazy(() => import("@/pages/VoiceAssistant"));
const AIOperationsCenter = React.lazy(() => import("@/pages/AIOperationsCenter"));
const Optimization = React.lazy(() => import("@/pages/Optimization"));
const TelemetriaCommand = React.lazy(() => import("@/pages/TelemetriaCommand"));
const PredictiveTelemetry = React.lazy(() => import("@/pages/PredictiveTelemetry"));
const SatelliteOptimizerPage = React.lazy(() => import("@/pages/SatelliteOptimizerPage"));
const VesselTrackingPage = React.lazy(() => import("@/pages/VesselTrackingPage"));
const IncidentSimulator = React.lazy(() => import("@/pages/IncidentSimulator"));
const CalendarView = React.lazy(() => import("@/pages/CalendarView"));
const APICenter = React.lazy(() => import("@/pages/APICenter"));
const APIMonitor = React.lazy(() => import("@/pages/APIMonitor"));
const Integrations = React.lazy(() => import("@/pages/Integrations"));
const WeatherMaritime = React.lazy(() => import("@/pages/WeatherMaritime"));
const AISTrackerPage = React.lazy(() => import("@/pages/AISTrackerPage"));
const PortAPI = React.lazy(() => import("@/pages/PortAPI"));
const FlightTracker = React.lazy(() => import("@/pages/FlightTracker"));
const NOAAWeather = React.lazy(() => import("@/pages/NOAAWeather"));
const OpenSkyFlights = React.lazy(() => import("@/pages/OpenSkyFlights"));
const EarthquakeMonitor = React.lazy(() => import("@/pages/EarthquakeMonitor"));
const VoiceTranscriber = React.lazy(() => import("@/pages/VoiceTranscriber"));
const ReportsCommandCenter = React.lazy(() => import("@/pages/ReportsCommandCenter"));
const Documents = React.lazy(() => import("@/pages/Documents"));
const Templates = React.lazy(() => import("@/pages/Templates"));
const MaritimeChecklists = React.lazy(() => import("@/pages/MaritimeChecklists"));
const DocumentWorkflow = React.lazy(() => import("@/pages/DocumentWorkflow"));
const ExportCenterPage = React.lazy(() => import("@/pages/ExportCenterPage"));
const AdvancedSearchPage = React.lazy(() => import("@/pages/AdvancedSearchPage"));
const CommunicationCommandCenter = React.lazy(() => import("@/pages/CommunicationCommandCenter"));
const AlertsCommandCenter = React.lazy(() => import("@/pages/AlertsCommandCenter"));
const PEODP = React.lazy(() => import("@/pages/PEODP"));
const PEOTRAM = React.lazy(() => import("@/pages/PEOTRAM"));
const SGSO = React.lazy(() => import("@/pages/SGSO"));
const SafetyIMCAV2 = React.lazy(() => import("@/pages/SafetyIMCAV2"));
const PreOVIDInspection = React.lazy(() => import("@/pages/PreOVIDInspection"));
const MLCInspection = React.lazy(() => import("@/pages/MLCInspection"));
const PSCPackage = React.lazy(() => import("@/pages/PSCPackage"));
const GMUDV2 = React.lazy(() => import("@/pages/GMUDV2"));
const ResponsibilityMatrixV2 = React.lazy(() => import("@/pages/ResponsibilityMatrixV2"));
const SafetyHumanFactorsV2 = React.lazy(() => import("@/pages/SafetyHumanFactorsV2"));
const ISPSSecurityV2 = React.lazy(() => import("@/pages/ISPSSecurityV2"));
const DrillSimulatorV2 = React.lazy(() => import("@/pages/DrillSimulatorV2"));
const ComplianceOneV2 = React.lazy(() => import("@/pages/ComplianceOneV2"));
const RegulationsV2 = React.lazy(() => import("@/pages/RegulationsV2"));
const RiskMatrixV2 = React.lazy(() => import("@/pages/RiskMatrixV2"));
const EvidencesV2 = React.lazy(() => import("@/pages/EvidencesV2"));
const DueDiligenceV2 = React.lazy(() => import("@/pages/DueDiligenceV2"));
const WhistleblowerV2 = React.lazy(() => import("@/pages/WhistleblowerV2"));
const SecurityCenter = React.lazy(() => import("@/pages/SecurityCenter"));
const SecurityAuditCenter = React.lazy(() => import("@/pages/SecurityAuditCenter"));
const SecurityScanner = React.lazy(() => import("@/pages/SecurityScanner"));
const CrewManagement = React.lazy(() => import("@/pages/CrewManagement"));
const CrewWellnessPage = React.lazy(() => import("@/pages/CrewWellnessPage"));
const Users = React.lazy(() => import("@/pages/Users"));
const HRDashboardPage = React.lazy(() => import("@/pages/HRDashboardPage"));
const EmployeePortalPage = React.lazy(() => import("@/pages/EmployeePortalPage"));
const PeopleAnalyticsPage = React.lazy(() => import("@/pages/PeopleAnalyticsPage"));
const Payroll = React.lazy(() => import("@/pages/Payroll"));
const TimeTracking = React.lazy(() => import("@/pages/TimeTracking"));
const HRChatbotPage = React.lazy(() => import("@/pages/HRChatbotPage"));
const HRDocumentOCRPage = React.lazy(() => import("@/pages/HRDocumentOCRPage"));
const HRTurnoverPredictionPage = React.lazy(() => import("@/pages/HRTurnoverPredictionPage"));
const AITraining = React.lazy(() => import("@/pages/AITraining"));
const MentorDP = React.lazy(() => import("@/pages/MentorDP"));
const DPIntelligence = React.lazy(() => import("@/pages/DPIntelligence"));
const FinanceCommandCenter = React.lazy(() => import("@/pages/FinanceCommandCenter"));
const VoyageAccountingPage = React.lazy(() => import("@/pages/VoyageAccountingPage"));
const AnalyticsCommandCenter = React.lazy(() => import("@/pages/AnalyticsCommandCenter"));
const OperationsCommandCenter = React.lazy(() => import("@/pages/OperationsCommandCenter"));
const ProcurementCommandCenter = React.lazy(() => import("@/pages/ProcurementCommandCenter"));
const TaskManagement = React.lazy(() => import("@/pages/TaskManagement"));
const SustainabilityScorePage = React.lazy(() => import("@/pages/SustainabilityScorePage"));
const TravelCommandCenter = React.lazy(() => import("@/pages/TravelCommandCenter"));
const WeatherCommandCenter = React.lazy(() => import("@/pages/WeatherCommandCenter"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const IntegrationsCenter = React.lazy(() => import("@/pages/IntegrationsCenter"));
const APIGateway = React.lazy(() => import("@/pages/APIGateway"));
const Collaboration = React.lazy(() => import("@/pages/Collaboration"));
const IoT = React.lazy(() => import("@/pages/IoT"));
const Gamification = React.lazy(() => import("@/pages/Gamification"));
const Roadmap = React.lazy(() => import("@/pages/Roadmap"));
const ProductionDeploy = React.lazy(() => import("@/pages/ProductionDeploy"));
const StatusPage = React.lazy(() => import("@/pages/StatusPage"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const ExecutiveDashboard = React.lazy(() => import("@/pages/ExecutiveDashboard"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));

// Loader component
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-foreground">Carregando Nautilus One...</p>
      <p className="text-muted-foreground text-sm">Otimizado para conexões lentas</p>
    </div>
  </div>
);

// Layout with Sidebar for authenticated routes
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
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// App Routes
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/pricing" element={<LandingPage />} />
    <Route path="/status" element={<StatusPage />} />
    
    {/* Authenticated routes with Sidebar */}
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
      <Route path="/central-comando/*" element={<CentralComando />} />
      <Route path="/noc" element={<NOC />} />
      <Route path="/noc-monitoring" element={<NOCMonitoring />} />
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
      <Route path="/logistics-command" element={<LogisticsCommandPage />} />
      <Route path="/recruitment" element={<RecruitmentPage />} />
      <Route path="/agent-orchestration" element={<AgentOrchestrationPage />} />
      <Route path="/blockchain-compliance" element={<BlockchainCompliancePage />} />
      <Route path="/company-financials" element={<CompanyFinancialPage />} />
      <Route path="/mlc-scheduling" element={<MLCSchedulingPage />} />
      <Route path="/supplier-portal" element={<SupplierPortalPage />} />
      <Route path="/iot-dashboard" element={<IoTDashboardPage />} />
      <Route path="/maintenance-command" element={<MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenancePage />} />
      <Route path="/ocean-sonar" element={<OceanSonar />} />
      <Route path="/underwater-drone" element={<UnderwaterDrone />} />
      <Route path="/auto-sub" element={<AutoSub />} />
      <Route path="/sonar-ai" element={<SonarAI />} />
      <Route path="/deep-risk-ai" element={<DeepRiskAI />} />
      <Route path="/nautilus-command" element={<NautilusCommand />} />
      <Route path="/revolutionary-ai" element={<RevolutionaryAI />} />
      <Route path="/ai-command" element={<AICommandCenter />} />
      <Route path="/ai-hub" element={<AIHubPage />} />
      <Route path="/ai-analytics" element={<AIAnalyticsDashboard />} />
      <Route path="/revolutionary-features" element={<RevolutionaryFeaturesPage />} />
      <Route path="/autonomous-command" element={<AutonomousCommandCenter />} />
      <Route path="/ai-observability" element={<AIObservabilityDashboard />} />
      <Route path="/workflow-command" element={<WorkflowCommandCenter />} />
      <Route path="/ai-audit" element={<AIAudit />} />
      <Route path="/voice-assistant" element={<VoiceAssistant />} />
      <Route path="/ai-operations" element={<AIOperationsCenter />} />
      <Route path="/optimization" element={<Optimization />} />
      <Route path="/telemetria-command" element={<TelemetriaCommand />} />
      <Route path="/predictive-telemetry" element={<PredictiveTelemetry />} />
      <Route path="/satellite-optimizer" element={<SatelliteOptimizerPage />} />
      <Route path="/vessel-tracking" element={<VesselTrackingPage />} />
      <Route path="/incident-simulator" element={<IncidentSimulator />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/api-center" element={<APICenter />} />
      <Route path="/api-monitor" element={<APIMonitor />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/weather-maritime" element={<WeatherMaritime />} />
      <Route path="/ais-tracker" element={<AISTrackerPage />} />
      <Route path="/port-api" element={<PortAPI />} />
      <Route path="/flight-tracker" element={<FlightTracker />} />
      <Route path="/noaa-weather" element={<NOAAWeather />} />
      <Route path="/opensky-flights" element={<OpenSkyFlights />} />
      <Route path="/earthquake-monitor" element={<EarthquakeMonitor />} />
      <Route path="/voice-transcriber" element={<VoiceTranscriber />} />
      <Route path="/reports-command" element={<ReportsCommandCenter />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/checklists" element={<MaritimeChecklists />} />
      <Route path="/document-workflow" element={<DocumentWorkflow />} />
      <Route path="/export-center" element={<ExportCenterPage />} />
      <Route path="/advanced-search" element={<AdvancedSearchPage />} />
      <Route path="/communication-command" element={<CommunicationCommandCenter />} />
      <Route path="/alerts-command" element={<AlertsCommandCenter />} />
      <Route path="/peodp" element={<PEODP />} />
      <Route path="/peotram" element={<PEOTRAM />} />
      <Route path="/sgso" element={<SGSO />} />
      <Route path="/safety-imca" element={<SafetyIMCAV2 />} />
      <Route path="/pre-ovid" element={<PreOVIDInspection />} />
      <Route path="/mlc-inspection" element={<MLCInspection />} />
      <Route path="/psc-package" element={<PSCPackage />} />
      <Route path="/gmud" element={<GMUDV2 />} />
      <Route path="/responsibility-matrix" element={<ResponsibilityMatrixV2 />} />
      <Route path="/safety-human-factors" element={<SafetyHumanFactorsV2 />} />
      <Route path="/isps-security" element={<ISPSSecurityV2 />} />
      <Route path="/drill-simulator" element={<DrillSimulatorV2 />} />
      <Route path="/compliance-one" element={<ComplianceOneV2 />} />
      <Route path="/regulations" element={<RegulationsV2 />} />
      <Route path="/risk-matrix" element={<RiskMatrixV2 />} />
      <Route path="/evidences" element={<EvidencesV2 />} />
      <Route path="/due-diligence" element={<DueDiligenceV2 />} />
      <Route path="/whistleblower" element={<WhistleblowerV2 />} />
      <Route path="/security-center" element={<SecurityCenter />} />
      <Route path="/security-audit" element={<SecurityAuditCenter />} />
      <Route path="/security-scanner" element={<SecurityScanner />} />
      <Route path="/crew" element={<CrewManagement />} />
      <Route path="/crew-wellness" element={<CrewWellnessPage />} />
      <Route path="/users" element={<Users />} />
      <Route path="/hr-dashboard" element={<HRDashboardPage />} />
      <Route path="/employee-portal" element={<EmployeePortalPage />} />
      <Route path="/people-analytics" element={<PeopleAnalyticsPage />} />
      <Route path="/payroll" element={<Payroll />} />
      <Route path="/time-tracking" element={<TimeTracking />} />
      <Route path="/hr-chatbot" element={<HRChatbotPage />} />
      <Route path="/hr-ocr" element={<HRDocumentOCRPage />} />
      <Route path="/hr-turnover" element={<HRTurnoverPredictionPage />} />
      <Route path="/ai-training" element={<AITraining />} />
      <Route path="/mentor-dp" element={<MentorDP />} />
      <Route path="/dp-intelligence" element={<DPIntelligence />} />
      <Route path="/finance-command" element={<FinanceCommandCenter />} />
      <Route path="/voyage-accounting" element={<VoyageAccountingPage />} />
      <Route path="/analytics-command" element={<AnalyticsCommandCenter />} />
      <Route path="/operations-command" element={<OperationsCommandCenter />} />
      <Route path="/procurement-command" element={<ProcurementCommandCenter />} />
      <Route path="/tasks" element={<TaskManagement />} />
      <Route path="/sustainability" element={<SustainabilityScorePage />} />
      <Route path="/travel-command" element={<TravelCommandCenter />} />
      <Route path="/weather-command" element={<WeatherCommandCenter />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/integrations-center" element={<IntegrationsCenter />} />
      <Route path="/api-gateway" element={<APIGateway />} />
      <Route path="/collaboration" element={<Collaboration />} />
      <Route path="/iot" element={<IoT />} />
      <Route path="/gamification" element={<Gamification />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/production-deploy" element={<ProductionDeploy />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/dev-routes" element={<DevRoutesDashboard />} />
    </Route>
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <React.Suspense fallback={<Loader />}>
                <AppRoutes />
              </React.Suspense>
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
