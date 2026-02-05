/**
 * Tracking & Telemetry Hub Enhanced
 * Centro de rastreamento com UX premium
 * 
 * Features:
 * - Dashboard de telemetria em tempo real
 * - Mapa interativo da frota
 * - Alertas de posição e status
 * - Histórico de rotas
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Satellite, Activity, Radio, AlertTriangle, History, Loader2,
  MapPin, Navigation, Anchor, Ship, Wifi, Signal, Compass,
  Clock, Eye, Target, Zap, Globe, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ModuleOnboarding, 
  QuickActionsBar, 
  InteractiveKPICard,
  ActionableAlertList 
} from "@/components/ui/module-enhancements";

// Lazy loads
const Telemetria360 = lazy(() => import("@/pages/Telemetria360"));
const PredictiveTelemetry = lazy(() => import("@/pages/PredictiveTelemetry"));
const DGNSSTracking = lazy(() => import("@/pages/DGNSSTracking"));
const TrackingAlerts = lazy(() => import("@/pages/tracking/TrackingAlerts"));
const FleetTrackingDashboard = lazy(() => import("@/modules/tracking/components/FleetTrackingDashboard"));
const VesselAlertsCenter = lazy(() => import("@/modules/tracking/components/VesselAlertsCenter"));
const TrackingCommandCenter = lazy(() => import("@/modules/tracking-telemetry/components/TrackingCommandCenter"));

// Enterprise Components - Phase 4
import { 
  TrackingCommandCenter as TrackingCommandEnt,
  AlertsNotificationCenter
} from "@/components/enterprise";

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando telemetria...</span>
    </div>
  );
}

const TABS = [
  { id: "command", label: "Comando", icon: Activity, badge: "PREMIUM" },
  { id: "tracking-ent", label: "Tracking", icon: Navigation, badge: "NEW" },
  { id: "alerts-ent", label: "Alertas", icon: AlertTriangle, badge: "NEW" },
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "fleet", label: "Frota", icon: Ship },
  { id: "map", label: "Mapa", icon: Globe },
  { id: "realtime", label: "Tempo Real", icon: Radio },
  { id: "predictive", label: "Preditiva", icon: Target, badge: "AI" },
  { id: "alerts", label: "Alertas Hub", icon: AlertTriangle },
  { id: "geofence", label: "Geofence", icon: MapPin },
  { id: "history", label: "Histórico", icon: History },
];

// Onboarding
const onboardingSteps = [
  {
    title: "Bem-vindo ao Tracking Center",
    description: "Monitore a posição e telemetria de toda a sua frota em tempo real.",
    icon: <Satellite className="h-8 w-8 text-primary" />
  },
  {
    title: "Mapa Interativo",
    description: "Visualize todas as embarcações no mapa com informações detalhadas.",
    icon: <Globe className="h-8 w-8 text-primary" />
  },
  {
    title: "Alertas de Posição",
    description: "Receba notificações de desvio de rota, entrada em zonas e mais.",
    icon: <AlertTriangle className="h-8 w-8 text-primary" />
  },
  {
    title: "Telemetria Preditiva",
    description: "IA analisa padrões e prevê comportamentos para otimização.",
    icon: <Target className="h-8 w-8 text-primary" />
  }
];

// Quick actions
const quickActions = [
  { id: "view-map", label: "Ver Mapa", icon: <Globe className="h-4 w-4" />, badge: 0 },
  { id: "track-vessel", label: "Rastrear Embarcação", icon: <Navigation className="h-4 w-4" />, badge: 0 },
  { id: "alerts", label: "Alertas Ativos", icon: <AlertTriangle className="h-4 w-4" />, badge: 3 },
  { id: "export-route", label: "Exportar Rota", icon: <History className="h-4 w-4" />, badge: 0 },
  { id: "satellite-status", label: "Status Satélite", icon: <Satellite className="h-4 w-4" />, badge: 0 },
];

// Telemetry KPIs
const telemetryKPIs = [
  {
    title: "Embarcações Online",
    value: "14",
    subtitle: "de 15 na frota",
    change: 0,
    trend: "stable" as const,
    icon: <Ship className="h-5 w-5" />,
    details: [
      { label: "Sinal forte", value: "12" },
      { label: "Sinal médio", value: "2" },
      { label: "Offline", value: "1" }
    ]
  },
  {
    title: "Cobertura Satélite",
    value: "98.5%",
    subtitle: "últimas 24h",
    change: 0.3,
    trend: "up" as const,
    icon: <Satellite className="h-5 w-5" />,
    details: [
      { label: "Iridium", value: "99%" },
      { label: "VSAT", value: "98%" },
      { label: "Inmarsat", value: "97%" }
    ]
  },
  {
    title: "Posições/Hora",
    value: "4,230",
    subtitle: "média por embarcação: 302",
    change: 12,
    trend: "up" as const,
    icon: <MapPin className="h-5 w-5" />,
    details: [
      { label: "AIS", value: "2,800" },
      { label: "GPS", value: "1,200" },
      { label: "DGNSS", value: "230" }
    ]
  },
  {
    title: "Alertas Hoje",
    value: "7",
    subtitle: "3 críticos resolvidos",
    change: -2,
    trend: "down" as const,
    icon: <AlertTriangle className="h-5 w-5" />,
    details: [
      { label: "Desvio rota", value: "2" },
      { label: "Zona restrita", value: "1" },
      { label: "Sinal perdido", value: "4" }
    ]
  }
];

// Tracking alerts
const trackingAlerts = [
  {
    id: "1",
    title: "Desvio de rota detectado",
    description: "Nautilus Pioneer desviou 3.2nm da rota planejada",
    severity: "high" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    module: "Navegação",
    actions: [
      { label: "Ver no Mapa", onClick: () => toast.info("Abrindo mapa...") },
      { label: "Contatar", onClick: () => toast.info("Abrindo comunicação...") }
    ]
  },
  {
    id: "2",
    title: "Sinal intermitente",
    description: "Nautilus Explorer com perda de sinal frequente na última hora",
    severity: "medium" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    module: "Satélite",
    actions: [
      { label: "Diagnóstico", onClick: () => toast.info("Executando diagnóstico...") }
    ]
  },
  {
    id: "3",
    title: "ETA atualizado",
    description: "Nautilus Star chegará 2h antes do previsto em Santos",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    module: "Viagem",
    actions: []
  }
];

// Fleet status
const fleetStatus = [
  { name: "Nautilus Star", status: "navegando", position: "23°58'S 46°18'W", speed: "12.5 kn", heading: "045°" },
  { name: "Nautilus Explorer", status: "navegando", position: "25°12'S 47°52'W", speed: "10.2 kn", heading: "180°" },
  { name: "Nautilus Pioneer", status: "atracado", position: "Santos - Berço 12", speed: "0 kn", heading: "-" },
  { name: "Nautilus Voyager", status: "navegando", position: "22°54'S 43°10'W", speed: "14.8 kn", heading: "270°" },
];

export default function TrackingTelemetryHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("tracking-telemetry-onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && TABS.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("tracking-telemetry-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao Tracking Center! 📡");
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    toast.info(`Executando: ${action?.label}`);
    if (actionId === "view-map") setActiveTab("map");
    if (actionId === "alerts") setActiveTab("alerts");
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast.success("Alerta arquivado");
  };

  const activeAlerts = trackingAlerts.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showOnboarding && (
          <ModuleOnboarding
            moduleName="Tracking & Telemetry"
            steps={onboardingSteps}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header - NO motion to prevent flickering */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5">
              <Satellite className="h-8 w-8 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Tracking & Telemetry
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Signal className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Monitoramento e rastreamento em tempo real
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Atualizado: agora
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
              <Satellite className="h-4 w-4 mr-2" />
              Tour
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 h-auto p-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Command Center Tab */}
          <TabsContent value="command" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <TrackingCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Enterprise Components - Phase 4 */}
          <TabsContent value="tracking-ent" className="space-y-6 mt-6">
            <TrackingCommandEnt />
          </TabsContent>

          <TabsContent value="alerts-ent" className="space-y-6 mt-6">
            <AlertsNotificationCenter />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* KPIs - NO staggered animations to prevent flickering */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {telemetryKPIs.map((kpi) => (
                <InteractiveKPICard key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts + Fleet Status */}
              <div className="lg:col-span-2 space-y-6">
                {/* Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Alertas de Rastreamento
                    </h3>
                    <Badge variant="outline">{activeAlerts.length} ativos</Badge>
                  </div>
                  <ActionableAlertList
                    alerts={activeAlerts}
                    onDismiss={handleDismissAlert}
                    emptyMessage="Nenhum alerta de rastreamento ativo."
                  />
                </div>

                {/* Fleet Status Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Ship className="h-4 w-4" />
                        Status da Frota
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("map")}>
                        Ver no Mapa
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fleetStatus.map((vessel, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className={`w-3 h-3 rounded-full ${
                            vessel.status === "navegando" ? "bg-green-500 animate-pulse" : "bg-blue-500"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{vessel.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{vessel.position}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-medium">{vessel.speed}</p>
                            <p className="text-muted-foreground">{vessel.heading}</p>
                          </div>
                          <Badge variant={vessel.status === "navegando" ? "default" : "secondary"}>
                            {vessel.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Satellite Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Satellite className="h-4 w-4 text-cyan-500" />
                      Status dos Satélites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "Iridium", status: "online", signal: 98 },
                      { name: "VSAT", status: "online", signal: 95 },
                      { name: "Inmarsat", status: "online", signal: 92 },
                      { name: "GPS L1/L2", status: "online", signal: 99 }
                    ].map((sat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            {sat.name}
                          </span>
                          <span className="font-medium">{sat.signal}%</span>
                        </div>
                        <Progress value={sat.signal} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Connection Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-primary" />
                      Conectividade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-green-500/10">
                        <p className="text-2xl font-bold text-green-600">14</p>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-500/10">
                        <p className="text-2xl font-bold text-red-600">1</p>
                        <p className="text-xs text-muted-foreground">Offline</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime médio</span>
                        <span className="font-medium">99.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latência média</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Map Preview */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Visão Rápida
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-blue-900 to-blue-950 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white/80">
                          <Globe className="h-8 w-8 mx-auto mb-1 opacity-50" />
                          <p className="text-xs">Clique para expandir</p>
                        </div>
                      </div>
                      {/* Simulated vessel dots */}
                      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
                      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full rounded-none"
                      onClick={() => setActiveTab("map")}
                    >
                      Abrir Mapa Completo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fleet" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <FleetTrackingDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <Telemetria360 />
            </Suspense>
          </TabsContent>

          <TabsContent value="realtime" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <DGNSSTracking />
            </Suspense>
          </TabsContent>

          <TabsContent value="predictive" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <PredictiveTelemetry />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <TrackingAlerts />
            </Suspense>
          </TabsContent>

          <TabsContent value="geofence" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <VesselAlertsCenter />
            </Suspense>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <Telemetria360 />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
