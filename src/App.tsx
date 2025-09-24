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
import NotFound from "./pages/NotFound";

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
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/price-alerts" element={<PriceAlerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/hr" element={<HumanResources />} />
                <Route path="/maritime" element={<Maritime />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/optimization" element={<Optimization />} />
                <Route path="/innovation" element={<Innovation />} />
                <Route path="/strategic" element={<Strategic />} />
                <Route path="/voice" element={<Voice />} />
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
