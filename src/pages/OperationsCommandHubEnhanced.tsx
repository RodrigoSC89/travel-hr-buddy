/**
 * Operations Command Hub Enhanced
 * Centro de operações marítimas com UX premium
 * 
 * Features:
 * - Onboarding interativo para novos usuários
 * - KPIs em tempo real com drill-down
 * - Alertas acionáveis
 * - Ações rápidas contextuais
 */

import React, { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Anchor, Ship, Map, Target, Package, Compass, Loader2,
  AlertTriangle, CheckCircle2, Clock, Users, Fuel, Navigation,
  Calendar, ArrowRight, Bell, TrendingUp, Activity, Zap,
  MapPin, Waves, Wind, Thermometer, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ModuleOnboarding, 
  QuickActionsBar, 
  InteractiveKPICard,
  ActionableAlert,
  ActionableAlertList 
} from "@/components/ui/module-enhancements";
import { useOperationsCommandData } from "@/hooks/useOperationsCommandData";

// Lazy load original components
const MaritimeCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
const FleetCommandCenter = lazy(() => import("@/pages/FleetCommandCenter"));
const VoyageCommandCenter = lazy(() => import("@/pages/VoyageCommandCenter"));
const MissionCommandCenter = lazy(() => import("@/pages/MissionCommandCenter"));
const LogisticsCommandPage = lazy(() => import("@/pages/LogisticsCommandPage"));
const MissionControlCenter = lazy(() => import("@/modules/operations/components/MissionControlCenter"));
const FleetPremiumCommand = lazy(() => import("@/modules/fleet-hub/components/FleetCommandCenter"));
const AnalyticsDashboard = lazy(() => import("@/modules/analytics/components/AnalyticsDashboard"));
const OperationsCommandDashboard = lazy(() => import("@/modules/operations-command/components/OperationsCommandDashboard"));
const VesselContractsAdvanced = lazy(() => import("@/components/premium/VesselContractsAdvanced"));

function TabLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando módulo...</span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "command", label: "Comando", icon: Compass, emoji: "🎛️", description: "Centro de Comando Premium", badge: "PREMIUM" },
  { id: "overview", label: "Visão Geral", icon: Activity, emoji: "📊", description: "Dashboard operacional" },
  { id: "missions", label: "Missões", icon: Target, emoji: "🎯", description: "Controle de viagens e missões", badge: "NEW" },
  { id: "fleetpremium", label: "Frota Premium", icon: Ship, emoji: "🚢", description: "Centro de controle da frota", badge: "PREMIUM" },
  { id: "analytics", label: "BI Analytics", icon: TrendingUp, emoji: "📈", description: "Business Intelligence", badge: "NOVO" },
  { id: "contracts", label: "Contratos", icon: Navigation, emoji: "📋", description: "Charter Party & Vessel Contracts", badge: "AI" },
  { id: "maritime", label: "Maritime", icon: Anchor, emoji: "⚓", description: "Tripulação, certificações" },
  { id: "fleet", label: "Fleet", icon: Ship, emoji: "🚢", description: "Embarcações, manutenção" },
  { id: "voyage", label: "Voyage", icon: Map, emoji: "🗺️", description: "Planejamento de viagens", badge: "AI" },
  { id: "logistics", label: "Logistics", icon: Package, emoji: "📦", description: "Cargas, fornecedores" },
];

// Onboarding steps
const onboardingSteps = [
  {
    title: "Bem-vindo ao Operations Command",
    description: "Centro unificado para gerenciar todas as operações marítimas da sua frota.",
    icon: <Compass className="h-8 w-8 text-primary" />
  },
  {
    title: "Visão Geral em Tempo Real",
    description: "Monitore KPIs críticos, alertas pendentes e status da frota em um único lugar.",
    icon: <Activity className="h-8 w-8 text-primary" />
  },
  {
    title: "Ações Rápidas",
    description: "Execute tarefas comuns com um clique: criar viagem, registrar manutenção, alocar tripulação.",
    icon: <Zap className="h-8 w-8 text-primary" />
  },
  {
    title: "Alertas Inteligentes",
    description: "Receba notificações prioritárias e resolva problemas diretamente do dashboard.",
    icon: <Bell className="h-8 w-8 text-primary" />
  }
];

