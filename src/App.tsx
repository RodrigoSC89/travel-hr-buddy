import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SmartLayout } from "./components/layout/SmartLayout";
import { NAVIGATION, SuspenseFallback } from "@/config/navigation";
import { initializeMonitoring } from "@/lib/monitoring/init";
import { logger } from "@/lib/logger";
import { CommandPalette } from "@/components/CommandPalette";
import { OfflineBanner } from "@/components/OfflineBanner";
import { systemWatchdog } from "@/ai/watchdog";
import { webVitalsService } from "@/services/web-vitals-service";
import { OffshoreLoader, PageSkeleton } from "@/components/LoadingStates";
import { lazyWithPreload, preloadStrategy } from "@/lib/performance/lazy-with-preload";
import { safeLazyImport } from "@/utils/safeLazyImport";

// PATCH 540: Import bundles para reduzir lazy loading
import * as ModulesBundle from "@/bundles/ModulesBundle";
import * as AdminBundle from "@/bundles/AdminBundle";
import * as DeveloperBundle from "@/bundles/DeveloperBundle";
import * as DocumentBundle from "@/bundles/DocumentBundle";
import * as MissionBundle from "@/bundles/MissionBundle";
import * as OperationsBundle from "@/bundles/OperationsBundle";
import * as IntelligenceBundle from "@/bundles/IntelligenceBundle";

// Full App for all environments

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
const ValidationPatches622_626 = safeLazyImport(() => import("@/pages/ValidationPatches622_626"));
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
const PrePSCDashboard = safeLazyImport(() => import("@/pages/compliance/PrePSCDashboard"));
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

// PATCH 608-612: New Maritime Modules
const TravelIntelligence = safeLazyImport(() => import("@/modules/travel-intelligence"));
const ISMAudits = safeLazyImport(() => import("@/modules/ism-audits"));
const PreOvidInspection = safeLazyImport(() => import("@/pages/admin/pre-ovid-inspection"));

// PATCH 540 Fase 4: Admin pages bundled (17 → 1 import)
const APITester = AdminBundle.APITester;
const APIStatus = AdminBundle.APIStatus;
const ControlPanel = AdminBundle.ControlPanel;
const TestDashboard = AdminBundle.TestDashboard;
const CIHistory = AdminBundle.CIHistory;
const AdminAnalytics = AdminBundle.AdminAnalytics;
const AdminBI = AdminBundle.AdminBI;
const AdminWall = AdminBundle.AdminWall;
const AdminChecklists = AdminBundle.AdminChecklists;
const AdminChecklistsDashboard = AdminBundle.AdminChecklistsDashboard;
const SystemHealth = AdminBundle.SystemHealth;
const Forecast = AdminBundle.Forecast;
const DocumentsAI = AdminBundle.DocumentsAI;
const DocumentAIEditor = AdminBundle.DocumentAIEditor;
const Assistant = AdminBundle.Assistant;
const AssistantLogs = AdminBundle.AssistantLogs;
const AdminCollaboration = AdminBundle.AdminCollaboration;

// PATCH 540 Fase 4: Document pages bundled (7 → 1 import)
const DocumentList = DocumentBundle.DocumentList;
const DocumentView = DocumentBundle.DocumentView;
const DocumentHistory = DocumentBundle.DocumentHistory;
const DocumentEditorPage = DocumentBundle.DocumentEditorPage;
const CollaborativeEditor = DocumentBundle.CollaborativeEditor;
const DocumentEditorDemo = DocumentBundle.DocumentEditorDemo;
const RestoreDashboard = DocumentBundle.RestoreDashboard;

// PATCH 540 Fase 4: Developer tools bundled (8 → 1 import)
const ExecutionLogs = DeveloperBundle.ExecutionLogs;
const RestoreReportLogs = DeveloperBundle.RestoreReportLogs;
const AssistantReportLogs = DeveloperBundle.AssistantReportLogs;

// Remaining individual imports
const Admin = safeLazyImport(() => import("@/pages/Admin"));
const ControlHub = safeLazyImport(() => import("@/pages/ControlHub"));
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

const DocumentTemplatesValidationPage = safeLazyImport(() => import("@/pages/admin/document-templates/validation"));
const SatelliteTrackerValidationPage = safeLazyImport(() => import("@/pages/admin/satellite-tracker/validation"));
const NavigationCopilotValidationPage = safeLazyImport(() => import("@/pages/admin/navigation-copilot/validation"));
const TemplateEditorValidationPage = safeLazyImport(() => import("@/pages/admin/template-editor/validation"));

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

