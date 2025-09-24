import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/layout/theme-provider";
import VoiceInterface from "@/components/voice/VoiceInterface";
import IntelligentChatbot from "@/components/voice/IntelligentChatbot";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import EnterpriseLayout from "./components/layout/enterprise-layout";
import PriceAlerts from "./pages/PriceAlerts";
import Reports from "./pages/Reports";
import Reservations from "./pages/Reservations";
import Settings from "./pages/Settings";
import Travel from "./pages/Travel";
import Analytics from "./pages/Analytics";
import HumanResources from "./pages/HumanResources";
import Communication from "./pages/Communication";
import Intelligence from "./pages/Intelligence";
import Maritime from "./pages/Maritime";
import Innovation from "./pages/Innovation";
import Optimization from "./pages/Optimization";
import Strategic from "./pages/Strategic";
import Voice from "./pages/Voice";
import Portal from "./pages/Portal";
import AR from "./pages/AR";
import IoT from "./pages/IoT";
import Blockchain from "./pages/Blockchain";
import Gamification from "./pages/Gamification";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/protected-route";
import { WorkflowAutomationHub } from "./components/automation/workflow-automation-hub";
import { AdvancedDocumentCenter } from "./components/documents/advanced-document-center";
import { MobileOptimizationCenter } from "./components/mobile/mobile-optimization-center";
import AdvancedReports from "./pages/AdvancedReports";
import Executive from "./pages/Executive";
import SystemMonitor from "./pages/SystemMonitor";
import NotificationCenter from "./pages/NotificationCenter";
import IntegrationsHub from "./components/integration/integrations-hub";
import BackupAudit from "./pages/BackupAudit";
import Help from "./pages/Help";
import Templates from "./pages/Templates";
import SystemOverviewPage from "./pages/SystemOverview";

const queryClient = new QueryClient();

const App = () => {
  // Service Worker registration for PWA capabilities
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <EnterpriseLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Index />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="price-alerts" element={<PriceAlerts />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="travel" element={<Travel />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="hr" element={<HumanResources />} />
                  <Route path="reservations" element={<Reservations />} />
                  <Route path="maritime" element={<Maritime />} />
                  <Route path="communication" element={<Communication />} />
                  <Route path="intelligence" element={<Intelligence />} />
                  <Route path="optimization" element={<Optimization />} />
                  <Route path="innovation" element={<Innovation />} />
                  <Route path="strategic" element={<Strategic />} />
                  <Route path="voice" element={<Voice />} />
                  <Route path="portal" element={<Portal />} />
                  <Route path="ar" element={<AR />} />
                  <Route path="iot" element={<IoT />} />
                  <Route path="blockchain" element={<Blockchain />} />
                  <Route path="gamification" element={<Gamification />} />
                  <Route path="predictive-analytics" element={<PredictiveAnalytics />} />
                  <Route path="workflow" element={
                    <div className="container mx-auto p-6">
                      <WorkflowAutomationHub />
                    </div>
                  } />
                  <Route path="documents" element={
                    <div className="container mx-auto p-6">
                      <AdvancedDocumentCenter />
                    </div>
                  } />
                  <Route path="mobile-optimization" element={
                    <div className="container mx-auto p-6">
                      <MobileOptimizationCenter />
                    </div>
                  } />
                  <Route path="advanced-reports" element={<AdvancedReports />} />
                  <Route path="executive" element={<Executive />} />
                  <Route path="system-monitor" element={<SystemMonitor />} />
                  <Route path="notification-center" element={<NotificationCenter />} />
                  <Route path="integrations" element={
                    <div className="container mx-auto p-6">
                      <IntegrationsHub />
                    </div>
                  } />
                  <Route path="backup-audit" element={<BackupAudit />} />
                  <Route path="help" element={<Help />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="system-overview" element={<SystemOverviewPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
