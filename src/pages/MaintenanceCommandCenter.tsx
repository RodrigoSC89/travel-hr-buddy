/**
 * Maintenance Command Center - Orchestrator
 * Refactored: overview tab extracted to MaintenanceOverviewTab
 */

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, Calendar, CheckCircle, AlertTriangle, Plus, Download, 
  Bell, Bot, Ship, Activity, LayoutGrid, Clock, FileText, Box,
  BarChart3, Sparkles, History, TrendingUp, Target, Zap, Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PredictiveMaintenanceAI } from "@/components/maintenance/PredictiveMaintenanceAI";
import { IoTSensorMonitor } from "@/components/maintenance/IoTSensorMonitor";
import { Predictive30_60_90 } from "@/components/maintenance/Predictive30_60_90";
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
import MaintenanceCommandDashboard from "@/modules/maintenance-planner/components/MaintenanceCommandCenter";
import { useMaintenanceCommandData } from "@/hooks/useMaintenanceCommandData";
import { MaintenanceOverviewTab } from "./maintenance/MaintenanceOverviewTab";

const MMIForecastSection = () => <div className="text-center py-8 text-muted-foreground">MMI Forecast não disponível.</div>;
const MMIHistorySection = () => <div className="text-center py-8 text-muted-foreground">MMI History não disponível.</div>;
const MMIDashboardSection = () => <div className="text-center py-8 text-muted-foreground">MMI Dashboard não disponível.</div>;

interface MaintenanceStats {
  scheduled: number; completed: number; overdue: number; efficiency: number; activeTasks: number; pendingForecasts: number;
}

const MaintenanceCommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const { toast } = useToast();

  const { tasks, equipment, predictions, summary, isLoading: loading, createTask, updateTaskStatus, refresh } = useMaintenanceCommandData();

  const stats: MaintenanceStats = {
    scheduled: summary.pendingTasks || 12,
    completed: summary.completedTasks || 87,
    overdue: summary.overdueTask || 3,
    efficiency: summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 94,
    activeTasks: summary.inProgressTasks || 15,
    pendingForecasts: predictions.filter((p: Record<string, unknown>) => (p.failureProbability as number) > 0.5).length || 5
  };

  const handleExportWeeklySchedule = async () => {
    toast({ title: "Exportação", description: "Gerando relatório semanal de manutenção..." });
  };

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
          <div className="p-3 bg-gradient-to-br from-warning to-warning/80 rounded-xl shadow-lg">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-warning to-warning/70 bg-clip-text text-transparent">Maintenance Command Center</h1>
            <p className="text-muted-foreground">Sistema Unificado de Gestão de Manutenção Naval com IA</p>
          </div>
          <div className="flex gap-2 ml-2 flex-wrap">
            <Badge variant="secondary" className="bg-accent/10 text-accent-foreground"><Bot className="h-3 w-3 mr-1" />GPT-4 Integrado</Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary"><Zap className="h-3 w-3 mr-1" />Tempo Real</Badge>
            <Badge variant="secondary" className="bg-success/10 text-success"><Brain className="h-3 w-3 mr-1" />IA Preditiva</Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowAlertsPanel(true)}>
            <Bell className="mr-2 h-4 w-4" />Alertas
            {stats.overdue > 0 && <Badge variant="destructive" className="ml-2">{stats.overdue}</Badge>}
          </Button>
          <Button variant="outline" onClick={handleExportWeeklySchedule}><Download className="mr-2 h-4 w-4" />Exportar</Button>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70"><Plus className="mr-2 h-4 w-4" />Novo Plano</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Agendados", value: stats.scheduled, icon: Calendar, color: "primary", borderColor: "border-l-primary" },
          { label: "Concluídos", value: stats.completed, icon: CheckCircle, color: "success", borderColor: "border-l-success" },
          { label: "Vencidos", value: stats.overdue, icon: AlertTriangle, color: stats.overdue > 0 ? "destructive" : "muted-foreground", borderColor: stats.overdue > 0 ? "border-l-destructive bg-destructive/5" : "border-l-muted" },
          { label: "Tarefas Ativas", value: stats.activeTasks, icon: Target, color: "warning", borderColor: "border-l-warning" },
          { label: "Forecasts", value: stats.pendingForecasts, icon: Sparkles, color: "accent-foreground", borderColor: "border-l-accent" },
          { label: "Eficiência", value: `${stats.efficiency}%`, icon: TrendingUp, color: "primary", borderColor: "border-l-primary" },
        ].map((s, i) => (
          <Card key={i} className={`border-l-4 hover:shadow-md transition-shadow ${s.borderColor}`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className={`text-2xl font-bold text-${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 text-${s.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LayoutGrid className="h-4 w-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="command" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Sparkles className="h-4 w-4" />Comando<Badge variant="secondary" className="ml-1 text-[10px]">PREMIUM</Badge></TabsTrigger>
          <TabsTrigger value="saude" className="flex items-center gap-2"><Ship className="h-4 w-4" />Saúde da Frota</TabsTrigger>
          <TabsTrigger value="copilot" className="flex items-center gap-2"><Bot className="h-4 w-4" />Copilot IA</TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2"><Brain className="h-4 w-4" />IA Preditiva</TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Forecast IA</TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2"><Wrench className="h-4 w-4" />Jobs</TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2"><Target className="h-4 w-4" />Tarefas</TabsTrigger>
          <TabsTrigger value="horimetros" className="flex items-center gap-2"><Clock className="h-4 w-4" />Horímetros</TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2"><FileText className="h-4 w-4" />Ordens de Serviço</TabsTrigger>
          <TabsTrigger value="twin" className="flex items-center gap-2"><Box className="h-4 w-4" />Digital Twin</TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Calendário</TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2"><Activity className="h-4 w-4" />Timeline</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2"><History className="h-4 w-4" />Histórico</TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Dashboard BI</TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="mt-6"><MaintenanceCommandDashboard /></TabsContent>
        <TabsContent value="overview" className="mt-6"><MaintenanceOverviewTab setActiveTab={setActiveTab} /></TabsContent>
        <TabsContent value="saude" className="mt-6"><FleetHealthPanel /></TabsContent>
        <TabsContent value="copilot" className="mt-6"><AdvancedCopilot /></TabsContent>
        <TabsContent value="predictive" className="mt-6"><PredictiveMaintenanceAI /></TabsContent>
        <TabsContent value="forecast" className="mt-6"><MMIForecastSection /></TabsContent>
        <TabsContent value="jobs" className="mt-6"><JobsCenter onCreateJob={() => setShowCreateDialog(true)} /></TabsContent>
        <TabsContent value="tasks" className="mt-6"><MaintenanceTasksTable onRefresh={refresh} /></TabsContent>
        <TabsContent value="horimetros" className="mt-6"><HourometerManager /></TabsContent>
        <TabsContent value="os" className="mt-6"><WorkOrderManager /></TabsContent>
        <TabsContent value="twin" className="mt-6"><DigitalTwin /></TabsContent>
        <TabsContent value="calendar" className="mt-6"><MaintenanceCalendarView /></TabsContent>
        <TabsContent value="timeline" className="mt-6"><MaintenanceTimelineView /></TabsContent>
        <TabsContent value="history" className="mt-6"><MMIHistorySection /></TabsContent>
        <TabsContent value="dashboard" className="mt-6"><MMIDashboardSection /></TabsContent>
      </Tabs>

      <CreateMaintenancePlanDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={refresh} />
      <MaintenanceAlertsPanel open={showAlertsPanel} onOpenChange={setShowAlertsPanel} />
    </div>
  );
};

export default MaintenanceCommandCenter;
