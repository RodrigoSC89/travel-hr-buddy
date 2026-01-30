/**
 * 🚀 NAUTI COMMAND CENTER - PREMIUM EDITION
 * Fusão de: Command Center, Dashboard Executivo, Nauti Command, Centro de Operações
 * 
 * Central de Inteligência e Operações em Tempo Real
 * PATCH PREMIUM-1.0 - Design extraordinário com IA autônoma
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  LayoutDashboard, Activity, TrendingUp, Brain, Bell, Settings,
  RefreshCw, Sun, Moon, Maximize2, Ship, 
  AlertTriangle, Zap, Shield, Mic, MicOff,
  ChevronRight, Sparkles, Radio, Waves, Server
} from "lucide-react";

// Seções do módulo
import { VisaoGeralSection } from "./sections/VisaoGeralSection";
import { OperacoesSection } from "./sections/OperacoesSection";
import { ExecutivoSection } from "./sections/ExecutivoSection";
import { IASection } from "./sections/IASection";
import { AlertasSection } from "./sections/AlertasSection";
import { ConfigSection } from "./sections/ConfigSection";
import { ResilienciaSection } from "./sections/ResilienciaSection";

// Hook de IA unificado
import { useUnifiedCommandAI } from "./hooks/useUnifiedCommandAI";
import { useVoiceCommands } from "./hooks/useVoiceCommands";

export interface SystemStatus {
  fleet: { total: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

const tabs = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard, gradient: "from-primary to-info" },
  { id: "operations", label: "Operações", icon: Activity, gradient: "from-success to-success/80" },
  { id: "executive", label: "Executivo", icon: TrendingUp, gradient: "from-secondary to-accent" },
  { id: "ai", label: "IA", icon: Brain, gradient: "from-accent to-destructive" },
  { id: "resilience", label: "Resiliência", icon: Shield, gradient: "from-warning to-warning/80" },
  { id: "alerts", label: "Alertas", icon: Bell, gradient: "from-destructive to-destructive/80" },
  { id: "settings", label: "Config", icon: Settings, gradient: "from-muted to-muted-foreground/20" },
];

export default function NautilusCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  // PATCH v44: Iniciar com isLoading=false para NUNCA bloquear renderização
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains("dark")
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    fleet: { total: 12, active: 11, maintenance: 1, alerts: 3 },
    crew: { total: 247, onboard: 198, onLeave: 49, expiringCerts: 8 },
    maintenance: { scheduled: 15, overdue: 2, completed: 45, efficiency: 94.2 },
    inventory: { lowStock: 5, pendingOrders: 12, value: 2450000 },
    compliance: { score: 96.8, pendingAudits: 2, expiringDocs: 6 }
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const { isConnected, sendMessage, messages, isLoading: isAITyping } = useUnifiedCommandAI();
  const { isListening, toggleVoice, transcript, isSupported: voiceSupported } = useVoiceCommands({
    onCommand: (cmd: string) => {
      toast.info(`Comando: ${cmd}`);
      sendMessage(cmd);
    }
  });

  // Load data from database
  const loadSystemData = useCallback(async () => {
    try {
      const [vesselsRes, crewRes, maintenanceRes] = await Promise.all([
        supabase.from("vessels").select("id, status").limit(100),
        supabase.from("crew_members").select("id, status").limit(500),
        supabase.from("maintenance_records").select("id, status").limit(100)
      ]);

      if (vesselsRes.data) {
        const vessels = vesselsRes.data;
        setSystemStatus(prev => ({
          ...prev,
          fleet: {
            ...prev.fleet,
            total: vessels.length || 12,
            active: vessels.filter(v => v.status === "active").length || 11,
            maintenance: vessels.filter(v => v.status === "maintenance").length || 1
          }
        }));
      }

      if (crewRes.data) {
        const crew = crewRes.data;
        setSystemStatus(prev => ({
          ...prev,
          crew: {
            ...prev.crew,
            total: crew.length || 247,
            onboard: crew.filter(c => c.status === "active").length || 198
          }
        }));
      }

      setLastSync(new Date());
    } catch (error) {
      logger.warn("Error loading system data:", { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // PATCH v47: Single mount effect with throttled realtime - NEVER causes infinite loops
  useEffect(() => {
    let mounted = true;
    
    // Background load on mount
    loadSystemData();

    // Throttled realtime - max once per 60 seconds
    let lastUpdate = 0;
    const throttledRefresh = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000 && mounted) { // 60s minimum between updates
        lastUpdate = now;
        loadSystemData();
      }
    };

    const channel = supabase
      .channel("command-center-v47")
      .on("postgres_changes", { event: "*", schema: "public", table: "vessels" }, throttledRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "crew_members" }, throttledRefresh)
      .subscribe();

    // Auto refresh every 2 minutes when tab is visible
    const interval = setInterval(() => {
      if (mounted && document.visibilityState === 'visible') {
        loadSystemData();
      }
    }, 120000);

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemData();
    toast.success("Dados atualizados em tempo real");
    setIsRefreshing(false);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const alertCounts = useMemo(() => ({
    critical: alerts.filter(a => a.severity === "critical" && !a.resolved).length,
    high: alerts.filter(a => a.severity === "high" && !a.resolved).length,
    total: alerts.filter(a => !a.resolved).length
  }), [alerts]);

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <>
      <Helmet>
        <title>Nauti Command Center | Central de Inteligência Premium</title>
        <meta name="description" content="Central de Inteligência e Operações em Tempo Real - Dashboard unificado com IA autônoma" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Animated Background Effect */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Premium Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            {/* Logo e Título Premium */}
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-purple-600 shadow-lg shadow-primary/25">
                  <Ship className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Nauti Command Center
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Waves className="h-3 w-3" />
                  Central de Inteligência e Operações
                </p>
              </div>
            </div>

            {/* Status Bar Premium */}
            <div className="hidden lg:flex items-center gap-6">
              {/* System Status */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                  <span className="text-xs font-medium">{isConnected ? 'Online' : 'Conectando...'}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Radio className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Critical Alerts */}
              {alertCounts.critical > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                  <span className="text-xs font-semibold text-destructive">
                    {alertCounts.critical} alertas críticos
                  </span>
                </motion.div>
              )}
            </div>

            {/* Action Buttons Premium */}
            <div className="flex items-center gap-2">
              {/* Voice Command */}
              {voiceSupported && (
                <Button 
                  variant={isListening ? "default" : "ghost"} 
                  size="icon"
                  onClick={toggleVoice}
                  className={isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="relative"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hidden lg:flex">
                <Maximize2 className="h-4 w-4" />
              </Button>

              {/* AI Status Badge Premium */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge 
                  className="cursor-pointer bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white border-0 shadow-lg shadow-purple-500/25 px-3 py-1"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                >
                  <Brain className="h-3 w-3 mr-1.5 animate-pulse" />
                  IA Ativa
                  <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showAIPanel ? 'rotate-90' : ''}`} />
                </Badge>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Voice Transcript Bar */}
        <AnimatePresence>
          {isListening && transcript && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b bg-primary/5 px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Ouvindo:</span>
                <span className="text-sm font-medium">{transcript}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content with AI Side Panel */}
        <div className="flex">
          {/* Main Content Area */}
          <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${showAIPanel ? 'lg:pr-[380px]' : ''}`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Premium Tab Navigation */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <TabsList className="inline-flex h-12 items-center justify-start gap-1 rounded-xl bg-muted/50 p-1 backdrop-blur">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`
                        relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
                        data-[state=active]:bg-background data-[state=active]:shadow-sm
                        data-[state=active]:text-foreground
                        hover:bg-background/50
                      `}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.id === "alerts" && alertCounts.total > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                          {alertCounts.total}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content with Animations */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <VisaoGeralSection 
                      systemStatus={systemStatus} 
                      isLoading={isLoading}
                      onNavigate={setActiveTab}
                    />
                  </TabsContent>

                  <TabsContent value="operations" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <OperacoesSection 
                      systemStatus={systemStatus}
                      isLoading={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="executive" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ExecutivoSection 
                      systemStatus={systemStatus}
                      isLoading={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="ai" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <IASection />
                  </TabsContent>

                  <TabsContent value="resilience" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ResilienciaSection />
                  </TabsContent>

                  <TabsContent value="alerts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <AlertasSection 
                      alerts={alerts}
                      setAlerts={setAlerts}
                    />
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ConfigSection />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </main>

          {/* AI Side Panel */}
          <AnimatePresence>
            {showAIPanel && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed right-0 top-16 bottom-0 z-40 border-l bg-background/95 backdrop-blur-xl overflow-hidden hidden lg:block"
              >
                <div className="h-full flex flex-col">
                  {/* AI Panel Header */}
                  <div className="p-4 border-b bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">Assistente IA</h3>
                          <p className="text-xs text-muted-foreground">Nautilus Intelligence</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Gemini 2.5
                      </Badge>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                          <Sparkles className="h-8 w-8 text-purple-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Olá! Sou a IA do Nautilus Command Center.
                        </p>
                        <div className="space-y-2">
                          {[
                            "Mostrar status da frota",
                            "Gerar relatório executivo",
                            "Analisar riscos operacionais"
                          ].map((suggestion, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => sendMessage(suggestion)}
                            >
                              <ChevronRight className="h-3 w-3 mr-2" />
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {isAITyping && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                          <span className="h-2 w-2 rounded-full bg-current animate-bounce delay-100" />
                          <span className="h-2 w-2 rounded-full bg-current animate-bounce delay-200" />
                        </div>
                        <span className="text-xs">Pensando...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t bg-muted/30">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Pergunte à IA..."
                        className="flex-1 px-4 py-2 rounded-full bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            sendMessage(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button size="icon" className="rounded-full">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