// PATCH 565 - Quality Dashboard Integration
const QualityDashboard = safeLazyImport(() => import("@/pages/dashboard/QualityDashboard"));

// PATCH 542 - Image Optimization Panel
const ImageOptimizationPanel = safeLazyImport(() => import("@/pages/admin/ImageOptimizationPanel"));

// PATCH 543 - Lighthouse CI Dashboard
const LighthouseDashboard = safeLazyImport(() => import("@/pages/admin/LighthouseDashboard"));

// Final - Deployment Status
const DeploymentStatus = safeLazyImport(() => import("@/pages/admin/DeploymentStatus"));

// PATCH 545 - TODO Tracker & Labs Status
const TodoTracker = safeLazyImport(() => import("@/pages/admin/TodoTracker"));
const LabsStatus = safeLazyImport(() => import("@/pages/admin/LabsStatus"));

// PATCH 602 - Epics Board
const EpicsBoard = safeLazyImport(() => import("@/pages/admin/epics-board"));

// PATCH 574 - i18n Dashboard
const I18nDashboard = safeLazyImport(() => import("@/pages/dashboard/i18n"));
const I18nDemo = safeLazyImport(() => import("@/pages/i18n-demo"));

// PATCHES 601-605 - Strategic Reasoning, Context, Feedback, Tactics & Learning Validation
const Patches601to605 = safeLazyImport(() => import("@/pages/validation/patches-601-605"));
// PATCHES 606-610 - AI & Voice Command Systems Validation
const Patches606to610 = safeLazyImport(() => import("@/pages/validation/patches-606-610"));
// PATCHES 611-615 - 3D Visualizer, Inference, Decisions, Threats & Strategy Validation
const Patches611to615 = safeLazyImport(() => import("@/pages/validation/patches-611-615"));
// PATCHES 151-155 - Maritime Operations Validation
const Patches151to155 = safeLazyImport(() => import("@/pages/validation/patches-151-155"));
// Patches Validation Hub - Central validation dashboard
const PatchesValidationHub = safeLazyImport(() => import("@/pages/validation/PatchesValidationHub"));

// PATCH 541 - PATCHES 506-510 UI Components
const AIMemoryDashboard = safeLazyImport(() => import("@/pages/admin/patches-506-510/ai-memory-dashboard"));
const BackupManagement = safeLazyImport(() => import("@/pages/admin/patches-506-510/backup-management"));
const RLSAuditDashboard = safeLazyImport(() => import("@/pages/admin/patches-506-510/rls-audit-dashboard"));
const AIFeedbackDashboard = safeLazyImport(() => import("@/pages/admin/patches-506-510/ai-feedback-dashboard"));
const SessionManagement = safeLazyImport(() => import("@/pages/admin/patches-506-510/session-management"));
const Patches506510Validation = safeLazyImport(() => import("@/pages/admin/Patches506510Validation"));

// PATCH 541 - Virtualized Logs Center
const VirtualizedLogsCenter = safeLazyImport(() => import("@/modules/logs-center/VirtualizedLogsCenter"));

// PATCH 541 Phase 3 - Performance Tools
const SystemBenchmark = safeLazyImport(() => import("@/pages/admin/SystemBenchmark"));
const SystemHealthDashboard = safeLazyImport(() => import("@/pages/admin/SystemHealth"));
const CodeHealthDashboard = safeLazyImport(() => import("@/pages/admin/CodeHealth"));
const ControlCenter = safeLazyImport(() => import("@/pages/admin/ControlCenter"));

// PATCH 540: Bundled modules para reduzir lazy loading (12 → 1 import)
const FeedbackModule = ModulesBundle.FeedbackModule;
const FleetModule = ModulesBundle.FleetModule;
const PerformanceModule = ModulesBundle.PerformanceModule;
const ReportsModule = ModulesBundle.ReportsModule;
const IncidentReports = ModulesBundle.IncidentReports;
const ComplianceHubModule = ModulesBundle.ComplianceHubModule;
const AIInsights = ModulesBundle.AIInsights;
const OperationsDashboard = ModulesBundle.OperationsDashboard;
const LogisticsHub = ModulesBundle.LogisticsHub;
const CrewManagement = ModulesBundle.CrewManagement;
const EmergencyResponse = ModulesBundle.EmergencyResponse;
const MissionControl = ModulesBundle.MissionControl;