// Quick actions
const quickActions = [
  { id: "new-voyage", label: "Nova Viagem", icon: <Map className="h-4 w-4" />, badge: 0 },
  { id: "crew-schedule", label: "Escalar Tripulação", icon: <Users className="h-4 w-4" />, badge: 3 },
  { id: "maintenance", label: "Ordem de Serviço", icon: <Ship className="h-4 w-4" />, badge: 2 },
  { id: "fuel-report", label: "Relatório Combustível", icon: <Fuel className="h-4 w-4" />, badge: 0 },
  { id: "checklist", label: "Checklist", icon: <CheckCircle2 className="h-4 w-4" />, badge: 5 },
];

// KPIs will be calculated from real data inside component

// Mock alerts
const operationalAlerts = [
  {
    id: "1",
    title: "Certificado expirando em 5 dias",
    description: "SOLAS da embarcação Nautilus Star expira em 12/02/2026",
    severity: "high" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    module: "Compliance",
    actions: [
      { label: "Renovar", onClick: () => toast.success("Solicitação de renovação enviada") },
      { label: "Ver Detalhes", onClick: () => toast.info("Abrindo detalhes...") }
    ]
  },
  {
    id: "2",
    title: "Manutenção preventiva pendente",
    description: "Motor principal do Nautilus Explorer - 50h para limite",
    severity: "medium" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    module: "Manutenção",
    actions: [
      { label: "Agendar", onClick: () => toast.success("Abrindo agenda...") },
      { label: "Adiar", onClick: () => toast.info("Adiamento registrado") }
    ]
  },
  {
    id: "3",
    title: "Tripulante com documento vencido",
    description: "João Silva - Certificado STCW vencido há 2 dias",
    severity: "high" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    module: "RH",
    actions: [
      { label: "Notificar", onClick: () => toast.success("Notificação enviada") },
      { label: "Substituir", onClick: () => toast.info("Abrindo escala...") }
    ]
  },
  {
    id: "4",
    title: "Condições meteorológicas adversas",
    description: "Alerta de tempestade na rota Santos-Paranaguá",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    module: "Navegação",
    actions: [
      { label: "Ver Previsão", onClick: () => toast.info("Abrindo mapa...") }
    ]
  }
];

// Weather widget data
const weatherData = {
  location: "Porto de Santos",
  temperature: 28,
  condition: "Parcialmente Nublado",
  wind: "15 nós NE",
  waves: "1.2m",
  visibility: "10 km"
};

