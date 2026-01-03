/**
 * App.tsx - Main application entry point
 * Uses named React imports to prevent multiple React instances
 */
import { lazy, Suspense, useMemo, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { logger } from "@/lib/logger";

// Import AuthProvider from contexts
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { GlobalBrainProvider } from "./components/global/GlobalBrainProvider";
import { LiteModeProvider } from "./components/performance/LiteMode";

// Global Voice Button & AI Level 3
import { GlobalVoiceButton } from "./components/voice/GlobalVoiceButton";
import { GlobalAILevel3Button } from "./components/ai/GlobalAILevel3Button";
import { GlobalAIButton } from "./components/ai/GlobalAIButton";
import { FloatingButtonsContainer } from "./components/global/FloatingButtonsContainer";
import { NautilusBrainButton } from "./components/global/NautilusBrainButton";

// Performance utilities
import { getModuleRoutes } from "@/utils/module-routes";
import { createOptimizedQueryClient } from "@/lib/performance/query-config";
import { ProtectedRoute, AdminRoute } from "@/components/auth/protected-route";
import { legacyRedirectRoutes } from "@/config/legacy-redirects";

// Simple loader component
const OffshoreLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Simple inline error boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error, errorInfo);
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

// Core pages - Lazy loading with named chunks
const Index = lazy(() => import(/* webpackChunkName: "page-index" */ "@/pages/Index"));
const Dashboard = lazy(() => import(/* webpackChunkName: "page-dashboard" */ "@/pages/Dashboard"));
const Admin = lazy(() => import(/* webpackChunkName: "page-admin" */ "@/pages/Admin"));
const Settings = lazy(() => import(/* webpackChunkName: "page-settings" */ "@/pages/Settings"));
const HealthCheck = lazy(() => import(/* webpackChunkName: "page-health" */ "@/pages/HealthCheck"));
const NotFound = lazy(() => import(/* webpackChunkName: "page-notfound" */ "@/pages/NotFoundProfessional"));
const Unauthorized = lazy(() => import(/* webpackChunkName: "page-unauthorized" */ "@/pages/Unauthorized"));
const Auth = lazy(() => import(/* webpackChunkName: "page-auth" */ "@/pages/Auth"));
const UserProfilePage = lazy(() => import(/* webpackChunkName: "page-profile" */ "@/pages/user/profile"));
const RevolutionaryAI = lazy(() => import(/* webpackChunkName: "page-ai" */ "@/pages/RevolutionaryAI"));
const AIEnhancedModules = lazy(() => import(/* webpackChunkName: "page-ai-modules" */ "@/pages/AIEnhancedModules"));
const SystemDebug = lazy(() => import(/* webpackChunkName: "page-debug" */ "@/pages/SystemDebug"));
const NOCMode = lazy(() => import(/* webpackChunkName: "page-noc" */ "@/pages/NOCMode"));
const AuditoriaTecnica = lazy(() => import(/* webpackChunkName: "page-auditoria" */ "@/pages/AuditoriaTecnica"));
const SecurityAudit = lazy(() => import(/* webpackChunkName: "page-security-audit" */ "@/pages/SecurityAudit"));
const TelemetriaCommand = lazy(() => import(/* webpackChunkName: "page-telemetria" */ "@/pages/TelemetriaCommand"));
const AIObservabilityDashboard = lazy(() => import(/* webpackChunkName: "page-ai-observability" */ "@/pages/AIObservabilityDashboard"));

// Revolutionary Features - PATCH FINAL
const VisionAI = lazy(() => import(/* webpackChunkName: "page-vision-ai" */ "@/pages/VisionAI"));
const AISTracking = lazy(() => import(/* webpackChunkName: "page-ais-tracking" */ "@/pages/AISTracking"));
const CertificateBlockchain = lazy(() => import(/* webpackChunkName: "page-cert-blockchain" */ "@/pages/CertificateBlockchain"));
const VoiceAssistant = lazy(() => import(/* webpackChunkName: "page-voice-assistant" */ "@/pages/VoiceAssistant"));

