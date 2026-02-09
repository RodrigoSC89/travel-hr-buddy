/**
 * App.tsx - Versão Completa com Todas as Rotas do Sidebar
 * PATCH: Rotas completas para 100+ módulos + Mobile/PWA optimizations
 * PATCH v28: Global error handlers for white screen prevention
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

// ============================================
// GLOBAL ERROR HANDLERS - Prevent white screens
// ============================================
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    
    // Don't show toast for common non-critical errors
    const ignorableErrors = [
      'ResizeObserver',
      'Script error',
      'Non-Error promise rejection',
      'Loading chunk',
      'ChunkLoadError',
    ];
    
    const shouldIgnore = ignorableErrors.some(e => message.includes(e));
    
    if (!shouldIgnore) {
      logger.error('[App] Unhandled rejection:', { message });
      // Show user-friendly toast instead of crashing
      toast.error('Ocorreu um erro inesperado', {
        description: 'A operação será tentada novamente automaticamente.',
        duration: 3000,
      });
    }
    
    // Prevent default browser handling (which could crash the app)
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    const message = event.message || 'Unknown error';
    
    // Ignore script loading errors (will be handled by LazyLoadErrorBoundary)
    if (message.includes('Loading chunk') || message.includes('dynamically imported')) {
      return;
    }
    
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
const LogisticsCommandPage = lazy(() => import("@/pages/LogisticsCommandPage"));
const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
const AgentOrchestrationPage = lazy(() => import("@/pages/AgentOrchestrationPage"));
const BlockchainCompliancePage = lazy(() => import("@/pages/BlockchainCompliancePage"));
const CompanyFinancialPage = lazy(() => import("@/pages/CompanyFinancialPage"));
const MLCSchedulingPage = lazy(() => import("@/pages/MLCSchedulingPage"));
const SupplierPortalPage = lazy(() => import("@/pages/SupplierPortalPage"));
const IoTDashboardPage = lazy(() => import("@/pages/IoTDashboardPage"));

// Módulos Completos - Enhanced
const MedicalInfirmary = lazy(() => import("@/modules/medical-infirmary"));
const EnhancedWasteManagement = lazy(() => import("@/pages/WasteManagementPremium"));

// PATCH PREMIUM-2.0 - Módulos Aprimorados
const CentralComandoAprimorada = lazy(() => import("@/pages/dashboard/CentralComandoAprimorada"));
const SystemHubAprimorado = lazy(() => import("@/pages/SystemHubAprimorado"));
const MedicalInfirmaryEnhanced = lazy(() => import("@/pages/MedicalInfirmaryEnhanced"));
const WasteManagementEnhanced = lazy(() => import("@/pages/WasteManagementEnhanced"));
const SatcomDashboardEnhanced = lazy(() => import("@/pages/SatcomDashboardEnhanced"));

// ============================================
// MANUTENÇÃO
// ============================================
const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));
const FuelManagementPage = lazy(() => import("@/pages/FuelManagementPage"));

// ============================================
// OPERAÇÕES SUBMARINAS - RESTAURADAS com IntegrationGuard
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
const AIHubPage = lazy(() => import("@/pages/AIHubPage"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
const RevolutionaryFeaturesPage = lazy(() => import("@/pages/RevolutionaryFeaturesPage"));
const AutonomousCommandCenter = lazy(() => import("@/pages/AutonomousCommandCenter"));
const AIObservabilityDashboard = lazy(() => import("@/pages/AIObservabilityDashboard"));
const WorkflowCommandCenter = lazy(() => import("@/pages/WorkflowCommandCenter"));
const AIAudit = lazy(() => import("@/pages/AIAudit"));
const VoiceAssistant = lazy(() => import("@/pages/VoiceAssistant"));
const VoiceAssistantAIPage = lazy(() => import("@/pages/VoiceAssistantAIPage"));
const PortugueseVoiceAssistantPage = lazy(() => import("@/pages/PortugueseVoiceAssistantPage"));
const AIOperationsCenter = lazy(() => import("@/pages/AIOperationsCenter"));
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
// MaritimeChecklists moved to MaritimeCommandCenter
const DocumentWorkflow = lazy(() => import("@/pages/DocumentWorkflow"));
const ExportCenterPage = lazy(() => import("@/pages/ExportCenterPage"));
const AdvancedSearchPage = lazy(() => import("@/pages/AdvancedSearchPage"));
const KnowledgeHubPage = lazy(() => import("@/modules/knowledge-hub/pages/KnowledgeHubPage"));

// ============================================
// COMUNICAÇÃO & ALERTAS
// ============================================
const CommunicationCommandCenter = lazy(() => import("@/pages/CommunicationCommandCenter"));
const AlertsCommandCenter = lazy(() => import("@/pages/AlertsCommandCenter"));

// ============================================
// AUDITORIAS & COMPLIANCE - 12 AUDITORIAS MARÍTIMAS COMPLETAS
// ============================================
const PEODP = lazy(() => import("@/pages/PEODP"));
const PEOTRAM = lazy(() => import("@/pages/PEOTRAM"));
const SGSO = lazy(() => import("@/pages/SGSO"));
const SGSOReportPage = lazy(() => import("@/pages/SGSOReportPage"));
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
// NOVAS AUDITORIAS - Pre-SIRE 2.0, TMSA, SOLAS/LSA/FFE
const PreSIREInspection = lazy(() => import("@/pages/PreSIREInspection"));
const TMSAAssessment = lazy(() => import("@/pages/TMSAAssessment"));
const SOLASInspection = lazy(() => import("@/pages/SOLASInspection"));

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
const VoyagePnLPage = lazy(() => import("@/pages/VoyagePnLPage"));
const CrewSchedulerPage = lazy(() => import("@/pages/CrewSchedulerPage"));
const AnalyticsCommandCenter = lazy(() => import("@/pages/AnalyticsCommandCenter"));
const OperationsCommandCenter = lazy(() => import("@/pages/OperationsCommandCenter"));
 const ProcurementCommandCenter = lazy(() => import("@/pages/ProcurementCommandCenterPremium"));
const TaskManagement = lazy(() => import("@/pages/TaskManagement"));
const FinanceProcurementAIPage = lazy(() => import("@/pages/FinanceProcurementAIPage"));

// ============================================
// UNIFIED HUBS - PROMPT MASTER V4.1 (ENHANCED)
// ============================================
const OperationsCommandHub = lazy(() => import("@/pages/OperationsCommandHubEnhanced"));
const AIControlTowerHub = lazy(() => import("@/pages/AIControlTowerHubEnhanced"));
const PeopleHub = lazy(() => import("@/pages/PeopleHubPremium"));
const TrackingTelemetryHub = lazy(() => import("@/pages/TrackingTelemetryPremium"));
const DocumentCenterHub = lazy(() => import("@/pages/DocumentCenterPremium"));
const CommsAlertsHub = lazy(() => import("@/pages/CommsAlertsHub"));
const AIEnterpriseEnginesHub = lazy(() => import("@/pages/AIEnterpriseEnginesHub"));
const ComplianceHubPage = lazy(() => import("@/pages/ComplianceHubPremium"));
const SystemHubPremium = lazy(() => import("@/pages/SystemHubPremium"));
const MaintenanceHub = lazy(() => import("@/pages/MaintenanceHubPremium"));
const FinanceHub = lazy(() => import("@/pages/FinanceCommandCenterPremium"));

// Medical Infirmary Premium
const MedicalInfirmaryPremium = lazy(() => import("@/pages/MedicalInfirmaryPremium"));

// STCW/MLC Compliance Center - Separated from Crew Intelligence
const STCWMLCCompliance = lazy(() => import("@/pages/STCWMLCCompliance"));

// ============================================
// ESG & SUSTENTABILIDADE
// ============================================
const SustainabilityScorePage = lazy(() => import("@/pages/SustainabilityScorePage"));
const ESGEmissionsPage = lazy(() => import("@/pages/ESGEmissionsPremium"));
const WasteManagementPage = lazy(() => import("@/pages/WasteManagementPage"));

// ============================================
// SOLAS/ISPS/ISM TRAINING (dedicated page)
// ============================================
const SOLASISPSTrainingPage = lazy(() => import("@/pages/SOLASISPSTrainingPage"));

// ============================================
// VIAGENS & LOGÍSTICA
// ============================================
const TravelCommandCenter = lazy(() => import("@/pages/TravelCommandPremium"));
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
// ADVANCED MARITIME MODULES - 12 REVOLUTIONARY FEATURES
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

// ============================================
// WORLD-CLASS DIFFERENTIALS
// ============================================
const FleetPulsePage = lazy(() => import("@/pages/FleetPulsePage"));
const VoyageSimulatorPage = lazy(() => import("@/pages/VoyageSimulatorPage"));
const CrewWellbeingPage = lazy(() => import("@/pages/CrewWellbeingPage"));
const PSCReadinessPageNew = lazy(() => import("@/pages/PSCReadinessPage"));

// ============================================
// SYSTEM & QA
// ============================================
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
// Dashboard, ExecutiveDashboard, Analytics → CentralComando/AnalyticsCommandCenter

// ============================================
// ADMIN SUB-PAGES (documents, templates, sgso, reports, etc.)
// ============================================
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

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

// Loader com timeout de segurança para prevenir loading infinito
/**
 * Loader with delayed visibility to prevent flash during fast transitions
 */