export default function OperationsCommandHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Real data from Supabase
  const { voyages, missions, vessels, ports, metrics, isLoading: dataLoading } = useOperationsCommandData();

  // Build KPIs from real data
  const operationalKPIs = useMemo(() => [
    {
      title: "Embarcações Ativas",
      value: String(metrics.operationalVessels),
      subtitle: `de ${metrics.totalVessels} na frota`,
      change: metrics.operationalVessels > 0 ? 2 : 0,
      trend: "up" as const,
      icon: <Ship className="h-5 w-5" />,
      details: [
        { label: "Em operação", value: String(metrics.operationalVessels) },
        { label: "Total", value: String(metrics.totalVessels) },
        { label: "Portos", value: String(metrics.totalPorts) }
      ]
    },
    {
      title: "Viagens em Andamento",
      value: String(metrics.activeVoyages),
      subtitle: `${metrics.plannedVoyages} planejadas`,
      change: metrics.activeVoyages,
      trend: metrics.activeVoyages > 0 ? "up" as const : "stable" as const,
      icon: <Navigation className="h-5 w-5" />,
      details: [
        { label: "Ativas", value: String(metrics.activeVoyages) },
        { label: "Planejadas", value: String(metrics.plannedVoyages) },
        { label: "Completas", value: String(metrics.completedVoyages) }
      ]
    },
    {
      title: "Missões Ativas",
      value: String(metrics.activeMissions),
      subtitle: `${missions.length} total registradas`,
      change: metrics.activeMissions,
      trend: metrics.activeMissions > 0 ? "up" as const : "stable" as const,
      icon: <Target className="h-5 w-5" />,
      details: [
        { label: "Ativas", value: String(metrics.activeMissions) },
        { label: "Total", value: String(missions.length) },
        { label: "Planejadas", value: String(missions.filter((m: any) => m.status === "planning").length) }
      ]
    },
    {
      title: "Portos Disponíveis",
      value: String(metrics.totalPorts),
      subtitle: "locais operacionais",
      change: 0,
      trend: "stable" as const,
      icon: <MapPin className="h-5 w-5" />,
      details: [
        { label: "Total", value: String(ports.length) },
        { label: "Ativos", value: String(ports.filter((p: any) => p.status === "active").length) },
        { label: "Países", value: String(new Set(ports.map((p: any) => p.country)).size) }
      ]
    }
  ], [metrics, missions, ports, vessels]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("operations-command-onboarding");
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
    localStorage.setItem("operations-command-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao Operations Command! 🚢");
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    toast.info(`Executando: ${action?.label}`);
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast.success("Alerta arquivado");
  };

  const activeAlerts = operationalAlerts.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <ModuleOnboarding
            moduleName="Operations Command"
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Operations Command
                <Badge variant="secondary" className="ml-2">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Centro unificado de operações marítimas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Atualizado há 2 min
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
              <Compass className="h-4 w-4 mr-2" />
              Tour
            </Button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            {TABS.slice(0, 6).map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.emoji}</span>
                  {tab.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Command Center Tab - PREMIUM */}
          <TabsContent value="command" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <OperationsCommandDashboard />
            </Suspense>
          </TabsContent>

          {/* Overview Tab - NEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPIs Row - NO staggered animations to prevent flickering */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {operationalKPIs.map((kpi) => (
                <InteractiveKPICard key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Alertas Prioritários
                  </h3>
                  <Badge variant="outline">{activeAlerts.length} pendentes</Badge>
                </div>
                <ActionableAlertList
                  alerts={activeAlerts}
                  onDismiss={handleDismissAlert}
                  emptyMessage="Nenhum alerta pendente. Sistema operando normalmente."
                />
              </div>

              {/* Weather & Status Column */}
              <div className="space-y-4">
                {/* Weather Card */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Waves className="h-4 w-4 text-blue-500" />
                      Condições Marítimas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">{weatherData.location}</span>
                      <Badge variant="secondary">{weatherData.condition}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span>{weatherData.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Wind className="h-4 w-4 text-blue-500" />
                        <span>{weatherData.wind}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Waves className="h-4 w-4 text-cyan-500" />
                        <span>Ondas: {weatherData.waves}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>Vis: {weatherData.visibility}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fleet Status Mini */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Ship className="h-4 w-4 text-primary" />
                      Status da Frota
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Em Operação</span>
                        <span className="font-medium text-green-600">10</span>
                      </div>
                      <Progress value={66} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Manutenção</span>
                        <span className="font-medium text-yellow-600">2</span>
                      </div>
                      <Progress value={13} className="h-2 [&>div]:bg-yellow-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Docadas</span>
                        <span className="font-medium text-blue-600">3</span>
                      </div>
                      <Progress value={20} className="h-2 [&>div]:bg-blue-500" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setActiveTab("fleet")}>
                      Ver Detalhes da Frota
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Próximos Eventos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { time: "14:00", event: "Chegada - Nautilus Star", type: "arrival" },
                      { time: "16:30", event: "Partida - Nautilus Explorer", type: "departure" },
                      { time: "18:00", event: "Troca de Turno", type: "crew" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="min-w-[50px] justify-center">
                          {item.time}
                        </Badge>
                        <span className="flex-1 truncate">{item.event}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Missions Control Center - Premium */}
          <TabsContent value="missions" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <MissionControlCenter />
            </Suspense>
          </TabsContent>

          {/* Fleet Premium Command Center */}
          <TabsContent value="fleetpremium" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <FleetPremiumCommand />
            </Suspense>
          </TabsContent>

          {/* Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AnalyticsDashboard />
            </Suspense>
          </TabsContent>

          {/* Maritime Command Tab */}
          <TabsContent value="maritime" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <MaritimeCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Fleet Command Tab */}
          <TabsContent value="fleet" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <FleetCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Voyage Command Tab */}
          <TabsContent value="voyage" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <VoyageCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Mission Command Tab */}
          <TabsContent value="mission" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <MissionCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Logistics Command Tab */}
          <TabsContent value="logistics" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <LogisticsCommandPage />
            </Suspense>
          </TabsContent>

          {/* Vessel Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <VesselContractsAdvanced />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
