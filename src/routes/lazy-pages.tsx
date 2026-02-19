/**
 * Lazy Page Imports - Centralized lazy loading for all pages
 * Extracted from App.tsx for maintainability
 */
import { lazy } from "react";

// ============================================
// PÁGINAS PRINCIPAIS
// ============================================
export const Auth = lazy(() => import("@/pages/Auth"));
export const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const LandingPage = lazy(() => import("@/pages/LandingPage"));
export const AboutSystem = lazy(() => import("@/pages/AboutSystem"));
export const DemoLauncher = lazy(() => import("@/pages/DemoLauncher"));
// CentralComando removed — consolidated into CommandMegaHub at /command
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const DevRoutesDashboard = lazy(() => import("@/pages/DevRoutesDashboard"));
export const Billing = lazy(() => import("@/pages/Settings"));
export const BillingPortal = lazy(() => import("@/pages/Settings"));
export const OnboardingDashboard = lazy(() => import("@/pages/OnboardingDashboard"));
export const TenantOnboardingWizard = lazy(() => import("@/pages/TenantOnboardingWizardPage"));
export const InteractiveOnboarding = lazy(() => import("@/pages/InteractiveOnboarding"));
export const WorldClassOnboarding = lazy(() => import("@/components/onboarding/WorldClassOnboarding"));
export const AnalyticsFeedback = lazy(() => import("@/pages/AnalyticsFeedback"));

// Central de Comando extras
export const NOC = lazy(() => import("@/pages/NOC"));
export const HealthMonitor = lazy(() => import("@/pages/HealthMonitor"));

// ============================================
// OPERAÇÕES MARÍTIMAS
// ============================================
export const MaritimeCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
export const FleetCommandCenter = lazy(() => import("@/pages/FleetCommandCenter"));
export const VoyageCommandCenter = lazy(() => import("@/pages/VoyageCommandCenter"));
export const MissionCommandCenter = lazy(() => import("@/pages/OperationsCommandCenter"));
export const BridgeLink = lazy(() => import("@/pages/FleetCommandCenter"));

// Digital Twin & Advanced
export const DigitalTwinPage = lazy(() => import("@/pages/advanced/DigitalTwin3DPage"));
export const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
export const AgentOrchestrationPage = lazy(() => import("@/pages/AgentOrchestrationPage"));
export const BlockchainCompliancePage = lazy(() => import("@/pages/advanced/BlockchainCertificatesPage"));
export const CompanyFinancialPage = lazy(() => import("@/pages/CompanyFinancialPage"));

// Revolutionary Features
export const SmartEvidencePackPage = lazy(() => import("@/pages/SmartEvidencePackPage"));
export const SmartVoyageOptimizerPage = lazy(() => import("@/pages/SmartVoyageOptimizerPage"));

// Módulos Completos
export const MedicalInfirmary = lazy(() => import("@/modules/medical-infirmary"));
export const EnhancedWasteManagement = lazy(() => import("@/pages/advanced/MARPOLTrackerPage"));
export const CentralComandoAprimorada = lazy(() => import("@/pages/dashboard/CentralComandoAprimorada"));
export const MedicalInfirmaryEnhanced = lazy(() => import("@/pages/MedicalInfirmaryEnhanced"));
export const SatcomDashboardEnhanced = lazy(() => import("@/modules/nauti-satellite"));

// ============================================
// MANUTENÇÃO
// ============================================
export const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
export const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));
export const FuelManagementPage = lazy(() => import("@/pages/FuelManagementPage"));

// ============================================
// IA & AUTOMAÇÃO
// ============================================
export const AIHubPage = lazy(() => import("@/pages/AIHubPage"));
export const AIAnalyticsDashboard = lazy(() => import("@/pages/AIAnalyticsDashboard"));
export const AIObservabilityDashboard = lazy(() => import("@/pages/AIObservabilityDashboard"));
export const WorkflowCommandCenter = lazy(() => import("@/pages/WorkflowCommandCenter"));
export const AIAudit = lazy(() => import("@/pages/AIAudit"));
export const QualityDashboard = lazy(() => import("@/pages/QualityDashboard"));
export const AgentChat = lazy(() => import("@/pages/AIAgents/AgentChat"));

