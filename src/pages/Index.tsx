import React, { useMemo, useState, useCallback } from "react";
import { ProfessionalHeader } from "@/components/dashboard/professional-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Wrench, Users, Box, Brain, Zap, Ship, Sparkles, Leaf, AlertTriangle, GraduationCap, Plane, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePreviewSafeMode } from "@/hooks/qa/usePreviewSafeMode";

// PATCH 584: Split Index into optimized subcomponents
import { KPIGrid } from "@/components/dashboard/index/KPIGrid";
import { OverviewCharts } from "@/components/dashboard/index/OverviewCharts";
import { QuickStats } from "@/components/dashboard/index/QuickStats";
import { FinancialTab } from "@/components/dashboard/index/FinancialTab";
import { OperationsTab } from "@/components/dashboard/index/OperationsTab";

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

// Quick Access to AI Modules
const AIModulesPanel = () => {
  const navigate = useNavigate();
  
  const modules = [
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
      route: "/crew-management",
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
    },
    { 
      name: "Compras IA", 
      description: "Procurement autônomo",
      route: "/autonomous-procurement",
      icon: ShoppingCart,
      badge: "Auto-Req",
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
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
              className={`p-3 rounded-lg bg-gradient-to-br ${mod.color} text-white hover:scale-105 transition-all duration-200 text-left`}
            >
              <mod.icon className="h-5 w-5 mb-2" />
              <h4 className="font-semibold text-xs">{mod.name}</h4>
              <p className="text-[10px] opacity-90 mt-1 line-clamp-2">{mod.description}</p>
              <Badge variant="secondary" className="mt-2 text-[10px] bg-white/20 hover:bg-white/30">
                {mod.badge}
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // PATCH 624 - Preview Safe Mode
  const { isValidated, validationPassed, shouldShowData } = usePreviewSafeMode({
    componentName: "Index",
    enableValidation: true,
    maxRenderTime: 2000,
    silenceErrors: true
  });

  // PATCH 584: Memoize callback to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
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

      {/* PATCH 549: AI Modules Quick Access */}
      <AIModulesPanel />

      {/* PATCH 584: KPIs Grid extracted to memoized component */}
      <KPIGrid />

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
          <OverviewCharts revenueData={REVENUE_DATA} fleetData={FLEET_DATA} />
          
          {/* PATCH 584: Quick Stats extracted to memoized component */}
          <QuickStats />
        </TabsContent>

        <TabsContent value="financial">
          {/* PATCH 584: Financial tab extracted to memoized component */}
          <FinancialTab data={REVENUE_DATA} />
        </TabsContent>

        <TabsContent value="operations">
          {/* PATCH 584: Operations tab extracted to memoized component */}
          <OperationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;