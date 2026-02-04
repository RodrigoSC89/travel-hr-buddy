/**
 * People Hub Enhanced
 * Centro de gestão de pessoas com UX premium
 * 
 * Features:
 * - Onboarding interativo
 * - Dashboard de RH com KPIs
 * - Gestão de tripulação avançada
 * - Analytics de pessoas
 */

import React, { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Target, TrendingUp, Heart, GraduationCap, Shield, BarChart3,
  Loader2, UserPlus, Calendar, Clock, Award, AlertTriangle, FileText,
  Briefcase, MapPin, Phone, Mail, Star, Activity, Zap, Bell, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ModuleOnboarding, 
  QuickActionsBar, 
  InteractiveKPICard,
  ActionableAlertList 
} from "@/components/ui/module-enhancements";
import { usePeopleHubData } from "@/hooks/usePeopleHubData";

// Lazy load components
const NautilusPeopleDashboard = lazy(() => import("@/modules/nauti-people/NautilusPeopleDashboard"));
const HRDashboard = lazy(() => import("@/pages/hr/HRDashboard"));
const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));
const PeopleAnalytics = lazy(() => import("@/pages/PeopleAnalytics"));
const CrewTrainingTab = lazy(() => import("@/components/people/CrewTrainingTab"));
const CrewComplianceTab = lazy(() => import("@/components/people/CrewComplianceTab"));
const CompetencyMatrix = lazy(() => import("@/modules/people-hub/components/CompetencyMatrix"));
const CrewSchedulingDashboard = lazy(() => import("@/modules/crew-scheduling/components/CrewSchedulingDashboard"));
const AcademyDashboard = lazy(() => import("@/modules/academy/components/AcademyDashboard"));
const PeopleCommandCenter = lazy(() => import("@/modules/people-hub/components/PeopleCommandCenter"));

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando...</span>
    </div>
  );
}

const TABS = [
  { id: "command", label: "Comando", icon: Activity, badge: "PREMIUM" },
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "crew", label: "Tripulação", icon: Users },
  { id: "scheduling", label: "Escalas", icon: Calendar },
  { id: "competency", label: "Competências", icon: Award },
  { id: "academy", label: "Academia", icon: GraduationCap },
  { id: "recruitment", label: "Recrutamento", icon: UserPlus },
  { id: "wellness", label: "Bem-estar", icon: Heart },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

// Onboarding steps
const onboardingSteps = [
  {
    title: "Bem-vindo ao People Hub",
    description: "Centro integrado para gestão de tripulação marítima, RH e bem-estar.",
    icon: <Users className="h-8 w-8 text-primary" />
  },
  {
    title: "Gestão de Tripulação",
    description: "Visualize escalas, certificações e status de todos os tripulantes em tempo real.",
    icon: <Briefcase className="h-8 w-8 text-primary" />
  },
  {
    title: "Compliance e Treinamento",
    description: "Monitore certificados STCW, MLC e gerencie treinamentos obrigatórios.",
    icon: <Shield className="h-8 w-8 text-primary" />
  },
  {
    title: "Bem-estar da Tripulação",
    description: "Acompanhe indicadores de saúde, fadiga e satisfação conforme MLC 2006.",
    icon: <Heart className="h-8 w-8 text-primary" />
  }
];

// Quick actions
const quickActions = [
  { id: "add-crew", label: "Novo Tripulante", icon: <UserPlus className="h-4 w-4" />, badge: 0 },
  { id: "schedule", label: "Escala de Bordo", icon: <Calendar className="h-4 w-4" />, badge: 5 },
  { id: "certificate", label: "Certificados", icon: <Award className="h-4 w-4" />, badge: 8 },
  { id: "training", label: "Agendar Treinamento", icon: <GraduationCap className="h-4 w-4" />, badge: 3 },
  { id: "report", label: "Relatório RH", icon: <FileText className="h-4 w-4" />, badge: 0 },
];

// KPIs will be calculated from real data inside component

// HR Alerts
const hrAlerts = [
  {
    id: "1",
    title: "8 certificados STCW expirando",
    description: "Tripulantes precisam renovar certificação nos próximos 15 dias",
    severity: "high" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    module: "Compliance",
    actions: [
      { label: "Ver Lista", onClick: () => toast.info("Abrindo lista...") },
      { label: "Notificar Todos", onClick: () => toast.success("Notificações enviadas") }
    ]
  },
  {
    id: "2",
    title: "Troca de turno pendente",
    description: "Nautilus Explorer - 5 tripulantes aguardando substituição",
    severity: "medium" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    module: "Escala",
    actions: [
      { label: "Ver Escala", onClick: () => toast.info("Abrindo escala...") }
    ]
  },
  {
    id: "3",
    title: "Avaliação de desempenho",
    description: "12 avaliações pendentes do ciclo Q1 2026",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    module: "RH",
    actions: [
      { label: "Iniciar Avaliações", onClick: () => toast.info("Abrindo módulo...") }
    ]
  }
];

// Featured crew members
const featuredCrew = [
  { name: "Carlos Santos", role: "Comandante", vessel: "Nautilus Star", status: "embarcado", rating: 4.9 },
  { name: "Maria Silva", role: "Imediato", vessel: "Nautilus Explorer", status: "embarcado", rating: 4.8 },
  { name: "João Oliveira", role: "Chefe de Máquinas", vessel: "Nautilus Pioneer", status: "licença", rating: 4.7 },
  { name: "Ana Costa", role: "Oficial de Náutica", vessel: "Nautilus Voyager", status: "embarcado", rating: 4.9 },
];

