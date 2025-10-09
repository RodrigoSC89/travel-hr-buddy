import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/layout/error-boundary";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { ProtectedRoute } from "./components/layout/protected-route";

// Lazy load all pages
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
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
const ControlPanel = React.lazy(() => import("./pages/admin/control-panel"));
const HealthMonitorDemo = React.lazy(() => import("./pages/HealthMonitorDemo"));

// Create QueryClient
const queryClient = new QueryClient();

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Carregando Nautilus One...</p>
    </div>
  </div>
);

// Simple Navigation Component (inline)
const SimpleNavigation = () => {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  const navItems = [
    { path: "/", label: "Início" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/peotram", label: "PEOTRAM" },
    { path: "/peo-dp", label: "PEO-DP" },
    { path: "/sgso", label: "SGSO" },
    { path: "/analytics", label: "Analytics" },
    { path: "/admin", label: "Admin" },
    { path: "/settings", label: "Configurações" }
  ];

  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold mb-4">🚢 Nautilus One</h1>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`px-3 py-2 rounded text-sm ${
                currentPath === item.path 
                  ? "bg-blue-700 text-white" 
                  : "bg-blue-800 hover:bg-blue-700 text-blue-100"
              }`}
              onClick={() => setCurrentPath(item.path)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <OrganizationProvider>
            <QueryClientProvider client={queryClient}>
              <Router>
                <div className="min-h-screen bg-gray-100">
                  <SimpleNavigation />
                  <main className="container mx-auto p-6">
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/auth" element={<Auth />} />
                        
                        {/* Protected routes */}
                        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/price-alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                        <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
                        <Route path="/checklists" element={<ProtectedRoute><ChecklistsInteligentes /></ProtectedRoute>} />
                        <Route path="/peotram" element={<ProtectedRoute><PEOTRAM /></ProtectedRoute>} />
                        <Route path="/peo-dp" element={<ProtectedRoute><PEODP /></ProtectedRoute>} />
                        <Route path="/sgso" element={<ProtectedRoute><SGSO /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                        <Route path="/travel" element={<ProtectedRoute><Travel /></ProtectedRoute>} />
                        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                        <Route path="/hr" element={<ProtectedRoute><HumanResources /></ProtectedRoute>} />
                        <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
                        <Route path="/intelligence" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
                        <Route path="/maritime" element={<ProtectedRoute><Maritime /></ProtectedRoute>} />
                        <Route path="/maritime-supremo" element={<ProtectedRoute><MaritimeSupremo /></ProtectedRoute>} />
                        <Route path="/innovation" element={<ProtectedRoute><Innovation /></ProtectedRoute>} />
                        <Route path="/optimization" element={<ProtectedRoute><Optimization /></ProtectedRoute>} />
                        <Route path="/collaboration" element={<ProtectedRoute><Collaboration /></ProtectedRoute>} />
                        <Route path="/voice" element={<ProtectedRoute><Voice /></ProtectedRoute>} />
                        <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
                        <Route path="/ar" element={<ProtectedRoute><AR /></ProtectedRoute>} />
                        <Route path="/iot" element={<ProtectedRoute><IoT /></ProtectedRoute>} />
                        <Route path="/blockchain" element={<ProtectedRoute><Blockchain /></ProtectedRoute>} />
                        <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
                        <Route path="/predictive" element={<ProtectedRoute><PredictiveAnalytics /></ProtectedRoute>} />
                        
                        {/* Admin routes - protected */}
                        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                        <Route path="/admin/api-tester" element={<ProtectedRoute><APITester /></ProtectedRoute>} />
                        <Route path="/admin/control-panel" element={<ProtectedRoute><ControlPanel /></ProtectedRoute>} />
                        
                        <Route path="/health-monitor" element={<ProtectedRoute><HealthMonitorDemo /></ProtectedRoute>} />
                      </Routes>
                    </React.Suspense>
                  </main>
                </div>
                <Toaster position="top-right" />
              </Router>
            </QueryClientProvider>
          </OrganizationProvider>
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