// ============================================
// INTELIGÊNCIA AVANÇADA
// ============================================
export const Optimization = lazy(() => import("@/pages/Optimization"));
export const UnifiedOptimizationPage = lazy(() => import("@/pages/UnifiedOptimizationPage"));

// ============================================
// TELEMETRIA & MONITORAMENTO
// ============================================
export const TelemetriaCommand = lazy(() => import("@/pages/TelemetriaCommand"));
export const VesselTrackingPage = lazy(() => import("@/pages/VesselTrackingPage"));
export const CalendarView = lazy(() => import("@/pages/CalendarView"));

// ============================================
// APIs & INTEGRAÇÕES
// ============================================
export const APICenter = lazy(() => import("@/pages/APICenter"));
export const APIMonitor = lazy(() => import("@/pages/APIMonitor"));
export const Integrations = lazy(() => import("@/pages/Integrations"));
export const WeatherMaritime = lazy(() => import("@/pages/WeatherMaritime"));
export const AISTrackerPage = lazy(() => import("@/pages/AISTrackerPage"));
export const PortAPI = lazy(() => import("@/pages/PortAPI"));

// ============================================
// RELATÓRIOS & DOCUMENTOS
// ============================================
export const ReportsCommandCenter = lazy(() => import("@/pages/ReportsCommandCenter"));
export const Documents = lazy(() => import("@/pages/Documents"));
export const Templates = lazy(() => import("@/pages/Templates"));
export const DocumentWorkflow = lazy(() => import("@/pages/DocumentWorkflow"));
export const ExportCenterPage = lazy(() => import("@/pages/ExportCenterPage"));

// ============================================
// AUDITORIAS & COMPLIANCE
// ============================================
export const PEODP = lazy(() => import("@/pages/PEODP"));
export const LVSAceitacaoPetrobras = lazy(() => import("@/pages/LVSAceitacaoPetrobras"));
export const SGSO = lazy(() => import("@/pages/SGSO"));
export const SGSOReportPage = lazy(() => import("@/pages/SGSOReportPage"));
export const PreOVIDInspection = lazy(() => import("@/pages/PreOVIDInspection"));
export const MLCInspection = lazy(() => import("@/pages/MLCInspection"));
export const PSCPackage = lazy(() => import("@/pages/PSCPackage"));
export const ExecutiveCompliancePage = lazy(() => import("@/pages/ExecutiveCompliancePage"));
export const SecurityCenter = lazy(() => import("@/pages/SecurityCenter"));
export const SecurityAuditCenter = lazy(() => import("@/pages/SecurityAuditCenter"));
export const SecurityScanner = lazy(() => import("@/pages/SecurityScanner"));
export const AuditAIChatPage = lazy(() => import("@/pages/AuditAIChatPage"));
export const ComplianceRoadmapPage = lazy(() => import("@/pages/ComplianceRoadmapPage"));
export const PreSIREInspection = lazy(() => import("@/pages/PreSIREInspection"));
export const TMSAAssessment = lazy(() => import("@/pages/TMSAAssessment"));
export const SOLASInspection = lazy(() => import("@/pages/SOLASInspection"));

// Diagnostic Components Pages
export const DiagnosticCertificatesPage = lazy(() => import("@/pages/DiagnosticCertificatesPage"));
export const DiagnosticDashboardPage = lazy(() => import("@/pages/DiagnosticDashboardPage"));
export const DiagnosticDocumentsPage = lazy(() => import("@/pages/DiagnosticDocumentsPage"));
export const DiagnosticNCsPage = lazy(() => import("@/pages/DiagnosticNCsPage"));
export const DiagnosticReportsPage = lazy(() => import("@/pages/DiagnosticReportsPage"));

// ============================================
// RH & PESSOAS
// ============================================
export const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));
export const Users = lazy(() => import("@/pages/Users"));
export const HRDashboardPage = lazy(() => import("@/pages/HRDashboardPage"));
export const EmployeePortalPage = lazy(() => import("@/pages/EmployeePortalPage"));
export const PeopleAnalyticsPage = lazy(() => import("@/pages/PeopleAnalyticsPage"));
export const Payroll = lazy(() => import("@/pages/Payroll"));
export const TimeTracking = lazy(() => import("@/pages/TimeTracking"));
export const HRChatbotPage = lazy(() => import("@/pages/HRChatbotPage"));
export const HRDocumentOCRPage = lazy(() => import("@/pages/HRDocumentOCRPage"));
export const HRTurnoverPredictionPage = lazy(() => import("@/pages/HRTurnoverPredictionPage"));

