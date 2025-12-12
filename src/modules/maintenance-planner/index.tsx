import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, Calendar, CheckCircle, AlertTriangle, Plus, Download, 
  Bell, Bot, Ship, Activity, LayoutGrid, Clock, FileText, Box
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaintenanceCalendarView } from "./components/MaintenanceCalendarView";
import { MaintenanceTimelineView } from "./components/MaintenanceTimelineView";
import { MaintenanceTasksTable } from "./components/MaintenanceTasksTable";
import { CreateMaintenancePlanDialog } from "./components/CreateMaintenancePlanDialog";
import { MaintenanceAlertsPanel } from "./components/MaintenanceAlertsPanel";
import { FleetHealthPanel } from "./components/FleetHealthPanel";
import { JobsCenter } from "./components/JobsCenter";
import HourometerManager from "./components/HourometerManager";
import WorkOrderManager from "./components/WorkOrderManager";
import AdvancedCopilot from "./components/AdvancedCopilot";
import DigitalTwin from "./components/DigitalTwin";

interface MaintenanceStats {
  scheduled: number;
  completed: number;
  overdue: number;
  efficiency: number;
}

const MaintenancePlanner = () => {
  const [activeTab, setActiveTab] = useState("saude");
  const [stats, setStats] = useState<MaintenanceStats>({
    scheduled: 0,
    completed: 0,
    overdue: 0,
    efficiency: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Using mock stats for now - integrate with real data when table exists
      setStats({
        scheduled: 12,
        completed: 8,
        overdue: 3,
        efficiency: 94
      });
    } catch (error) {
      console.error("Error fetching maintenance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWeeklySchedule = async () => {
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada com dados reais.",
    });
  };

  const handleJobCreated = (job: unknown) => {
    toast({
      title: "Job Criado via IA",
      description: `${job.nome} - ${job.equipamento_nome}`,
    });
    fetchStats();
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
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Manutenção Inteligente (MMI)</h1>
            <p className="text-muted-foreground">Sistema Premium de Gestão de Manutenção Naval</p>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Bot className="h-3 w-3 mr-1" />
            IA Integrada
          </Badge>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={handleSetShowCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
        
        <Card className={`border-l-4 ${stats.overdue > 0 ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" : "border-l-gray-300"}`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className={`text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : ""}`}>
                  {stats.overdue}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 opacity-50 ${stats.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold">{stats.efficiency}%</p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">No prazo</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="saude" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Saúde
          </TabsTrigger>
          <TabsTrigger value="copilot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Copilot
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="horimetros" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horímetros
          </TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            OS
          </TabsTrigger>
          <TabsTrigger value="twin" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Digital Twin
          </TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
        </TabsList>

        <TabsContent value="saude" className="mt-6">
          <FleetHealthPanel />
        </TabsContent>

        <TabsContent value="copilot" className="mt-6">
          <AdvancedCopilot />
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobsCenter onCreateJob={() => setShowCreateDialog(true} />
        </TabsContent>

        <TabsContent value="horimetros" className="mt-6">
          <HourometerManager />
        </TabsContent>

        <TabsContent value="os" className="mt-6">
          <WorkOrderManager />
        </TabsContent>

        <TabsContent value="twin" className="mt-6">
          <DigitalTwin />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <MaintenanceCalendarView />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <MaintenanceTimelineView />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <MaintenanceTasksTable onRefresh={fetchStats} />
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

export default MaintenancePlanner;
