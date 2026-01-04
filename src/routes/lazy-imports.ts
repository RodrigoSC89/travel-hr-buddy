/**
 * Lazy Imports - Centralized lazy component loading
 * Organized by category for maintainability
 */
import { lazy } from "react";

// ============= CORE PAGES =============
export const Index = lazy(() => import(/* webpackChunkName: "page-index" */ "@/pages/Index"));
export const Dashboard = lazy(() => import(/* webpackChunkName: "page-dashboard" */ "@/pages/Dashboard"));
export const Admin = lazy(() => import(/* webpackChunkName: "page-admin" */ "@/pages/Admin"));
export const Settings = lazy(() => import(/* webpackChunkName: "page-settings" */ "@/pages/Settings"));
export const HealthCheck = lazy(() => import(/* webpackChunkName: "page-health" */ "@/pages/HealthCheck"));
export const NotFound = lazy(() => import(/* webpackChunkName: "page-notfound" */ "@/pages/NotFoundProfessional"));
export const Unauthorized = lazy(() => import(/* webpackChunkName: "page-unauthorized" */ "@/pages/Unauthorized"));
export const Auth = lazy(() => import(/* webpackChunkName: "page-auth" */ "@/pages/Auth"));
export const UserProfilePage = lazy(() => import(/* webpackChunkName: "page-profile" */ "@/pages/user/profile"));
export const SystemDebug = lazy(() => import(/* webpackChunkName: "page-debug" */ "@/pages/SystemDebug"));
export const Billing = lazy(() => import(/* webpackChunkName: "page-billing" */ "@/pages/Billing"));

// ============= AI MODULES =============
export const RevolutionaryAI = lazy(() => import(/* webpackChunkName: "page-ai" */ "@/pages/RevolutionaryAI"));
export const AIEnhancedModules = lazy(() => import(/* webpackChunkName: "page-ai-modules" */ "@/pages/AIEnhancedModules"));
export const AIOperationsCenter = lazy(() => import(/* webpackChunkName: "page-ai-ops" */ "@/pages/AIOperationsCenter"));
export const AIObservabilityDashboard = lazy(() => import(/* webpackChunkName: "page-ai-observability" */ "@/pages/AIObservabilityDashboard"));
export const SelfHealingLogs = lazy(() => import(/* webpackChunkName: "page-self-healing" */ "@/pages/ai/SelfHealingLogs"));
export const AIHubPage = lazy(() => import(/* webpackChunkName: "page-ai-hub" */ "@/pages/AIHubPage"));
export const AIAnalyticsDashboard = lazy(() => import(/* webpackChunkName: "page-ai-analytics" */ "@/pages/AIAnalyticsDashboard"));
export const VisionAI = lazy(() => import(/* webpackChunkName: "page-vision-ai" */ "@/pages/VisionAI"));
export const VoiceAssistant = lazy(() => import(/* webpackChunkName: "page-voice-assistant" */ "@/pages/VoiceAssistant"));
export const VoiceTranscriber = lazy(() => import(/* webpackChunkName: "page-voice-transcriber" */ "@/pages/VoiceTranscriber"));

// ============= SECURITY & MONITORING =============
export const SecurityCenter = lazy(() => import(/* webpackChunkName: "page-security-center" */ "@/pages/SecurityCenter"));
export const SecurityAudit = lazy(() => import(/* webpackChunkName: "page-security-audit" */ "@/pages/SecurityAudit"));
export const SecurityScanner = lazy(() => import(/* webpackChunkName: "page-security-scanner" */ "@/pages/SecurityScanner"));
export const NOCMode = lazy(() => import(/* webpackChunkName: "page-noc" */ "@/pages/NOCMode"));
export const NOCMonitoring = lazy(() => import(/* webpackChunkName: "page-noc-monitoring" */ "@/pages/NOCMonitoring"));
export const TelemetriaCommand = lazy(() => import(/* webpackChunkName: "page-telemetria" */ "@/pages/TelemetriaCommand"));
export const PredictiveTelemetry = lazy(() => import(/* webpackChunkName: "page-predictive-telemetry" */ "@/pages/PredictiveTelemetry"));
export const ObservabilityCenter = lazy(() => import(/* webpackChunkName: "page-observability" */ "@/pages/ObservabilityCenter"));
export const AuditoriaTecnica = lazy(() => import(/* webpackChunkName: "page-auditoria" */ "@/pages/AuditoriaTecnica"));

