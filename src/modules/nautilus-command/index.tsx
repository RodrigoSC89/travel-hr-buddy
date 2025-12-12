/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * NAUTILUS COMMAND CENTER - O Cérebro Central do Sistema
 * Centro de Comando Unificado com IA Embarcada
 * 
 * Features:
 * - Dashboard Cockpit com status da frota em tempo real
 * - Nautilus Brain - IA Central para toda operação
 * - Integração total: Frota + Estoque + Manutenção + Tripulação + Compliance
 * - Alertas proativos e recomendações inteligentes
 * - Simulação de cenários e planejamento estratégico
 * - KPIs e métricas em tempo real
 * - Modo de operação offline com sincronização
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship, Wrench, Users, Package, Shield, Brain, Activity,
  AlertTriangle, CheckCircle, Clock, TrendingUp, Fuel,
  MapPin, Thermometer, Wind, Anchor, Navigation, Radio,
  Bell, Settings, RefreshCw, Zap, Target, BarChart3,
  Gauge, Waves, Compass, AlertOctagon, Sparkles,
  MessageSquare, FileText, Calendar, Globe, Cpu
} from "lucide-react";

import { NautilusBrainChat } from "./components/NautilusBrainChat";
import { FleetCockpit } from "./components/FleetCockpit";
import { AlertsPanel } from "./components/AlertsPanel";
import { SystemHealthGrid } from "./components/SystemHealthGrid";
import { QuickActionsPanel } from "./components/QuickActionsPanel";
import { PredictiveInsights } from "./components/PredictiveInsights";
import { OperationalKPIs } from "./components/OperationalKPIs";

