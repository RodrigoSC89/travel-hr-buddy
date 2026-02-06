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
import { useRealActionHandlers } from "@/hooks/useRealActionHandlers";
import { NewVoyageDialog, CrewScheduleDialog, MaintenanceOrderDialog, FuelReportDialog, ChecklistDialog } from "@/components/operations/QuickActionDialogs";

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
const OperationsIntelligenceHub = lazy(() => import("@/components/premium/OperationsIntelligenceHub"));

// NEW Premium Phase 1 Components
const ProcurementWorkflowEngine = lazy(() => import("@/components/premium/operations/ProcurementWorkflowEngine"));
const OperationsGanttAdvanced = lazy(() => import("@/components/premium/operations/OperationsGanttAdvanced"));
const LogisticsIntelligenceHub = lazy(() => import("@/components/premium/operations/LogisticsIntelligenceHub"));
const VesselContractsIntelligence = lazy(() => import("@/components/premium/operations/VesselContractsIntelligence"));

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
  { id: "intelligence", label: "Intelligence", icon: Zap, emoji: "🧠", description: "Operations Intelligence Hub", badge: "AI" },
  { id: "command", label: "Comando", icon: Compass, emoji: "🎛️", description: "Centro de Comando Premium" },
  { id: "gantt", label: "Gantt", icon: Activity, emoji: "📊", description: "Gantt interativo com weather overlay", badge: "NEW" },
  { id: "procurement", label: "Procurement", icon: Target, emoji: "🛒", description: "Workflow de aprovação multinível", badge: "NEW" },
  { id: "logistics-ai", label: "Logistics", icon: Package, emoji: "📦", description: "Supply chain com IA preditiva", badge: "AI" },
  { id: "contracts-bimco", label: "Contratos", icon: Navigation, emoji: "📋", description: "BIMCO, Laytime/Demurrage", badge: "NEW" },
  { id: "overview", label: "Visão Geral", icon: Activity, emoji: "📈", description: "Dashboard operacional" },
  { id: "missions", label: "Missões", icon: Target, emoji: "🎯", description: "Controle de viagens e missões" },
  { id: "fleetpremium", label: "Frota Premium", icon: Ship, emoji: "🚢", description: "Centro de controle da frota", badge: "PREMIUM" },
  { id: "maritime", label: "Maritime", icon: Anchor, emoji: "⚓", description: "Tripulação, certificações" },
  { id: "fleet", label: "Fleet", icon: Ship, emoji: "🚢", description: "Embarcações, manutenção" },
  { id: "voyage", label: "Voyage", icon: Map, emoji: "🗺️", description: "Planejamento de viagens", badge: "AI" },
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

// Alerts are now derived from real data inside the component (no mocks)

