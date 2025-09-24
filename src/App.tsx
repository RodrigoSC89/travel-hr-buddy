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
import PriceAlerts from "./pages/PriceAlerts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Travel from "./pages/Travel";
import Analytics from "./pages/Analytics";
import HumanResources from "./pages/HumanResources";
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
                <Route path="/price-alerts" element={<PriceAlerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/hr" element={<HumanResources />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <VoiceInterface />
            <IntelligentChatbot />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
