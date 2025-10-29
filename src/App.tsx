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
import { safeLazyImport } from "@/utils/safeLazyImport";

// Páginas mais usadas - carregamento prioritário
import Index from "@/pages/Index";
const Dashboard = lazyWithPreload(() => import("@/pages/Dashboard"));
const Travel = lazyWithPreload(() => import("@/pages/Travel"));

// Páginas secundárias - carregamento normal
const PriceAlerts = safeLazyImport(() => import("@/modules/features/price-alerts"));
const SensorsHub = safeLazyImport(() => import("@/modules/sensors-hub"));
const CrewValidation = safeLazyImport(() => import("@/pages/admin/crew/validation"));
const IntegrationsValidation = safeLazyImport(() => import("@/pages/admin/integrations/validation"));
const AnalyticsValidation = safeLazyImport(() => import("@/pages/admin/analytics/validation"));
const Reports = safeLazyImport(() => import("@/pages/Reports"));
const Reservations = safeLazyImport(() => import("@/pages/Reservations"));
const ChecklistsInteligentes = safeLazyImport(() => import("@/pages/ChecklistsInteligentes"));
const BridgeLink = safeLazyImport(() => import("@/pages/BridgeLink"));
const PEODP = safeLazyImport(() => import("@/pages/PEODP"));
const DPIncidents = safeLazyImport(() => import("@/pages/DPIncidents"));
const DPIntelligence = safeLazyImport(() => import("@/pages/DPIntelligence"));
const DPSyncEngine = safeLazyImport(() => import("@/pages/DPSyncEngine"));
const SGSO = safeLazyImport(() => import("@/pages/SGSO"));
const SGSOReportPage = safeLazyImport(() => import("@/pages/SGSOReportPage"));
const SGSOAuditPage = safeLazyImport(() => import("@/pages/SGSOAuditPage"));
const Settings = safeLazyImport(() => import("@/pages/Settings"));
const Documents = safeLazyImport(() => import("@/modules/document-hub/components/DocumentsAI"));
const DocumentHub = safeLazyImport(() => import("@/modules/document-hub"));
const AIAssistant = safeLazyImport(() => import("@/pages/AIAssistant"));
const Analytics = safeLazyImport(() => import("@/pages/Analytics"));
const HumanResources = safeLazyImport(() => import("@/pages/HumanResources"));
const Communication = safeLazyImport(() => import("@/modules/connectivity/communication"));
const Intelligence = safeLazyImport(() => import("@/pages/Intelligence"));
const Maritime = safeLazyImport(() => import("@/pages/Maritime"));
const MaritimeSupremo = safeLazyImport(() => import("@/pages/MaritimeSupremo"));
const NautilusOne = safeLazyImport(() => import("@/pages/NautilusOne"));
const FuelOptimizerPage = safeLazyImport(() => import("@/pages/FuelOptimizerPage"));
const ForecastPage = safeLazyImport(() => import("@/pages/Forecast"));
const ForecastGlobal = safeLazyImport(() => import("@/pages/ForecastGlobal"));
const MaintenanceDashboard = safeLazyImport(() => import("@/pages/Maintenance"));
const ComplianceHub = safeLazyImport(() => import("@/pages/compliance/ComplianceHub"));
const DPIntelligenceCenter = safeLazyImport(() => import("@/modules/intelligence/dp-intelligence"));
const Innovation = safeLazyImport(() => import("@/pages/Innovation"));
const Optimization = safeLazyImport(() => import("@/pages/Optimization"));
const Collaboration = safeLazyImport(() => import("@/pages/Collaboration"));
const Voice = safeLazyImport(() => import("@/modules/assistants/voice-assistant"));
const Portal = safeLazyImport(() => import("@/modules/hr/employee-portal"));
const AR = safeLazyImport(() => import("@/pages/AR"));
const IoT = safeLazyImport(() => import("@/pages/IoT"));
const Blockchain = safeLazyImport(() => import("@/pages/Blockchain"));
const Gamification = safeLazyImport(() => import("@/pages/Gamification"));
const PredictiveAnalytics = safeLazyImport(() => import("@/pages/PredictiveAnalytics"));
const Admin = safeLazyImport(() => import("@/pages/Admin"));
const ControlHub = safeLazyImport(() => import("@/pages/ControlHub"));
const APITester = safeLazyImport(() => import("@/pages/admin/api-tester"));
const APIStatus = safeLazyImport(() => import("@/pages/admin/api-status"));
const ControlPanel = safeLazyImport(() => import("@/pages/admin/control-panel"));
const TestDashboard = safeLazyImport(() => import("@/pages/admin/tests"));
const CIHistory = safeLazyImport(() => import("@/pages/admin/ci-history"));
const AdminAnalytics = safeLazyImport(() => import("@/pages/admin/analytics"));
const AdminBI = safeLazyImport(() => import("@/pages/admin/bi"));
const AdminWall = safeLazyImport(() => import("@/pages/admin/wall"));
const AdminChecklists = safeLazyImport(() => import("@/pages/admin/checklists"));
const AdminChecklistsDashboard = safeLazyImport(() => import("@/pages/admin/checklists-dashboard"));
const SystemHealth = safeLazyImport(() => import("@/pages/admin/system-health"));
const Forecast = safeLazyImport(() => import("@/pages/admin/forecast"));
const DocumentsAI = safeLazyImport(() => import("@/pages/admin/documents-ai"));
const DocumentAIEditor = safeLazyImport(() => import("@/pages/admin/documents/ai-editor"));
const Assistant = safeLazyImport(() => import("@/pages/admin/assistant"));
const AssistantLogs = safeLazyImport(() => import("@/pages/admin/assistant-logs"));
const AdminCollaboration = safeLazyImport(() => import("@/pages/admin/collaboration"));
const DocumentList = safeLazyImport(() => import("@/pages/admin/documents/DocumentList"));
const DocumentView = safeLazyImport(() => import("@/pages/admin/documents/DocumentView"));
const DocumentHistory = safeLazyImport(() => import("@/pages/admin/documents/DocumentHistory"));
const DocumentEditorPage = safeLazyImport(() => import("@/pages/admin/documents/DocumentEditorPage"));
const CollaborativeEditor = safeLazyImport(() => import("@/pages/admin/documents/CollaborativeEditor"));
const DocumentEditorDemo = safeLazyImport(() => import("@/pages/admin/documents/DocumentEditorDemo"));
const RestoreDashboard = safeLazyImport(() => import("@/pages/admin/documents/restore-dashboard"));
const ExecutionLogs = safeLazyImport(() => import("@/pages/admin/automation/execution-logs"));
const RestoreReportLogs = safeLazyImport(() => import("@/pages/admin/reports/logs"));
const AssistantReportLogs = safeLazyImport(() => import("@/pages/admin/reports/assistant"));
const DashboardLogs = safeLazyImport(() => import("@/pages/admin/reports/dashboard-logs"));
const RestoreAnalytics = safeLazyImport(() => import("@/pages/admin/reports/restore-analytics"));
const PersonalRestoreDashboard = safeLazyImport(() => import("@/pages/admin/restore/personal"));
const AdminDashboard = safeLazyImport(() => import("@/pages/admin/dashboard"));
const SmartWorkflows = safeLazyImport(() => import("@/pages/admin/workflows"));
const WorkflowDetail = safeLazyImport(() => import("@/pages/admin/workflows/detail"));
const Templates = safeLazyImport(() => import("@/pages/admin/templates"));
const EditTemplatePage = safeLazyImport(() => import("@/pages/admin/templates/edit/[id]"));
const HealthMonitorDemo = safeLazyImport(() => import("@/pages/HealthMonitorDemo"));
const Health = safeLazyImport(() => import("@/pages/Health"));
const Offline = safeLazyImport(() => import("@/pages/Offline"));
const Modules = safeLazyImport(() => import("@/pages/Modules"));
const NotFound = safeLazyImport(() => import("@/pages/NotFound"));
const SmartLayoutDemo = safeLazyImport(() => import("@/pages/SmartLayoutDemo"));
const TemplateEditorDemo = safeLazyImport(() => import("@/pages/TemplateEditorDemo"));
const Unauthorized = safeLazyImport(() => import("@/pages/Unauthorized"));
const RestoreChartEmbed = safeLazyImport(() => import("@/pages/embed/RestoreChartEmbed"));
const TVWallLogs = safeLazyImport(() => import("@/pages/tv/LogsPage"));
const TemplateEditorPage = safeLazyImport(() => import("@/pages/admin/templates/editor"));
const TemplateValidationPage = safeLazyImport(() => import("@/pages/admin/templates/validation"));
const CrewConsolidationValidationPage = safeLazyImport(() => import("@/pages/admin/crew/consolidation-validation"));
const DocumentHubValidationPage = safeLazyImport(() => import("@/pages/admin/document-hub/validation"));
const MissionControlValidationPage = safeLazyImport(() => import("@/pages/admin/mission-control/validation"));
const DocumentationValidationPage = safeLazyImport(() => import("@/pages/admin/documentation/validation"));
const DocumentTemplatesValidationPage = safeLazyImport(() => import("@/pages/admin/document-templates/validation"));
const SatelliteTrackerValidationPage = safeLazyImport(() => import("@/pages/admin/satellite-tracker/validation"));
const NavigationCopilotValidationPage = safeLazyImport(() => import("@/pages/admin/navigation-copilot/validation"));
const TemplateEditorValidationPage = safeLazyImport(() => import("@/pages/admin/template-editor/validation"));
const DocumentsConsolidationValidationPage = safeLazyImport(() => import("@/pages/admin/documents-consolidation/validation"));
const PriceAlertsValidationPage = safeLazyImport(() => import("@/pages/admin/price-alerts/validation"));
const IncidentsConsolidationValidationPage = safeLazyImport(() => import("@/pages/admin/incidents-consolidation/validation"));
const SensorHubValidationPage = safeLazyImport(() => import("@/pages/admin/sensor-hub/validation"));
const TestsValidationPage = safeLazyImport(() => import("@/pages/admin/tests"));
const MMIJobsPanel = safeLazyImport(() => import("@/pages/MMIJobsPanel"));
const MmiBI = safeLazyImport(() => import("@/pages/MmiBI"));
const MMIHistory = safeLazyImport(() => import("@/pages/MMIHistory"));
const MMIHistoryAdmin = safeLazyImport(() => import("@/pages/admin/mmi/history"));
const MMIForecast = safeLazyImport(() => import("@/pages/admin/mmi/forecast/page"));
const MMIOrders = safeLazyImport(() => import("@/pages/admin/mmi/orders"));
const MMITasks = safeLazyImport(() => import("@/pages/MMITasks"));
const MMIForecastPage = safeLazyImport(() => import("@/pages/MMIForecastPage"));
const PerformanceAnalysis = safeLazyImport(() => import("@/pages/admin/PerformanceAnalysis"));
const JobCreationWithSimilarExamples = safeLazyImport(() => import("@/pages/JobCreationWithSimilarExamples"));
const CopilotJobForm = safeLazyImport(() => import("@/pages/CopilotJobForm"));
const CopilotJobFormAdmin = safeLazyImport(() => import("@/pages/admin/copilot-job-form"));
const DashboardAuditorias = safeLazyImport(() => import("@/pages/admin/dashboard-auditorias"));
const MetricasRisco = safeLazyImport(() => import("@/pages/admin/metricas-risco"));
const AdminSGSO = safeLazyImport(() => import("@/pages/admin/sgso"));
const SGSOHistoryPage = safeLazyImport(() => import("@/pages/admin/sgso/history/[vesselId]"));
const SGSOAuditHistory = safeLazyImport(() => import("@/pages/admin/sgso/history"));
const SGSOAuditReview = safeLazyImport(() => import("@/pages/admin/sgso/review/[id]"));
const AuditoriasIMCA = safeLazyImport(() => import("@/pages/admin/auditorias-imca"));
const AuditoriasLista = safeLazyImport(() => import("@/pages/admin/auditorias-lista"));
const IMCAAudit = safeLazyImport(() => import("@/pages/IMCAAudit"));
const Simulations = safeLazyImport(() => import("@/pages/admin/simulations"));
const CronMonitor = safeLazyImport(() => import("@/pages/admin/cron-monitor"));
const TrainingManagement = safeLazyImport(() => import("@/pages/admin/training"));
const TrainingAcademyAdmin = safeLazyImport(() => import("@/pages/admin/training-academy"));
const TrainingAcademyEnhanced = safeLazyImport(() => import("@/pages/admin/training-academy-enhanced"));
const IncidentsPage = safeLazyImport(() => import("@/pages/admin/incidents"));
const IncidentReportsComplete = safeLazyImport(() => import("@/pages/admin/incident-reports-complete"));
const PerformanceDashboard = safeLazyImport(() => import("@/pages/admin/performance-dashboard"));
const BackupAudit = safeLazyImport(() => import("@/pages/BackupAudit"));
const RiskAudit = safeLazyImport(() => import("@/pages/admin/risk-audit"));
const CertViewer = safeLazyImport(() => import("@/components/cert/CertViewer"));
const QuizPage = safeLazyImport(() => import("@/pages/admin/QuizPage"));
const ExternalAuditSystem = safeLazyImport(() => import("@/pages/ExternalAuditSystem"));
const ForecastHistoryPage = safeLazyImport(() => import("@/pages/admin/mmi/forecast/ForecastHistory"));
const BIForecastsPage = safeLazyImport(() => import("@/pages/admin/bi/forecasts"));
const PEODPAuditPage = safeLazyImport(() => import("@/pages/admin/peodp-audit"));
const PEODPWizardComplete = safeLazyImport(() => import("@/pages/admin/peodp-wizard-complete"));
const VaultAI = safeLazyImport(() => import("@/modules/vault_ai/pages/VaultAIPage"));
const VaultAIComplete = safeLazyImport(() => import("@/pages/admin/vault-ai-complete"));
const Patch66Dashboard = safeLazyImport(() => import("@/pages/Patch66Dashboard"));
const CrewDossierPage = safeLazyImport(() => import("@/pages/CrewDossier"));
const ChannelManagerHub = safeLazyImport(() => import("@/components/channel-manager/ChannelManagerHub"));
const TrainingAcademyHub = safeLazyImport(() => import("@/components/academy/TrainingAcademy"));
const CrewWellbeingNew = safeLazyImport(() => import("@/components/crew-wellbeing/CrewWellbeingHub"));
const ConsolidatedCrew = safeLazyImport(() => import("@/pages/crew"));
const SGSOManagerPage = safeLazyImport(() => import("@/components/sgso/SGSOManager"));

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
// PATCH 524: Incident Replay AI Module
const IncidentReplayAI = React.lazy(() => import("@/modules/incident-replay"));
// PATCH 525: AI Visual Recognition Core Module
const AIVisionCore = React.lazy(() => import("@/modules/ai-vision-core"));
// Validation Pages - Patches 401-410
const TemplateEditorValidation = safeLazyImport(() => import("@/pages/admin/template-editor/validation"));
const DocumentsConsolidationValidation = safeLazyImport(() => import("@/pages/admin/documents-consolidation/validation"));
const PriceAlertsValidation = safeLazyImport(() => import("@/pages/admin/price-alerts/validation"));
const IncidentsConsolidationValidation = safeLazyImport(() => import("@/pages/admin/incidents-consolidation/validation"));
const SensorHubValidation = safeLazyImport(() => import("@/pages/admin/sensor-hub/validation"));
const CrewConsolidationValidation = safeLazyImport(() => import("@/pages/admin/crew-consolidation/validation"));
const SonarAIValidation = safeLazyImport(() => import("@/pages/admin/sonar-ai/validation"));
const TestAutomationValidation = safeLazyImport(() => import("@/pages/admin/test-automation/validation"));
const TemplatesApplicationValidation = safeLazyImport(() => import("@/pages/admin/templates-application/validation"));
const MissionControlConsolidationValidation = safeLazyImport(() => import("@/pages/admin/mission-control-consolidation/validation"));
// PATCH 411-415 Validation Pages
const PriceAlertsFinalizadoValidation = safeLazyImport(() => import("@/pages/admin/price-alerts-finalizado/validation"));
const DocumentsConsolidadoValidation = safeLazyImport(() => import("@/pages/admin/documents-consolidado/validation"));
const UnifiedLogsPanelValidation = safeLazyImport(() => import("@/pages/admin/unified-logs-panel/validation"));
const CoordinationAIValidation = safeLazyImport(() => import("@/pages/admin/coordination-ai/validation"));
const ExperimentalModulesValidation = safeLazyImport(() => import("@/pages/admin/experimental-modules/validation"));
// PATCH 416-420 Validation Pages
const CrewConsolidadoValidation = safeLazyImport(() => import("@/pages/admin/crew-consolidado/validation"));
const TemplatesEditorValidation = safeLazyImport(() => import("@/pages/admin/templates-editor/validation"));
const PriceAlertsNotificationValidation = safeLazyImport(() => import("@/pages/admin/price-alerts-notification/validation"));
const MissionControlRealtimeValidation = safeLazyImport(() => import("@/pages/admin/mission-control-realtime/validation"));
const SatcomSimulationValidation = safeLazyImport(() => import("@/pages/admin/satcom-simulation/validation"));
// PATCH 421-425 Validation Pages
const DocumentsConsolidatedValidation = safeLazyImport(() => import("@/pages/admin/documents-consolidated/validation"));
const OceanSonarValidation = safeLazyImport(() => import("@/pages/admin/ocean-sonar/validation"));
const UnderwaterDroneValidation = safeLazyImport(() => import("@/pages/admin/underwater-drone/validation"));
// PATCH 426-430 Validation Pages
const MissionEngineValidation = safeLazyImport(() => import("@/pages/admin/mission-engine/validation"));
const DroneCommanderValidation = safeLazyImport(() => import("@/pages/admin/drone-commander/validation"));
const SatcomValidation = safeLazyImport(() => import("@/pages/admin/satcom/validation"));
const MissionConsolidationValidation = safeLazyImport(() => import("@/pages/admin/mission-consolidation/validation"));
// PATCH 431-435 Validation Pages
const RoutePlannerValidation = safeLazyImport(() => import("@/pages/admin/route-planner/validation"));
const NavigationCopilotV2Validation = safeLazyImport(() => import("@/pages/admin/navigation-copilot-v2/validation"));
const SystemValidationHub = safeLazyImport(() => import("@/pages/SystemValidationHub"));
const DeepRiskAIValidation = safeLazyImport(() => import("@/pages/admin/deep-risk-ai/validation"));
const TemplatesSystemValidation = safeLazyImport(() => import("@/pages/admin/templates-system/validation"));
const SonarAIValidationV2 = safeLazyImport(() => import("@/pages/admin/sonar-ai/validation"));
// PATCH 436-440 Validation Pages
const CrewConsolidationValidationPatch437 = safeLazyImport(() => import("@/pages/admin/crew-consolidation/validation"));
const PriceAlertsValidationPatch438 = safeLazyImport(() => import("@/pages/admin/price-alerts/validation"));
const IncidentReportsV2Validation = safeLazyImport(() => import("@/pages/admin/incident-reports-v2/validation"));
const AICoordinationValidation = safeLazyImport(() => import("@/pages/admin/ai-coordination/validation"));
// PATCH 441-445 Validation Pages
const SensorHubV2Validation = safeLazyImport(() => import("@/pages/admin/sensor-hub-v2/validation"));
const SATCOMv2Validation = safeLazyImport(() => import("@/pages/admin/satcom-v2/validation"));
const OceanSonarV3Validation = safeLazyImport(() => import("@/pages/admin/ocean-sonar-v3/validation"));
const DocumentsUnificationValidation = safeLazyImport(() => import("@/pages/admin/documents-unification/validation"));
const MissionEngineV2Validation = safeLazyImport(() => import("@/pages/admin/mission-engine-v2/validation"));
// PATCH 471-480 Validation Pages
const IncidentReplayAIValidation = safeLazyImport(() => import("@/pages/admin/incident-replay-ai/validation"));
const IncidentsConsolidationV2Validation = safeLazyImport(() => import("@/pages/admin/incidents-consolidation-v2/validation"));
const RoutePlannerV1Validation = safeLazyImport(() => import("@/pages/admin/route-planner-v1/validation"));
const SatcomV1Validation = safeLazyImport(() => import("@/pages/admin/satcom-v1/validation"));
const MissionEngineValidationPage = safeLazyImport(() => import("@/pages/admin/mission-engine-validation/validation"));
const CrewModuleConsolidationValidation = safeLazyImport(() => import("@/pages/admin/crew-module-consolidation/validation"));
const SonarAIDetailedValidation = safeLazyImport(() => import("@/pages/admin/sonar-ai-detailed/validation"));
const DocumentUnificationValidation = safeLazyImport(() => import("@/pages/admin/document-unification/validation"));
// PATCH 481-485 Validation Page
const Patches481485Validation = safeLazyImport(() => import("@/modules/validation/Patches481485Validation"));
// PATCH 491-495 Validation Page
const Patches491495Validation = safeLazyImport(() => import("@/modules/validation/Patches491495Validation"));
// PATCH 516-520: Advanced Sensor and Navigation Systems
const SensorsHubAdvanced = React.lazy(() => import("@/pages/sensors-hub"));
const NavigationCopilotAI = React.lazy(() => import("@/pages/navigation-copilot"));
const SatelliteLive = React.lazy(() => import("@/pages/satellite-live"));
const JointMissions = React.lazy(() => import("@/pages/joint-missions"));
const InteropGridAI = React.lazy(() => import("@/pages/interop-grid"));

