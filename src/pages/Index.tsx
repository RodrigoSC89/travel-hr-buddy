import React, { useMemo, useState, useCallback, Suspense, lazy, memo } from "react";
import { Helmet } from "react-helmet-async";
import { ProfessionalHeader } from "@/components/dashboard/professional-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Wrench, Users, Brain, Ship, Sparkles, Leaf, AlertTriangle, GraduationCap, Plane, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Lazy load onboarding
const WelcomeOnboarding = lazy(() => import("@/components/onboarding/WelcomeOnboarding").then(m => ({ default: m.WelcomeOnboarding })));

// PATCH 584: Split Index into optimized subcomponents - Lazy loaded
const KPIGrid = lazy(() => import("@/components/dashboard/index/KPIGrid").then(m => ({ default: m.KPIGrid })));
const OverviewCharts = lazy(() => import("@/components/dashboard/index/OverviewCharts").then(m => ({ default: m.OverviewCharts })));
const QuickStats = lazy(() => import("@/components/dashboard/index/QuickStats").then(m => ({ default: m.QuickStats })));
const FinancialTab = lazy(() => import("@/components/dashboard/index/FinancialTab").then(m => ({ default: m.FinancialTab })));
const OperationsTab = lazy(() => import("@/components/dashboard/index/OperationsTab").then(m => ({ default: m.OperationsTab })));
const SystemControlPanel = lazy(() => import("@/components/system/SystemControlPanel").then(m => ({ default: m.SystemControlPanel })));
const QuickActionsPanel = lazy(() => import("@/components/dashboard/QuickActionsPanel").then(m => ({ default: m.QuickActionsPanel })));
const NetworkStatusWidget = lazy(() => import("@/components/dashboard/NetworkStatusWidget").then(m => ({ default: m.NetworkStatusWidget })));
const PerformanceMonitor = lazy(() => import("@/components/dashboard/PerformanceMonitor").then(m => ({ default: m.PerformanceMonitor })));
const AIModulesGrid = lazy(() => import("@/components/dashboard/AIModulesGrid").then(m => ({ default: m.AIModulesGrid })));
const LiveMetricsBar = lazy(() => import("@/components/dashboard/LiveMetricsBar").then(m => ({ default: m.LiveMetricsBar })));
const LiveDashboardStats = lazy(() => import("@/components/dashboard/LiveDashboardStats").then(m => ({ default: m.LiveDashboardStats })));
const DashboardActions = lazy(() => import("@/components/dashboard/DashboardActions").then(m => ({ default: m.DashboardActions })));

// PATCH 850: PWA & Offline Components - Lazy loaded
const OfflineStatusBar = lazy(() => import("@/components/pwa/OfflineStatusBar").then(m => ({ default: m.OfflineStatusBar })));
const InstallPrompt = lazy(() => import("@/components/pwa/InstallPrompt").then(m => ({ default: m.InstallPrompt })));

// Loading placeholder
const LoadingPlaceholder = () => <div className="h-32 bg-muted/20 rounded-lg animate-pulse" />;

// PATCH 584: Memoized data constants for better performance
const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, target: 40000 },
  { month: "Fev", revenue: 48000, target: 45000 },
  { month: "Mar", revenue: 52000, target: 50000 },
  { month: "Abr", revenue: 58000, target: 55000 },
  { month: "Mai", revenue: 65000, target: 60000 },
  { month: "Jun", revenue: 72000, target: 70000 },
] as const;

const FLEET_DATA = [
  { name: "Operacional", value: 20, color: "#10b981" },
  { name: "Manutenção", value: 3, color: "#f59e0b" },
  { name: "Standby", value: 1, color: "#3b82f6" },
] as const;