// AI Ops & Security - PATCH 852
const AIOperationsCenter = lazy(() => import(/* webpackChunkName: "page-ai-ops" */ "@/pages/AIOperationsCenter"));
const SecurityCenter = lazy(() => import(/* webpackChunkName: "page-security-center" */ "@/pages/SecurityCenter"));
const PredictiveTelemetry = lazy(() => import(/* webpackChunkName: "page-predictive-telemetry" */ "@/pages/PredictiveTelemetry"));

// Incident Simulator & Offline - PATCH 853
const IncidentSimulator = lazy(() => import(/* webpackChunkName: "page-incident-simulator" */ "@/pages/IncidentSimulator"));
const OfflinePage = lazy(() => import(/* webpackChunkName: "page-offline" */ "@/pages/OfflinePage"));

// Integrations & Docs - PATCH 854
const IntegrationsCenter = lazy(() => import(/* webpackChunkName: "page-integrations" */ "@/pages/IntegrationsCenter"));
const DocumentationHub = lazy(() => import(/* webpackChunkName: "page-docs" */ "@/pages/DocumentationHub"));
const APIMonitor = lazy(() => import(/* webpackChunkName: "page-api-monitor" */ "@/pages/APIMonitor"));

// New API Integration Pages - PATCH 856
const WeatherMaritime = lazy(() => import(/* webpackChunkName: "page-weather-maritime" */ "@/pages/WeatherMaritime"));
const AISTrackerPage = lazy(() => import(/* webpackChunkName: "page-ais-tracker" */ "@/pages/AISTrackerPage"));
const VoiceTranscriber = lazy(() => import(/* webpackChunkName: "page-voice-transcriber" */ "@/pages/VoiceTranscriber"));

// New Pages - PATCH 857
const PortAPI = lazy(() => import(/* webpackChunkName: "page-port-api" */ "@/pages/PortAPI"));
const FlightTracker = lazy(() => import(/* webpackChunkName: "page-flight-tracker" */ "@/pages/FlightTracker"));
const SecurityScanner = lazy(() => import(/* webpackChunkName: "page-security-scanner" */ "@/pages/SecurityScanner"));
const EarthquakeMonitor = lazy(() => import(/* webpackChunkName: "page-earthquake-monitor" */ "@/pages/EarthquakeMonitor"));
const NOAAWeather = lazy(() => import(/* webpackChunkName: "page-noaa-weather" */ "@/pages/NOAAWeather"));
const OpenSkyFlights = lazy(() => import(/* webpackChunkName: "page-opensky-flights" */ "@/pages/OpenSkyFlights"));

// Executive & NOC - PATCH 855
const ExecutiveBIDashboard = lazy(() => import(/* webpackChunkName: "page-executive-bi" */ "@/pages/ExecutiveBIDashboard"));
const NOCMonitoring = lazy(() => import(/* webpackChunkName: "page-noc-monitoring" */ "@/pages/NOCMonitoring"));

// Roadmap - PATCH 859
const Roadmap = lazy(() => import(/* webpackChunkName: "page-roadmap" */ "@/pages/Roadmap"));

// AI Self-Healing - PATCH 860
const SelfHealingLogs = lazy(() => import(/* webpackChunkName: "page-self-healing" */ "@/pages/ai/SelfHealingLogs"));

// Sidebar Diagnostic - PATCH 862
const SidebarCheck = lazy(() => import(/* webpackChunkName: "page-sidebar-check" */ "@/pages/dev/SidebarCheck"));

// Compliance One Module - PATCH 863
const ComplianceCenter = lazy(() => import(/* webpackChunkName: "module-compliance" */ "@/modules/compliance/pages/ComplianceCenter"));

