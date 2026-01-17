/**
 * App.tsx - PATCH 861 - SIMPLIFIED PROVIDERS
 * 
 * All providers are inside App.tsx, not in main.tsx
 * Using standard imports (not namespace imports)
 */
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
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
// LAZY LOAD - All pages use lazy
// ============================================
const Auth = lazy(() => import("@/pages/Auth"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const CentralComando = lazy(() => import("@/pages/CentralComando"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DevRoutesDashboard = lazy(() => import("@/pages/DevRoutesDashboard"));
const Billing = lazy(() => import("@/pages/Billing"));
const BillingPortal = lazy(() => import("@/pages/BillingPortal"));
const OnboardingDashboard = lazy(() => import("@/pages/OnboardingDashboard"));
const InteractiveOnboarding = lazy(() => import("@/pages/InteractiveOnboarding"));
const AnalyticsFeedback = lazy(() => import("@/pages/AnalyticsFeedback"));
const NOC = lazy(() => import("@/pages/NOC"));
const NOCMonitoring = lazy(() => import("@/pages/NOCMonitoring"));
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
const DigitalTwinPage = lazy(() => import("@/pages/DigitalTwinPage"));
const LogisticsCommandPage = lazy(() => import("@/pages/LogisticsCommandPage"));
const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
const AgentOrchestrationPage = lazy(() => import("@/pages/AgentOrchestrationPage"));
const BlockchainCompliancePage = lazy(() => import("@/pages/BlockchainCompliancePage"));
const CompanyFinancialPage = lazy(() => import("@/pages/CompanyFinancialPage"));
const MLCSchedulingPage = lazy(() => import("@/pages/MLCSchedulingPage"));
const SupplierPortalPage = lazy(() => import("@/pages/SupplierPortalPage"));
const IoTDashboardPage = lazy(() => import("@/pages/IoTDashboardPage"));
const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));
const OceanSonar = lazy(() => import("@/pages/OceanSonar"));
const UnderwaterDrone = lazy(() => import("@/pages/UnderwaterDrone"));
const AutoSub = lazy(() => import("@/pages/AutoSub"));
const SonarAI = lazy(() => import("@/pages/SonarAI"));
const DeepRiskAI = lazy(() => import("@/pages/DeepRiskAI"));
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
const Optimization = lazy(() => import("@/pages/Optimization"));
const TelemetriaCommand = lazy(() => import("@/pages/TelemetriaCommand"));
const PredictiveTelemetry = lazy(() => import("@/pages/PredictiveTelemetry"));
const SatelliteOptimizerPage = lazy(() => import("@/pages/SatelliteOptimizerPage"));
const VesselTrackingPage = lazy(() => import("@/pages/VesselTrackingPage"));
const IncidentSimulator = lazy(() => import("@/pages/IncidentSimulator"));
const CalendarView = lazy(() => import("@/pages/CalendarView"));
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
const ReportsCommandCenter = lazy(() => import("@/pages/ReportsCommandCenter"));
const Documents = lazy(() => import("@/pages/Documents"));
const Templates = lazy(() => import("@/pages/Templates"));
const MaritimeChecklists = lazy(() => import("@/pages/MaritimeChecklists"));
const DocumentWorkflow = lazy(() => import("@/pages/DocumentWorkflow"));
const ExportCenterPage = lazy(() => import("@/pages/ExportCenterPage"));
const AdvancedSearchPage = lazy(() => import("@/pages/AdvancedSearchPage"));
const CommunicationCommandCenter = lazy(() => import("@/pages/CommunicationCommandCenter"));
const AlertsCommandCenter = lazy(() => import("@/pages/AlertsCommandCenter"));
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
const CrewManagement = lazy(() => import("@/pages/CrewManagement"));
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
const AITraining = lazy(() => import("@/pages/AITraining"));
const MentorDP = lazy(() => import("@/pages/MentorDP"));
const DPIntelligence = lazy(() => import("@/pages/DPIntelligence"));
const FinanceCommandCenter = lazy(() => import("@/pages/FinanceCommandCenter"));
const VoyageAccountingPage = lazy(() => import("@/pages/VoyageAccountingPage"));
const AnalyticsCommandCenter = lazy(() => import("@/pages/AnalyticsCommandCenter"));
const OperationsCommandCenter = lazy(() => import("@/pages/OperationsCommandCenter"));
const ProcurementCommandCenter = lazy(() => import("@/pages/ProcurementCommandCenter"));
const TaskManagement = lazy(() => import("@/pages/TaskManagement"));
const SustainabilityScorePage = lazy(() => import("@/pages/SustainabilityScorePage"));
const TravelCommandCenter = lazy(() => import("@/pages/TravelCommandCenter"));
const WeatherCommandCenter = lazy(() => import("@/pages/WeatherCommandCenter"));
const Settings = lazy(() => import("@/pages/Settings"));
const IntegrationsCenter = lazy(() => import("@/pages/IntegrationsCenter"));
const APIGateway = lazy(() => import("@/pages/APIGateway"));
const Collaboration = lazy(() => import("@/pages/Collaboration"));
const IoT = lazy(() => import("@/pages/IoT"));
const Gamification = lazy(() => import("@/pages/Gamification"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const ProductionDeploy = lazy(() => import("@/pages/ProductionDeploy"));
const StatusPage = lazy(() => import("@/pages/StatusPage"));
const Admin = lazy(() => import("@/pages/Admin"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));

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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Router>
              <AuthProvider>
                <Suspense fallback={<Loader />}>
                  <AppRoutes />
                </Suspense>
              </AuthProvider>
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