// ============================================
// TREINAMENTOS
// ============================================
export const AITraining = lazy(() => import("@/pages/AITraining"));
export const SOLASISPSTrainingPage = lazy(() => import("@/pages/SOLASISPSTrainingPage"));

// ============================================
// FINANÇAS & PROCUREMENT
// ============================================
export const VoyageAccountingPage = lazy(() => import("@/pages/VoyageAccountingPage"));
export const VoyagePnLPage = lazy(() => import("@/pages/VoyagePnLPage"));
export const CrewSchedulerPage = lazy(() => import("@/pages/CrewSchedulerPage"));
export const AnalyticsCommandCenter = lazy(() => import("@/pages/AnalyticsCommandCenter"));
export const OperationsCommandCenter = lazy(() => import("@/pages/OperationsCommandCenter"));
export const FinanceProcurementAIPage = lazy(() => import("@/pages/FinanceProcurementAIPage"));
export const WorldClassDashboard = lazy(() => import("@/pages/WorldClassDashboard"));

// ============================================
// ESG & SUSTENTABILIDADE
// ============================================
export const SustainabilityScorePage = lazy(() => import("@/pages/SustainabilityScorePage"));
export const ESGEmissionsPage = lazy(() => import("@/pages/ESGEmissionsPremium"));

// ============================================
// STCW/MLC
// ============================================
export const STCWMLCCompliance = lazy(() => import("@/pages/STCWMLCCompliance"));

// ============================================
// SISTEMA & CONFIGURAÇÕES
// ============================================
export const Settings = lazy(() => import("@/pages/Settings"));
export const IntegrationsCenter = lazy(() => import("@/pages/IntegrationsCenter"));
export const Collaboration = lazy(() => import("@/pages/Collaboration"));
export const SecuritySettings = lazy(() => import("@/pages/settings/Security"));

// ============================================
// AI MODULES HUB - All 11 AI Modules
// ============================================
export const AIModulesHubPage = lazy(() => import("@/pages/ai/AIModulesHubPage"));
export const VoyageLogisticsAIPage = lazy(() => import("@/pages/ai/VoyageLogisticsAIPage"));
export const SafetyIncidentAIPage = lazy(() => import("@/pages/ai/SafetyIncidentAIPage"));
export const InventorySparesAIPage = lazy(() => import("@/pages/ai/InventorySparesAIPage"));
export const ComplianceAIPage = lazy(() => import("@/pages/ai/ComplianceAIPage"));
export const EnvironmentalAIPage = lazy(() => import("@/pages/ai/EnvironmentalAIPage"));
export const QualityManagementAIPage = lazy(() => import("@/pages/ai/QualityManagementAIPage"));
export const ContractLegalAIPage = lazy(() => import("@/pages/ai/ContractLegalAIPage"));
export const InsuranceClaimsAIPage = lazy(() => import("@/pages/ai/InsuranceClaimsAIPage"));
export const CrewingPayrollAIPage = lazy(() => import("@/pages/ai/CrewingPayrollAIPage"));
export const ReportingAnalyticsAIPage = lazy(() => import("@/pages/ai/ReportingAnalyticsAIPage"));
export const MobileOfflineAIPage = lazy(() => import("@/pages/ai/MobileOfflineAIPage"));

