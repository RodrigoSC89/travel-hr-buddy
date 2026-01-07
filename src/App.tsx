/**
 * App.tsx - Versão com Sidebar e Rotas Completas
 */
import * as React from "react";
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/layout/app-sidebar";
import { ThemeProvider } from "./components/layout/theme-provider";

// Lazy load páginas
const Auth = lazy(() => import("@/pages/Auth"));
const CentralComando = lazy(() => import("@/pages/CentralComando"));

// Central de Comando extras
const NOC = lazy(() => import("@/pages/NOC"));
const NOCMonitoring = lazy(() => import("@/pages/NOCMonitoring"));

// Operações Marítimas
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

// Manutenção
const MaintenanceCommandCenter = lazy(() => import("@/pages/MaintenanceCommandCenter"));
const PredictiveMaintenancePage = lazy(() => import("@/pages/PredictiveMaintenancePage"));

// IA & Automação
const NautilusCommand = lazy(() => import("@/pages/NautilusCommand"));
const RevolutionaryAI = lazy(() => import("@/pages/RevolutionaryAI"));
const AICommandCenter = lazy(() => import("@/pages/AICommandCenter"));

// Telemetria
const TelemetriaCommand = lazy(() => import("@/pages/TelemetriaCommand"));

// Relatórios & Documentos
const DocumentationHub = lazy(() => import("@/pages/DocumentationHub"));
const ReportsCommandCenter = lazy(() => import("@/pages/ReportsCommandCenter"));

// Auditorias
const PEOTRAM = lazy(() => import("@/pages/PEOTRAM"));
const PEODP = lazy(() => import("@/pages/PEODP"));
const SGSO = lazy(() => import("@/pages/SGSO"));
const SafetyIMCAV2 = lazy(() => import("@/pages/SafetyIMCAV2"));
const PreOVIDInspection = lazy(() => import("@/pages/PreOVIDInspection"));
const MLCInspection = lazy(() => import("@/pages/MLCInspection"));

// RH & Pessoas
const CrewManagement = lazy(() => import("@/pages/CrewManagement"));
const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));

// Admin
const Admin = lazy(() => import("@/pages/Admin"));
const Settings = lazy(() => import("@/pages/Settings"));
const Users = lazy(() => import("@/pages/Users"));

// Dashboards
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// Loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-foreground">Carregando Nautilus One...</p>
    </div>
  </div>
);

// Layout com Sidebar para rotas autenticadas
const AuthenticatedLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Rotas internas
const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    
    {/* Rotas autenticadas com Sidebar */}
    <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
      <Route path="/" element={<Navigate to="/central-comando" replace />} />
      
      {/* Central de Comando */}
      <Route path="/central-comando/*" element={<CentralComando />} />
      <Route path="/noc" element={<NOC />} />
      <Route path="/noc-monitoring" element={<NOCMonitoring />} />
      
      {/* Operações Marítimas */}
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
      
      {/* Manutenção */}
      <Route path="/maintenance-command" element={<MaintenanceCommandCenter />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenancePage />} />
      
      {/* IA & Automação */}
      <Route path="/nautilus-command" element={<NautilusCommand />} />
      <Route path="/revolutionary-ai" element={<RevolutionaryAI />} />
      <Route path="/ai-command" element={<AICommandCenter />} />
      
      {/* Telemetria */}
      <Route path="/telemetria-command" element={<TelemetriaCommand />} />
      
      {/* Relatórios & Documentos */}
      <Route path="/documentation" element={<DocumentationHub />} />
      <Route path="/reports" element={<ReportsCommandCenter />} />
      
      {/* Auditorias */}
      <Route path="/peotram" element={<PEOTRAM />} />
      <Route path="/peo-dp" element={<PEODP />} />
      <Route path="/sgso" element={<SGSO />} />
      <Route path="/imca-audit" element={<SafetyIMCAV2 />} />
      <Route path="/pre-ovid-inspection" element={<PreOVIDInspection />} />
      <Route path="/mlc-inspection" element={<MLCInspection />} />
      
      {/* RH & Pessoas */}
      <Route path="/crew-management" element={<CrewManagement />} />
      <Route path="/crew-wellness" element={<CrewWellnessPage />} />
      
      {/* Admin */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/users" element={<Users />} />
      
      {/* Dashboards */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
    </Route>
    
    <Route path="*" element={<Navigate to="/central-comando" replace />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nautilus-ui-theme">
        <AuthProvider>
          <Router>
            <TooltipProvider>
              <Suspense fallback={<Loader />}>
                <AppRoutes />
              </Suspense>
              <Toaster />
            </TooltipProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;