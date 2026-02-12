/**
 * Central de Comando - Módulo Unificado
 * PATCH UNIFY-4.0 - Fusão de Nautilus Command Center + Dashboard Principal
 * 
 * Subrotas:
 * - /central-comando/visao-geral (antigo Dashboard Principal)
 * - /central-comando/operacoes (antigo Nautilus Command Center)
 * - /central-comando/executivo (BI Executivo)
 * - /central-comando/ia (IA Central)
 * - /central-comando/alertas (Central de Alertas)
 * - /central-comando/resiliencia (Resiliência)
 * - /central-comando/config (Configurações)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  LayoutDashboard, Activity, TrendingUp, Brain, Bell, Settings,
  RefreshCw, Sun, Moon, Maximize2, Ship, 
  AlertTriangle, Zap, Shield, Mic, MicOff,
  ChevronRight, Sparkles, Radio, Waves, Compass, Eye,
  BarChart3, Building2, Filter, HelpCircle, X
} from "lucide-react";

// Tour guiado
import { GuidedTour, tourStyles } from "@/components/onboarding/GuidedTour";

// Seções do módulo unificado
import { VisaoGeralSection } from "@/modules/nauti-command-center/sections/VisaoGeralSection";
import { OperacoesSection } from "@/modules/nauti-command-center/sections/OperacoesSection";
import { ExecutivoSection } from "@/modules/nauti-command-center/sections/ExecutivoSection";
import { IASection } from "@/modules/nauti-command-center/sections/IASection";
import { AlertasSection } from "@/modules/nauti-command-center/sections/AlertasSection";
import { ConfigSection } from "@/modules/nauti-command-center/sections/ConfigSection";
import { ResilienciaSection } from "@/modules/nauti-command-center/sections/ResilienciaSection";

// Hooks de IA
import { useUnifiedCommandAI } from "@/modules/nauti-command-center/hooks/useUnifiedCommandAI";
import { useVoiceCommands } from "@/modules/nauti-command-center/hooks/useVoiceCommands";

// Voice Assistant with Hotword (ARIA)
import { VoiceAssistantWithHotword } from "@/components/voice/VoiceAssistantWithHotword";

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
  { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard, path: "/central-comando/visao-geral" },
  { id: "operacoes", label: "Operações", icon: Activity, path: "/central-comando/operacoes" },
  { id: "executivo", label: "Executivo", icon: TrendingUp, path: "/central-comando/executivo" },
  { id: "ia", label: "IA", icon: Brain, path: "/central-comando/ia" },
  { id: "resiliencia", label: "Resiliência", icon: Shield, path: "/central-comando/resiliencia" },
  { id: "alertas", label: "Alertas", icon: Bell, path: "/central-comando/alertas" },
  { id: "config", label: "Config", icon: Settings, path: "/central-comando/config" },
];

function CentralComandoContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const tenant = { id: null, name: null }; // Placeholder para multi-tenant
  
  const [isLoading, setIsLoading] = useState(false); // Start false to prevent infinite loading on mobile
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
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
      toast.success(`Comando recebido: ${cmd}`);
      sendMessage(cmd);
    }
  });

  // Determinar tab ativa baseada na rota
  const activeTab = useMemo(() => {
    const currentPath = location.pathname;
    const tab = tabs.find(t => currentPath.includes(t.id));
    return tab?.id || "visao-geral";
  }, [location.pathname]);

  // Timeout wrapper for Supabase queries
  const withTimeout = <T,>(promise: Promise<T>, ms: number = 8000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error("Query timeout")), ms)
      )
    ]);
  };

  // Filtrar dados por tenant com timeout e fallback - MOBILE FIX
  const loadSystemData = useCallback(async () => {
    // Prevent loading if already loaded to avoid infinite loops on mobile
    if (dataLoaded && !isRefreshing) return;
    
    try {
      setIsLoading(true);
      const tenantFilter = tenant?.id ? { tenant_id: tenant.id } : {};
      
      // Use shorter timeout for mobile (5s) vs desktop (10s)
      const isMobile = window.innerWidth < 768;
      const timeout = isMobile ? 5000 : 10000;
      
      const [vesselsRes, crewRes, maintenanceRes] = await withTimeout(
        Promise.all([
          supabase.from("vessels").select("id, status").match(tenantFilter).limit(100),
          supabase.from("crew_members").select("id, status").match(tenantFilter).limit(500),
          supabase.from("maintenance_records").select("id, status").match(tenantFilter).limit(100)
        ]),
        timeout
      );

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
      setDataLoaded(true);
    } catch (error) {
      // On timeout/error, use fallback data and stop loading
      logger.warn("Error loading system data (using fallback):", { error });
      if (!dataLoaded) {
        toast.warning("Conexão lenta - usando dados em cache");
      }
      setDataLoaded(true); // Mark as loaded even on error to prevent loops
    } finally {
      // ALWAYS stop loading, even on error
      setIsLoading(false);
    }
  }, [tenant?.id, dataLoaded, isRefreshing]);

  // MOBILE FIX: Load data only once on mount, not on every callback change
  useEffect(() => {
    let mounted = true;
    
    // Initial load
    if (!dataLoaded) {
      loadSystemData();
    }

    // Real-time subscriptions - only trigger on actual changes, not loops
    const channel = supabase
      .channel("central-comando-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vessels" }, () => {
        if (mounted) setDataLoaded(false); // Allow refetch
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "crew_members" }, () => {
        if (mounted) setDataLoaded(false); // Allow refetch
      })
      .subscribe();

    // Auto refresh every 60 seconds (increased from 30 for mobile)
    const interval = setInterval(() => {
      if (mounted && document.visibilityState === 'visible') {
        setDataLoaded(false);
      }
    }, 60000);

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []); // Empty deps - run only on mount

  // Separate effect to handle data refetch
  useEffect(() => {
    if (!dataLoaded) {
      loadSystemData();
    }
  }, [dataLoaded, loadSystemData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemData();
    toast.success("Dados atualizados em tempo real");
    setIsRefreshing(false);
  };

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
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

  return (
    <>
      <Helmet>
        <title>Central de Comando | Nautilus One</title>
        <meta name="description" content="Central de Comando Unificada - Dashboard, Operações, IA e Monitoramento em Tempo Real" />
        <link rel="canonical" href="/central-comando" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Premium Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-purple-600 shadow-lg shadow-primary/25">
                  <Compass className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Central de Comando
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {tenant?.name || "Todas Organizações"}
                </p>
              </div>
            </div>

            {/* Status Bar */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted'}`} />
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {voiceSupported && (
                <Button 
                  variant={isListening ? "default" : "ghost"} 
                  size="icon"
                  onClick={toggleVoice}
                  className={isListening ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hidden lg:flex">
                <Maximize2 className="h-4 w-4" />
              </Button>

              {/* Tour Guiado */}
              <GuidedTour autoStart={false} />

              <motion.div whileHover={{ scale: 1.05 }} data-tour="ia-button">
                <Badge 
                  className="cursor-pointer bg-gradient-to-r from-secondary via-accent to-destructive text-secondary-foreground border-0 shadow-lg shadow-secondary/25 px-3 py-1"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                >
                  <Brain className="h-3 w-3 mr-1.5 animate-pulse" />
                  IA Ativa
                  <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showAIPanel ? 'rotate-90' : ''}`} />
                </Badge>
              </motion.div>
            </div>
            
            {/* Tour Styles */}
            <style dangerouslySetInnerHTML={{ __html: tourStyles }} />
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
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm text-muted-foreground">Ouvindo:</span>
                <span className="text-sm font-medium">{transcript}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex">
          <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${showAIPanel ? 'lg:pr-[380px]' : ''}`}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2" data-tour="tabs">
                <TabsList className="inline-flex h-12 items-center justify-start gap-1 rounded-xl bg-muted/50 p-1 backdrop-blur">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/50"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.id === "alertas" && alertCounts.total > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                          {alertCounts.total}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="visao-geral" className="mt-0 focus-visible:outline-none">
                    <VisaoGeralSection systemStatus={systemStatus} isLoading={isLoading} onNavigate={handleTabChange} />
                  </TabsContent>

                  <TabsContent value="operacoes" className="mt-0 focus-visible:outline-none">
                    <OperacoesSection systemStatus={systemStatus} isLoading={isLoading} />
                  </TabsContent>

                  <TabsContent value="executivo" className="mt-0 focus-visible:outline-none">
                    <ExecutivoSection systemStatus={systemStatus} isLoading={isLoading} />
                  </TabsContent>

                  <TabsContent value="ia" className="mt-0 focus-visible:outline-none">
                    <IASection />
                  </TabsContent>

                  <TabsContent value="resiliencia" className="mt-0 focus-visible:outline-none">
                    <ResilienciaSection />
                  </TabsContent>

                  <TabsContent value="alertas" className="mt-0 focus-visible:outline-none">
                    <AlertasSection alerts={alerts} setAlerts={setAlerts} />
                  </TabsContent>

                  <TabsContent value="config" className="mt-0 focus-visible:outline-none">
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
                className="fixed right-0 top-0 bottom-0 w-[360px] border-l bg-background/95 backdrop-blur-xl overflow-hidden z-[60] pt-16"
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h3 className="font-semibold">Assistente IA</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {isAITyping ? "Processando..." : "Pronto"}
                      </Badge>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setShowAIPanel(false)}
                        className="h-8 w-8"
                        title="Fechar chat"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-180px)]">
                  {messages.map((msg, i) => (
                    <Card key={`cmd-msg-${msg.role}-${i}`} className={`${msg.role === 'assistant' ? 'bg-primary/5' : 'bg-muted/50'}`}>
                      <CardContent className="p-3">
                        <p className="text-sm">{msg.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {isAITyping && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
                      </div>
                      <span className="text-xs">IA pensando...</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Pergunte algo..." 
                      className="flex-1 px-3 py-2 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          sendMessage(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="icon" variant="default">
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* ARIA Voice Assistant with Hotword - Centered Bottom */}
        <VoiceAssistantWithHotword 
          onCommand={(cmd) => {
            sendMessage(cmd);
          }}
        />
      </div>
    </>
  );
}

// Router wrapper para subrotas
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