// DGNSS Tracking Module - PATCH 864
const TrackingCenter = lazy(() => import(/* webpackChunkName: "module-tracking" */ "@/modules/tracking/pages/TrackingCenter"));

// API Center - PATCH 865
const APICenter = lazy(() => import(/* webpackChunkName: "page-api-center" */ "@/pages/APICenter"));

// MMI Jobs Direct Route - PATCH 866
const MMIJobsPanel = lazy(() => import(/* webpackChunkName: "page-mmi-jobs" */ "@/pages/MMIJobsPanel"));

// V3.2.0 Advanced Modules
const VesselContracts = lazy(() => import(/* webpackChunkName: "page-vessel-contracts" */ "@/pages/VesselContracts"));
const VesselCTS = lazy(() => import(/* webpackChunkName: "page-vessel-cts" */ "@/pages/VesselCTS"));
const VesselHistory = lazy(() => import(/* webpackChunkName: "page-vessel-history" */ "@/pages/VesselHistory"));
const GMUD = lazy(() => import(/* webpackChunkName: "page-gmud" */ "@/pages/GMUD"));
const ResponsibilityMatrix = lazy(() => import(/* webpackChunkName: "page-responsibility-matrix" */ "@/pages/ResponsibilityMatrix"));
const SafetyHumanFactors = lazy(() => import(/* webpackChunkName: "page-safety-human-factors" */ "@/pages/SafetyHumanFactors"));
const SafetyIMCA = lazy(() => import(/* webpackChunkName: "page-safety-imca" */ "@/pages/SafetyIMCA"));
const PreOVIDInspection = lazy(() => import(/* webpackChunkName: "page-pre-ovid" */ "@/pages/PreOVIDInspection"));
const SGSOReportPage = lazy(() => import(/* webpackChunkName: "page-sgso-report" */ "@/pages/SGSOReport"));

// V2 ELEVATED MODULES - PATCH V2-UPGRADE
const VesselContractsV2 = lazy(() => import(/* webpackChunkName: "page-vessel-contracts-v2" */ "@/pages/VesselContractsV2"));
const CharterPartyV2 = lazy(() => import(/* webpackChunkName: "page-charter-party-v2" */ "@/pages/CharterPartyV2"));
const CargoManagementV2 = lazy(() => import(/* webpackChunkName: "page-cargo-management-v2" */ "@/pages/CargoManagementV2"));
const PortCallOptimizationV2 = lazy(() => import(/* webpackChunkName: "page-port-call-v2" */ "@/pages/PortCallOptimizationV2"));
const VesselCTSV2 = lazy(() => import(/* webpackChunkName: "page-vessel-cts-v2" */ "@/pages/VesselCTSV2"));
const VesselHistoryV2 = lazy(() => import(/* webpackChunkName: "page-vessel-history-v2" */ "@/pages/VesselHistoryV2"));
const GMUDV2 = lazy(() => import(/* webpackChunkName: "page-gmud-v2" */ "@/pages/GMUDV2"));
const ResponsibilityMatrixV2 = lazy(() => import(/* webpackChunkName: "page-responsibility-matrix-v2" */ "@/pages/ResponsibilityMatrixV2"));
const SafetyHumanFactorsV2 = lazy(() => import(/* webpackChunkName: "page-safety-hf-v2" */ "@/pages/SafetyHumanFactorsV2"));
const SafetyIMCAV2 = lazy(() => import(/* webpackChunkName: "page-safety-imca-v2" */ "@/pages/SafetyIMCAV2"));
const ISPSSecurityV2 = lazy(() => import(/* webpackChunkName: "page-isps-v2" */ "@/pages/ISPSSecurityV2"));
const DrillSimulatorV2 = lazy(() => import(/* webpackChunkName: "page-drill-simulator-v2" */ "@/pages/DrillSimulatorV2"));
const ComplianceOneV2 = lazy(() => import(/* webpackChunkName: "page-compliance-one-v2" */ "@/pages/ComplianceOneV2"));
const RegulationsV2 = lazy(() => import(/* webpackChunkName: "page-regulations-v2" */ "@/pages/RegulationsV2"));
const RiskMatrixV2 = lazy(() => import(/* webpackChunkName: "page-risk-matrix-v2" */ "@/pages/RiskMatrixV2"));
const EvidencesV2 = lazy(() => import(/* webpackChunkName: "page-evidences-v2" */ "@/pages/EvidencesV2"));
const DueDiligenceV2 = lazy(() => import(/* webpackChunkName: "page-due-diligence-v2" */ "@/pages/DueDiligenceV2"));
const WhistleblowerV2 = lazy(() => import(/* webpackChunkName: "page-whistleblower-v2" */ "@/pages/WhistleblowerV2"));