// ============================================
// ENTERPRISE INTELLIGENCE SUITE
// ============================================
export const RAGAssistantPage = lazy(() => import("@/pages/enterprise/RAGAssistantPage"));
export const OCRCenterPage = lazy(() => import("@/pages/enterprise/OCRCenterPage"));
export const FormsBuilderPage = lazy(() => import("@/pages/enterprise/FormsBuilderPage"));
export const ChecklistsBuilderPage = lazy(() => import("@/pages/enterprise/ChecklistsBuilderPage"));
export const OCIMFAssessmentPage = lazy(() => import("@/pages/enterprise/OCIMFAssessmentPage"));
export const TMSAAnalyticsPage = lazy(() => import("@/pages/enterprise/TMSAAnalyticsPage"));
export const FatigueRiskPage = lazy(() => import("@/pages/enterprise/FatigueRiskPage"));
export const MLCWorkHoursPage = lazy(() => import("@/pages/enterprise/MLCWorkHoursPage"));
export const CrewMatchingPage = lazy(() => import("@/pages/enterprise/CrewMatchingPage"));
export const ContractAnalysisPage = lazy(() => import("@/pages/enterprise/ContractAnalysisPage"));
export const RiskClausesPage = lazy(() => import("@/pages/enterprise/RiskClausesPage"));
export const NCPredictionPage = lazy(() => import("@/pages/enterprise/NCPredictionPage"));
export const CompliancePredictorPage = lazy(() => import("@/pages/enterprise/CompliancePredictorPage"));

// Audit Agents Hub
export const AuditAgentsPage = lazy(() => import("@/pages/AuditAgentsPage"));
export const AgentsDashboard = lazy(() => import("@/pages/audit-agents/AgentsDashboard"));
export const AgentDetailPage = lazy(() => import("@/pages/audit-agents/AgentDetailPage"));

// ============================================
// ADVANCED MARITIME MODULES
// ============================================
export const DigitalTwin3DPage = lazy(() => import("@/pages/advanced/DigitalTwin3DPage"));
export const WeatherIntelligencePage = lazy(() => import("@/pages/advanced/WeatherIntelligencePage"));
export const BunkerOptimizationPage = lazy(() => import("@/pages/advanced/BunkerOptimizationPage"));
export const CargoPlanningPage = lazy(() => import("@/pages/advanced/CargoPlanningPage"));
export const PSCReadinessPage = lazy(() => import("@/pages/advanced/PSCReadinessPage"));
export const MARPOLTrackerPage = lazy(() => import("@/pages/advanced/MARPOLTrackerPage"));
export const BlockchainCertificatesPage = lazy(() => import("@/pages/advanced/BlockchainCertificatesPage"));
export const IncidentInvestigationPage = lazy(() => import("@/pages/advanced/IncidentInvestigationPage"));
export const VRTrainingPage = lazy(() => import("@/pages/advanced/VRTrainingPage"));
export const VoiceCommandsPage = lazy(() => import("@/pages/advanced/VoiceCommandsPage"));
export const CrewWellnessAIAdvancedPage = lazy(() => import("@/pages/advanced/CrewWellnessAIPage"));
export const ExecutiveDashboardAdvancedPage = lazy(() => import("@/pages/advanced/ExecutiveDashboardPage"));

// ============================================
// 7 MEGA-HUBS CANÔNICOS
// ============================================
export const CommandMegaHub = lazy(() => import("@/pages/mega-hubs/CommandMegaHub"));
export const OpsMegaHub = lazy(() => import("@/pages/mega-hubs/OpsMegaHub"));
export const MaintenanceMegaHub = lazy(() => import("@/pages/mega-hubs/MaintenanceMegaHub"));
export const AIMegaHub = lazy(() => import("@/pages/mega-hubs/AIMegaHub"));
export const TrackingMegaHub = lazy(() => import("@/pages/mega-hubs/TrackingMegaHub"));
export const ComplianceMegaHub = lazy(() => import("@/pages/mega-hubs/ComplianceMegaHub"));
export const WorkbenchMegaHub = lazy(() => import("@/pages/mega-hubs/WorkbenchMegaHub"));

