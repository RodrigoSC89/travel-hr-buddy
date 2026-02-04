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

import React, { Suspense, lazy, useEffect, useState } from "react";
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
  MapPin, Waves, Wind, Thermometer
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

// Lazy load original components
const MaritimeCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
const FleetCommandCenter = lazy(() => import("@/pages/FleetCommandCenter"));
const VoyageCommandCenter = lazy(() => import("@/pages/VoyageCommandCenter"));
const MissionCommandCenter = lazy(() => import("@/pages/MissionCommandCenter"));
const LogisticsCommandPage = lazy(() => import("@/pages/LogisticsCommandPage"));

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
  { id: "overview", label: "Visão Geral", icon: Activity, emoji: "📊", description: "Dashboard operacional" },
  { id: "maritime", label: "Maritime", icon: Anchor, emoji: "⚓", description: "Tripulação, certificações" },
  { id: "fleet", label: "Fleet", icon: Ship, emoji: "🚢", description: "Embarcações, manutenção" },
  { id: "voyage", label: "Voyage", icon: Map, emoji: "🗺️", description: "Planejamento de viagens", badge: "AI" },
  { id: "mission", label: "Mission", icon: Target, emoji: "🎯", description: "Controle de missões" },
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

// Mock operational KPIs
const operationalKPIs = [
  {
    title: "Embarcações Ativas",
    value: "12",
    subtitle: "de 15 na frota",
    change: 2,
    trend: "up" as const,
    icon: <Ship className="h-5 w-5" />,
    details: [
      { label: "Em operação", value: "10" },
      { label: "Em manutenção", value: "2" },
      { label: "Docadas", value: "3" }
    ]
  },
  {
    title: "Viagens em Andamento",
    value: "8",
    subtitle: "previsão: 3 chegadas hoje",
    change: 1,
    trend: "up" as const,
    icon: <Navigation className="h-5 w-5" />,
    details: [
      { label: "Viagens hoje", value: "8" },
      { label: "Esta semana", value: "23" },
      { label: "Este mês", value: "67" }
    ]
  },
  {
    title: "Tripulantes a Bordo",
    value: "284",
    subtitle: "96% da capacidade",
    change: -5,
    trend: "down" as const,
    icon: <Users className="h-5 w-5" />,
    details: [
      { label: "Oficiais", value: "48" },
      { label: "Marinheiros", value: "180" },
      { label: "Técnicos", value: "56" }
    ]
  },
  {
    title: "Eficiência Operacional",
    value: "94.2%",
    subtitle: "+2.1% vs mês anterior",
    change: 2.1,
    trend: "up" as const,
    icon: <TrendingUp className="h-5 w-5" />,
    details: [
      { label: "Pontualidade", value: "96%" },
      { label: "Disponibilidade", value: "92%" },
      { label: "Utilização", value: "89%" }
    ]
  }
];

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
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
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
        </motion.div>

        {/* Quick Actions Bar */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            {TABS.map((tab) => (
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

          {/* Overview Tab - NEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {operationalKPIs.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <InteractiveKPICard {...kpi} />
                </motion.div>
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
        </Tabs>
      </div>
    </div>
  );
}