// Central de Comando - PATCH UNIFY-4.0 (Fusão Nautilus Command + Dashboard)
const CentralComando = lazy(() => import(/* webpackChunkName: "page-central-comando" */ "@/pages/CentralComando"));

// Q1 2025 Critical Modules - Cargo, Charter, Port Optimization
const CargoManagementPage = lazy(() => import(/* webpackChunkName: "page-cargo-management" */ "@/pages/CargoManagementPage"));
const CharterPartyPage = lazy(() => import(/* webpackChunkName: "page-charter-party" */ "@/pages/CharterPartyPage"));
const PortCallOptimizationPage = lazy(() => import(/* webpackChunkName: "page-port-call-optimization" */ "@/pages/PortCallOptimizationPage"));
const VoyageAccountingPage = lazy(() => import(/* webpackChunkName: "page-voyage-accounting" */ "@/pages/VoyageAccountingPage"));

// Q1 2025 Quick Wins & New Modules
const ExportCenterPage = lazy(() => import(/* webpackChunkName: "page-export-center" */ "@/pages/ExportCenterPage"));
const AdvancedSearchPage = lazy(() => import(/* webpackChunkName: "page-advanced-search" */ "@/pages/AdvancedSearchPage"));
const ISPSPage = lazy(() => import(/* webpackChunkName: "page-isps" */ "@/pages/ISPSPage"));
const DrillSimulatorPage = lazy(() => import(/* webpackChunkName: "page-drill-simulator" */ "@/pages/DrillSimulatorPage"));
const SustainabilityScorePage = lazy(() => import(/* webpackChunkName: "page-sustainability-score" */ "@/pages/SustainabilityScorePage"));
const Gamification = lazy(() => import(/* webpackChunkName: "page-gamification" */ "@/pages/Gamification"));

// Revolutionary Features Hub - PATCH REVOLUTION v1.0
const RevolutionaryFeaturesPage = lazy(() => import(/* webpackChunkName: "page-revolutionary-features" */ "@/pages/RevolutionaryFeaturesPage"));

// AI Hub Central - PATCH AI-REVOLUTION
const AIHubPage = lazy(() => import(/* webpackChunkName: "page-ai-hub" */ "@/pages/AIHubPage"));

// AI Analytics Dashboard - PATCH AI-REVOLUTION
const AIAnalyticsDashboard = lazy(() => import(/* webpackChunkName: "page-ai-analytics" */ "@/pages/AIAnalyticsDashboard"));

