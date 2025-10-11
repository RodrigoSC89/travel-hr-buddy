import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
const SGSO = React.lazy(() => import("./pages/SGSO"));
const Settings = React.lazy(() => import("./pages/Settings"));
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
const AdminWall = React.lazy(() => import("./pages/admin/wall"));
const AdminChecklists = React.lazy(() => import("./pages/admin/checklists"));
const AdminChecklistsDashboard = React.lazy(() => import("./pages/admin/checklists-dashboard"));
const DocumentsAI = React.lazy(() => import("./pages/admin/documents-ai"));
const DocumentView = React.lazy(() => import("./pages/admin/documents/DocumentView"));
const HealthMonitorDemo = React.lazy(() => import("./pages/HealthMonitorDemo"));
const Health = React.lazy(() => import("./pages/Health"));
const Offline = React.lazy(() => import("./pages/Offline"));
const Modules = React.lazy(() => import("./pages/Modules"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const SmartLayoutDemo = React.lazy(() => import("./pages/SmartLayoutDemo"));

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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <OrganizationProvider>
            <QueryClientProvider client={queryClient}>
              <Router>
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Routes>
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
                      <Route path="/sgso" element={<SGSO />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/travel" element={<Travel />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/hr" element={<HumanResources />} />
                      <Route path="/communication" element={<Communication />} />
                      <Route path="/intelligence" element={<Intelligence />} />
                      <Route path="/maritime" element={<Maritime />} />
                      <Route path="/maritime-supremo" element={<MaritimeSupremo />} />
                      <Route path="/nautilus-one" element={<NautilusOne />} />
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
                      <Route path="/admin/api-tester" element={<APITester />} />
                      <Route path="/admin/api-status" element={<APIStatus />} />
                      <Route path="/admin/control-panel" element={<ControlPanel />} />
                      <Route path="/admin/tests" element={<TestDashboard />} />
                      <Route path="/admin/ci-history" element={<CIHistory />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/admin/wall" element={<AdminWall />} />
                      <Route path="/admin/checklists" element={<AdminChecklists />} />
                      <Route path="/admin/checklists/dashboard" element={<AdminChecklistsDashboard />} />
                      <Route path="/admin/documents/ai" element={<DocumentsAI />} />
                      <Route path="/admin/documents/view/:id" element={<DocumentView />} />
                      <Route path="/health-monitor" element={<HealthMonitorDemo />} />
                      <Route path="/health" element={<Health />} />
                      <Route path="/modules" element={<Modules />} />
                      <Route path="/smart-layout-demo" element={<SmartLayoutDemo />} />
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