// PATCH 540 Fase 5: Operations bundled (15 → 1 import)
const RealTimeWorkspace = OperationsBundle.RealTimeWorkspace;
const ChannelManager = OperationsBundle.ChannelManager;
const TrainingAcademy = OperationsBundle.TrainingAcademy;
const MaintenancePlanner = OperationsBundle.MaintenancePlanner;
const TravelManagementPage = OperationsBundle.TravelManagementPage;
const FuelOptimizer = OperationsBundle.FuelOptimizer;
const WeatherDashboard = OperationsBundle.WeatherDashboard;
const VoyagePlanner = OperationsBundle.VoyagePlanner;
const TaskAutomation = OperationsBundle.TaskAutomation;
const AuditCenter = OperationsBundle.AuditCenter;
const PEOTRAM = OperationsBundle.PEOTRAM;
const CrewWellbeing = OperationsBundle.CrewWellbeing;
const SatelliteTracker = OperationsBundle.SatelliteTracker;
const ProjectTimeline = OperationsBundle.ProjectTimeline;
const UserManagement = OperationsBundle.UserManagement;
// PATCH 540 Fase 4: Developer tools already bundled above
const DeveloperStatus = DeveloperBundle.DeveloperStatus;
const ModuleStatus = DeveloperBundle.ModuleStatus;
const TestsDashboard = DeveloperBundle.TestsDashboard;
const ModuleHealth = DeveloperBundle.ModuleHealth;
const WatchdogMonitor = DeveloperBundle.WatchdogMonitor;

// PATCH 540 Fase 5: Mission control bundled (12 → 1 import)
const MissionLogs = MissionBundle.MissionLogs;
const MissionEngine = MissionBundle.MissionEngine;
const DroneCommander = MissionBundle.DroneCommander;
const SensorsHubPage = MissionBundle.SensorsHubPage;
const SatcomPage = MissionBundle.SatcomPage;
const InsightDashboard = MissionBundle.InsightDashboard;
const AutonomyConsole = MissionBundle.AutonomyConsole;
const AICommandCenter = MissionBundle.AICommandCenter;
const WorkflowEngine = MissionBundle.WorkflowEngine;
const NautilusLLM = MissionBundle.NautilusLLM;
const ThoughtChain = MissionBundle.ThoughtChain;
const NautilusOS = MissionBundle.NautilusOS;
// PATCH 540 Fase 5: Intelligence bundled (13 → 1 import)
const ExecutiveReport = IntelligenceBundle.ExecutiveReport;
const FinanceHub = IntelligenceBundle.FinanceHub;
const APIGateway = IntelligenceBundle.APIGateway;
const APIGatewayDocs = IntelligenceBundle.APIGatewayDocs;
const AutomationModule = IntelligenceBundle.AutomationModule;
const RiskManagementModule = IntelligenceBundle.RiskManagementModule;
const AnalyticsCoreModule = IntelligenceBundle.AnalyticsCoreModule;
const VoiceAssistantModule = IntelligenceBundle.VoiceAssistantModule;
const NotificationsCenterModule = IntelligenceBundle.NotificationsCenterModule;
const AIModulesStatus = IntelligenceBundle.AIModulesStatus;
const SonarAI = IntelligenceBundle.SonarAI;
const IncidentReplayAI = IntelligenceBundle.IncidentReplayAI;
const AIVisionCore = IntelligenceBundle.AIVisionCore;
// Validation Pages - Patches 401-410
const TemplateEditorValidation = safeLazyImport(() => import("@/pages/admin/template-editor/validation"));

const PriceAlertsValidation = safeLazyImport(() => import("@/pages/admin/price-alerts/validation"));
const IncidentsConsolidationValidation = safeLazyImport(() => import("@/pages/admin/incidents-consolidation/validation"));
const SensorHubValidation = safeLazyImport(() => import("@/pages/admin/sensor-hub/validation"));

const SonarAIValidation = safeLazyImport(() => import("@/pages/admin/sonar-ai/validation"));
const TestAutomationValidation = safeLazyImport(() => import("@/pages/admin/test-automation/validation"));
const TemplatesApplicationValidation = safeLazyImport(() => import("@/pages/admin/templates-application/validation"));

// PATCH 411-415 Validation Pages
const PriceAlertsFinalizadoValidation = safeLazyImport(() => import("@/pages/admin/price-alerts-finalizado/validation"));

const UnifiedLogsPanelValidation = safeLazyImport(() => import("@/pages/admin/unified-logs-panel/validation"));
const CoordinationAIValidation = safeLazyImport(() => import("@/pages/admin/coordination-ai/validation"));
const ExperimentalModulesValidation = safeLazyImport(() => import("@/pages/admin/experimental-modules/validation"));
// PATCH 416-420 Validation Pages