export default function PeopleHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Real data from Supabase
  const { crewMembers, trainings, wellnessRecords, summary, isLoading: dataLoading } = usePeopleHubData();

  // Build KPIs from real data
  const hrKPIs = useMemo(() => [
    {
      title: "Total de Tripulantes",
      value: String(summary.totalCrew),
      subtitle: `${summary.activeOnboard} ativos a bordo`,
      change: summary.totalCrew > 0 ? 12 : 0,
      trend: "up" as const,
      icon: <Users className="h-5 w-5" />,
      details: [
        { label: "Ativos", value: String(summary.activeOnboard) },
        { label: "Em Licença", value: String(summary.onLeave) },
        { label: "Total", value: String(crewMembers.length) }
      ]
    },
    {
      title: "Certificados",
      value: `${summary.expiringCerts > 0 ? summary.expiringCerts : "OK"}`,
      subtitle: `${summary.expiringCerts} expiram em breve`,
      change: summary.expiringCerts === 0 ? 2 : -2,
      trend: summary.expiringCerts === 0 ? "up" as const : "down" as const,
      icon: <Award className="h-5 w-5" />,
      details: [
        { label: "Expirando", value: String(summary.expiringCerts) },
        { label: "Próximos", value: String(summary.upcomingTrainings) },
        { label: "Total", value: String(crewMembers.length) }
      ]
    },
    {
      title: "Treinamentos",
      value: String(trainings.filter(t => t.status === "completed").length),
      subtitle: `${summary.upcomingTrainings} agendados`,
      change: trainings.filter(t => t.status === "completed").length,
      trend: trainings.length > 0 ? "up" as const : "stable" as const,
      icon: <GraduationCap className="h-5 w-5" />,
      details: [
        { label: "Completos", value: String(trainings.filter(t => t.status === "completed").length) },
        { label: "Em andamento", value: String(trainings.filter(t => t.status === "in_progress").length) },
        { label: "Total", value: String(trainings.length) }
      ]
    },
    {
      title: "Aptidão",
      value: String(summary.fitForDuty),
      subtitle: "aptos para serviço",
      change: summary.fitForDuty > 0 ? 0.3 : 0,
      trend: summary.fitForDuty > 0 ? "up" as const : "stable" as const,
      icon: <Heart className="h-5 w-5" />,
      details: [
        { label: "Aptos", value: String(summary.fitForDuty) },
        { label: "Avaliações", value: String(wellnessRecords.length) },
        { label: "Tempo médio", value: `${summary.avgTenure}m` }
      ]
    }
  ], [summary, crewMembers, trainings, wellnessRecords]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("people-hub-onboarding");
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
    localStorage.setItem("people-hub-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao People Hub! 👥");
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    toast.info(`Executando: ${action?.label}`);
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast.success("Alerta arquivado");
  };

  const activeAlerts = hrAlerts.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <ModuleOnboarding
            moduleName="People Hub"
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                People Hub
                <Badge variant="secondary" className="ml-2">
                  <Heart className="h-3 w-3 mr-1" />
                  MLC 2006
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestão unificada de tripulação e RH marítimo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              342 tripulantes ativos
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
              <Users className="h-4 w-4 mr-2" />
              Tour
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Command Center Tab - PREMIUM */}
          <TabsContent value="command" className="space-y-6 mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <PeopleCommandCenter />
            </Suspense>
          </TabsContent>

          {/* Dashboard Tab - NEW */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* KPIs - NO staggered animations to prevent flickering */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hrKPIs.map((kpi) => (
                <InteractiveKPICard key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Alertas de RH
                  </h3>
                  <Badge variant="outline">{activeAlerts.length} pendentes</Badge>
                </div>
                <ActionableAlertList
                  alerts={activeAlerts}
                  onDismiss={handleDismissAlert}
                  emptyMessage="Nenhum alerta pendente de RH."
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Featured Crew */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Tripulantes Destaque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {featuredCrew.map((crew, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {crew.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{crew.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{crew.role}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">{crew.rating}</span>
                          </div>
                          <Badge 
                            variant={crew.status === "embarcado" ? "default" : "secondary"}
                            className="text-[10px] mt-1"
                          >
                            {crew.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Compliance Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Compliance STCW/MLC
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Certificados STCW</span>
                        <span className="font-medium">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Exames Médicos</span>
                        <span className="font-medium">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Contratos SEA</span>
                        <span className="font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => setActiveTab("compliance")}
                    >
                      Ver Compliance Completo
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Agenda RH
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { date: "Hoje", event: "3 embarques programados" },
                      { date: "Amanhã", event: "5 desembarques" },
                      { date: "Esta semana", event: "12 treinamentos" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.date}</span>
                        <span className="font-medium">{item.event}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crew" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <NautilusPeopleDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="recruitment" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <RecruitmentPage />
            </Suspense>
          </TabsContent>

          <TabsContent value="wellness" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <CrewWellnessPage />
            </Suspense>
          </TabsContent>

          <TabsContent value="competency" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <CompetencyMatrix />
            </Suspense>
          </TabsContent>

          <TabsContent value="scheduling" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <CrewSchedulingDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="academy" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AcademyDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <CrewTrainingTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="compliance" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <CrewComplianceTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <PeopleAnalytics />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