// PATCH 486-489: New module pages
const CommunicationCenter = safeLazyImport(() => import("@/modules/communication-center"));
const DroneCommanderV1 = safeLazyImport(() => import("@/pages/admin/drone-commander-v1"));
const TemplateLibrary = safeLazyImport(() => import("@/pages/admin/template-library"));
const NavigationCopilotV2 = safeLazyImport(() => import("@/pages/admin/navigation-copilot-v2"));

// PATCH 511-515: Satellite, Satcom, Ocean Sonar, Navigation Copilot, Sensors Integration
const Patch511SatelliteTracker = safeLazyImport(() => import("@/pages/admin/Patch511SatelliteTracker"));
const Patch512Satcom = safeLazyImport(() => import("@/pages/admin/Patch512Satcom"));
const Patch513OceanSonar = safeLazyImport(() => import("@/pages/admin/Patch513OceanSonar"));
const Patch514NavigationCopilot = safeLazyImport(() => import("@/pages/admin/Patch514NavigationCopilot"));
const Patch515SensorsIntegration = safeLazyImport(() => import("@/pages/admin/Patch515SensorsIntegration"));

// PATCH 526-531: Communication, Incidents, Templates, Price Alerts, Mission Control, Tests
const Patch526Communication = safeLazyImport(() => import("@/pages/admin/Patch526Communication"));
const Patch527IncidentReports = safeLazyImport(() => import("@/pages/admin/Patch527IncidentReports"));
const Patch528DocumentTemplates = safeLazyImport(() => import("@/pages/admin/Patch528DocumentTemplates"));
const Patch529PriceAlerts = safeLazyImport(() => import("@/pages/admin/Patch529PriceAlerts"));
const Patch530MissionControlV2 = safeLazyImport(() => import("@/pages/admin/Patch530MissionControlV2"));
const Patch531TestValidation = safeLazyImport(() => import("@/pages/admin/Patch531TestValidation"));

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
                      {/* PATCH 486: Communication Center (unified) */}
                      <Route path="/communication-center" element={<CommunicationCenter />} />
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
                      {/* PATCH 488: Template Library */}
                      <Route path="/admin/templates/library" element={<TemplateLibrary />} />
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
                      <Route path="/validation" element={<SystemValidationHub />} />
                      <Route path="/system-validation" element={<SystemValidationHub />} />
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
                      
                      {/* Validation Routes - Patches 471-480 */}
                      <Route path="/admin/incident-replay-ai/validation" element={<IncidentReplayAIValidation />} />
                      <Route path="/admin/incidents-consolidation-v2/validation" element={<IncidentsConsolidationV2Validation />} />
                      <Route path="/admin/route-planner-v1/validation" element={<RoutePlannerV1Validation />} />
                      <Route path="/admin/satcom-v1/validation" element={<SatcomV1Validation />} />
                      <Route path="/admin/mission-engine-validation/validation" element={<MissionEngineValidationPage />} />
                      <Route path="/admin/crew-module-consolidation/validation" element={<CrewModuleConsolidationValidation />} />
                      <Route path="/admin/sonar-ai-detailed/validation" element={<SonarAIDetailedValidation />} />
                      <Route path="/admin/document-unification/validation" element={<DocumentUnificationValidation />} />
                      
                      {/* Validation Route - Patches 481-485 */}
                      <Route path="/admin/patches-481-485/validation" element={<Patches481485Validation />} />
                      
                      {/* Validation Route - Patches 491-495 */}
                      <Route path="/admin/patches-491-495/validation" element={<Patches491495Validation />} />
                      
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
                      {/* PATCH 491: Consolidated Incident Reports - single route */}
                      <Route path="/admin/incident-reports" element={<IncidentReports />} />
                      <Route path="/admin/incidents" element={<IncidentReports />} /> {/* Redirect old route */}
                      <Route path="/admin/performance-dashboard" element={<PerformanceDashboard />} />
                      {/* PATCH 487: Drone Commander v1 */}
                      <Route path="/drone-commander-v1" element={<DroneCommanderV1 />} />
                      {/* PATCH 489: Navigation Copilot v2 */}
                      <Route path="/admin/navigation-copilot-v2" element={<NavigationCopilotV2 />} />
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
                      
                      {/* PATCH 524: Incident Replay AI Module */}
                      <Route path="/incident-replay" element={<IncidentReplayAI />} />
                      
                      {/* PATCH 525: AI Visual Recognition Core Module */}
                      <Route path="/ai-vision-core" element={<AIVisionCore />} />
                      
                      {/* Validation Routes - Patches 401-410 */
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
                      
                      {/* PATCH 516-520: Advanced Sensor and Navigation Systems */}
                      <Route path="/sensors-hub" element={<SensorsHubAdvanced />} />
                      <Route path="/navigation-copilot" element={<NavigationCopilotAI />} />
                      <Route path="/satellite-live" element={<SatelliteLive />} />
                      <Route path="/joint-missions" element={<JointMissions />} />
                      <Route path="/interop-grid" element={<InteropGridAI />} />
                      
                      {/* PATCH 511-515: Validation Routes */}
                      <Route path="/admin/patch-511-satellite-tracker" element={<Patch511SatelliteTracker />} />
                      <Route path="/admin/patch-512-satcom" element={<Patch512Satcom />} />
                      <Route path="/admin/patch-513-ocean-sonar" element={<Patch513OceanSonar />} />
                      <Route path="/admin/patch-514-navigation-copilot" element={<Patch514NavigationCopilot />} />
                      <Route path="/admin/patch-515-sensors-integration" element={<Patch515SensorsIntegration />} />
                      
                      {/* PATCH 526-531: Validation Routes */}
                      <Route path="/admin/patch-526/communication" element={<Patch526Communication />} />
                      <Route path="/admin/patch-527/incident-reports" element={<Patch527IncidentReports />} />
                      <Route path="/admin/patch-528/document-templates" element={<Patch528DocumentTemplates />} />
                      <Route path="/admin/patch-529/price-alerts" element={<Patch529PriceAlerts />} />
                      <Route path="/admin/patch-530/mission-control-v2" element={<Patch530MissionControlV2 />} />
                      <Route path="/admin/patch-531/test-validation" element={<Patch531TestValidation />} />
                      
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