// Nautilus Command Center Hero - Primary CTA
const NautilusCommandHero = memo(() => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-cyan-500/10 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
      onClick={() => navigate('/nautilus-command')}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Nautilus Command Center
                <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                  Novo
                </Badge>
              </h2>
              <p className="text-muted-foreground">
                Centro de Comando Integrado com IA • Frota, Tripulação, Estoque, Manutenção & IoT
              </p>
            </div>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Ship className="h-4 w-4" />
            Acessar
          </Button>
        </div>
        
        <div className="grid grid-cols-5 gap-3 mt-4">
          {[
            { label: 'Frota', icon: Ship, color: 'text-blue-500' },
            { label: 'Tripulação', icon: Users, color: 'text-emerald-500' },
            { label: 'Estoque', icon: ShoppingCart, color: 'text-amber-500' },
            { label: 'Manutenção', icon: Wrench, color: 'text-purple-500' },
            { label: 'IoT', icon: Sparkles, color: 'text-cyan-500' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

NautilusCommandHero.displayName = 'NautilusCommandHero';

// Quick Access to AI Modules - Memoized
const AIModulesPanel = memo(() => {
  const navigate = useNavigate();
  
  const modules = useMemo(() => [
    { 
      name: "MMI Inteligente", 
      description: "Manutenção com IA, Digital Twin",
      route: "/maintenance-planner",
      icon: Wrench,
      badge: "Digital Twin",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      name: "Crew 2.0", 
      description: "Análise de fadiga e competências",
      route: "/crew",
      icon: Users,
      badge: "IA Avançada",
      color: "from-green-500 to-emerald-500"
    },
    { 
      name: "PEO-DP", 
      description: "Posicionamento dinâmico",
      route: "/peo-dp",
      icon: Ship,
      badge: "IMCA M117",
      color: "from-purple-500 to-indigo-500"
    },
    { 
      name: "ESG & Emissões", 
      description: "Carbon footprint, CII",
      route: "/esg-emissions",
      icon: Leaf,
      badge: "IMO 2020",
      color: "from-teal-500 to-green-600"
    },
    { 
      name: "Safety Guardian", 
      description: "Incidentes e IA preditiva",
      route: "/safety-guardian",
      icon: AlertTriangle,
      badge: "TRIR/LTI",
      color: "from-red-500 to-orange-500"
    },
    { 
      name: "PEOTRAM", 
      description: "Compliance marítimo",
      route: "/peotram",
      icon: Shield,
      badge: "Compliance",
      color: "from-orange-500 to-amber-500"
    },
    { 
      name: "Nautilus Academy", 
      description: "Treinamentos com IA",
      route: "/nautilus-academy",
      icon: GraduationCap,
      badge: "AI Training",
      color: "from-indigo-500 to-purple-600"
    },
    { 
      name: "Smart Mobility", 
      description: "Viagens e logística",
      route: "/smart-mobility",
      icon: Plane,
      badge: "Viagens",
      color: "from-sky-500 to-blue-600"
    }
  ], []);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          Módulos IA Avançados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {modules.map((mod) => (
            <button
              key={mod.route}
              onClick={() => navigate(mod.route)}
              className={`relative p-3 rounded-lg bg-gradient-to-br ${mod.color} text-white hover:scale-105 transition-all duration-200 text-left overflow-hidden group`}
              aria-label={`${mod.name}: ${mod.description}`}
            >
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <mod.icon className="h-5 w-5 mb-2 drop-shadow-sm" aria-hidden="true" />
                <h4 className="font-semibold text-sm drop-shadow-sm">{mod.name}</h4>
                <p className="text-xs opacity-95 mt-1 line-clamp-2 drop-shadow-sm font-medium">{mod.description}</p>
                <Badge 
                  variant="secondary" 
                  className="mt-2 text-xs bg-white/25 hover:bg-white/35 text-white border-0 font-medium"
                >
                  {mod.badge}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

AIModulesPanel.displayName = 'AIModulesPanel';

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // PATCH 584: Memoize callback to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <>
      {/* PATCH 850: PWA Offline Status */}
      <Suspense fallback={null}>
        <OfflineStatusBar />
      </Suspense>
      
      {/* Onboarding para novos usuários */}
      <Suspense fallback={null}>
        <WelcomeOnboarding />
      </Suspense>
      
      {/* PATCH 850: PWA Install Prompt */}
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>
      
      <Helmet>
        <title>Dashboard Executivo | Nautilus One - Sistema Marítimo Corporativo</title>
        <meta name="description" content="Visão estratégica e métricas em tempo real do Sistema Nautilus One. Gerencie operações marítimas, manutenção, compliance e analytics com IA avançada." />
        <meta name="keywords" content="maritime, offshore, gestão marítima, manutenção, compliance, ESG, IA, analytics" />
        <meta property="og:title" content="Dashboard Executivo | Nautilus One" />
        <meta property="og:description" content="Sistema corporativo para gestão marítima com IA avançada" />
        <link rel="canonical" href="/" />
      </Helmet>
      
      {/* Live Metrics Bar - Always visible */}
      <Suspense fallback={null}>
        <LiveMetricsBar />
      </Suspense>
      
      <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <ProfessionalHeader
          title="Dashboard Executivo"
          subtitle="Visão estratégica e métricas em tempo real - Sistema Nautilus One"
          showLogo={true}
          showRealTime={true}
        />
        <Link to="/qa/preview">
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            QA Dashboard
          </Button>
        </Link>
      </div>

      {/* PATCH 1000: Nautilus Command Center Hero */}
      <NautilusCommandHero />

      {/* PATCH 549: AI Modules Quick Access */}
      <AIModulesPanel />

      {/* Live Dashboard Stats with real data */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <LiveDashboardStats />
      </Suspense>

      {/* Dashboard Actions */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <DashboardActions />
      </Suspense>

      {/* PATCH 801: Quick Actions, Network Status & Performance */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingPlaceholder />}>
            <QuickActionsPanel />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingPlaceholder />}>
          <NetworkStatusWidget />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder />}>
          <PerformanceMonitor />
        </Suspense>
      </div>

      {/* PATCH 802: AI Modules Grid */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Central de Inteligência Artificial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingPlaceholder />}>
            <AIModulesGrid />
          </Suspense>
        </CardContent>
      </Card>

      {/* PATCH 800: Sistema de Controle Unificado */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <SystemControlPanel />
      </Suspense>

      {/* PATCH 584: KPIs Grid extracted to memoized component */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <KPIGrid />
      </Suspense>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-primary/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Operações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* PATCH 584: Charts extracted to memoized component */}
          <Suspense fallback={<LoadingPlaceholder />}>
            <OverviewCharts revenueData={REVENUE_DATA} fleetData={FLEET_DATA} />
          </Suspense>
          
          {/* PATCH 584: Quick Stats extracted to memoized component */}
          <Suspense fallback={<LoadingPlaceholder />}>
            <QuickStats />
          </Suspense>
        </TabsContent>

        <TabsContent value="financial">
          {/* PATCH 584: Financial tab extracted to memoized component */}
          <Suspense fallback={<LoadingPlaceholder />}>
            <FinancialTab data={REVENUE_DATA} />
          </Suspense>
        </TabsContent>

        <TabsContent value="operations">
          {/* PATCH 584: Operations tab extracted to memoized component */}
          <Suspense fallback={<LoadingPlaceholder />}>
            <OperationsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};

export default Index;