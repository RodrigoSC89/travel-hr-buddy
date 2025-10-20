import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SmartLayout } from "./components/layout/SmartLayout";
import { NAVIGATION, SuspenseFallback } from "@/config/navigation";
import { safeLazyImport } from "@/utils/safeLazyImport";

// Lazy load all pages with safeLazyImport to prevent dynamic module loading failures
const Index = safeLazyImport(() => import("@/pages/Index"), "Index");
const Dashboard = safeLazyImport(() => import("@/pages/Dashboard"), "Dashboard");
const PriceAlerts = safeLazyImport(() => import("@/pages/PriceAlerts"), "Price Alerts");
const Reports = safeLazyImport(() => import("@/pages/Reports"), "Reports");
const Reservations = safeLazyImport(() => import("@/pages/Reservations"), "Reservations");
const ChecklistsInteligentes = safeLazyImport(() => import("@/pages/ChecklistsInteligentes"), "Checklists Inteligentes");
const PEOTRAM = safeLazyImport(() => import("@/pages/PEOTRAM"), "PEO-TRAM");
const PEODP = safeLazyImport(() => import("@/pages/PEODP"), "PEO-DP");
const DPIncidents = safeLazyImport(() => import("@/pages/DPIncidents"), "DP Incidents");
const DPIntelligence = safeLazyImport(() => import("@/pages/DPIntelligence"), "DP Intelligence");
const BridgeLink = safeLazyImport(() => import("@/pages/BridgeLink"), "Bridge Link");
const SGSO = safeLazyImport(() => import("@/pages/SGSO"), "SGSO");
const SGSOReportPage = safeLazyImport(() => import("@/pages/SGSOReportPage"), "SGSO Report");
const SGSOAuditPage = safeLazyImport(() => import("@/pages/SGSOAuditPage"), "SGSO Audit");
const Settings = safeLazyImport(() => import("@/pages/Settings"), "Settings");
const Documents = safeLazyImport(() => import("@/pages/Documents"), "Documents");
const IntelligentDocuments = safeLazyImport(() => import("@/pages/IntelligentDocuments"), "Intelligent Documents");
const AIAssistant = safeLazyImport(() => import("@/pages/AIAssistant"), "AI Assistant");
const Travel = safeLazyImport(() => import("@/pages/Travel"), "Travel");
const Analytics = safeLazyImport(() => import("@/pages/Analytics"), "Analytics");
const HumanResources = safeLazyImport(() => import("@/pages/HumanResources"), "Human Resources");
const Communication = safeLazyImport(() => import("@/pages/Communication"), "Communication");
const Intelligence = safeLazyImport(() => import("@/pages/Intelligence"), "Intelligence");
const Maritime = safeLazyImport(() => import("@/pages/Maritime"), "Maritime");
const MaritimeSupremo = safeLazyImport(() => import("@/pages/MaritimeSupremo"), "Maritime Supremo");
const NautilusOne = safeLazyImport(() => import("@/pages/NautilusOne"), "Nautilus One");
const Innovation = safeLazyImport(() => import("@/pages/Innovation"), "Innovation");
const Optimization = safeLazyImport(() => import("@/pages/Optimization"), "Optimization");
const Collaboration = safeLazyImport(() => import("@/pages/Collaboration"), "Collaboration");
const Voice = safeLazyImport(() => import("@/pages/Voice"), "Voice");
const Portal = safeLazyImport(() => import("@/pages/Portal"), "Portal");
const AR = safeLazyImport(() => import("@/pages/AR"), "AR");
const IoT = safeLazyImport(() => import("@/pages/IoT"), "IoT");
const Blockchain = safeLazyImport(() => import("@/pages/Blockchain"), "Blockchain");
const Gamification = safeLazyImport(() => import("@/pages/Gamification"), "Gamification");
const PredictiveAnalytics = safeLazyImport(() => import("@/pages/PredictiveAnalytics"), "Predictive Analytics");
const Admin = safeLazyImport(() => import("@/pages/Admin"), "Admin");
const APITester = safeLazyImport(() => import("@/pages/admin/api-tester"), "API Tester");
const APIStatus = safeLazyImport(() => import("@/pages/admin/api-status"), "API Status");
const ControlPanel = safeLazyImport(() => import("@/pages/admin/control-panel"), "Control Panel");
const TestDashboard = safeLazyImport(() => import("@/pages/admin/tests"), "Test Dashboard");
const CIHistory = safeLazyImport(() => import("@/pages/admin/ci-history"), "CI History");
const AdminAnalytics = safeLazyImport(() => import("@/pages/admin/analytics"), "Admin Analytics");
const AdminBI = safeLazyImport(() => import("@/pages/admin/bi"), "Admin BI");
const AdminWall = safeLazyImport(() => import("@/pages/admin/wall"), "Admin Wall");
const AdminChecklists = safeLazyImport(() => import("@/pages/admin/checklists"), "Admin Checklists");
const AdminChecklistsDashboard = safeLazyImport(() => import("@/pages/admin/checklists-dashboard"), "Checklists Dashboard");
const SystemHealth = safeLazyImport(() => import("@/pages/admin/system-health"), "System Health");
const Forecast = safeLazyImport(() => import("@/pages/admin/forecast"), "Forecast");
const DocumentsAI = safeLazyImport(() => import("@/pages/admin/documents-ai"), "Documents AI");
const DocumentAIEditor = safeLazyImport(() => import("@/pages/admin/documents/ai-editor"), "AI Editor");
const Assistant = safeLazyImport(() => import("@/pages/admin/assistant"), "Assistant");
const AssistantLogs = safeLazyImport(() => import("@/pages/admin/assistant-logs"), "Assistant Logs");
const AdminCollaboration = safeLazyImport(() => import("@/pages/admin/collaboration"), "Admin Collaboration");
const DocumentList = safeLazyImport(() => import("@/pages/admin/documents/DocumentList"), "Document List");
const DocumentView = safeLazyImport(() => import("@/pages/admin/documents/DocumentView"), "Document View");
const DocumentHistory = safeLazyImport(() => import("@/pages/admin/documents/DocumentHistory"), "Document History");
const DocumentEditorPage = safeLazyImport(() => import("@/pages/admin/documents/DocumentEditorPage"), "Document Editor");
const CollaborativeEditor = safeLazyImport(() => import("@/pages/admin/documents/CollaborativeEditor"), "Collaborative Editor");
const DocumentEditorDemo = safeLazyImport(() => import("@/pages/admin/documents/DocumentEditorDemo"), "Document Editor Demo");
const RestoreDashboard = safeLazyImport(() => import("@/pages/admin/documents/restore-dashboard"), "Restore Dashboard");
const ExecutionLogs = safeLazyImport(() => import("@/pages/admin/automation/execution-logs"), "Execution Logs");
const RestoreReportLogs = safeLazyImport(() => import("@/pages/admin/reports/logs"), "Restore Report Logs");
const AssistantReportLogs = safeLazyImport(() => import("@/pages/admin/reports/assistant"), "Assistant Report Logs");
const DashboardLogs = safeLazyImport(() => import("@/pages/admin/reports/dashboard-logs"), "Dashboard Logs");
const RestoreAnalytics = safeLazyImport(() => import("@/pages/admin/reports/restore-analytics"), "Restore Analytics");
const PersonalRestoreDashboard = safeLazyImport(() => import("@/pages/admin/restore/personal"), "Personal Restore Dashboard");
const AdminDashboard = safeLazyImport(() => import("@/pages/admin/dashboard"), "Admin Dashboard");
const SmartWorkflows = safeLazyImport(() => import("@/pages/admin/workflows"), "Smart Workflows");
const WorkflowDetail = safeLazyImport(() => import("@/pages/admin/workflows/detail"), "Workflow Detail");
const Templates = safeLazyImport(() => import("@/pages/admin/templates"), "Templates");
const EditTemplatePage = safeLazyImport(() => import("@/pages/admin/templates/edit/[id]"), "Edit Template");
const HealthMonitorDemo = safeLazyImport(() => import("@/pages/HealthMonitorDemo"), "Health Monitor Demo");
const Health = safeLazyImport(() => import("@/pages/Health"), "Health");
const Offline = safeLazyImport(() => import("@/pages/Offline"), "Offline");
const Modules = safeLazyImport(() => import("@/pages/Modules"), "Modules");
const NotFound = safeLazyImport(() => import("@/pages/NotFound"), "Not Found");
const SmartLayoutDemo = safeLazyImport(() => import("@/pages/SmartLayoutDemo"), "Smart Layout Demo");
const TemplateEditorDemo = safeLazyImport(() => import("@/pages/TemplateEditorDemo"), "Template Editor Demo");
const Unauthorized = safeLazyImport(() => import("@/pages/Unauthorized"), "Unauthorized");
const RestoreChartEmbed = safeLazyImport(() => import("@/pages/embed/RestoreChartEmbed"), "Restore Chart Embed");
const TVWallLogs = safeLazyImport(() => import("@/pages/tv/LogsPage"), "TV Wall Logs");
const TemplateEditorPage = safeLazyImport(() => import("@/pages/admin/templates/editor"), "Template Editor");
const MMIJobsPanel = safeLazyImport(() => import("@/pages/MMIJobsPanel"), "MMI Jobs Panel");
const MmiBI = safeLazyImport(() => import("@/pages/MmiBI"), "MMI BI");
const MMIHistory = safeLazyImport(() => import("@/pages/MMIHistory"), "MMI History");
const MMIHistoryAdmin = safeLazyImport(() => import("@/pages/admin/mmi/history"), "MMI History Admin");
const MMIForecast = safeLazyImport(() => import("@/pages/admin/mmi/forecast/page"), "MMI Forecast");
const MMIOrders = safeLazyImport(() => import("@/pages/admin/mmi/orders"), "MMI Orders");
const MMITasks = safeLazyImport(() => import("@/pages/MMITasks"), "MMI Tasks");
const MMIForecastPage = safeLazyImport(() => import("@/pages/MMIForecastPage"), "MMI Forecast Page");
const PerformanceAnalysis = safeLazyImport(() => import("@/pages/admin/PerformanceAnalysis"), "Performance Analysis");
const JobCreationWithSimilarExamples = safeLazyImport(() => import("@/pages/JobCreationWithSimilarExamples"), "Job Creation with Similar Examples");
const CopilotJobForm = safeLazyImport(() => import("@/pages/CopilotJobForm"), "Copilot Job Form");
const CopilotJobFormAdmin = safeLazyImport(() => import("@/pages/admin/copilot-job-form"), "Copilot Job Form Admin");
const DashboardAuditorias = safeLazyImport(() => import("@/pages/admin/dashboard-auditorias"), "Dashboard Auditorias");
const MetricasRisco = safeLazyImport(() => import("@/pages/admin/metricas-risco"), "Métricas de Risco");
const AdminSGSO = safeLazyImport(() => import("@/pages/admin/sgso"), "Admin SGSO");
const SGSOHistoryPage = safeLazyImport(() => import("@/pages/admin/sgso/history/[vesselId]"), "SGSO History Page");
const SGSOAuditHistory = safeLazyImport(() => import("@/pages/admin/sgso/history"), "SGSO Audit History");
const SGSOAuditReview = safeLazyImport(() => import("@/pages/admin/sgso/review/[id]"), "SGSO Audit Review");
const AuditoriasIMCA = safeLazyImport(() => import("@/pages/admin/auditorias-imca"), "Auditorias IMCA");
const AuditoriasLista = safeLazyImport(() => import("@/pages/admin/auditorias-lista"), "Auditorias Lista");
const IMCAAudit = safeLazyImport(() => import("@/pages/IMCAAudit"), "IMCA Audit");
const Simulations = safeLazyImport(() => import("@/pages/admin/simulations"), "Simulations");
const CronMonitor = safeLazyImport(() => import("@/pages/admin/cron-monitor"), "Cron Monitor");
const TrainingManagement = safeLazyImport(() => import("@/pages/admin/training"), "Training Management");
const BackupAudit = safeLazyImport(() => import("@/pages/BackupAudit"), "Backup Audit");
const RiskAudit = safeLazyImport(() => import("@/pages/admin/risk-audit"), "Risk Audit");
const CertViewer = safeLazyImport(() => import("@/components/cert/CertViewer"), "Certificate Viewer");
const QuizPage = safeLazyImport(() => import("@/pages/admin/QuizPage"), "Quiz Page");
const ExternalAuditSystem = safeLazyImport(() => import("@/pages/ExternalAuditSystem"), "External Audit System");
const ForecastHistoryPage = safeLazyImport(() => import("@/pages/admin/mmi/forecast/ForecastHistory"), "Forecast History");
const BIForecastsPage = safeLazyImport(() => import("@/pages/admin/bi/forecasts"), "BI Forecasts");
const PEODPAuditPage = safeLazyImport(() => import("@/pages/admin/peodp-audit"), "PEO-DP Audit");
const VaultAI = safeLazyImport(() => import("@/modules/vault_ai/pages/VaultAIPage"), "Vault AI");
const ControlHub = safeLazyImport(() => import("@/pages/ControlHub"), "Control Hub");

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Carregando Nautilus One...</p>
    </div>
  </div>
);