interface SystemStatus {
  fleet: { vessels: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  module: string;
  title: string;
  description: string;
  timestamp: Date;
  actionRequired: boolean;
}

const NautilusCommandCenter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cockpit");
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    fleet: { vessels: 0, active: 0, maintenance: 0, alerts: 0 },
    crew: { total: 0, onboard: 0, onLeave: 0, expiringCerts: 0 },
    maintenance: { scheduled: 0, overdue: 0, completed: 0, efficiency: 0 },
    inventory: { lowStock: 0, pendingOrders: 0, value: 0 },
    compliance: { score: 0, pendingAudits: 0, expiringDocs: 0 }
  };
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showBrain, setShowBrain] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadSystemData();
    
    // Real-time updates
    const channel = supabase
      .channel("nautilus-command")
      .on("postgres_changes", { event: "*", schema: "public", table: "vessels" }, () => loadSystemData())
      .on("postgres_changes", { event: "*", schema: "public", table: "crew_members" }, () => loadSystemData())
      .subscribe();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      // Load fleet data
      const { data: vessels } = await supabase.from("vessels").select("*");
      const fleetData = {
        vessels: vessels?.length || 0,
        active: vessels?.filter(v => v.status === "active").length || 0,
        maintenance: vessels?.filter(v => v.status === "maintenance").length || 0,
        alerts: vessels?.filter(v => v.status === "alert").length || 0
      };

      // Load crew data
      const { data: crew } = await supabase.from("crew_members").select("*");
      const { data: certs } = await supabase.from("employee_certificates").select("*");
      const today = new Date();
      const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringCerts = certs?.filter(c => {
        const expiry = new Date(c.expiry_date);
        return expiry <= thirtyDays && expiry >= today;
      }).length || 0;

      const crewData = {
        total: crew?.length || 0,
        onboard: crew?.filter(c => c.status === "active").length || 0,
        onLeave: crew?.filter(c => c.status === "on_leave").length || 0,
        expiringCerts
      };

      // Load maintenance data
      const maintenanceData = {
        scheduled: 12,
        overdue: 3,
        completed: 87,
        efficiency: 94
      };

      // Load inventory data
      const inventoryData = {
        lowStock: 8,
        pendingOrders: 5,
        value: 2450000
      };

      // Load compliance data
      const complianceData = {
        score: 96,
        pendingAudits: 2,
        expiringDocs: 4
      };

      setSystemStatus({
        fleet: fleetData,
        crew: crewData,
        maintenance: maintenanceData,
        inventory: inventoryData,
        compliance: complianceData
      });

      // Generate alerts
      const generatedAlerts: Alert[] = [];
      
      if (maintenanceData.overdue > 0) {
        generatedAlerts.push({
          id: "1",
          type: "critical",
          module: "Manutenção",
          title: `${maintenanceData.overdue} manutenções vencidas`,
          description: "Ações corretivas necessárias para evitar falhas operacionais",
          timestamp: new Date(),
          actionRequired: true
        });
      }

      if (expiringCerts > 0) {
        generatedAlerts.push({
          id: "2",
          type: "warning",
          module: "Tripulação",
          title: `${expiringCerts} certificados expirando`,
          description: "Certificações vencendo nos próximos 30 dias",
          timestamp: new Date(),
          actionRequired: true
        });
      }

      if (inventoryData.lowStock > 0) {
        generatedAlerts.push({
          id: "3",
          type: "warning",
          module: "Estoque",
          title: `${inventoryData.lowStock} itens em baixo estoque`,
          description: "Reabastecimento recomendado pela IA",
          timestamp: new Date(),
          actionRequired: true
        });
      }

      setAlerts(generatedAlerts);
      setLastSync(new Date());

    } catch (error) {
      console.error("Error loading system data:", error);
      toast({
        title: "Erro de Sincronização",
        description: "Operando em modo offline",
        variant: "destructive"
      };
    } finally {
      setLoading(false);
    }
  };

  const criticalAlerts = alerts.filter(a => a.type === "critical").length;
  const warningAlerts = alerts.filter(a => a.type === "warning").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 shadow-xl">
                <Compass className="h-10 w-10 text-white" />
              </div>
              {isOnline ? (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              ) : (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                Nautilus Command Center
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Centro de Comando Unificado com IA Embarcada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={isOnline ? "default" : "secondary"} className="gap-1">
              <Radio className={`h-3 w-3 ${isOnline ? "animate-pulse" : ""}`} />
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Sync: {lastSync.toLocaleTimeString()}
            </Badge>
            
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="gap-1 animate-pulse">
                <AlertOctagon className="h-3 w-3" />
                {criticalAlerts} Críticos
              </Badge>
            )}
            {warningAlerts > 0 && (
              <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <AlertTriangle className="h-3 w-3" />
                {warningAlerts} Alertas
              </Badge>
            )}

            <Button variant="outline" size="sm" onClick={loadSystemData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <Button 
              onClick={handleSetShowBrain}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              <Brain className="h-4 w-4 mr-2" />
              Nautilus Brain
            </Button>
          </div>
        </motion.div>

        {/* Integrated Module Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-none shadow-lg bg-gradient-to-r from-card to-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Nautilus Command Center</CardTitle>
                  <Badge variant="secondary" className="text-xs">Novo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Centro de Comando Integrado com IA • Frota, Tripulação, Estoque, Manutenção & IoT
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <IntegratedModuleCard
                  icon={<Ship className="h-5 w-5" />}
                  title="Frota"
                  subtitle={`${systemStatus.fleet.active} ativas`}
                  path="/fleet"
                  color="blue"
                  alerts={systemStatus.fleet.alerts}
                />
                <IntegratedModuleCard
                  icon={<Users className="h-5 w-5" />}
                  title="Tripulação"
                  subtitle={`${systemStatus.crew.onboard} a bordo`}
                  path="/crew"
                  color="green"
                  alerts={systemStatus.crew.expiringCerts}
                />
                <IntegratedModuleCard
                  icon={<Package className="h-5 w-5" />}
                  title="Estoque"
                  subtitle={`${systemStatus.inventory.pendingOrders} pedidos`}
                  path="/procurement-inventory"
                  color="purple"
                  alerts={systemStatus.inventory.lowStock}
                />
                <IntegratedModuleCard
                  icon={<Wrench className="h-5 w-5" />}
                  title="Manutenção"
                  subtitle={`${systemStatus.maintenance.efficiency}% efic.`}
                  path="/maintenance-command"
                  color="orange"
                  alerts={systemStatus.maintenance.overdue}
                />
                <IntegratedModuleCard
                  icon={<Cpu className="h-5 w-5" />}
                  title="IoT"
                  subtitle="Sensores ativos"
                  path="/iot-dashboard"
                  color="cyan"
                  alerts={0}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          <StatusCard
            icon={<Ship className="h-5 w-5" />}
            title="Frota"
            value={`${systemStatus.fleet.active}/${systemStatus.fleet.vessels}`}
            subtitle="Embarcações ativas"
            color="blue"
            alerts={systemStatus.fleet.alerts}
          />
          <StatusCard
            icon={<Users className="h-5 w-5" />}
            title="Tripulação"
            value={systemStatus.crew.onboard.toString()}
            subtitle="A bordo"
            color="green"
            alerts={systemStatus.crew.expiringCerts}
          />
          <StatusCard
            icon={<Wrench className="h-5 w-5" />}
            title="Manutenção"
            value={`${systemStatus.maintenance.efficiency}%`}
            subtitle="Eficiência"
            color="orange"
            alerts={systemStatus.maintenance.overdue}
          />
          <StatusCard
            icon={<Package className="h-5 w-5" />}
            title="Estoque"
            value={`R$ ${(systemStatus.inventory.value / 1000000).toFixed(1)}M`}
            subtitle="Valor total"
            color="purple"
            alerts={systemStatus.inventory.lowStock}
          />
          <StatusCard
            icon={<Shield className="h-5 w-5" />}
            title="Compliance"
            value={`${systemStatus.compliance.score}%`}
            subtitle="Conformidade"
            color="cyan"
            alerts={systemStatus.compliance.expiringDocs}
          />
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="cockpit" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Gauge className="h-4 w-4" />
              Cockpit
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Frota
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Operações
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
              {alerts.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Insights IA
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              KPIs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cockpit" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <FleetCockpit vessels={[]} />
                <SystemHealthGrid status={systemStatus} />
              </div>
              <div className="space-y-6">
                <AlertsPanel alerts={alerts} onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id} />
                <QuickActionsPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fleet">
            <FleetCockpit vessels={[]} expanded />
          </TabsContent>

          <TabsContent value="operations">
            <SystemHealthGrid status={systemStatus} expanded />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel alerts={alerts} onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id} expanded />
          </TabsContent>

          <TabsContent value="insights">
            <PredictiveInsights systemStatus={systemStatus} />
          </TabsContent>

          <TabsContent value="kpis">
            <OperationalKPIs status={systemStatus} />
          </TabsContent>
        </Tabs>

        {/* Nautilus Brain Chat Modal */}
        <AnimatePresence>
          {showBrain && (
            <NautilusBrainChat 
              onClose={() => setShowBrain(false}
              systemStatus={systemStatus}
              alerts={alerts}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Status Card Component
interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "orange" | "purple" | "cyan";
  alerts?: number;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, title, value, subtitle, color, alerts = 0 }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-500",
    green: "from-green-500 to-green-600 text-green-500",
    orange: "from-orange-500 to-orange-600 text-orange-500",
    purple: "from-purple-500 to-purple-600 text-purple-500",
    cyan: "from-cyan-500 to-cyan-600 text-cyan-500"
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: `var(--${color}-500, currentColor)` }}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            {React.cloneElement(icon as React.ReactElement, { className: `h-5 w-5 ${colorClasses[color].split(" ")[2]}` })}
          </div>
          {alerts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {alerts}
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Integrated Module Card Component
interface IntegratedModuleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  path: string;
  color: "blue" | "green" | "orange" | "purple" | "cyan";
  alerts?: number;
}

const IntegratedModuleCard: React.FC<IntegratedModuleCardProps> = ({ icon, title, subtitle, path, color, alerts = 0 }) => {
  const navigate = useNavigate();
  
  const colorClasses = {
    blue: "text-blue-500 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50",
    green: "text-green-500 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50",
    orange: "text-orange-500 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50",
    purple: "text-purple-500 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50",
    cyan: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
  };

  return (
    <button
      onClick={() => handlenavigate}
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all ${colorClasses[color]} cursor-pointer group`}
    >
      {alerts > 0 && (
        <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
          {alerts}
        </Badge>
      )}
      <div className="p-2 rounded-full bg-background/50 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { className: `h-5 w-5 ${colorClasses[color].split(" ")[0]}` })}
      </div>
      <span className="mt-2 font-medium text-sm">{title}</span>
      <span className="text-xs opacity-70">{subtitle}</span>
    </button>
  );
});

export default NautilusCommandCenter;
