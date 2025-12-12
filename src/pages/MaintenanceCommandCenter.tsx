/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * Maintenance Command Center
 * PATCH UNIFY-3.0 - Fusão dos módulos de Manutenção
 * 
 * Módulos fundidos:
 * - intelligent-maintenance → Maintenance Command Center
 * - mmi (MMI - Manutenção) → Maintenance Command Center
 * - mmi-tasks → Maintenance Command Center
 * - mmi-forecast → Maintenance Command Center
 * - mmi-history → Maintenance Command Center
 * - mmi-jobs-panel → Maintenance Command Center
 * - mmi-dashboard → Maintenance Command Center
 * - maintenance-planner → Maintenance Command Center
 * 
 * Funcionalidades unificadas:
 * - Saúde da Frota com monitoramento em tempo real
 * - Copilot IA para assistência inteligente
 * - Central de Jobs e Ordens de Serviço
 * - Gestão de Horímetros
 * - Digital Twin 3D
 * - Forecast com IA GPT-4
 * - Dashboard BI com analytics
 * - Histórico completo de manutenções
 * - Calendário e Timeline visual
 * - IA Preditiva para manutenção
 * - Tarefas de manutenção
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, Calendar, CheckCircle, AlertTriangle, Plus, Download, 
  Bell, Bot, Ship, Activity, LayoutGrid, Clock, FileText, Box,
  BarChart3, Sparkles, History, TrendingUp, Target, Settings,
  Zap, Shield, Search, Filter, RefreshCw, Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PredictiveMaintenanceAI } from "@/components/maintenance/PredictiveMaintenanceAI";

// Core maintenance components
import { MaintenanceCalendarView } from "@/modules/maintenance-planner/components/MaintenanceCalendarView";
import { MaintenanceTimelineView } from "@/modules/maintenance-planner/components/MaintenanceTimelineView";
import { MaintenanceTasksTable } from "@/modules/maintenance-planner/components/MaintenanceTasksTable";
import { CreateMaintenancePlanDialog } from "@/modules/maintenance-planner/components/CreateMaintenancePlanDialog";
import { MaintenanceAlertsPanel } from "@/modules/maintenance-planner/components/MaintenanceAlertsPanel";
import { FleetHealthPanel } from "@/modules/maintenance-planner/components/FleetHealthPanel";
import { JobsCenter } from "@/modules/maintenance-planner/components/JobsCenter";
import HourometerManager from "@/modules/maintenance-planner/components/HourometerManager";
import WorkOrderManager from "@/modules/maintenance-planner/components/WorkOrderManager";
import AdvancedCopilot from "@/modules/maintenance-planner/components/AdvancedCopilot";
import DigitalTwin from "@/modules/maintenance-planner/components/DigitalTwin";

// MMI specific components
import MMIForecastSection from "@/modules/intelligent-maintenance/components/MMIForecastSection";
import MMIHistorySection from "@/modules/intelligent-maintenance/components/MMIHistorySection";
import MMIJobsPanelSection from "@/modules/intelligent-maintenance/components/MMIJobsPanelSection";
import MMIDashboardSection from "@/modules/intelligent-maintenance/components/MMIDashboardSection";

interface MaintenanceStats {
  scheduled: number;
  completed: number;
  overdue: number;
  efficiency: number;
  activeTasks: number;
  pendingForecasts: number;
}

const MaintenanceCommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<MaintenanceStats>({
    scheduled: 0,
    completed: 0,
    overdue: 0,
    efficiency: 0,
    activeTasks: 0,
    pendingForecasts: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats - integrate with real data
      setStats({
        scheduled: 12,
        completed: 87,
        overdue: 3,
        efficiency: 94,
        activeTasks: 15,
        pendingForecasts: 5
      });
    } catch (error) {
      console.error("Error fetching maintenance stats:", error);
    } finally {
      setLoading(false);
    }
  });

  const handleExportWeeklySchedule = async () => {
    toast({
      title: "Exportação",
      description: "Gerando relatório semanal de manutenção...",
    });
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Maintenance Command Center
            </h1>
            <p className="text-muted-foreground">Sistema Unificado de Gestão de Manutenção Naval com IA</p>
          </div>
          <div className="flex gap-2 ml-2 flex-wrap">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <Bot className="h-3 w-3 mr-1" />
              GPT-4 Integrado
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Zap className="h-3 w-3 mr-1" />
              Tempo Real
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <Brain className="h-3 w-3 mr-1" />
              IA Preditiva
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleSetShowAlertsPanel}>
            <Bell className="mr-2 h-4 w-4" />
            Alertas
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.overdue}
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={handleExportWeeklySchedule}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={handleSetShowCreateDialog} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Agendados</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-l-4 hover:shadow-md transition-shadow ${stats.overdue > 0 ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" : "border-l-gray-300"}`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Vencidos</p>
                <p className={`text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : ""}`}>
                  {stats.overdue}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 opacity-50 ${stats.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tarefas Ativas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeTasks}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Forecasts</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pendingForecasts}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Eficiência</p>
                <p className="text-2xl font-bold">{stats.efficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <LayoutGrid className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="saude" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Saúde da Frota
          </TabsTrigger>
          <TabsTrigger value="copilot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Copilot IA
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Preditiva
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Forecast IA
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="horimetros" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horímetros
          </TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ordens de Serviço
          </TabsTrigger>
          <TabsTrigger value="twin" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Digital Twin
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard BI
          </TabsTrigger>
        </TabsList>

        {/* Overview - Quick Access Cards */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-500" />
                  Saúde da Frota
                </CardTitle>
                <CardDescription>
                  Monitoramento em tempo real do estado das embarcações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Acessar</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-purple-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-500" />
                  Copilot IA
                </CardTitle>
                <CardDescription>
                  Assistente inteligente para planejamento de manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Acessar</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  IA Preditiva
                </CardTitle>
                <CardDescription>
                  Manutenção preditiva com machine learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Analisar</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-pink-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  Forecast com IA
                </CardTitle>
                <CardDescription>
                  Gerar previsões de manutenção com GPT-4
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Gerar Forecast</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-green-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-green-500" />
                  Central de Jobs
                </CardTitle>
                <CardDescription>
                  Gerenciar jobs e tarefas de manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Jobs</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-orange-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Tarefas de Manutenção
                </CardTitle>
                <CardDescription>
                  Gerenciar tarefas e criar ordens de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Tarefas</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-amber-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Ordens de Serviço
                </CardTitle>
                <CardDescription>
                  Criar e gerenciar ordens de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Gerenciar OS</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-cyan-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-cyan-500" />
                  Digital Twin 3D
                </CardTitle>
                <CardDescription>
                  Visualização 3D dos sistemas e componentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Abrir Twin</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-teal-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-500" />
                  Horímetros
                </CardTitle>
                <CardDescription>
                  Gestão de horímetros e tempo de operação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Horímetros</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-sky-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-500" />
                  Calendário
                </CardTitle>
                <CardDescription>
                  Visualização do calendário de manutenções
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Calendário</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-rose-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-rose-500" />
                  Histórico
                </CardTitle>
                <CardDescription>
                  Histórico completo de manutenções realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Histórico</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-violet-300" onClick={handleSetActiveTab}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-violet-500" />
                  Dashboard BI
                </CardTitle>
                <CardDescription>
                  Análises e métricas de Business Intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Analytics</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fleet Health */}
        <TabsContent value="saude" className="mt-6">
          <FleetHealthPanel />
        </TabsContent>

        {/* AI Copilot */}
        <TabsContent value="copilot" className="mt-6">
          <AdvancedCopilot />
        </TabsContent>

        {/* Predictive AI */}
        <TabsContent value="predictive" className="mt-6">
          <PredictiveMaintenanceAI />
        </TabsContent>

        {/* Forecast IA */}
        <TabsContent value="forecast" className="mt-6">
          <MMIForecastSection />
        </TabsContent>

        {/* Jobs Center */}
        <TabsContent value="jobs" className="mt-6">
          <JobsCenter onCreateJob={() => setShowCreateDialog(true} />
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks" className="mt-6">
          <MaintenanceTasksTable onRefresh={fetchStats} />
        </TabsContent>

        {/* Hourometers */}
        <TabsContent value="horimetros" className="mt-6">
          <HourometerManager />
        </TabsContent>

        {/* Work Orders */}
        <TabsContent value="os" className="mt-6">
          <WorkOrderManager />
        </TabsContent>

        {/* Digital Twin */}
        <TabsContent value="twin" className="mt-6">
          <DigitalTwin />
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <MaintenanceCalendarView />
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <MaintenanceTimelineView />
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-6">
          <MMIHistorySection />
        </TabsContent>

        {/* Dashboard BI */}
        <TabsContent value="dashboard" className="mt-6">
          <MMIDashboardSection />
        </TabsContent>
      </Tabs>

      <CreateMaintenancePlanDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchStats}
      />

      <MaintenanceAlertsPanel
        open={showAlertsPanel}
        onOpenChange={setShowAlertsPanel}
      />
    </div>
  );
};

export default MaintenanceCommandCenter;