export default function OperationsCommandHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState({ voyage: false, crew: false, maintenance: false, fuel: false, checklist: false });

  // Get active tab directly from URL - use useMemo to avoid stale closures
  const activeTab = useMemo(() => {
    const tabFromUrl = searchParams.get("tab");
    const validTab = TABS.find(t => t.id === tabFromUrl);
    return validTab ? tabFromUrl : "overview";
  }, [searchParams]);

  // Handle tab change by updating URL
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

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

  // No need for sync effects - activeTab comes directly from URL

  const handleOnboardingComplete = () => {
    localStorage.setItem("operations-command-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao Operations Command! 🚢");
  };

  // Real action handlers from hook
  const { quickActions: realQuickActions } = useRealActionHandlers();

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "new-voyage":
        setDialogOpen(p => ({ ...p, voyage: true }));
        break;
      case "crew-schedule":
        setDialogOpen(p => ({ ...p, crew: true }));
        break;
      case "maintenance":
        setDialogOpen(p => ({ ...p, maintenance: true }));
        break;
      case "fuel-report":
        setDialogOpen(p => ({ ...p, fuel: true }));
        break;
      case "checklist":
        setDialogOpen(p => ({ ...p, checklist: true }));
        break;
      default:
        toast.info(`Executando: ${actionId}`);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast.success("Alerta arquivado");
  };

  // Build alerts from real vessel/voyage data
  const operationalAlerts = useMemo(() => {
    const alerts: Array<{id: string; title: string; description: string; severity: "high" | "medium" | "info"; timestamp: Date; module: string; actions: Array<{label: string; onClick: () => void}>}> = [];
    
    // Generate alerts from real vessel data
    vessels.forEach((v: any, idx: number) => {
      if (v.status === 'maintenance') {
        alerts.push({
          id: `vessel-maint-${v.id || idx}`,
          title: `${v.name || 'Embarcação'} em manutenção`,
          description: `Embarcação ${v.name} está em manutenção programada`,
          severity: "medium",
          timestamp: new Date(v.updated_at || Date.now()),
          module: "Manutenção",
          actions: [
            { label: "Ver Detalhes", onClick: () => handleTabChange("fleet") },
          ]
        });
      }
    });

    // Alert for pending voyages
    if (metrics.plannedVoyages > 0) {
      alerts.push({
        id: "planned-voyages",
        title: `${metrics.plannedVoyages} viagens planejadas`,
        description: "Viagens aguardando aprovação ou início",
        severity: "info",
        timestamp: new Date(),
        module: "Operações",
        actions: [
          { label: "Ver Viagens", onClick: () => handleTabChange("voyage") },
        ]
      });
    }

    // Alert if no operational vessels
    if (metrics.totalVessels > 0 && metrics.operationalVessels === 0) {
      alerts.push({
        id: "no-operational",
        title: "Nenhuma embarcação operacional",
        description: "Todas as embarcações estão fora de operação",
        severity: "high",
        timestamp: new Date(),
        module: "Frota",
        actions: [
          { label: "Ver Frota", onClick: () => handleTabChange("fleet") },
        ]
      });
    }

    return alerts;
  }, [vessels, metrics, handleTabChange]);

  const activeAlerts = operationalAlerts.filter((a: any) => !dismissedAlerts.includes(a.id));

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
        <Tabs value={activeTab || "overview"} onValueChange={handleTabChange} className="space-y-6">
           <TabsList className="grid w-full grid-cols-7 h-auto p-1">
             {TABS.slice(0, 7).map((tab) => (
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

           {/* Intelligence Tab - NEW AI HUB */}
           <TabsContent value="intelligence" className="space-y-6 mt-6">
             <Suspense fallback={<TabLoadingSkeleton />}>
               <OperationsIntelligenceHub />
             </Suspense>
           </TabsContent>
 
          {/* Command Center Tab - PREMIUM */}
          <TabsContent value="command" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <OperationsCommandDashboard />
            </Suspense>
          </TabsContent>

          {/* NEW: Gantt Advanced Tab */}
          <TabsContent value="gantt" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <OperationsGanttAdvanced />
            </Suspense>
          </TabsContent>

          {/* NEW: Procurement Workflow Tab */}
          <TabsContent value="procurement" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <ProcurementWorkflowEngine />
            </Suspense>
          </TabsContent>

          {/* NEW: Logistics Intelligence Tab */}
          <TabsContent value="logistics-ai" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <LogisticsIntelligenceHub />
            </Suspense>
          </TabsContent>

          {/* NEW: Contracts BIMCO Tab */}
          <TabsContent value="contracts-bimco" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <VesselContractsIntelligence />
            </Suspense>
          </TabsContent>
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
                {/* Operations Summary Card */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-accent/10">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Waves className="h-4 w-4 text-primary" />
                      Resumo Operacional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Status Geral</span>
                      <Badge variant="secondary">
                        {metrics.operationalVessels > 0 ? "Operacional" : "Sem Operação"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Ship className="h-4 w-4 text-primary" />
                        <span>{metrics.operationalVessels} embarcações</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span>{metrics.activeVoyages} viagens</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-primary" />
                        <span>{metrics.activeMissions} missões</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{metrics.totalPorts} portos</span>
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
                        <span className="font-medium text-primary">{metrics.operationalVessels}</span>
                      </div>
                      <Progress value={metrics.totalVessels > 0 ? (metrics.operationalVessels / metrics.totalVessels) * 100 : 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Manutenção</span>
                        <span className="font-medium text-muted-foreground">{vessels.filter((v: any) => v.status === 'maintenance').length}</span>
                      </div>
                      <Progress value={metrics.totalVessels > 0 ? (vessels.filter((v: any) => v.status === 'maintenance').length / metrics.totalVessels) * 100 : 0} className="h-2 [&>div]:bg-warning" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Frota</span>
                        <span className="font-medium text-muted-foreground">{metrics.totalVessels}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleTabChange("fleet")}>
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
                     {voyages.length > 0 ? (
                       voyages.slice(0, 3).map((voy: any, idx: number) => (
                         <div key={voy.id || idx} className="flex items-center gap-3 text-sm">
                           <Badge variant="outline" className="min-w-[60px] justify-center text-xs">
                             {voy.status === 'in_progress' ? '🟢' : voy.status === 'planned' ? '🟡' : '✅'} {voy.status || 'N/A'}
                           </Badge>
                           <span className="flex-1 truncate">
                             {voy.voyage_number || `Voyage ${idx + 1}`} — {voy.origin_port || '?'} → {voy.destination_port || '?'}
                           </span>
                         </div>
                       ))
                     ) : (
                       <div className="text-sm text-muted-foreground text-center py-4">
                         <Calendar className="h-5 w-5 mx-auto mb-2 opacity-50" />
                         Nenhuma viagem registrada.
                         <br />
                         <Button variant="link" size="sm" onClick={() => handleTabChange("voyage")} className="mt-1">
                           Criar primeira viagem →
                         </Button>
                       </div>
                     )}
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

        {/* Quick Action Dialogs */}
        <NewVoyageDialog open={dialogOpen.voyage} onOpenChange={(v) => setDialogOpen(p => ({ ...p, voyage: v }))} />
        <CrewScheduleDialog open={dialogOpen.crew} onOpenChange={(v) => setDialogOpen(p => ({ ...p, crew: v }))} />
        <MaintenanceOrderDialog open={dialogOpen.maintenance} onOpenChange={(v) => setDialogOpen(p => ({ ...p, maintenance: v }))} />
        <FuelReportDialog open={dialogOpen.fuel} onOpenChange={(v) => setDialogOpen(p => ({ ...p, fuel: v }))} />
        <ChecklistDialog open={dialogOpen.checklist} onOpenChange={(v) => setDialogOpen(p => ({ ...p, checklist: v }))} />
      </div>
    </div>
  );
}