// Create QueryClient
const queryClient = new QueryClient();

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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <OrganizationProvider>
            <QueryClientProvider client={queryClient}>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/reservations" element={<Reservations />} />
                      <Route path="/checklists" element={<ChecklistsInteligentes />} />
                      <Route path="/peotram" element={<PEOTRAM />} />
                      <Route path="/peo-dp" element={<PEODP />} />
                      <Route path="/dp-incidents" element={<DPIncidents />} />
                      <Route path="/dp-intelligence" element={<DPIntelligence />} />
                      <Route path="/bridgelink" element={<BridgeLink />} />
                      <Route path="/sgso" element={<SGSO />} />
                      <Route path="/sgso/report" element={<SGSOReportPage />} />
                      <Route path="/sgso/audit" element={<SGSOAuditPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/intelligent-documents" element={<IntelligentDocuments />} />
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/travel" element={<Travel />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/hr" element={<HumanResources />} />
                      <Route path="/communication" element={<Communication />} />
                      <Route path="/intelligence" element={<Intelligence />} />
                      <Route path="/maritime" element={<Maritime />} />
                      <Route path="/maritime-supremo" element={<MaritimeSupremo />} />
                      <Route path="/nautilus-one" element={<NautilusOne />} />
                      <Route path="/vault-ai" element={<VaultAI />} />
                      <Route path="/control-hub" element={<ControlHub />} />
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
                      <Route path="/admin/templates/edit/:id" element={<EditTemplatePage />} />
                      <Route path="/admin/documents/demo" element={<DocumentEditorDemo />} />
                      <Route path="/admin/templates/editor" element={<TemplateEditorPage />} />
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
                      <Route path="/admin/simulations" element={<Simulations />} />
                      <Route path="/admin/cron-monitor" element={<CronMonitor />} />
                      <Route path="/admin/training" element={<TrainingManagement />} />
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
