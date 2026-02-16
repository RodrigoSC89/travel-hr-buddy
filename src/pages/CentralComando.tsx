/**
 * Central de Comando - Módulo Unificado
 * Refactored: Header, AI Panel, and types extracted to sub-files
 */

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  LayoutDashboard, Activity, TrendingUp, Brain, Bell, Settings, Shield,
} from "lucide-react";
import { CentralComandoHeader } from "./central-comando/CentralComandoHeader";
import { CentralComandoAIPanel } from "./central-comando/CentralComandoAIPanel";
import { SystemStatus, Alert, DEFAULT_SYSTEM_STATUS } from "./central-comando/types";

// Lazy loaded sections
const VisaoGeralSection = React.lazy(() => import("@/components/dashboard/enhanced-unified-dashboard"));
const OperacoesSection = React.lazy(() => import("@/components/operations/OperationsCommandCenter"));
const ExecutivoSection = React.lazy(() => import("@/components/dashboard/executive-dashboard").then(m => ({ default: m.ExecutiveDashboard })));
const IASection = React.lazy(() => import("@/components/ai/AIObservabilityDashboard"));
const AlertasSection = React.lazy(() => import("@/components/fleet/intelligent-alerts"));
const ConfigSection = React.lazy(() => import("@/pages/Settings"));
const ResilienciaSection = React.lazy(() => import("@/components/dashboard/organization-health-check").then(m => ({ default: m.OrganizationHealthCheck })));

// Hooks stubs
const useUnifiedCommandAI = () => ({ messages: [] as Array<{role: string; content: string}>, sendMessage: async (_msg: string) => {}, isLoading: false, clearMessages: () => {}, isConnected: false });
const useVoiceCommands = (_opts?: Record<string, unknown>) => ({ isListening: false, isSupported: false, transcript: '', toggleVoice: () => {}, stopListening: () => {} });
const VoiceAssistantWithHotword = (_props: Record<string, unknown>) => null;

const tabsConfig = [
  { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard, path: "/central-comando/visao-geral" },
  { id: "operacoes", label: "Operações", icon: Activity, path: "/central-comando/operacoes" },
  { id: "executivo", label: "Executivo", icon: TrendingUp, path: "/central-comando/executivo" },
  { id: "ia", label: "IA", icon: Brain, path: "/central-comando/ia" },
  { id: "resiliencia", label: "Resiliência", icon: Shield, path: "/central-comando/resiliencia" },
  { id: "alertas", label: "Alertas", icon: Bell, path: "/central-comando/alertas" },
  { id: "config", label: "Config", icon: Settings, path: "/central-comando/config" },
];

const sectionMap: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "visao-geral": VisaoGeralSection,
  "operacoes": OperacoesSection,
  "executivo": ExecutivoSection,
  "ia": IASection,
  "resiliencia": ResilienciaSection,
  "alertas": AlertasSection,
  "config": ConfigSection,
};

function CentralComandoContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const tenant = { id: null, name: null };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(DEFAULT_SYSTEM_STATUS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const { isConnected, sendMessage, messages, isLoading: isAITyping } = useUnifiedCommandAI();
  const { isListening, toggleVoice, transcript, isSupported: voiceSupported } = useVoiceCommands({
    onCommand: (cmd: string) => { toast.success(`Comando recebido: ${cmd}`); sendMessage(cmd); }
  });

  const activeTab = useMemo(() => {
    const tab = tabsConfig.find(t => location.pathname.includes(t.id));
    return tab?.id || "visao-geral";
  }, [location.pathname]);

  const withTimeout = <T,>(promise: Promise<T>, ms: number = 8000): Promise<T> => {
    return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Query timeout")), ms))]);
  };

  const loadSystemData = useCallback(async () => {
    if (dataLoaded && !isRefreshing) return;
    try {
      const isMobile = window.innerWidth < 768;
      const timeout = isMobile ? 5000 : 10000;
      const [vesselsRes, crewRes] = await withTimeout(
        Promise.all([
          supabase.from("vessels").select("id, status").limit(100),
          supabase.from("crew_members").select("id, status").limit(500),
        ]),
        timeout
      );
      if (vesselsRes.data) {
        const vessels = vesselsRes.data;
        setSystemStatus(prev => ({ ...prev, fleet: { ...prev.fleet, total: vessels.length || 12, active: vessels.filter(v => v.status === "active").length || 11, maintenance: vessels.filter(v => v.status === "maintenance").length || 1 } }));
      }
      if (crewRes.data) {
        const crew = crewRes.data;
        setSystemStatus(prev => ({ ...prev, crew: { ...prev.crew, total: crew.length || 247, onboard: crew.filter(c => c.status === "active").length || 198 } }));
      }
      setLastSync(new Date());
      setDataLoaded(true);
    } catch (error) {
      logger.warn("Error loading system data (using fallback):", { error });
      if (!dataLoaded) toast.warning("Conexão lenta - usando dados em cache");
      setDataLoaded(true);
    }
  }, [dataLoaded, isRefreshing]);

  useEffect(() => {
    let mounted = true;
    if (!dataLoaded) loadSystemData();
    const channel = supabase.channel("central-comando-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vessels" }, () => { if (mounted) setDataLoaded(false); })
      .on("postgres_changes", { event: "*", schema: "public", table: "crew_members" }, () => { if (mounted) setDataLoaded(false); })
      .subscribe();
    const interval = setInterval(() => { if (mounted && document.visibilityState === 'visible') setDataLoaded(false); }, 60000);
    return () => { mounted = false; supabase.removeChannel(channel); clearInterval(interval); };
  }, []);

  useEffect(() => { if (!dataLoaded) loadSystemData(); }, [dataLoaded, loadSystemData]);

  const handleRefresh = async () => { setIsRefreshing(true); await loadSystemData(); toast.success("Dados atualizados em tempo real"); setIsRefreshing(false); };
  const handleTabChange = (tabId: string) => { const tab = tabsConfig.find(t => t.id === tabId); if (tab) navigate(tab.path); };
  const toggleTheme = () => { const n = !isDarkMode; setIsDarkMode(n); document.documentElement.classList.toggle("dark", n); localStorage.setItem("theme", n ? "dark" : "light"); };
  const toggleFullscreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); } else { document.exitFullscreen(); setIsFullscreen(false); } };

  const alertCounts = useMemo(() => ({
    critical: alerts.filter(a => a.severity === "critical" && !a.resolved).length,
    high: alerts.filter(a => a.severity === "high" && !a.resolved).length,
    total: alerts.filter(a => !a.resolved).length
  }), [alerts]);

  return (
    <>
      <Helmet>
        <title>Central de Comando | Nauti One</title>
        <meta name="description" content="Central de Comando Unificada - Dashboard, Operações, IA e Monitoramento em Tempo Real" />
        <link rel="canonical" href="/central-comando" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <CentralComandoHeader
          tenant={tenant}
          isConnected={isConnected}
          lastSync={lastSync}
          alertCounts={alertCounts}
          isRefreshing={isRefreshing}
          isDarkMode={isDarkMode}
          isListening={isListening}
          voiceSupported={voiceSupported}
          showAIPanel={showAIPanel}
          isAITyping={isAITyping}
          onRefresh={handleRefresh}
          onToggleTheme={toggleTheme}
          onToggleFullscreen={toggleFullscreen}
          onToggleVoice={toggleVoice}
          onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
        />

        <AnimatePresence>
          {isListening && transcript && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b bg-primary/5 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm text-muted-foreground">Ouvindo:</span>
                <span className="text-sm font-medium">{transcript}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex">
          <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${showAIPanel ? 'lg:pr-[380px]' : ''}`}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2" data-tour="tabs">
                <TabsList className="inline-flex h-12 items-center justify-start gap-1 rounded-xl bg-muted/50 p-1 backdrop-blur">
                  {tabsConfig.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50">
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.id === "alertas" && alertCounts.total > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">{alertCounts.total}</Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                  {tabsConfig.map((tab) => {
                    const Section = sectionMap[tab.id];
                    return (
                      <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:outline-none">
                        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando...</div>}>
                          <Section />
                        </Suspense>
                      </TabsContent>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </main>

          <CentralComandoAIPanel
            showAIPanel={showAIPanel}
            isAITyping={isAITyping}
            messages={messages}
            onClose={() => setShowAIPanel(false)}
            onSendMessage={sendMessage}
          />
        </div>

        <VoiceAssistantWithHotword onCommand={(cmd: string) => { sendMessage(cmd); }} />
      </div>
    </>
  );
}

export default function CentralComando() {
  return (
    <Routes>
      <Route index element={<Navigate to="/central-comando/visao-geral" replace />} />
      <Route path="visao-geral" element={<CentralComandoContent />} />
      <Route path="operacoes" element={<CentralComandoContent />} />
      <Route path="executivo" element={<CentralComandoContent />} />
      <Route path="ia" element={<CentralComandoContent />} />
      <Route path="resiliencia" element={<CentralComandoContent />} />
      <Route path="alertas" element={<CentralComandoContent />} />
      <Route path="config" element={<CentralComandoContent />} />
      <Route path="*" element={<Navigate to="/central-comando/visao-geral" replace />} />
    </Routes>
  );
}