const TemplatesEditorValidation = safeLazyImport(() => import("@/pages/admin/templates-editor/validation"));
const PriceAlertsNotificationValidation = safeLazyImport(() => import("@/pages/admin/price-alerts-notification/validation"));

const SatcomSimulationValidation = safeLazyImport(() => import("@/pages/admin/satcom-simulation/validation"));

// PATCH 566-570: Copilot Presenter, AI Auto-Tuning, Evolution Dashboard, Changelog, Evolution Trigger
const CopilotPresenterPage = safeLazyImport(() => import("@/pages/CopilotPresenterPage"));
const AIEvolutionPage = safeLazyImport(() => import("@/pages/dashboard/AIEvolutionPage"));
const ReleaseNotesV35 = safeLazyImport(() => import("@/pages/release-notes/ReleaseNotesV35"));

// PATCH 421-425 Validation Pages

const OceanSonarValidation = safeLazyImport(() => import("@/pages/admin/ocean-sonar/validation"));
const UnderwaterDroneValidation = safeLazyImport(() => import("@/pages/admin/underwater-drone/validation"));
// PATCH 426-430 Validation Pages
const MissionEngineValidation = safeLazyImport(() => import("@/pages/admin/mission-engine/validation"));
const DroneCommanderValidation = safeLazyImport(() => import("@/pages/admin/drone-commander/validation"));
const SatcomValidation = safeLazyImport(() => import("@/pages/admin/satcom/validation"));

// PATCH 431-435 Validation Pages
const RoutePlannerValidation = safeLazyImport(() => import("@/pages/admin/route-planner/validation"));
const NavigationCopilotV2Validation = safeLazyImport(() => import("@/pages/admin/navigation-copilot-v2/validation"));
const SystemValidationHub = safeLazyImport(() => import("@/pages/SystemValidationHub"));
const DeepRiskAIValidation = safeLazyImport(() => import("@/pages/admin/deep-risk-ai/validation"));
const TemplatesSystemValidation = safeLazyImport(() => import("@/pages/admin/templates-system/validation"));
const SonarAIValidationV2 = safeLazyImport(() => import("@/pages/admin/sonar-ai/validation"));
// PATCH 436-440 Validation Pages

const PriceAlertsValidationPatch438 = safeLazyImport(() => import("@/pages/admin/price-alerts/validation"));
const IncidentReportsV2Validation = safeLazyImport(() => import("@/pages/admin/incident-reports-v2/validation"));
const AICoordinationValidation = safeLazyImport(() => import("@/pages/admin/ai-coordination/validation"));
// PATCH 441-445 Validation Pages
const SensorHubV2Validation = safeLazyImport(() => import("@/pages/admin/sensor-hub-v2/validation"));
const SATCOMv2Validation = safeLazyImport(() => import("@/pages/admin/satcom-v2/validation"));
const OceanSonarV3Validation = safeLazyImport(() => import("@/pages/admin/ocean-sonar-v3/validation"));


// PATCH 471-480 Validation Pages
const IncidentReplayAIValidation = safeLazyImport(() => import("@/pages/admin/incident-replay-ai/validation"));
const IncidentsConsolidationV2Validation = safeLazyImport(() => import("@/pages/admin/incidents-consolidation-v2/validation"));
const RoutePlannerV1Validation = safeLazyImport(() => import("@/pages/admin/route-planner-v1/validation"));
const SatcomV1Validation = safeLazyImport(() => import("@/pages/admin/satcom-v1/validation"));


const SonarAIDetailedValidation = safeLazyImport(() => import("@/pages/admin/sonar-ai-detailed/validation"));

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

// PATCH 551-555: Validation Dashboard
const Patches551to555ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-551-555"));

// PATCH 546-550: Validation Dashboard (Incident Timeline, Trust Analysis, Mission Mobile, AutoDocs, Theme)
const Patches546to550ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-546-550"));

// PATCH 561-565: Validation Dashboard (Stress Test, Beta, Audit, Regression, Quality)
const Patches561to565ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-561-565"));

// PATCH 566-570: Validation Dashboard (Copilot Presenter, Auto-Tuning, AI Evolution, Release Notes, Watchdog)
const Patches566to570ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-566-570"));

// PATCH 571-575: Validation Dashboard (AI Translator, i18n Hooks, Multilingual Logs, i18n Dashboard, LLM Fine-tuning)
const Patches571to575ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-571-575"));

// PATCH 576-580: Validation Dashboard (Situational Awareness, Tactical Response, Reaction Mapper, Resilience Tracker, Incident Replayer v2)
const Patches576to580ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-576-580"));

