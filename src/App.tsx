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
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/price-alerts" element={
                  <ProtectedRoute>
                    <PriceAlerts />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/travel" element={
                  <ProtectedRoute>
                    <Travel />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/hr" element={
                  <ProtectedRoute>
                    <HumanResources />
                  </ProtectedRoute>
                } />
                <Route path="/reservations" element={
                  <ProtectedRoute>
                    <Reservations />
                  </ProtectedRoute>
                } />
                <Route path="/maritime" element={
                  <ProtectedRoute>
                    <Maritime />
                  </ProtectedRoute>
                } />
                <Route path="/communication" element={
                  <ProtectedRoute>
                    <Communication />
                  </ProtectedRoute>
                } />
                <Route path="/intelligence" element={
                  <ProtectedRoute>
                    <Intelligence />
                  </ProtectedRoute>
                } />
                <Route path="/optimization" element={
                  <ProtectedRoute>
                    <Optimization />
                  </ProtectedRoute>
                } />
                <Route path="/innovation" element={
                  <ProtectedRoute>
                    <Innovation />
                  </ProtectedRoute>
                } />
                <Route path="/strategic" element={
                  <ProtectedRoute>
                    <Strategic />
                  </ProtectedRoute>
                } />
                <Route path="/voice" element={
                  <ProtectedRoute>
                    <Voice />
                  </ProtectedRoute>
                } />
                <Route path="/portal" element={
                  <ProtectedRoute>
                    <Portal />
                  </ProtectedRoute>
                } />
                <Route path="/ar" element={
                  <ProtectedRoute>
                    <AR />
                  </ProtectedRoute>
                } />
                <Route path="/iot" element={
                  <ProtectedRoute>
                    <IoT />
                  </ProtectedRoute>
                } />
                <Route path="/blockchain" element={
                  <ProtectedRoute>
                    <Blockchain />
                  </ProtectedRoute>
                } />
                <Route path="/gamification" element={
                  <ProtectedRoute>
                    <Gamification />
                  </ProtectedRoute>
                } />
                <Route path="/predictive-analytics" element={
                  <ProtectedRoute>
                    <PredictiveAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/workflow" element={
                  <ProtectedRoute>
                    <div className="container mx-auto p-6">
                      <WorkflowAutomationHub />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/documents" element={
                  <ProtectedRoute>
                    <div className="container mx-auto p-6">
                      <AdvancedDocumentCenter />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/mobile-optimization" element={
                  <ProtectedRoute>
                    <div className="container mx-auto p-6">
                      <MobileOptimizationCenter />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <IntelligentChatbot />
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