// ============================================
// ADMIN & DASHBOARDS
// ============================================
export const Admin = lazy(() => import("@/pages/Admin"));
export const AdminDocumentList = lazy(() => import("@/pages/admin/documents/DocumentList"));
export const AdminDocumentsAI = lazy(() => import("@/pages/admin/documents-ai"));
export const AdminDocumentView = lazy(() => import("@/pages/admin/documents/DocumentView"));
export const AdminDocumentHistory = lazy(() => import("@/pages/admin/documents/DocumentHistory"));
export const AdminDocumentEditorDemo = lazy(() => import("@/pages/admin/documents/DocumentEditorDemo"));
export const AdminAIEditor = lazy(() => import("@/pages/admin/documents/ai-editor"));
export const AdminAITemplates = lazy(() => import("@/pages/admin/documents/ai-templates"));
export const AdminCollaborativeEditor = lazy(() => import("@/pages/admin/documents/CollaborativeEditor"));
export const AdminTemplates = lazy(() => import("@/pages/admin/templates"));
export const AdminTemplateEdit = lazy(() => import("@/pages/admin/templates/edit/[id]"));
export const AdminSGSO = lazy(() => import("@/pages/admin/sgso"));
export const AdminSGSOHistory = lazy(() => import("@/pages/admin/sgso/history/[vesselId]"));
export const AdminAssistant = lazy(() => import("@/pages/admin/assistant"));
export const AdminAssistantLogs = lazy(() => import("@/pages/admin/assistant-logs"));
export const AdminReportsAssistant = lazy(() => import("@/pages/admin/reports/assistant"));
export const AdminReportsLogs = lazy(() => import("@/pages/admin/reports/logs"));
export const AdminReportsRestoreAnalytics = lazy(() => import("@/pages/admin/reports/restore-analytics"));
export const AdminCollaboration = lazy(() => import("@/pages/admin/collaboration"));
export const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
export const AdminBI = lazy(() => import("@/pages/admin/bi"));
export const AdminChecklistsDashboard = lazy(() => import("@/pages/admin/checklists-dashboard"));
export const AdminApiTester = lazy(() => import("@/pages/admin/api-tester"));

// AIEnterpriseEnginesHub
export const AIEnterpriseEnginesHub = lazy(() => import("@/pages/AIEnterpriseEnginesHub"));

// ============================================
// WORLD-CLASS COMPETITIVE MODULES (vs IMOS, AMOS, DNV, Compas)
// ============================================
export const CommercialOperationsHub = lazy(() => import("@/pages/CommercialOperationsHub"));
export const CharterPartyPage = lazy(() => import("@/pages/CharterPartyPage"));
export const LaytimeDemurragePage = lazy(() => import("@/pages/LaytimeDemurragePage"));
export const RunningHoursPage = lazy(() => import("@/pages/RunningHoursPage"));
export const CrewAppraisalPage = lazy(() => import("@/pages/CrewAppraisalPage"));
export const CrewTravelPage = lazy(() => import("@/pages/CrewTravelPage"));
export const CrewRotationPage = lazy(() => import("@/pages/CrewRotationPage"));
export const QHSEIncidentPage = lazy(() => import("@/pages/QHSEIncidentPage"));
export const ClassSurveyPage = lazy(() => import("@/pages/ClassSurveyPage"));
export const FreightInvoicePage = lazy(() => import("@/pages/FreightInvoicePage"));
export const VoyageEstimatePage = lazy(() => import("@/pages/VoyageEstimatePage"));
export const CrewPayrollPage = lazy(() => import("@/pages/CrewPayrollPage"));
export const BudgetOpexPage = lazy(() => import("@/pages/BudgetOpexPage"));
export const RegulatoryRadarPage = lazy(() => import("@/pages/RegulatoryRadarPage"));
export const WarrantyClaimsPage = lazy(() => import("@/pages/WarrantyClaimsPage"));

// ============================================
// WORLD-CLASS GAP-CLOSING MODULES (vs IMOS, AMOS, Compas, CFM)
// ============================================
export const SparePartsPage = lazy(() => import("@/pages/SparePartsPage"));
export const PMSHubPage = lazy(() => import("@/pages/PMSHubPage"));
export const ISMCodeHubPage = lazy(() => import("@/pages/ISMCodeHubPage"));
export const CharteringHubPage = lazy(() => import("@/pages/CharteringHubPage"));
export const EUETSHubPage = lazy(() => import("@/pages/EUETSHubPage"));
export const IMPASparePartsHubPage = lazy(() => import("@/pages/IMPASparePartsHubPage"));
export const SIRE2HubPage = lazy(() => import("@/pages/SIRE2HubPage"));
export const PortCostPage = lazy(() => import("@/pages/PortCostPage"));
export const CrewCompetencyPage = lazy(() => import("@/pages/CrewCompetencyPage"));
export const InsurancePIPage = lazy(() => import("@/pages/InsurancePIPage"));
export const PoolDistributionPage = lazy(() => import("@/pages/PoolDistributionPage"));
export const PIClaimsHubPage = lazy(() => import("@/pages/PIClaimsHubPage"));
export const PoolDistributionHubPage = lazy(() => import("@/pages/PoolDistributionHubPage"));