// ============= OPERATIONS & FLEET =============
export const AISTracking = lazy(() => import(/* webpackChunkName: "page-ais-tracking" */ "@/pages/AISTracking"));
export const AISTrackerPage = lazy(() => import(/* webpackChunkName: "page-ais-tracker" */ "@/pages/AISTrackerPage"));
export const CertificateBlockchain = lazy(() => import(/* webpackChunkName: "page-cert-blockchain" */ "@/pages/CertificateBlockchain"));
export const IncidentSimulator = lazy(() => import(/* webpackChunkName: "page-incident-simulator" */ "@/pages/IncidentSimulator"));
export const VesselContracts = lazy(() => import(/* webpackChunkName: "page-vessel-contracts" */ "@/pages/VesselContracts"));
export const VesselCTS = lazy(() => import(/* webpackChunkName: "page-vessel-cts" */ "@/pages/VesselCTS"));
export const VesselHistory = lazy(() => import(/* webpackChunkName: "page-vessel-history" */ "@/pages/VesselHistory"));
export const GMUD = lazy(() => import(/* webpackChunkName: "page-gmud" */ "@/pages/GMUD"));
export const ResponsibilityMatrix = lazy(() => import(/* webpackChunkName: "page-responsibility-matrix" */ "@/pages/ResponsibilityMatrix"));
export const CargoManagementPage = lazy(() => import(/* webpackChunkName: "page-cargo-management" */ "@/pages/CargoManagementPage"));
export const CharterPartyPage = lazy(() => import(/* webpackChunkName: "page-charter-party" */ "@/pages/CharterPartyPage"));
export const PortCallOptimizationPage = lazy(() => import(/* webpackChunkName: "page-port-call-optimization" */ "@/pages/PortCallOptimizationPage"));
export const VoyageAccountingPage = lazy(() => import(/* webpackChunkName: "page-voyage-accounting" */ "@/pages/VoyageAccountingPage"));

// ============= SAFETY & COMPLIANCE =============
export const SafetyHumanFactors = lazy(() => import(/* webpackChunkName: "page-safety-human-factors" */ "@/pages/SafetyHumanFactors"));
export const SafetyIMCA = lazy(() => import(/* webpackChunkName: "page-safety-imca" */ "@/pages/SafetyIMCA"));
export const PreOVIDInspection = lazy(() => import(/* webpackChunkName: "page-pre-ovid" */ "@/pages/PreOVIDInspection"));
export const SGSOReportPage = lazy(() => import(/* webpackChunkName: "page-sgso-report" */ "@/pages/SGSOReport"));
export const ISPSPage = lazy(() => import(/* webpackChunkName: "page-isps" */ "@/pages/ISPSPage"));
export const DrillSimulatorPage = lazy(() => import(/* webpackChunkName: "page-drill-simulator" */ "@/pages/DrillSimulatorPage"));
export const ComplianceCenter = lazy(() => import(/* webpackChunkName: "module-compliance" */ "@/modules/compliance/pages/ComplianceCenter"));
export const TrackingCenter = lazy(() => import(/* webpackChunkName: "module-tracking" */ "@/modules/tracking/pages/TrackingCenter"));

// ============= V2 ELEVATED MODULES =============
export const VesselContractsV2 = lazy(() => import(/* webpackChunkName: "page-vessel-contracts-v2" */ "@/pages/VesselContractsV2"));
export const CharterPartyV2 = lazy(() => import(/* webpackChunkName: "page-charter-party-v2" */ "@/pages/CharterPartyV2"));
export const CargoManagementV2 = lazy(() => import(/* webpackChunkName: "page-cargo-management-v2" */ "@/pages/CargoManagementV2"));
export const PortCallOptimizationV2 = lazy(() => import(/* webpackChunkName: "page-port-call-v2" */ "@/pages/PortCallOptimizationV2"));
export const VesselCTSV2 = lazy(() => import(/* webpackChunkName: "page-vessel-cts-v2" */ "@/pages/VesselCTSV2"));
export const VesselHistoryV2 = lazy(() => import(/* webpackChunkName: "page-vessel-history-v2" */ "@/pages/VesselHistoryV2"));
export const GMUDV2 = lazy(() => import(/* webpackChunkName: "page-gmud-v2" */ "@/pages/GMUDV2"));
export const ResponsibilityMatrixV2 = lazy(() => import(/* webpackChunkName: "page-responsibility-matrix-v2" */ "@/pages/ResponsibilityMatrixV2"));
export const SafetyHumanFactorsV2 = lazy(() => import(/* webpackChunkName: "page-safety-hf-v2" */ "@/pages/SafetyHumanFactorsV2"));
export const SafetyIMCAV2 = lazy(() => import(/* webpackChunkName: "page-safety-imca-v2" */ "@/pages/SafetyIMCAV2"));
export const ISPSSecurityV2 = lazy(() => import(/* webpackChunkName: "page-isps-v2" */ "@/pages/ISPSSecurityV2"));
export const DrillSimulatorV2 = lazy(() => import(/* webpackChunkName: "page-drill-simulator-v2" */ "@/pages/DrillSimulatorV2"));
export const ComplianceOneV2 = lazy(() => import(/* webpackChunkName: "page-compliance-one-v2" */ "@/pages/ComplianceOneV2"));
export const RegulationsV2 = lazy(() => import(/* webpackChunkName: "page-regulations-v2" */ "@/pages/RegulationsV2"));
export const RiskMatrixV2 = lazy(() => import(/* webpackChunkName: "page-risk-matrix-v2" */ "@/pages/RiskMatrixV2"));
export const EvidencesV2 = lazy(() => import(/* webpackChunkName: "page-evidences-v2" */ "@/pages/EvidencesV2"));
export const DueDiligenceV2 = lazy(() => import(/* webpackChunkName: "page-due-diligence-v2" */ "@/pages/DueDiligenceV2"));
export const WhistleblowerV2 = lazy(() => import(/* webpackChunkName: "page-whistleblower-v2" */ "@/pages/WhistleblowerV2"));

