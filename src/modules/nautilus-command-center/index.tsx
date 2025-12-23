/**
 * NAUTILUS COMMAND CENTER - Módulo Unificado
 * Fusão de: Command Center, Dashboard Executivo, Nautilus Command, Centro de Operações
 * 
 * Central de Inteligência e Operações em Tempo Real
 */

import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, Activity, TrendingUp, Brain, Bell, Settings,
  RefreshCw, Sun, Moon, Maximize2, Download, Ship, Users, 
  Wrench, DollarSign, Shield, AlertTriangle
} from "lucide-react";

// Seções do módulo
import { VisaoGeralSection } from "./sections/VisaoGeralSection";
import { OperacoesSection } from "./sections/OperacoesSection";
import { ExecutivoSection } from "./sections/ExecutivoSection";
import { IASection } from "./sections/IASection";
import { AlertasSection } from "./sections/AlertasSection";
import { ConfigSection } from "./sections/ConfigSection";

// Hook de IA unificado
import { useUnifiedCommandAI } from "./hooks/useUnifiedCommandAI";

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
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "operations", label: "Operações", icon: Activity },
  { id: "executive", label: "Executivo", icon: TrendingUp },
  { id: "ai", label: "IA", icon: Brain },
  { id: "alerts", label: "Alertas", icon: Bell },
  { id: "settings", label: "Config", icon: Settings },
];

export default function NautilusCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains("dark")
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    fleet: { total: 12, active: 11, maintenance: 1, alerts: 3 },
    crew: { total: 247, onboard: 198, onLeave: 49, expiringCerts: 8 },
    maintenance: { scheduled: 15, overdue: 2, completed: 45, efficiency: 94.2 },
    inventory: { lowStock: 5, pendingOrders: 12, value: 2450000 },
    compliance: { score: 96.8, pendingAudits: 2, expiringDocs: 6 }
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const { isConnected, aiStatus } = useUnifiedCommandAI();

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
      console.warn("Error loading system data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystemData();

    // Real-time subscriptions
    const channel = supabase
      .channel("command-center-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vessels" }, () => loadSystemData())
      .on("postgres_changes", { event: "*", schema: "public", table: "crew_members" }, () => loadSystemData())
      .subscribe();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadSystemData, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadSystemData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemData();
    toast.success("Dados atualizados");
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

  const alertCounts = {
    critical: alerts.filter(a => a.severity === "critical" && !a.resolved).length,
    high: alerts.filter(a => a.severity === "high" && !a.resolved).length,
    total: alerts.filter(a => !a.resolved).length
  };

  return (
    <>
      <Helmet>
        <title>Nautilus Command Center | Central de Inteligência</title>
        <meta name="description" content="Central de Inteligência e Operações em Tempo Real - Dashboard unificado com IA" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Superior */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/60">
                <Ship className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Nautilus Command Center</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Central de Inteligência e Operações
                </p>
              </div>
            </div>

            {/* Status em tempo real */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Sistema Online' : 'Conectando...'}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Última sync: {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Badge>
              {alertCounts.critical > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {alertCounts.critical} crítico(s)
                </Badge>
              )}
            </div>

            {/* Ações do header */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hidden lg:flex">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0">
                <Brain className="h-3 w-3 mr-1" />
                IA Ativa
              </Badge>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="p-4 lg:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Navegação por Tabs */}
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Seções */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="overview" className="mt-0">
                  <VisaoGeralSection 
                    systemStatus={systemStatus} 
                    isLoading={isLoading}
                    onNavigate={setActiveTab}
                  />
                </TabsContent>

                <TabsContent value="operations" className="mt-0">
                  <OperacoesSection 
                    systemStatus={systemStatus}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="executive" className="mt-0">
                  <ExecutivoSection 
                    systemStatus={systemStatus}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <IASection />
                </TabsContent>

                <TabsContent value="alerts" className="mt-0">
                  <AlertasSection 
                    alerts={alerts}
                    setAlerts={setAlerts}
                  />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <ConfigSection />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>
    </>
  );
}