// ============================================
// WORLD-CLASS FINAL GAP-CLOSING (vs AMOS, Veson, Compas, CFM, DNV)
// ============================================
export const ProcurementPage = lazy(() => import("@/pages/ProcurementPage"));
export const TCCharterPage = lazy(() => import("@/pages/TCCharterPage"));
export const CrewPlanningPage = lazy(() => import("@/pages/CrewPlanningPage"));
export const VesselKPIPage = lazy(() => import("@/pages/VesselKPIPage"));
export const CAPAssessmentPage = lazy(() => import("@/pages/CAPAssessmentPage"));

// ============================================
// WORLD-CLASS DISRUPTIVE FEATURES
// ============================================
export const ComputerVisionInspectorPage = lazy(() => import("@/pages/ComputerVisionInspectorPage"));
export const CrewMarketplacePage = lazy(() => import("@/pages/CrewMarketplacePage"));
export const IoTWearablesDashboardPage = lazy(() => import("@/pages/IoTWearablesDashboardPage"));

// Client Portal
export const ClientPortalPage = lazy(() => import("@/pages/client-portal"));

// ============================================
// WORLD-CLASS DISRUPTIVE FEATURES v2
// ============================================
export const VoiceCopilotPage = lazy(() => import("@/pages/VoiceCopilotPage"));
export const CrewFatiguePredictorPage = lazy(() => import("@/pages/CrewFatiguePredictorPage"));
export const FleetBenchmarkingPage = lazy(() => import("@/pages/FleetBenchmarkingPage"));
export const WorldLeadershipDashboard = lazy(() => import("@/pages/WorldLeadershipDashboard"));
export const GamificationHub = lazy(() => import("@/pages/GamificationHub"));
export const SecurityDashboardPage = lazy(() => import("@/pages/SecurityDashboardPage"));
export const PerformanceMonitorPage = lazy(() => import("@/pages/PerformanceMonitorPage"));
export const PremiumReportsPage = lazy(() => import("@/pages/PremiumReportsPage"));
export const WhatsAppBotPage = lazy(() => import("@/pages/WhatsAppBotPage"));

// ============================================
// WORLD-CLASS NEXT-GEN MODULES (vs StormGeo, DNV Navigator, Integr8, Compas E-CMS, Veson)
// ============================================
export const WeatherRoutingPage = lazy(() => import("@/pages/WeatherRoutingPage"));
export const EnergyEfficiencyPage = lazy(() => import("@/pages/EnergyEfficiencyPage"));
export const BunkerOptimizationEnginePage = lazy(() => import("@/pages/BunkerOptimizationEnginePage"));
export const CrewDocumentVaultPage = lazy(() => import("@/pages/CrewDocumentVaultPage"));
export const AdvancedCargoPage = lazy(() => import("@/pages/AdvancedCargoPage"));

// ============================================
// WORLD-CLASS FINAL INTEGRATION (vs Compas, INX, RightShip, NAPA, Equasis)
// ============================================
export const CrewChangePage = lazy(() => import("@/pages/CrewChangePage"));
export const PermitToWorkPage = lazy(() => import("@/pages/PermitToWorkPage"));
export const ShipVettingPage = lazy(() => import("@/pages/ShipVettingPage"));
export const NoonReportAnalyticsPage = lazy(() => import("@/pages/NoonReportAnalyticsPage"));
export const PSCHistoryPage = lazy(() => import("@/pages/PSCHistoryPage"));
export const StowagePlanPage = lazy(() => import("@/pages/StowagePlanPage"));
export const BunkerOperationsPage = lazy(() => import("@/pages/BunkerOperationsPage"));

// Role Management (Admin only)
export const RoleManagementPage = lazy(() => import("@/pages/admin/RoleManagementPage"));

// AdminRoute (lazy-loaded RoleGuard)
export const AdminRoute = lazy(() => import('@/components/auth/RoleGuard').then(mod => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <mod.RoleGuard requiredRoles={['admin']}>{children}</mod.RoleGuard>
  )
})));
