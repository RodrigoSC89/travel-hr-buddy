import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { SmartLayout } from "./components/layout/SmartLayout";

// Lazy load all pages
const Index = React.lazy(() => import("./pages/Index"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const PriceAlerts = React.lazy(() => import("./pages/PriceAlerts"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Reservations = React.lazy(() => import("./pages/Reservations"));
const ChecklistsInteligentes = React.lazy(() => import("./pages/ChecklistsInteligentes"));
const PEOTRAM = React.lazy(() => import("./pages/PEOTRAM"));
const PEODP = React.lazy(() => import("./pages/PEODP"));
const DPIncidents = React.lazy(() => import("./pages/DPIncidents"));
const DPIntelligence = React.lazy(() => import("./pages/DPIntelligence"));
const SGSO = React.lazy(() => import("./pages/SGSO"));
const SGSOReportPage = React.lazy(() => import("./pages/SGSOReportPage"));
const SGSOAuditPage = React.lazy(() => import("./pages/SGSOAuditPage"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Documents = React.lazy(() => import("./pages/Documents"));
const IntelligentDocuments = React.lazy(() => import("./pages/IntelligentDocuments"));
const AIAssistant = React.lazy(() => import("./pages/AIAssistant"));
const Travel = React.lazy(() => import("./pages/Travel"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const HumanResources = React.lazy(() => import("./pages/HumanResources"));
const Communication = React.lazy(() => import("./pages/Communication"));
const Intelligence = React.lazy(() => import("./pages/Intelligence"));
const Maritime = React.lazy(() => import("./pages/Maritime"));
const MaritimeSupremo = React.lazy(() => import("./pages/MaritimeSupremo"));
const NautilusOne = React.lazy(() => import("./pages/NautilusOne"));
const Innovation = React.lazy(() => import("./pages/Innovation"));
const Optimization = React.lazy(() => import("./pages/Optimization"));
const Collaboration = React.lazy(() => import("./pages/Collaboration"));
const Voice = React.lazy(() => import("./pages/Voice"));
const Portal = React.lazy(() => import("./pages/Portal"));
const AR = React.lazy(() => import("./pages/AR"));
const IoT = React.lazy(() => import("./pages/IoT"));
const Blockchain = React.lazy(() => import("./pages/Blockchain"));
const Gamification = React.lazy(() => import("./pages/Gamification"));
const PredictiveAnalytics = React.lazy(() => import("./pages/PredictiveAnalytics"));
const Admin = React.lazy(() => import("./pages/Admin"));
const APITester = React.lazy(() => import("./pages/admin/api-tester"));
const APIStatus = React.lazy(() => import("./pages/admin/api-status"));
const ControlPanel = React.lazy(() => import("./pages/admin/control-panel"));
const TestDashboard = React.lazy(() => import("./pages/admin/tests"));
const CIHistory = React.lazy(() => import("./pages/admin/ci-history"));
const AdminAnalytics = React.lazy(() => import("./pages/admin/analytics"));
const AdminBI = React.lazy(() => import("./pages/admin/bi"));
const AdminWall = React.lazy(() => import("./pages/admin/wall"));
const AdminChecklists = React.lazy(() => import("./pages/admin/checklists"));
const AdminChecklistsDashboard = React.lazy(() => import("./pages/admin/checklists-dashboard"));
const SystemHealth = React.lazy(() => import("./pages/admin/system-health"));
const Forecast = React.lazy(() => import("./pages/admin/forecast"));
const DocumentsAI = React.lazy(() => import("./pages/admin/documents-ai"));
const DocumentAIEditor = React.lazy(() => import("./pages/admin/documents/ai-editor"));
const Assistant = React.lazy(() => import("./pages/admin/assistant"));
const AssistantLogs = React.lazy(() => import("./pages/admin/assistant-logs"));
const AdminCollaboration = React.lazy(() => import("./pages/admin/collaboration"));
const DocumentList = React.lazy(() => import("./pages/admin/documents/DocumentList"));
const DocumentView = React.lazy(() => import("./pages/admin/documents/DocumentView"));
const DocumentHistory = React.lazy(() => import("./pages/admin/documents/DocumentHistory"));
const DocumentEditorPage = React.lazy(() => import("./pages/admin/documents/DocumentEditorPage"));
const CollaborativeEditor = React.lazy(() => import("./pages/admin/documents/CollaborativeEditor"));
const DocumentEditorDemo = React.lazy(() => import("./pages/admin/documents/DocumentEditorDemo"));
const RestoreDashboard = React.lazy(() => import("./pages/admin/documents/restore-dashboard"));
const ExecutionLogs = React.lazy(() => import("./pages/admin/automation/execution-logs"));
const RestoreReportLogs = React.lazy(() => import("./pages/admin/reports/logs"));
const AssistantReportLogs = React.lazy(() => import("./pages/admin/reports/assistant"));
const DashboardLogs = React.lazy(() => import("./pages/admin/reports/dashboard-logs"));
const RestoreAnalytics = React.lazy(() => import("./pages/admin/reports/restore-analytics"));
const PersonalRestoreDashboard = React.lazy(() => import("./pages/admin/restore/personal"));
const AdminDashboard = React.lazy(() => import("./pages/admin/dashboard"));
const SmartWorkflows = React.lazy(() => import("./pages/admin/workflows"));
const WorkflowDetail = React.lazy(() => import("./pages/admin/workflows/detail"));
const Templates = React.lazy(() => import("./pages/admin/templates"));
const EditTemplatePage = React.lazy(() => import("./pages/admin/templates/edit/[id]"));
const HealthMonitorDemo = React.lazy(() => import("./pages/HealthMonitorDemo"));
const Health = React.lazy(() => import("./pages/Health"));
const Offline = React.lazy(() => import("./pages/Offline"));
const Modules = React.lazy(() => import("./pages/Modules"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const SmartLayoutDemo = React.lazy(() => import("./pages/SmartLayoutDemo"));
const TemplateEditorDemo = React.lazy(() => import("./pages/TemplateEditorDemo"));
const Unauthorized = React.lazy(() => import("./pages/Unauthorized"));
const RestoreChartEmbed = React.lazy(() => import("./pages/embed/RestoreChartEmbed"));
const TVWallLogs = React.lazy(() => import("./pages/tv/LogsPage"));
const TemplateEditorPage = React.lazy(() => import("./pages/admin/templates/editor"));
const MMIJobsPanel = React.lazy(() => import("./pages/MMIJobsPanel"));
const MmiBI = React.lazy(() => import("./pages/MmiBI"));
const MMIHistory = React.lazy(() => import("./pages/MMIHistory"));
const MMITasks = React.lazy(() => import("./pages/MMITasks"));
const MMIForecastPage = React.lazy(() => import("./pages/MMIForecastPage"));
const PerformanceAnalysis = React.lazy(() => import("./pages/admin/PerformanceAnalysis"));
const JobCreationWithSimilarExamples = React.lazy(() => import("./pages/JobCreationWithSimilarExamples"));
const CopilotJobForm = React.lazy(() => import("./pages/CopilotJobForm"));
const CopilotJobFormAdmin = React.lazy(() => import("./pages/admin/copilot-job-form"));
const DashboardAuditorias = React.lazy(() => import("./pages/admin/dashboard-auditorias"));
const MetricasRisco = React.lazy(() => import("./pages/admin/metricas-risco"));
const AdminSGSO = React.lazy(() => import("./pages/admin/sgso"));
const SGSOHistoryPage = React.lazy(() => import("./pages/admin/sgso/history/[vesselId]"));
const SGSOAuditHistory = React.lazy(() => import("./pages/admin/sgso/history"));
const SGSOAuditReview = React.lazy(() => import("./pages/admin/sgso/review/[id]"));
const AuditoriasIMCA = React.lazy(() => import("./pages/admin/auditorias-imca"));
const AuditoriasLista = React.lazy(() => import("./pages/admin/auditorias-lista"));
const IMCAAudit = React.lazy(() => import("./pages/IMCAAudit"));
const Simulations = React.lazy(() => import("./pages/admin/simulations"));
const CronMonitor = React.lazy(() => import("./pages/admin/cron-monitor"));
const TrainingManagement = React.lazy(() => import("./pages/admin/training"));
const BackupAudit = React.lazy(() => import("./pages/BackupAudit"));
const RiskAudit = React.lazy(() => import("./pages/admin/risk-audit"));
const CertViewer = React.lazy(() => import("./components/cert/CertViewer"));
const QuizPage = React.lazy(() => import("./pages/admin/QuizPage"));
const ExternalAuditSystem = React.lazy(() => import("./pages/ExternalAuditSystem"));

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
                      <Route path="/mmi/jobs" element={<MMIJobsPanel />} />
                      <Route path="/mmi/bi" element={<MmiBI />} />
                      <Route path="/mmi/history" element={<MMIHistory />} />
                      <Route path="/mmi/tasks" element={<MMITasks />} />
                      <Route path="/mmi/forecast" element={<MMIForecastPage />} />
                      <Route path="/mmi/job-creation-demo" element={<JobCreationWithSimilarExamples />} />
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