/**
 * Loader INSTANTÂNEO - Sem delays ou animações que causam flickering
 * PATCH: Anti-flickering v3.0
 */
const Loader = () => {
  const [showRetry, setShowRetry] = React.useState(false);
  
  React.useEffect(() => {
    // Show retry button after 15s only
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
  
  // RENDER IMEDIATO - Sem delay de visibilidade
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-foreground">Carregando Nauti One...</p>
        {showRetry && (
          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              O carregamento está demorando mais que o normal.
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Limpar cache e recarregar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Layout com Sidebar para rotas autenticadas - CORRIGIDO COM HEADER E MOBILE NAV
const AuthenticatedLayout = () => {
  // Importar OfflineStatusBar dinamicamente para evitar erros se não existir
  const OfflineStatusBar = lazy(() => 
    import("@/components/offline/OfflineStatusBar").then(mod => ({ default: mod.OfflineStatusBar }))
  );

  // Command Palette for global search
  const CommandPalette = lazy(() => import("@/components/shared/CommandPalette"));

  // Global AI Assistant
  const GlobalAIAssistant = lazy(() => 
    import("@/components/ai/GlobalAIAssistant").then(mod => ({ default: mod.GlobalAIAssistant }))
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - renders as Sheet on mobile via SidebarProvider */}
        <AppSidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header with mobile menu trigger */}
          <Header />
          
          {/* Main content with padding for mobile bottom nav - NO animation wrapper to prevent flickering */}
          <main className="flex-1 overflow-auto px-3 pb-20 md:px-6 md:pb-6">
            <Outlet />
          </main>
        </div>
        
        {/* Mobile Bottom Navigation - only shows on mobile */}
        <MobileBottomNav />
        
        {/* Onboarding Tour for new users */}
        <ProductOnboardingTour />
        
        {/* Offline Status Bar - shows connection status */}
        <Suspense fallback={null}>
          <OfflineStatusBar position="bottom" showDetails={true} />
        </Suspense>
        
        {/* Command Palette - Global Module Search (Ctrl+K) */}
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
        
        {/* Global AI Assistant (Nauti Brain) */}
        <Suspense fallback={null}>
          <GlobalAIAssistant />
        </Suspense>
        
        {/* Toast Notifications moved to App root to prevent duplicates */}
      </div>
    </SidebarProvider>
  );
};

/**
 * Protected Route wrapper - prevents flash during auth check
 * P2-010: Now imports RoleGuard for RBAC enforcement
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [showLoader, setShowLoader] = React.useState(false);
  
  React.useEffect(() => {
    // Only show loader after 300ms of loading to prevent flash
    let timeout: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timeout = setTimeout(() => setShowLoader(true), 300);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // During initial auth check, render empty div to prevent flash
  if (isLoading) {
    if (showLoader) return <Loader />;
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

/**
 * P2-010: Admin-only route wrapper using RoleGuard
 */
const AdminRoute = lazy(() => import('@/components/auth/RoleGuard').then(mod => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <mod.RoleGuard requiredRoles={['admin']}>{children}</mod.RoleGuard>
  )
})));