const SmartLayout = lazy(() =>
  import(/* webpackChunkName: "layout-smart" */ "./components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
);

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
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      
                      {/* Protected Routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <SmartLayout />
                        </ProtectedRoute>
                      }>
                        {/* PATCH UNIFY-4.0: Rota principal "/" redireciona para Central de Comando */}
                        <Route index element={<Navigate to="/central-comando" replace />} />
                        <Route path="dashboard" element={<Navigate to="/central-comando/visao-geral" replace />} />
                        
                        {/* Central de Comando - Módulo Unificado */}
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
                        <Route path="__debug__" element={<SystemDebug />} />
                        <Route path="revolutionary-ai/*" element={<RevolutionaryAI />} />
                        <Route path="ai-modules" element={<AIEnhancedModules />} />
                        <Route path="noc-mode" element={<NOCMode />} />
                        <Route path="noc" element={<NOCMode />} />
                        <Route path="auditoria-tecnica" element={<AuditoriaTecnica />} />
                        <Route path="auditoria-seguranca" element={<SecurityAudit />} />
                        <Route path="telemetria" element={<TelemetriaCommand />} />
                        
                        {/* Revolutionary Features - PATCH FINAL */}
                        <Route path="vision-ai" element={<VisionAI />} />
                        <Route path="ais-tracking" element={<AISTracking />} />
                        <Route path="certificate-blockchain" element={<CertificateBlockchain />} />
                        <Route path="voice-assistant" element={<VoiceAssistant />} />
                        
                        {/* AI Ops & Security - PATCH 852 */}
                        <Route path="ai-operations-center" element={<AIOperationsCenter />} />
                        <Route path="security-center" element={<SecurityCenter />} />
                        <Route path="predictive-telemetry" element={<PredictiveTelemetry />} />
                        
                        {/* Incident Simulator & Offline - PATCH 853 */}
                        <Route path="simulador" element={<IncidentSimulator />} />
                        <Route path="offline" element={<OfflinePage />} />
                        
{/* Integrations & Docs - PATCH 854 */}
                        <Route path="integracoes" element={<IntegrationsCenter />} />
                        <Route path="integracoes/api-monitor" element={<APIMonitor />} />
                        <Route path="docs" element={<DocumentationHub />} />
                        
                        {/* NEW: API Integration Routes - PATCH 856 */}
                        <Route path="weather-maritime" element={<WeatherMaritime />} />
                        <Route path="ais-tracker-page" element={<AISTrackerPage />} />
                        <Route path="voice-transcriber" element={<VoiceTranscriber />} />
                        
                        {/* NEW: Additional API Pages - PATCH 857 */}
                        <Route path="port-api" element={<PortAPI />} />
                        <Route path="flight-tracker" element={<FlightTracker />} />
                        <Route path="security-scanner" element={<SecurityScanner />} />
                        <Route path="earthquake-monitor" element={<EarthquakeMonitor />} />
                        <Route path="noaa-weather" element={<NOAAWeather />} />
                        <Route path="opensky-flights" element={<OpenSkyFlights />} />
                        
                        {/* NEW: Executive & NOC Routes - PATCH 855 */}
                        <Route path="executive-bi" element={<ExecutiveBIDashboard />} />
                        <Route path="noc-monitoring" element={<NOCMonitoring />} />
                        
{/* AI Observability - PATCH 860 */}
                        <Route path="ai-observability" element={<AIObservabilityDashboard />} />
                        
{/* Roadmap - PATCH 859 */}
                        <Route path="roadmap" element={<Roadmap />} />

                        {/* Revolutionary Features Hub - PATCH REVOLUTION v1.0 */}
                        <Route path="revolutionary-features" element={<RevolutionaryFeaturesPage />} />
                        
                        {/* AI Hub Central - PATCH AI-REVOLUTION */}
                        <Route path="ai-hub" element={<AIHubPage />} />
                        <Route path="ai-analytics" element={<AIAnalyticsDashboard />} />
                        
                        {/* AI Self-Healing - PATCH 860 */}
                        <Route path="ai-ops/logs" element={<SelfHealingLogs />} />
                        
                        {/* Sidebar Diagnostic - PATCH 862 */}
                        <Route path="dev/sidebar-check" element={<SidebarCheck />} />

                        {/* Compliance One Module - PATCH 863 */}
                        <Route path="compliance-center/*" element={<ComplianceCenter />} />

                        {/* DGNSS Tracking Module - PATCH 864 */}
                        <Route path="tracking/*" element={<TrackingCenter />} />

                        {/* API Center - PATCH 865 */}
                        <Route path="integracoes/api-center" element={<APICenter />} />

                        {/* MMI Jobs Direct Route - PATCH 866 */}
                        <Route path="mmi-jobs" element={<MMIJobsPanel />} />

{/* V3.2.0 Advanced Modules */}
                        <Route path="vessel-contracts" element={<VesselContracts />} />
                        <Route path="vessel-cts" element={<VesselCTS />} />
                        <Route path="vessel-history" element={<VesselHistory />} />
                        <Route path="gmud" element={<GMUD />} />
                        <Route path="responsibility-matrix" element={<ResponsibilityMatrix />} />
                        <Route path="safety-human-factors" element={<SafetyHumanFactors />} />
                        <Route path="safety-imca" element={<SafetyIMCA />} />
                        <Route path="pre-ovid" element={<PreOVIDInspection />} />
                        <Route path="sgso/report" element={<SGSOReportPage />} />
                        
                        {/* V2 ELEVATED MODULES - PATCH V2-UPGRADE */}
                        <Route path="vessel-contracts-v2" element={<VesselContractsV2 />} />
                        <Route path="charter-party-v2" element={<CharterPartyV2 />} />
                        <Route path="cargo-management-v2" element={<CargoManagementV2 />} />
                        <Route path="port-call-v2" element={<PortCallOptimizationV2 />} />
                        <Route path="vessel-cts-v2" element={<VesselCTSV2 />} />
                        <Route path="vessel-history-v2" element={<VesselHistoryV2 />} />
                        <Route path="gmud-v2" element={<GMUDV2 />} />
                        <Route path="responsibility-matrix-v2" element={<ResponsibilityMatrixV2 />} />
                        <Route path="safety-human-factors-v2" element={<SafetyHumanFactorsV2 />} />
                        <Route path="safety-imca-v2" element={<SafetyIMCAV2 />} />
                        <Route path="isps-security-v2" element={<ISPSSecurityV2 />} />
                        <Route path="drill-simulator-v2" element={<DrillSimulatorV2 />} />
                        <Route path="compliance-one-v2" element={<ComplianceOneV2 />} />
                        <Route path="regulations-v2" element={<RegulationsV2 />} />
                        <Route path="risk-matrix-v2" element={<RiskMatrixV2 />} />
                        <Route path="evidences-v2" element={<EvidencesV2 />} />
                        <Route path="due-diligence-v2" element={<DueDiligenceV2 />} />
                        <Route path="whistleblower-v2" element={<WhistleblowerV2 />} />
                        
                        {/* Q1 2025 Critical Modules */}
                        <Route path="cargo-management" element={<CargoManagementPage />} />
                        <Route path="charter-party" element={<CharterPartyPage />} />
                        <Route path="port-call-optimization" element={<PortCallOptimizationPage />} />
                        <Route path="voyage-accounting" element={<VoyageAccountingPage />} />
                        
                        {/* Q1 2025 Quick Wins & New Modules */}
                        <Route path="export-center" element={<ExportCenterPage />} />
                        <Route path="advanced-search" element={<AdvancedSearchPage />} />
                        <Route path="isps-security" element={<ISPSPage />} />
                        <Route path="drill-simulator" element={<DrillSimulatorPage />} />
                        <Route path="sustainability-score" element={<SustainabilityScorePage />} />
                        <Route path="gamification" element={<Gamification />} />

                        {/* Legacy Redirects - Extracted */}
                        {legacyRedirectRoutes}
                        
                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                    
                    <Toaster />
                    <FloatingButtonsContainer>
                      <GlobalAIButton />
                      <GlobalAILevel3Button />
                      <GlobalVoiceButton />
                      <NautilusBrainButton />
                    </FloatingButtonsContainer>
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