// ============= INTEGRATIONS & APIs =============
export const IntegrationsCenter = lazy(() => import(/* webpackChunkName: "page-integrations" */ "@/pages/IntegrationsCenter"));
export const DocumentationHub = lazy(() => import(/* webpackChunkName: "page-docs" */ "@/pages/DocumentationHub"));
export const APIMonitor = lazy(() => import(/* webpackChunkName: "page-api-monitor" */ "@/pages/APIMonitor"));
export const APICenter = lazy(() => import(/* webpackChunkName: "page-api-center" */ "@/pages/APICenter"));
export const ExternalAPIsPage = lazy(() => import(/* webpackChunkName: "page-external-apis" */ "@/pages/ExternalAPIsPage"));
export const WeatherMaritime = lazy(() => import(/* webpackChunkName: "page-weather-maritime" */ "@/pages/WeatherMaritime"));
export const PortAPI = lazy(() => import(/* webpackChunkName: "page-port-api" */ "@/pages/PortAPI"));
export const FlightTracker = lazy(() => import(/* webpackChunkName: "page-flight-tracker" */ "@/pages/FlightTracker"));
export const EarthquakeMonitor = lazy(() => import(/* webpackChunkName: "page-earthquake-monitor" */ "@/pages/EarthquakeMonitor"));
export const NOAAWeather = lazy(() => import(/* webpackChunkName: "page-noaa-weather" */ "@/pages/NOAAWeather"));
export const OpenSkyFlights = lazy(() => import(/* webpackChunkName: "page-opensky-flights" */ "@/pages/OpenSkyFlights"));

// ============= BETA & STATUS =============
export const BetaFeedback = lazy(() => import(/* webpackChunkName: "page-beta-feedback" */ "@/pages/BetaFeedback"));
export const BetaDashboard = lazy(() => import(/* webpackChunkName: "page-beta-dashboard" */ "@/pages/BetaDashboard"));
export const StatusPage = lazy(() => import(/* webpackChunkName: "page-status" */ "@/pages/StatusPage"));
export const Roadmap = lazy(() => import(/* webpackChunkName: "page-roadmap" */ "@/pages/Roadmap"));

// ============= EXECUTIVE & BI =============
export const ExecutiveBIDashboard = lazy(() => import(/* webpackChunkName: "page-executive-bi" */ "@/pages/ExecutiveBIDashboard"));
export const RevolutionaryFeaturesPage = lazy(() => import(/* webpackChunkName: "page-revolutionary-features" */ "@/pages/RevolutionaryFeaturesPage"));
export const SustainabilityScorePage = lazy(() => import(/* webpackChunkName: "page-sustainability-score" */ "@/pages/SustainabilityScorePage"));
export const Gamification = lazy(() => import(/* webpackChunkName: "page-gamification" */ "@/pages/Gamification"));
export const ExportCenterPage = lazy(() => import(/* webpackChunkName: "page-export-center" */ "@/pages/ExportCenterPage"));
export const AdvancedSearchPage = lazy(() => import(/* webpackChunkName: "page-advanced-search" */ "@/pages/AdvancedSearchPage"));

// ============= SPECIAL PAGES =============
export const OfflinePage = lazy(() => import(/* webpackChunkName: "page-offline" */ "@/pages/OfflinePage"));
export const MMIJobsPanel = lazy(() => import(/* webpackChunkName: "page-mmi-jobs" */ "@/pages/MMIJobsPanel"));
export const SidebarCheck = lazy(() => import(/* webpackChunkName: "page-sidebar-check" */ "@/pages/dev/SidebarCheck"));
export const CentralComando = lazy(() => import(/* webpackChunkName: "page-central-comando" */ "@/pages/CentralComando"));

// ============= LAYOUT =============
export const SmartLayout = lazy(() =>
  import(/* webpackChunkName: "layout-smart" */ "@/components/layout/SmartLayout").then(m => ({ default: m.SmartLayout }))
);