const ManagerRoute = lazy(() => import('@/components/auth/RoleGuard').then(mod => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <mod.RoleGuard minRole="manager">{children}</mod.RoleGuard>
  )
})));

// Rotas internas
const AppRoutes = () => (
<Routes>
    {/* Public Routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/pricing" element={<LandingPage />} />
    <Route path="/status" element={<StatusPage />} />
    <Route path="/demo" element={<DemoPage />} />
    
    {/* Rotas autenticadas com Sidebar */}
    <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
      <Route path="/" element={<Navigate to="/command" replace />} />
      
      {/* ============================================ */}
      {/* 7 MEGA-HUBS CANÔNICOS - v8.0 MEGA-FUSION */}
      {/* ============================================ */}
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
      
      {/* ============================================ */}
      {/* CENTRAL DE COMANDO */}
      {/* ============================================ */}
      <Route path="/central-comando/*" element={<CentralComando />} />
      <Route path="/noc" element={<NOC />} />
      <Route path="/noc-monitoring" element={<NOCMonitoring />} />
      <Route path="/health-monitor" element={<HealthMonitor />} />
      <Route path="/soc" element={<SOCPage />} />
      
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
      <Route path="/logistics-command" element={<LogisticsCommandPage />} />
      
      {/* WORLD-CLASS DIFFERENTIALS */}
      <Route path="/fleet-pulse" element={<FleetPulsePage />} />
      <Route path="/voyage-simulator" element={<VoyageSimulatorPage />} />
      <Route path="/crew-wellbeing" element={<CrewWellbeingPage />} />
      <Route path="/psc-readiness" element={<PSCReadinessPageNew />} />
      <Route path="/recruitment" element={<RecruitmentPage />} />
      <Route path="/agent-orchestration" element={<AgentOrchestrationPage />} />
      <Route path="/blockchain-compliance" element={<BlockchainCompliancePage />} />
      <Route path="/company-financials" element={<CompanyFinancialPage />} />
      <Route path="/mlc-scheduling" element={<MLCSchedulingPage />} />
      <Route path="/crew-scheduling" element={<MLCSchedulingPage />} />
      <Route path="/supplier-portal" element={<SupplierPortalPage />} />
      <Route path="/iot-dashboard" element={<IoTDashboardPage />} />
      <Route path="/satcom-dashboard" element={<SatcomDashboardEnhanced />} />
      {/* ============================================ */}
      {/* MANUTENÇÃO */}
      {/* ============================================ */}
      <Route path="/maintenance-command" element={<MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenancePage />} />
      <Route path="/fuel-management" element={<FuelManagementPage />} />
      
      {/* ============================================ */}
      {/* OPERAÇÕES SUBMARINAS - RESTAURADAS */}
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
      <Route path="/voice-assistant-ai" element={<VoiceAssistantAIPage />} />
      <Route path="/assistente-voz" element={<PortugueseVoiceAssistantPage />} />
      <Route path="/assistant/voice" element={<VoiceAssistant />} />
      
      {/* AI Modules Hub - 11 Complete AI Modules */}
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
      
      {/* ============================================ */}
      {/* INTELIGÊNCIA AVANÇADA */}
      {/* ============================================ */}
      <Route path="/optimization-dashboard" element={<Optimization />} />
      <Route path="/unified-optimization" element={<UnifiedOptimizationPage />} />
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
      <Route path="/vessel-tracking" element={<VesselTrackingPage />} />
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
      {/* admin/checklists route moved to ADMIN section below */}
      <Route path="/document-workflow" element={<DocumentWorkflow />} />
      <Route path="/export-center" element={<ExportCenterPage />} />
      <Route path="/advanced-search" element={<AdvancedSearchPage />} />
      <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
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
      <Route path="/audit-ai-chat" element={<AuditAIChatPage />} />
      <Route path="/peo-dp" element={<PEODP />} />
      <Route path="/peotram" element={<PEOTRAM />} />
      <Route path="/sgso" element={<SGSO />} />
      <Route path="/sgso/report" element={<SGSOReportPage />} />
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
      <Route path="/audit-agents" element={<AgentsDashboard />} />
      <Route path="/audit-agents/:agentId" element={<AgentDetailPage />} />
      
      {/* === 12 AUDITORIAS MARÍTIMAS COMPLETAS === */}
      <Route path="/pre-sire" element={<PreSIREInspection />} />
      <Route path="/pre-sire-2" element={<PreSIREInspection />} />
      <Route path="/tmsa-assessment" element={<TMSAAssessment />} />
      <Route path="/tmsa" element={<TMSAAssessment />} />
      <Route path="/solas-inspection" element={<SOLASInspection />} />
      <Route path="/solas-lsa-ffe" element={<SOLASInspection />} />
      
      {/* Diagnostic Components - 5 Soluções */}
      <Route path="/diagnostic-certificates" element={<DiagnosticCertificatesPage />} />
      <Route path="/diagnostic-dashboard" element={<DiagnosticDashboardPage />} />
      <Route path="/diagnostic-documents" element={<DiagnosticDocumentsPage />} />
      <Route path="/diagnostic-ncs" element={<DiagnosticNCsPage />} />
      <Route path="/diagnostic-reports" element={<DiagnosticReportsPage />} />
      
      {/* ============================================ */}
      {/* RH & PESSOAS (HR/DP MODULE) */}
      {/* ============================================ */}
      <Route path="/nautilus-people" element={<MaritimeCommandCenter />} />
      <Route path="/crew-management" element={<MaritimeCommandCenter />} />
      <Route path="/crew-wellness" element={<CrewWellnessPage />} />
      <Route path="/crew-wellbeing" element={<CrewWellnessPage />} />
      {/* /recruitment, /agent-orchestration, /blockchain-compliance already defined in WORLD-CLASS section */}
      {/* /company-financials already defined in WORLD-CLASS section - removed duplicate */}
      <Route path="/medical-infirmary" element={<MedicalInfirmaryPremium />} />
      <Route path="/enfermaria-digital" element={<MedicalInfirmaryPremium />} />
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
      
      {/* ============================================ */}
      {/* TREINAMENTOS */}
      {/* ============================================ */}
      <Route path="/nautilus-academy" element={<AITraining />} />
      <Route path="/solas-isps-training" element={<SOLASISPSTrainingPage />} />
      <Route path="/mentor-dp" element={<Navigate to="/people-hub?tab=mentor-dp" replace />} />
      <Route path="/dp-intelligence" element={<DPIntelligence />} />
      
      {/* ============================================ */}
      {/* FINANÇAS & PROCUREMENT */}
      {/* ============================================ */}
      <Route path="/finance-command" element={<FinanceCommandCenter />} />
      <Route path="/finance-ai" element={<FinanceProcurementAIPage />} />
      <Route path="/finance-procurement-ai" element={<FinanceProcurementAIPage />} />
      <Route path="/voyage-accounting" element={<VoyageAccountingPage />} />
      <Route path="/voyage-pnl" element={<VoyagePnLPage />} />
      <Route path="/crew-scheduler" element={<CrewSchedulerPage />} />
      <Route path="/analytics-command" element={<AnalyticsCommandCenter />} />
      <Route path="/operations-command" element={<OperationsCommandCenter />} />
      <Route path="/procurement-command" element={<ProcurementCommandCenter />} />
      <Route path="/task-management" element={<TaskManagement />} />
      
      {/* ============================================ */}
      {/* ESG & SUSTENTABILIDADE */}
      {/* ============================================ */}
      <Route path="/esg-emissions" element={<ESGEmissionsPage />} />
      <Route path="/waste-management" element={<EnhancedWasteManagement />} />
      <Route path="/sustainability-score" element={<SustainabilityScorePage />} />
      
      {/* ============================================ */}
      {/* VIAGENS & LOGÍSTICA */}
      {/* ============================================ */}
      <Route path="/travel-command" element={<TravelCommandCenter />} />
      <Route path="/weather-command" element={<WeatherCommandCenter />} />
      
      {/* ============================================ */}
      {/* SISTEMA & CONFIGURAÇÕES */}
      {/* ============================================ */}
      <Route path="/quality-dashboard" element={<QualityDashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/security" element={<SecuritySettings />} />
      <Route path="/integrations" element={<IntegrationsCenter />} />
      <Route path="/api-gateway" element={<APIGateway />} />
      <Route path="/collaboration" element={<Collaboration />} />
      <Route path="/iot" element={<IoT />} />
      <Route path="/gamification" element={<Gamification />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/qa/preview" element={<CentralComando />} />
      <Route path="/production-deploy" element={<ProductionDeploy />} />
      
      {/* ============================================ */}
      {/* ENTERPRISE INTELLIGENCE SUITE */}
      {/* ============================================ */}
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
      
      {/* ============================================ */}
      {/* ADVANCED MARITIME MODULES - 12 REVOLUTIONARY FEATURES */}
      {/* ============================================ */}
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
      
      {/* ============================================ */}
      {/* SYSTEM & QA */}
      {/* ============================================ */}
      <Route path="/system/interactivity" element={<InteractivityScoreboard />} />
      <Route path="/system/qa-scoreboard" element={<InteractivityScoreboard />} />
      <Route path="/qa-dashboard" element={<InteractivityScoreboard />} />
      
      {/* ============================================ */}
      {/* UNIFIED HUBS - PROMPT MASTER V4.1 */}
      {/* ============================================ */}
      <Route path="/operations-command-hub" element={<OperationsCommandHub />} />
      <Route path="/ai-control-tower" element={<AIControlTowerHub />} />
      <Route path="/people-hub" element={<PeopleHub />} />
      <Route path="/tracking-telemetry" element={<TrackingTelemetryHub />} />
      <Route path="/document-center" element={<DocumentCenterHub />} />
      <Route path="/comms-alerts" element={<CommsAlertsHub />} />
      <Route path="/ai-enterprise-engines" element={<AIEnterpriseEnginesHub />} />
      <Route path="/compliance-unified" element={<ComplianceHubPage />} />
      <Route path="/system-hub" element={<SystemHubPremium />} />
      <Route path="/maintenance-hub" element={<MaintenanceHub />} />
      <Route path="/finance-hub" element={<FinanceHub />} />
      
      {/* STCW/MLC Dedicated Route - Separated from Crew Intelligence */}
      <Route path="/stcw-mlc" element={<STCWMLCCompliance />} />
      
      {/* ============================================ */}
      {/* ADMIN & DASHBOARDS */}
      {/* ============================================ */}
      <Route path="/admin" element={<Suspense fallback={<Loader />}><AdminRoute><Admin /></AdminRoute></Suspense>} />
      <Route path="/admin/dashboard" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDashboard /></AdminRoute></Suspense>} />
      
      {/* ADMIN DOCUMENTS - Full CRUD flow (RBAC protected) */}
      <Route path="/admin/documents" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentList /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/ai" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAIEditor /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/ai/templates" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAITemplates /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/view/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentView /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/history/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentHistory /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/editor/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminDocumentEditorDemo /></AdminRoute></Suspense>} />
      <Route path="/admin/documents/collaborate/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminCollaborativeEditor /></AdminRoute></Suspense>} />
      
      {/* ADMIN TEMPLATES (RBAC protected) */}
      <Route path="/admin/templates" element={<Suspense fallback={<Loader />}><AdminRoute><AdminTemplates /></AdminRoute></Suspense>} />
      <Route path="/admin/templates/edit/:id" element={<Suspense fallback={<Loader />}><AdminRoute><AdminTemplateEdit /></AdminRoute></Suspense>} />
      
      {/* ADMIN SGSO (RBAC protected) */}
      <Route path="/admin/sgso" element={<Suspense fallback={<Loader />}><AdminRoute><AdminSGSO /></AdminRoute></Suspense>} />
      <Route path="/admin/sgso/history/:vesselId" element={<Suspense fallback={<Loader />}><AdminRoute><AdminSGSOHistory /></AdminRoute></Suspense>} />
      
      {/* ADMIN ASSISTANT & REPORTS (RBAC protected) */}
      <Route path="/admin/assistant" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAssistant /></AdminRoute></Suspense>} />
      <Route path="/admin/assistant/logs" element={<Suspense fallback={<Loader />}><AdminRoute><AdminAssistantLogs /></AdminRoute></Suspense>} />
      <Route path="/admin/reports/assistant" element={<Suspense fallback={<Loader />}><AdminRoute><AdminReportsAssistant /></AdminRoute></Suspense>} />
      <Route path="/admin/reports/logs" element={<Suspense fallback={<Loader />}><AdminRoute><AdminReportsLogs /></AdminRoute></Suspense>} />
      <Route path="/admin/reports/restore-analytics" element={<Suspense fallback={<Loader />}><AdminRoute><AdminReportsRestoreAnalytics /></AdminRoute></Suspense>} />
      
      {/* ADMIN COLLABORATION & CHECKLISTS (RBAC protected) */}
      <Route path="/admin/collaboration" element={<Suspense fallback={<Loader />}><AdminRoute><AdminCollaboration /></AdminRoute></Suspense>} />
      <Route path="/admin/checklists" element={<Suspense fallback={<Loader />}><AdminRoute><MaritimeCommandCenter /></AdminRoute></Suspense>} />
      
      <Route path="/dashboard" element={<CentralComando />} />
      <Route path="/executive-dashboard" element={<CentralComando />} />
      <Route path="/system-overview" element={<CentralComando />} />
      <Route path="/analytics" element={<AnalyticsCommandCenter />} />
      <Route path="/backup-audit" element={<SecurityAuditCenter />} />
      <Route path="/testing" element={<CentralComando />} />
      <Route path="/saas-manager" element={<Admin />} />
      
      {/* MISSING ROUTE ALIASES */}
      <Route path="/docs" element={<Documents />} />
      
      {/* DEV ONLY - Route Dashboard */}
      <Route path="/dev-routes" element={<DevRoutesDashboard />} />
    </Route>
    
    {/* Catch-all: Página 404 real */}
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
              {/* Toaster only here — removed duplicate from AuthenticatedLayout */}
              <Toaster />
            </TooltipProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