// PATCH 581-585: Validation Dashboard (Predictive Strategy, Decision Simulator, Neural Governance, Strategic Consensus, Executive Summary)
const Patches581to585ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-581-585"));

// PATCH 586-590: Validation Dashboard (Multi-Level Coordination, Reflective Core, Evolution Tracker, Auto-Reconfig, Self-Diagnosis)
const Patches586to590ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-586-590"));

// PATCH 591-595: Validation Dashboard (SocioCognitive Layer, Empathy Core, Neuro-Adapter, Joint Decision, Emotion Feedback)
const Patches591to595ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-591-595"));
const Patches596to600ValidationPage = safeLazyImport(() => import("@/pages/validation/patches-596-600"));

// PATCH 623: Health Monitor - System Health Monitoring Dashboard
const HealthMonitor = safeLazyImport(() => import("@/pages/admin/HealthMonitor"));

// PATCH 531-535: Navigation Copilot v2, Route Planner, Underwater Drone, Drone Commander, Mission Consolidation
const Patch531NavigationCopilotV2 = safeLazyImport(() => import("@/pages/admin/Patch531NavigationCopilotV2"));
const Patch532RoutePlannerAI = safeLazyImport(() => import("@/pages/admin/Patch532RoutePlannerAI"));
const Patch533UnderwaterDroneV2 = safeLazyImport(() => import("@/pages/admin/Patch533UnderwaterDroneV2"));
const Patch534DroneCommanderAI = safeLazyImport(() => import("@/pages/admin/Patch534DroneCommanderAI"));
const Patch535MissionConsolidation = safeLazyImport(() => import("@/pages/admin/Patch535MissionConsolidation"));

// Loading component otimizado para offshore
const LoadingSpinner = () => {
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
      logger.warn("Failed to restore navigation path", { error });
    }
  }, [navigate, location]);

  return null;
};

// Flag global para evitar dupla inicialização
let isInitialized = false;

// PATCH 536: Timeout para prevenir freeze na inicialização
const INIT_TIMEOUT_MS = 5000;

