/**
 * AppRoutes - Main route definitions
 * Organized by domain: Mega-Hubs, Maritime, AI, Compliance, HR, Admin, Legacy Redirects
 */
import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { AppLoader } from "./AppLoader";
import * as Pages from "./lazy-pages";

export const AppRoutes = () => (
  <Routes>
    {/* ============================================ */}
    {/* PUBLIC ROUTES */}
    {/* ============================================ */}
    <Route path="/auth" element={<Pages.Auth />} />
    <Route path="/auth/callback" element={<Pages.AuthCallback />} />
    <Route path="/landing" element={<Pages.LandingPage />} />
    <Route path="/pricing" element={<Pages.LandingPage />} />
    <Route path="/status" element={<Pages.LandingPage />} />
    <Route path="/demo" element={<Pages.LandingPage />} />
    
    {/* ============================================ */}
    {/* AUTHENTICATED ROUTES */}
    {/* ============================================ */}
    <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
      <Route path="/" element={<Navigate to="/command" replace />} />
      
      {/* ======== 7 MEGA-HUBS ======== */}
      <Route path="/command" element={<Pages.CommandMegaHub />} />
      <Route path="/command/*" element={<Pages.CommandMegaHub />} />
      <Route path="/ops" element={<Pages.OpsMegaHub />} />
      <Route path="/ops/*" element={<Pages.OpsMegaHub />} />
      <Route path="/maintenance" element={<Pages.MaintenanceMegaHub />} />
      <Route path="/maintenance/*" element={<Pages.MaintenanceMegaHub />} />
      <Route path="/ai" element={<Pages.AIMegaHub />} />
      <Route path="/ai/agents/:agentId" element={<Pages.AgentChat />} />
      <Route path="/ai/*" element={<Pages.AIMegaHub />} />
      <Route path="/tracking" element={<Pages.TrackingMegaHub />} />
      <Route path="/tracking/*" element={<Pages.TrackingMegaHub />} />
      <Route path="/compliance" element={<Pages.ComplianceMegaHub />} />
      <Route path="/compliance/*" element={<Pages.ComplianceMegaHub />} />
      <Route path="/workbench" element={<Pages.WorkbenchMegaHub />} />
      <Route path="/workbench/*" element={<Pages.WorkbenchMegaHub />} />
      
      {/* ======== GENERAL ======== */}
      <Route path="/billing" element={<Pages.Billing />} />
      <Route path="/billing-portal" element={<Pages.BillingPortal />} />
      <Route path="/planos" element={<Pages.Billing />} />
      <Route path="/onboarding" element={<Pages.OnboardingDashboard />} />
      <Route path="/onboarding-tour" element={<Pages.InteractiveOnboarding />} />
      <Route path="/welcome" element={<Pages.InteractiveOnboarding />} />
      <Route path="/analytics-feedback" element={<Pages.AnalyticsFeedback />} />
      <Route path="/feedback" element={<Pages.AnalyticsFeedback />} />
      
      {/* ======== CENTRAL DE COMANDO (redirect to standardized CommandMegaHub) ======== */}
      <Route path="/central-comando" element={<Navigate to="/command" replace />} />
      <Route path="/central-comando/visao-geral" element={<Navigate to="/command" replace />} />
      <Route path="/central-comando/operacoes" element={<Navigate to="/command?tab=operations" replace />} />
      <Route path="/central-comando/executivo" element={<Navigate to="/command?tab=executive" replace />} />
      <Route path="/central-comando/ia" element={<Navigate to="/ai" replace />} />
      <Route path="/central-comando/alertas" element={<Navigate to="/command?tab=alerts" replace />} />
      <Route path="/central-comando/*" element={<Navigate to="/command" replace />} />
      <Route path="/noc" element={<Pages.NOC />} />
      <Route path="/health-monitor" element={<Pages.HealthMonitor />} />
      
      {/* ======== OPERAÇÕES MARÍTIMAS ======== */}
      <Route path="/maritime-command" element={<Pages.MaritimeCommandCenter />} />
      <Route path="/fleet-command" element={<Pages.FleetCommandCenter />} />
      <Route path="/voyage-command" element={<Pages.VoyageCommandCenter />} />
      <Route path="/mission-command" element={<Pages.MissionCommandCenter />} />
      <Route path="/bridge-link" element={<Pages.BridgeLink />} />
      <Route path="/digital-twin" element={<Pages.DigitalTwinPage />} />
      <Route path="/recruitment" element={<Pages.RecruitmentPage />} />
      <Route path="/agent-orchestration" element={<Pages.AgentOrchestrationPage />} />
      <Route path="/blockchain-compliance" element={<Pages.BlockchainCompliancePage />} />
      <Route path="/company-financials" element={<Pages.CompanyFinancialPage />} />
      <Route path="/satcom-dashboard" element={<Pages.SatcomDashboardEnhanced />} />
      
      {/* Operações Submarinas (redirects) */}
      <Route path="/ocean-sonar" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/underwater-drone" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/auto-sub" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/sonar-ai" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/deep-risk-ai" element={<Navigate to="/maritime-command" replace />} />
      
      {/* ======== MANUTENÇÃO ======== */}
      <Route path="/maintenance-command" element={<Pages.MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<Pages.PredictiveMaintenancePage />} />
      <Route path="/fuel-management" element={<Pages.FuelManagementPage />} />
      
      {/* ======== IA & AUTOMAÇÃO ======== */}
      <Route path="/nauti-command" element={<Pages.AIHubPage />} />
      <Route path="/revolutionary-ai" element={<Pages.AIHubPage />} />
      <Route path="/ai-hub" element={<Pages.AIHubPage />} />
      <Route path="/ai-analytics" element={<Pages.AIAnalyticsDashboard />} />
      <Route path="/revolutionary-features" element={<Pages.AIHubPage />} />
      <Route path="/ai-ops/logs" element={<Pages.AIHubPage />} />
      <Route path="/ai-observability" element={<Pages.AIObservabilityDashboard />} />
      <Route path="/workflow-command" element={<Pages.WorkflowCommandCenter />} />
      <Route path="/ai-journaling" element={<Pages.Documents />} />
      <Route path="/ai-audit" element={<Pages.AIAudit />} />
      <Route path="/voice-assistant" element={<Pages.AIHubPage />} />
      <Route path="/voice-assistant-ai" element={<Pages.AIHubPage />} />
      <Route path="/assistente-voz" element={<Pages.AIHubPage />} />
      <Route path="/assistant/voice" element={<Pages.AIHubPage />} />
      
      {/* AI Modules Hub */}
      <Route path="/ai-modules" element={<Pages.AIModulesHubPage />} />
      <Route path="/ai/voyage-logistics" element={<Pages.VoyageLogisticsAIPage />} />
      <Route path="/ai/safety-incident" element={<Pages.SafetyIncidentAIPage />} />
      <Route path="/ai/inventory-spares" element={<Pages.InventorySparesAIPage />} />
      <Route path="/compliance-ai" element={<Pages.ComplianceAIPage />} />
      <Route path="/environmental-ai" element={<Pages.EnvironmentalAIPage />} />
      <Route path="/quality-ai" element={<Pages.QualityManagementAIPage />} />
      <Route path="/contract-legal-ai" element={<Pages.ContractLegalAIPage />} />
      <Route path="/insurance-claims-ai" element={<Pages.InsuranceClaimsAIPage />} />
      <Route path="/crewing-payroll-ai" element={<Pages.CrewingPayrollAIPage />} />
      <Route path="/reporting-analytics-ai" element={<Pages.ReportingAnalyticsAIPage />} />
      <Route path="/mobile-offline-ai" element={<Pages.MobileOfflineAIPage />} />
      
      {/* ======== INTELIGÊNCIA AVANÇADA ======== */}
      <Route path="/optimization-dashboard" element={<Pages.Optimization />} />
      <Route path="/unified-optimization" element={<Pages.UnifiedOptimizationPage />} />
      <Route path="/intelligence/opec" element={<Pages.Optimization />} />
      <Route path="/intelligence/wellness" element={<Pages.CrewWellnessPage />} />
      <Route path="/intelligence/documents" element={<Pages.Documents />} />
      <Route path="/intelligence/blockchain" element={<Pages.AIHubPage />} />
      <Route path="/intelligence/competitive" element={<Pages.AISTrackerPage />} />
      
      {/* ======== TELEMETRIA & MONITORAMENTO ======== */}
      <Route path="/telemetria" element={<Pages.TelemetriaCommand />} />
      <Route path="/telemetria-command" element={<Pages.TelemetriaCommand />} />
      <Route path="/predictive-telemetry" element={<Pages.TelemetriaCommand />} />
      <Route path="/satellite-optimizer" element={<Pages.TelemetriaCommand />} />
      <Route path="/vessel-tracking" element={<Pages.VesselTrackingPage />} />
      <Route path="/tracking/gnss-live" element={<Pages.VesselTrackingPage />} />
      <Route path="/simulador" element={<Navigate to="/maritime-command" replace />} />
      <Route path="/operational-calendar" element={<Pages.CalendarView />} />
      
      {/* ======== APIs & INTEGRAÇÕES ======== */}
      <Route path="/integracoes/api-center" element={<Pages.APICenter />} />
      <Route path="/integracoes/api-monitor" element={<Pages.APIMonitor />} />
      <Route path="/integracoes" element={<Pages.Integrations />} />
      <Route path="/weather-maritime" element={<Pages.WeatherMaritime />} />
      <Route path="/ais-tracker-page" element={<Pages.AISTrackerPage />} />
      <Route path="/port-api" element={<Pages.PortAPI />} />
      <Route path="/flight-tracker" element={<Pages.WeatherMaritime />} />
      <Route path="/noaa-weather" element={<Pages.WeatherMaritime />} />
      <Route path="/opensky-flights" element={<Pages.WeatherMaritime />} />
      <Route path="/earthquake-monitor" element={<Pages.WeatherMaritime />} />
      <Route path="/voice-transcriber" element={<Navigate to="/ai-hub" replace />} />
      
      {/* ======== RELATÓRIOS & DOCUMENTOS ======== */}
      <Route path="/reports-command" element={<Pages.ReportsCommandCenter />} />
      <Route path="/reports" element={<Pages.ReportsCommandCenter />} />
      <Route path="/documents" element={<Pages.Documents />} />
      <Route path="/templates" element={<Pages.Templates />} />
      <Route path="/document-workflow" element={<Pages.DocumentWorkflow />} />
      <Route path="/export-center" element={<Pages.ExportCenterPage />} />
      <Route path="/knowledge-hub" element={<Pages.Documents />} />
      <Route path="/documentation" element={<Pages.Documents />} />
      
      {/* ======== AUDITORIAS & COMPLIANCE ======== */}
      <Route path="/audit-ai-chat" element={<Pages.AuditAIChatPage />} />
      <Route path="/peo-dp" element={<Pages.PEODP />} />
      <Route path="/sgso" element={<Pages.SGSO />} />
      <Route path="/sgso/report" element={<Pages.SGSOReportPage />} />
      <Route path="/pre-ovid" element={<Pages.PreOVIDInspection />} />
      <Route path="/pre-ovid-inspection" element={<Pages.PreOVIDInspection />} />
      <Route path="/mlc-inspection" element={<Pages.MLCInspection />} />
      <Route path="/psc-package" element={<Pages.PSCPackage />} />
      <Route path="/whistleblower" element={<Pages.SecurityCenter />} />
      <Route path="/security-center" element={<Pages.SecurityCenter />} />
      <Route path="/ai-operations-center" element={<Pages.AIHubPage />} />
      <Route path="/auditoria-seguranca" element={<Pages.SecurityAuditCenter />} />
      <Route path="/security-scanner" element={<Pages.SecurityScanner />} />
      <Route path="/compliance-roadmap" element={<Pages.ComplianceRoadmapPage />} />
      <Route path="/compliance-dashboard" element={<Pages.ComplianceRoadmapPage />} />
      <Route path="/compliance-executive" element={<Pages.ExecutiveCompliancePage />} />
      <Route path="/executive-compliance" element={<Pages.ExecutiveCompliancePage />} />
      <Route path="/audit-agents" element={<Pages.AgentsDashboard />} />
      <Route path="/audit-agents/:agentId" element={<Pages.AgentDetailPage />} />
      <Route path="/pre-sire" element={<Pages.PreSIREInspection />} />
      <Route path="/pre-sire-2" element={<Pages.PreSIREInspection />} />
      <Route path="/tmsa-assessment" element={<Pages.TMSAAssessment />} />
      <Route path="/tmsa" element={<Pages.TMSAAssessment />} />
      <Route path="/solas-inspection" element={<Pages.SOLASInspection />} />
      <Route path="/solas-lsa-ffe" element={<Pages.SOLASInspection />} />
      
      {/* Diagnostic Components */}
      <Route path="/diagnostic-certificates" element={<Pages.DiagnosticCertificatesPage />} />
      <Route path="/diagnostic-dashboard" element={<Pages.DiagnosticDashboardPage />} />
      <Route path="/diagnostic-documents" element={<Pages.DiagnosticDocumentsPage />} />
      <Route path="/diagnostic-ncs" element={<Pages.DiagnosticNCsPage />} />
      <Route path="/diagnostic-reports" element={<Pages.DiagnosticReportsPage />} />
      
      {/* ======== RH & PESSOAS ======== */}
      <Route path="/nautilus-people" element={<Pages.MaritimeCommandCenter />} />
      <Route path="/crew-management" element={<Pages.MaritimeCommandCenter />} />
      <Route path="/crew-wellness" element={<Pages.CrewWellnessPage />} />
      <Route path="/medical-infirmary" element={<Pages.MedicalInfirmary />} />
      <Route path="/enfermaria-digital" element={<Pages.MedicalInfirmary />} />
      <Route path="/users" element={<Pages.Users />} />
      <Route path="/hr-dashboard" element={<Pages.HRDashboardPage />} />
      <Route path="/hr/dashboard" element={<Pages.HRDashboardPage />} />
      <Route path="/hr/employees" element={<Pages.HRDashboardPage />} />
      <Route path="/hr/payroll" element={<Pages.Payroll />} />
      <Route path="/payroll" element={<Pages.Payroll />} />
      <Route path="/folha-pagamento" element={<Pages.Payroll />} />
      <Route path="/time-tracking" element={<Pages.TimeTracking />} />
      <Route path="/controle-ponto" element={<Pages.TimeTracking />} />
      <Route path="/hr/admissions" element={<Pages.HRDashboardPage />} />
      <Route path="/hr/vacations" element={<Pages.HRDashboardPage />} />
      <Route path="/employee-portal" element={<Pages.EmployeePortalPage />} />
      <Route path="/portal-colaborador" element={<Pages.EmployeePortalPage />} />
      <Route path="/people-analytics" element={<Pages.PeopleAnalyticsPage />} />
      <Route path="/hr/analytics" element={<Pages.PeopleAnalyticsPage />} />
      <Route path="/hr/turnover" element={<Pages.HRTurnoverPredictionPage />} />
      <Route path="/hr-chatbot" element={<Pages.HRChatbotPage />} />
      <Route path="/hr/chatbot" element={<Pages.HRChatbotPage />} />
      <Route path="/assistente-rh" element={<Pages.HRChatbotPage />} />
      <Route path="/hr-ocr" element={<Pages.HRDocumentOCRPage />} />
      <Route path="/hr/document-ocr" element={<Pages.HRDocumentOCRPage />} />
      <Route path="/admissao-digital" element={<Pages.HRDocumentOCRPage />} />
      <Route path="/hr-turnover" element={<Pages.HRTurnoverPredictionPage />} />
      <Route path="/hr/turnover-prediction" element={<Pages.HRTurnoverPredictionPage />} />
      <Route path="/predicao-turnover" element={<Pages.HRTurnoverPredictionPage />} />
      
      {/* ======== TREINAMENTOS ======== */}
      <Route path="/nautilus-academy" element={<Pages.AITraining />} />
      <Route path="/solas-isps-training" element={<Pages.SOLASISPSTrainingPage />} />
      <Route path="/dp-intelligence" element={<Pages.AITraining />} />
      
      {/* ======== FINANÇAS & PROCUREMENT ======== */}
      <Route path="/finance-ai" element={<Pages.FinanceProcurementAIPage />} />
      <Route path="/finance-procurement-ai" element={<Pages.FinanceProcurementAIPage />} />
      <Route path="/voyage-accounting" element={<Pages.VoyageAccountingPage />} />
      <Route path="/voyage-pnl" element={<Pages.VoyagePnLPage />} />
      <Route path="/crew-scheduler" element={<Pages.CrewSchedulerPage />} />
      <Route path="/analytics-command" element={<Pages.AnalyticsCommandCenter />} />
      <Route path="/operations-command" element={<Pages.OperationsCommandCenter />} />
      
      {/* ======== ESG & SUSTENTABILIDADE ======== */}
      <Route path="/esg-emissions" element={<Pages.ESGEmissionsPage />} />
      <Route path="/waste-management" element={<Pages.EnhancedWasteManagement />} />
      <Route path="/sustainability-score" element={<Pages.SustainabilityScorePage />} />
      
      {/* ======== STCW/MLC ======== */}
      <Route path="/stcw-mlc" element={<Pages.STCWMLCCompliance />} />
      
      {/* ======== SISTEMA & CONFIGURAÇÕES ======== */}
      <Route path="/quality-dashboard" element={<Pages.QualityDashboard />} />
      <Route path="/settings" element={<Pages.Settings />} />
      <Route path="/settings/security" element={<Pages.SecuritySettings />} />
      <Route path="/integrations" element={<Pages.IntegrationsCenter />} />
      <Route path="/api-gateway" element={<Pages.IntegrationsCenter />} />
      <Route path="/collaboration" element={<Pages.Collaboration />} />
      <Route path="/roadmap" element={<Pages.LandingPage />} />
      <Route path="/client-portal" element={<Pages.ClientPortalPage />} />
      
      {/* ======== ENTERPRISE INTELLIGENCE SUITE ======== */}
      <Route path="/enterprise/rag-assistant" element={<Pages.RAGAssistantPage />} />
      <Route path="/enterprise/ocr-center" element={<Pages.OCRCenterPage />} />
      <Route path="/enterprise/document-processor" element={<Pages.OCRCenterPage />} />
      <Route path="/enterprise/forms-builder" element={<Pages.FormsBuilderPage />} />
      <Route path="/enterprise/checklists-builder" element={<Pages.ChecklistsBuilderPage />} />
      <Route path="/enterprise/ocimf-assessment" element={<Pages.OCIMFAssessmentPage />} />
      <Route path="/enterprise/tmsa-analytics" element={<Pages.TMSAAnalyticsPage />} />
      <Route path="/enterprise/fatigue-risk" element={<Pages.FatigueRiskPage />} />
      <Route path="/enterprise/mlc-hours" element={<Pages.MLCWorkHoursPage />} />
      <Route path="/enterprise/crew-matching" element={<Pages.CrewMatchingPage />} />
      <Route path="/enterprise/talent-pool" element={<Pages.CrewMatchingPage />} />
      <Route path="/enterprise/contract-analysis" element={<Pages.ContractAnalysisPage />} />
      <Route path="/enterprise/risk-clauses" element={<Pages.RiskClausesPage />} />
      <Route path="/enterprise/compliance-predictor" element={<Pages.CompliancePredictorPage />} />
      <Route path="/enterprise/nc-prediction" element={<Pages.NCPredictionPage />} />
      
      {/* ======== ADVANCED MARITIME MODULES ======== */}
      <Route path="/advanced/digital-twin-3d" element={<Pages.DigitalTwin3DPage />} />
      <Route path="/advanced/weather-intelligence" element={<Pages.WeatherIntelligencePage />} />
      <Route path="/advanced/bunker-optimization" element={<Pages.BunkerOptimizationPage />} />
      <Route path="/advanced/cargo-planning" element={<Pages.CargoPlanningPage />} />
      <Route path="/advanced/psc-readiness" element={<Pages.PSCReadinessPage />} />
      <Route path="/advanced/marpol-tracker" element={<Pages.MARPOLTrackerPage />} />
      <Route path="/advanced/blockchain-certificates" element={<Pages.BlockchainCertificatesPage />} />
      <Route path="/advanced/incident-investigation" element={<Pages.IncidentInvestigationPage />} />
      <Route path="/advanced/vr-training" element={<Pages.VRTrainingPage />} />
      <Route path="/advanced/voice-commands" element={<Pages.VoiceCommandsPage />} />
      <Route path="/advanced/crew-wellness-ai" element={<Pages.CrewWellnessAIAdvancedPage />} />
      <Route path="/advanced/executive-dashboard" element={<Pages.ExecutiveDashboardAdvancedPage />} />
      
      {/* ======== SYSTEM REDIRECTS ======== */}
      <Route path="/system/interactivity" element={<Navigate to="/command" replace />} />
      <Route path="/system/qa-scoreboard" element={<Navigate to="/command" replace />} />
      <Route path="/qa-dashboard" element={<Navigate to="/command" replace />} />
      
      {/* ======== UNIFIED HUB REDIRECTS ======== */}
      <Route path="/operations-command-hub" element={<Navigate to="/ops" replace />} />
      <Route path="/ai-control-tower" element={<Navigate to="/ai" replace />} />
      <Route path="/people-hub" element={<Navigate to="/workbench" replace />} />
      <Route path="/tracking-telemetry" element={<Navigate to="/tracking" replace />} />
      <Route path="/document-center" element={<Navigate to="/workbench" replace />} />
      <Route path="/comms-alerts" element={<Navigate to="/command" replace />} />
      <Route path="/ai-enterprise-engines" element={<Pages.AIEnterpriseEnginesHub />} />
      <Route path="/compliance-unified" element={<Navigate to="/compliance" replace />} />
      <Route path="/system-hub" element={<Navigate to="/command?tab=monitoring" replace />} />
      <Route path="/maintenance-hub" element={<Navigate to="/maintenance" replace />} />
      <Route path="/finance-hub" element={<Navigate to="/workbench" replace />} />
      <Route path="/finance-command" element={<Navigate to="/workbench" replace />} />
      
      {/* ======== ADMIN ======== */}
      <Route path="/admin" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.Admin /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/dashboard" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminDashboard /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/bi" element={<Suspense fallback={<AppLoader />}><Pages.AdminBI /></Suspense>} />
      <Route path="/admin/documents" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminDocumentList /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/documents/ai" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminAIEditor /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/documents/ai/templates" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminAITemplates /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/documents/view/:id" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminDocumentView /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/documents/history/:id" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminDocumentHistory /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/documents/editor/:id" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminDocumentEditorDemo /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/documents/collaborate/:id" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminCollaborativeEditor /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/templates" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminTemplates /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/templates/edit/:id" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminTemplateEdit /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/sgso" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminSGSO /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/sgso/history/:vesselId" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminSGSOHistory /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/assistant" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminAssistant /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/assistant/logs" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminAssistantLogs /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/reports/assistant" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminReportsAssistant /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/reports/logs" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminReportsLogs /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/reports/restore-analytics" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminReportsRestoreAnalytics /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/collaboration" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminCollaboration /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/checklists" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.MaritimeCommandCenter /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/checklists/dashboard" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminChecklistsDashboard /></Pages.AdminRoute></Suspense>} />
      <Route path="/admin/api-tester" element={<Suspense fallback={<AppLoader />}><Pages.AdminRoute><Pages.AdminApiTester /></Pages.AdminRoute></Suspense>} />
      
      {/* ======== DASHBOARD ALIASES ======== */}
      <Route path="/dashboard" element={<Navigate to="/command" replace />} />
      <Route path="/executive-dashboard" element={<Navigate to="/command" replace />} />
      <Route path="/system-overview" element={<Navigate to="/command" replace />} />
      <Route path="/analytics" element={<Pages.AnalyticsCommandCenter />} />
      <Route path="/backup-audit" element={<Pages.SecurityAuditCenter />} />
      <Route path="/saas-manager" element={<Pages.Admin />} />
      <Route path="/docs" element={<Pages.Documents />} />
      
      {/* ======== LEGACY REDIRECTS (Safety Net) ======== */}
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
      <Route path="/peotram" element={<Navigate to="/compliance?standard=peotram" replace />} />
      <Route path="/peotram-ai" element={<Navigate to="/compliance?standard=peotram" replace />} />
      <Route path="/gmud" element={<Navigate to="/compliance" replace />} />
      <Route path="/gmud-workflow" element={<Navigate to="/compliance" replace />} />
      <Route path="/responsibility-matrix" element={<Navigate to="/compliance" replace />} />
      <Route path="/safety-human-factors" element={<Navigate to="/compliance" replace />} />
      <Route path="/safety-imca" element={<Navigate to="/compliance?standard=ism" replace />} />
      <Route path="/imca-audit" element={<Navigate to="/compliance?standard=ism" replace />} />
      <Route path="/isps-security" element={<Navigate to="/compliance?standard=isps" replace />} />
      <Route path="/drill-simulator" element={<Navigate to="/compliance?standard=solas" replace />} />
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
      <Route path="/real-time-workspace" element={<Pages.Collaboration />} />
      <Route path="/schedule" element={<Navigate to="/operational-calendar" replace />} />
      <Route path="/schedules" element={<Navigate to="/operational-calendar" replace />} />
      <Route path="/missions" element={<Navigate to="/mission-command" replace />} />
      <Route path="/monitoring" element={<Navigate to="/central-comando" replace />} />
      <Route path="/testing" element={<Pages.CentralComando />} />
      <Route path="/qa/preview" element={<Pages.CentralComando />} />

      {/* DEV ONLY */}
      <Route path="/dev-routes" element={<Pages.DevRoutesDashboard />} />
    </Route>
    
    <Route path="*" element={<Pages.NotFound />} />
  </Routes>
);
