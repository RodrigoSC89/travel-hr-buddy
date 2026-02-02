/**
 * Unified Optimization Page - AI-Powered Operations Optimization
 * Combines route, fuel, crew, and schedule optimization
 */
import React from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Route, 
  Fuel, 
  Users, 
  Calendar, 
  TrendingUp,
  Target,
  DollarSign,
  Clock,
  Anchor,
  Brain,
  Sparkles
} from "lucide-react";

export default function UnifiedOptimizationPage() {
  const optimizationModules = [
    {
      id: "routes",
      name: "Otimização de Rotas",
      icon: Route,
      savings: "$45K/mês",
      efficiency: 94,
      description: "Análise de condições climáticas e portos"
    },
    {
      id: "fuel",
      name: "Otimização de Combustível",
      icon: Fuel,
      savings: "$78K/mês",
      efficiency: 89,
      description: "Previsão de consumo e bunker planning"
    },
    {
      id: "crew",
      name: "Otimização de Tripulação",
      icon: Users,
      savings: "$32K/mês",
      efficiency: 92,
      description: "Rotação e alocação inteligente de crew"
    },
    {
      id: "schedule",
      name: "Otimização de Agendas",
      icon: Calendar,
      savings: "$25K/mês",
      efficiency: 87,
      description: "Planejamento de manutenção e operações"
    }
  ];

  const kpis = [
    { label: "Economia Total Mensal", value: "$180K", trend: "+12%", icon: DollarSign },
    { label: "Eficiência Operacional", value: "91%", trend: "+5%", icon: TrendingUp },
    { label: "Tempo Economizado", value: "340h", trend: "+8%", icon: Clock },
    { label: "Embarcações Otimizadas", value: "23", trend: "+3", icon: Anchor }
  ];

  const recentOptimizations = [
    { vessel: "MV Atlântico Sul", type: "Rota", savings: "$12,500", date: "Hoje" },
    { vessel: "MT Oceano Azul", type: "Combustível", savings: "$8,200", date: "Ontem" },
    { vessel: "MV Horizonte", type: "Tripulação", savings: "$5,800", date: "2 dias atrás" }
  ];

  return (
    <OrganizationLayout title="Otimização Unificada">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              Otimização Unificada
            </h1>
            <p className="text-muted-foreground mt-1">
              Central de otimização inteligente para todas as operações marítimas
            </p>
          </div>
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            Executar Análise Completa
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <Badge variant="outline" className="text-green-600 mt-1">
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <kpi.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Optimization Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizationModules.map((module) => (
            <Card key={module.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <module.icon className="h-5 w-5 text-primary" />
                  {module.name}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Economia Mensal</span>
                    <span className="font-bold text-green-600">{module.savings}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Eficiência</span>
                      <span>{module.efficiency}%</span>
                    </div>
                    <Progress value={module.efficiency} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Otimizar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Optimizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Otimizações Recentes
            </CardTitle>
            <CardDescription>Últimas otimizações aplicadas pela IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOptimizations.map((opt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Anchor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{opt.vessel}</p>
                      <p className="text-sm text-muted-foreground">{opt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{opt.savings}</p>
                    <p className="text-xs text-muted-foreground">{opt.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}