function App() {
  // Initialize monitoring systems on app start with timeout protection
  useEffect(() => {
    // Evita dupla inicialização causada por React StrictMode
    if (isInitialized) {
      logger.info("App already initialized, skipping duplicate initialization");
      return;
    }
    
    isInitialized = true;
    logger.info("Nautilus One - Starting system initialization");
    
    // PATCH 536: Timeout de segurança para inicialização
    const initTimeout = setTimeout(() => {
      logger.error("Initialization timeout exceeded", { timeout: INIT_TIMEOUT_MS });
    }, INIT_TIMEOUT_MS);
    
    try {
      performance.mark("init-start");
      
      initializeMonitoring();
      logger.info("Monitoring initialized");
      
      // PATCH 85.0 - Iniciar System Watchdog automaticamente
      systemWatchdog.start();
      logger.info("System Watchdog started");
      
      // Preload módulos críticos durante idle time com proteção
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          logger.debug("Starting critical modules preload");
          if ("preload" in Dashboard && typeof Dashboard.preload === "function") {
            Dashboard.preload()
              .then(() => logger.debug("Dashboard preloaded"))
              .catch((error) => logger.warn("Dashboard preload failed", { error }));
          }
          if ("preload" in Travel && typeof Travel.preload === "function") {
            Travel.preload()
              .then(() => logger.debug("Travel preloaded"))
              .catch((error) => logger.warn("Travel preload failed", { error }));
          }
        }, { timeout: 3000 }); // Timeout para idle callback
      } else {
        setTimeout(() => {
          logger.debug("Starting critical modules preload (fallback)");
          if ("preload" in Dashboard && typeof Dashboard.preload === "function") {
            Dashboard.preload()
              .then(() => logger.debug("Dashboard preloaded"))
              .catch((error) => logger.warn("Dashboard preload failed", { error }));
          }
          if ("preload" in Travel && typeof Travel.preload === "function") {
            Travel.preload()
              .then(() => logger.debug("Travel preloaded"))
              .catch((error) => logger.warn("Travel preload failed", { error }));
          }
        }, 2000);
      }
      
      performance.mark("init-end");
      performance.measure("app-initialization", "init-start", "init-end");
      const initMeasure = performance.getEntriesByName("app-initialization")[0];
      
      logger.info("App initialized successfully", { 
        duration: `${initMeasure?.duration.toFixed(2)}ms` 
      });
      
      clearTimeout(initTimeout);
      
    } catch (error) {
      logger.error("Critical error during initialization", { error });
      clearTimeout(initTimeout);
    }
    
    return () => {
      systemWatchdog.stop();
      isInitialized = false; // Reset para hot-reload em dev
      performance.clearMarks("init-start");
      performance.clearMarks("init-end");
      performance.clearMeasures("app-initialization");
    };
  }, []);

  // Use Router for all environments
  const RouterComponent = Router;
  const routerProps = { future: { v7_startTransition: true, v7_relativeSplatPath: true } };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <OrganizationProvider>
            <QueryClientProvider client={queryClient}>
              <RouterComponent {...routerProps}>
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
                    <Route path="/validation/patches-622-626" element={<ValidationPatches622_626 />} />
                    
                    {/* All routes wrapped in SmartLayout */}
                    <Route element={<SmartLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/quality" element={<QualityDashboard />} />
                      <Route path="/dashboard/i18n" element={<I18nDashboard />} />
                      <Route path="/i18n-demo" element={<I18nDemo />} />
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
                      <Route path="/documents" element={<DocumentHub />} />
                      <Route path="/intelligent-documents" element={<DocumentHub />} />
                      <Route path="/document-hub" element={<DocumentHub />} />
                      <Route path="/dashboard/document-hub" element={<DocumentHub />} />
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/travel" element={<Travel />} />
                      {/* PATCH 608: Travel Intelligence */}
                      <Route path="/travel-intelligence" element={<TravelIntelligence />} />
                      {/* PATCH 609: ISM Audits */}
                      <Route path="/ism-audits" element={<ISMAudits />} />
                      {/* PATCH 610: Pre-OVID Inspection */}
                      <Route path="/pre-ovid" element={<PreOvidInspection />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/hr" element={<HumanResources />} />
                      {/* PATCH 551: Communication Center Consolidation - Unified communication route */}
                      <Route path="/communication-center" element={<CommunicationCenter />} />
                      {/* Legacy communication routes - redirect to unified center */}
                      <Route path="/communication" element={<CommunicationCenter />} />
                      <Route path="/communications" element={<CommunicationCenter />} />
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
                      <Route path="/compliance/pre-psc" element={<PrePSCDashboard />} />
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
                      {/* PATCH 553: Crew Consolidation - unified crew management */}
                      <Route path="/crew-management" element={<CrewManagement />} />
                      <Route path="/crew" element={<CrewManagement />} />
                      <Route path="/hr/crew" element={<CrewManagement />} />
                      <Route path="/operations/crew" element={<CrewManagement />} />
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
                      <Route path="/admin/health-monitor" element={<HealthMonitor />} />
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
                      <Route path="/admin/document-templates/validation" element={<DocumentTemplatesValidationPage />} />
                      <Route path="/admin/satellite-tracker/validation" element={<SatelliteTrackerValidationPage />} />
                      <Route path="/admin/navigation-copilot/validation" element={<NavigationCopilotValidationPage />} />
                      <Route path="/admin/template-editor/validation" element={<TemplateEditorValidationPage />} />
                      <Route path="/admin/price-alerts/validation" element={<PriceAlertsValidationPage />} />
                      <Route path="/admin/incidents-consolidation/validation" element={<IncidentsConsolidationValidationPage />} />
                      <Route path="/admin/sensor-hub/validation" element={<SensorHubValidationPage />} />
                      <Route path="/admin/tests/validation" element={<TestsValidationPage />} />
                      <Route path="/admin/ocean-sonar/validation" element={<OceanSonarValidation />} />
                      <Route path="/admin/underwater-drone/validation" element={<UnderwaterDroneValidation />} />
                      <Route path="/admin/mission-engine/validation" element={<MissionEngineValidation />} />
                      <Route path="/admin/drone-commander/validation" element={<DroneCommanderValidation />} />
                      <Route path="/admin/satcom/validation" element={<SatcomValidation />} />
                      <Route path="/admin/route-planner/validation" element={<RoutePlannerValidation />} />
                      <Route path="/admin/navigation-copilot-v2/validation" element={<NavigationCopilotV2Validation />} />
                      <Route path="/validation" element={<SystemValidationHub />} />
                      <Route path="/system-validation" element={<SystemValidationHub />} />
                      <Route path="/admin/deep-risk-ai/validation" element={<DeepRiskAIValidation />} />
                      <Route path="/admin/templates-system/validation" element={<TemplatesSystemValidation />} />
                      <Route path="/admin/sonar-ai-v2/validation" element={<SonarAIValidationV2 />} />
                      
                      {/* Validation Routes - Patches 436-440 */}
                      <Route path="/admin/underwater-drone/validation" element={<UnderwaterDroneValidation />} />
                      <Route path="/admin/price-alerts/validation" element={<PriceAlertsValidationPatch438 />} />
                      <Route path="/admin/incident-reports-v2/validation" element={<IncidentReportsV2Validation />} />
                      <Route path="/admin/ai-coordination/validation" element={<AICoordinationValidation />} />
                      
                      {/* Validation Routes - Patches 441-445 */}
                      <Route path="/admin/sensor-hub-v2/validation" element={<SensorHubV2Validation />} />
                      <Route path="/admin/satcom-v2/validation" element={<SATCOMv2Validation />} />
                      <Route path="/admin/ocean-sonar-v3/validation" element={<OceanSonarV3Validation />} />
                      
                      {/* Validation Routes - Patches 471-480 */}
                      <Route path="/admin/incident-replay-ai/validation" element={<IncidentReplayAIValidation />} />
                      <Route path="/admin/incidents-consolidation-v2/validation" element={<IncidentsConsolidationV2Validation />} />
                      <Route path="/admin/route-planner-v1/validation" element={<RoutePlannerV1Validation />} />
                      <Route path="/admin/satcom-v1/validation" element={<SatcomV1Validation />} />
                      <Route path="/admin/sonar-ai-detailed/validation" element={<SonarAIDetailedValidation />} />
                      
                      {/* Patches Validation Routes */}
                      <Route path="/validation/patches-151-155" element={<Patches151to155 />} />
                      <Route path="/validation/hub" element={<PatchesValidationHub />} />
                      <Route path="/validation/patches-601-605" element={<Patches601to605 />} />
                      <Route path="/validation/patches-606-610" element={<Patches606to610 />} />
                      <Route path="/validation/patches-611-615" element={<Patches611to615 />} />
                      
                      {/* Validation Route - Patches 481-485 */}
                      <Route path="/admin/patches-481-485/validation" element={<Patches481485Validation />} />
                      
                      {/* Validation Route - Patches 491-495 */}
                      <Route path="/admin/patches-491-495/validation" element={<Patches491495Validation />} />
                      
                      {/* PATCH 541 - PATCHES 506-510 UI Routes */}
                      <Route path="/admin/patches-506-510/validation" element={<Patches506510Validation />} />
                      <Route path="/admin/patches-506-510/ai-memory" element={<AIMemoryDashboard />} />
                      <Route path="/admin/patches-506-510/backups" element={<BackupManagement />} />
                      <Route path="/admin/patches-506-510/rls-audit" element={<RLSAuditDashboard />} />
                      <Route path="/admin/patches-506-510/ai-feedback" element={<AIFeedbackDashboard />} />
                      <Route path="/admin/patches-506-510/sessions" element={<SessionManagement />} />
                      
                      {/* PATCH 541 - Virtualized Logs */}
                      <Route path="/logs-center-virtual" element={<VirtualizedLogsCenter />} />
                      
                      {/* PATCH 541 Phase 3 - Performance Tools */}
                      <Route path="/admin/control-center" element={<ControlCenter />} />
                      <Route path="/admin/benchmark" element={<SystemBenchmark />} />
                      <Route path="/admin/health-validation" element={<SystemHealthDashboard />} />
                      <Route path="/admin/code-health" element={<CodeHealthDashboard />} />
                      
                      {/* PATCH 542 - Image Optimization */}
                      <Route path="/admin/image-optimization" element={<ImageOptimizationPanel />} />
                      
                      {/* PATCH 543 - Lighthouse CI */}
                      <Route path="/admin/lighthouse-dashboard" element={<LighthouseDashboard />} />
                      
                      {/* Final - Deployment Status */}
                      <Route path="/admin/deployment-status" element={<DeploymentStatus />} />
                      
                      {/* PATCH 545 - Technical Debt Tracking */}
                      <Route path="/admin/todo-tracker" element={<TodoTracker />} />
                      <Route path="/admin/labs-status" element={<LabsStatus />} />
                      
                      {/* PATCH 602 - Epics & Patches Board */}
                      <Route path="/admin/epics-board" element={<EpicsBoard />} />

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
                      <Route path="/admin/pre-ovid-inspection" element={<PreOvidInspection />} />
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
                      {/* PATCH 552: Incident Reports Consolidation - Unified route */}
                      <Route path="/incident-reports" element={<IncidentReports />} />
                      <Route path="/incidents" element={<IncidentReports />} /> {/* Legacy redirect */}
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
                      
                      {/* PATCH 407: Sonar AI Module */}
                      <Route path="/sonar-ai" element={<SonarAI />} />
                      
                      {/* PATCH 524: Incident Replay AI Module */}
                      <Route path="/incident-replay" element={<IncidentReplayAI />} />
                      
                      {/* PATCH 525: AI Visual Recognition Core Module */}
                      <Route path="/ai-vision-core" element={<AIVisionCore />} />
                      
                      {/* Validation Routes - Patches 401-410 */}
                      <Route path="/admin/template-editor/validation" element={<TemplateEditorValidation />} />
                      <Route path="/admin/price-alerts/validation" element={<PriceAlertsValidation />} />
                      <Route path="/admin/incidents-consolidation/validation" element={<IncidentsConsolidationValidation />} />
                      <Route path="/admin/sensor-hub/validation" element={<SensorHubValidation />} />
                      <Route path="/admin/sonar-ai/validation" element={<SonarAIValidation />} />
                      <Route path="/admin/test-automation/validation" element={<TestAutomationValidation />} />
                      <Route path="/admin/templates-application/validation" element={<TemplatesApplicationValidation />} />
                      
                      {/* Validation Routes - Patches 411-415 */}
                      <Route path="/admin/price-alerts-finalizado/validation" element={<PriceAlertsFinalizadoValidation />} />
                      <Route path="/admin/unified-logs-panel/validation" element={<UnifiedLogsPanelValidation />} />
                      <Route path="/admin/coordination-ai/validation" element={<CoordinationAIValidation />} />
                      <Route path="/admin/experimental-modules/validation" element={<ExperimentalModulesValidation />} />
                      
                      {/* Validation Routes - Patches 416-420 */}
                      <Route path="/admin/templates-editor/validation" element={<TemplatesEditorValidation />} />
                      <Route path="/admin/price-alerts-notification/validation" element={<PriceAlertsNotificationValidation />} />
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
                      
                      {/* PATCH 531-535: New Validation Routes */}
                      <Route path="/admin/patch-531/navigation-copilot-v2" element={<Patch531NavigationCopilotV2 />} />
                      <Route path="/admin/patch-532/route-planner-ai" element={<Patch532RoutePlannerAI />} />
                      <Route path="/admin/patch-533/underwater-drone-v2" element={<Patch533UnderwaterDroneV2 />} />
                      <Route path="/admin/patch-534/drone-commander-ai" element={<Patch534DroneCommanderAI />} />
                      <Route path="/admin/patch-535/mission-consolidation" element={<Patch535MissionConsolidation />} />
                      
                      {/* PATCH 566-570: Copilot Presenter, AI Evolution, Changelog v3.5 */}
                      <Route path="/demo/copilot-presenter" element={<CopilotPresenterPage />} />
                      <Route path="/dashboard/ai-evolution" element={<AIEvolutionPage />} />
                      <Route path="/release-notes/v3.5" element={<ReleaseNotesV35 />} />
                      
                      {/* Master Validation Dashboard */}
                      <Route path="/validation/master-validation" element={<Suspense fallback={<PageSkeleton />}>{React.createElement(safeLazyImport(() => import("@/pages/validation/master-validation")))}</Suspense>} />
                      <Route path="/validation/patches-546-550" element={<Patches546to550ValidationPage />} />
                      <Route path="/validation/patches-551-555" element={<Patches551to555ValidationPage />} />
                      <Route path="/validation/patches-561-565" element={<Patches561to565ValidationPage />} />
                      <Route path="/validation/patches-566-570" element={<Patches566to570ValidationPage />} />
                      <Route path="/validation/patches-571-575" element={<Patches571to575ValidationPage />} />
                      <Route path="/validation/patches-576-580" element={<Patches576to580ValidationPage />} />
                      <Route path="/validation/patches-581-585" element={<Patches581to585ValidationPage />} />
                      <Route path="/validation/patches-586-590" element={<Patches586to590ValidationPage />} />
                      <Route path="/validation/patches-591-595" element={<Patches591to595ValidationPage />} />
                      <Route path="/validation/patches-596-600" element={<Patches596to600ValidationPage />} />
                      <Route path="/validation/patches-601-605" element={<Patches601to605 />} />
                      <Route path="/validation/patches-606-610" element={<Patches606to610 />} />
                      <Route path="/validation/patches-611-615" element={<Patches611to615 />} />
                       
                      {/* Additional navigation routes from config */}
                      {NAVIGATION.map(({ path, component: Component }) => (
                        <Route key={path} path={path} element={<Suspense fallback={SuspenseFallback}><Component /></Suspense>} />
                      ))}
                      
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </React.Suspense>
              </RouterComponent>
            </QueryClientProvider>
          </OrganizationProvider>
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
