/**
 * FASE 2 - Manutenção Preventiva
 * PMS baseado em horímetro com alertas automáticos (benchmark: SERTICA)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, AlertTriangle, CheckCircle, Calendar, 
  Wrench, Timer, Bell, Settings, Play, Pause,
  RotateCcw, TrendingUp, Gauge
} from "lucide-react";
import { toast } from "sonner";

interface MaintenanceTask {
  id: string;
  equipment: string;
  task: string;
  interval: number; // hours
  currentHours: number;
  lastMaintenance: string;
  status: "ok" | "warning" | "overdue";
  priority: "low" | "medium" | "high" | "critical";
}

const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "1",
    equipment: "Motor Principal ME-01",
    task: "Troca de óleo lubrificante",
    interval: 500,
    currentHours: 485,
    lastMaintenance: "2024-01-15",
    status: "warning",
    priority: "high"
  },
  {
    id: "2",
    equipment: "Gerador Auxiliar GE-01",
    task: "Inspeção de filtros de ar",
    interval: 250,
    currentHours: 280,
    lastMaintenance: "2024-01-20",
    status: "overdue",
    priority: "critical"
  },
  {
    id: "3",
    equipment: "Compressor de Ar CA-01",
    task: "Verificação de válvulas",
    interval: 1000,
    currentHours: 720,
    lastMaintenance: "2024-01-10",
    status: "ok",
    priority: "medium"
  },
  {
    id: "4",
    equipment: "Sistema Hidráulico SH-01",
    task: "Análise de óleo hidráulico",
    interval: 750,
    currentHours: 650,
    lastMaintenance: "2024-01-05",
    status: "ok",
    priority: "medium"
  },
  {
    id: "5",
    equipment: "Bomba de Lastro BL-01",
    task: "Inspeção de selo mecânico",
    interval: 2000,
    currentHours: 1950,
    lastMaintenance: "2023-12-01",
    status: "warning",
    priority: "high"
  },
];

const hourMeters = [
  { equipment: "Motor Principal", hours: 12450, running: true },
  { equipment: "Gerador #1", hours: 8920, running: true },
  { equipment: "Gerador #2", hours: 7840, running: false },
  { equipment: "Compressor", hours: 5620, running: true },
];

export default function PMSHourMeterAlerts() {
  const [selectedTab, setSelectedTab] = useState("tasks");

  const getProgressPercentage = (current: number, interval: number) => {
    return Math.min((current / interval) * 100, 100);
  };

  const getRemainingHours = (current: number, interval: number) => {
    return Math.max(interval - current, 0);
  };

  const handleCreateWorkOrder = (taskId: string) => {
    toast.success("Ordem de serviço criada automaticamente");
  };

  const handleResetCounter = (taskId: string) => {
    toast.success("Contador resetado após manutenção");
  };

  const overdueCount = maintenanceTasks.filter(t => t.status === "overdue").length;
  const warningCount = maintenanceTasks.filter(t => t.status === "warning").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Próximas</p>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Dia</p>
                <p className="text-2xl font-bold text-success">
                  {maintenanceTasks.length - overdueCount - warningCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Tarefas</p>
                <p className="text-2xl font-bold">{maintenanceTasks.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <Wrench className="h-4 w-4" />
            Tarefas PMS
          </TabsTrigger>
          <TabsTrigger value="hourmeters" className="gap-2">
            <Gauge className="h-4 w-4" />
            Horímetros
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Configurar Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          {maintenanceTasks
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((task) => (
            <Card key={task.id} className={`border-l-4 ${
              task.status === "overdue" ? "border-l-destructive" :
              task.status === "warning" ? "border-l-warning" : "border-l-success"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{task.equipment}</h4>
                      <Badge variant={
                        task.priority === "critical" ? "destructive" :
                        task.priority === "high" ? "secondary" : "outline"
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.task}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCreateWorkOrder(task.id)}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Criar OS
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleResetCounter(task.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso: {task.currentHours}h / {task.interval}h</span>
                    <span className={
                      task.status === "overdue" ? "text-destructive font-medium" :
                      task.status === "warning" ? "text-warning font-medium" : ""
                    }>
                      {task.status === "overdue" 
                        ? `${task.currentHours - task.interval}h vencida`
                        : `${getRemainingHours(task.currentHours, task.interval)}h restantes`
                      }
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(task.currentHours, task.interval)}
                    className={`h-2 ${
                      task.status === "overdue" ? "[&>div]:bg-destructive" :
                      task.status === "warning" ? "[&>div]:bg-warning" : ""
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Última manutenção: {task.lastMaintenance}</span>
                    <span>Intervalo: {task.interval}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hourmeters" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hourMeters.map((meter) => (
              <Card key={meter.equipment}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        meter.running ? "bg-success animate-pulse" : "bg-muted"
                      }`} />
                      <h4 className="font-semibold">{meter.equipment}</h4>
                    </div>
                    <Badge variant={meter.running ? "default" : "secondary"}>
                      {meter.running ? (
                        <><Play className="h-3 w-3 mr-1" /> Em operação</>
                      ) : (
                        <><Pause className="h-3 w-3 mr-1" /> Parado</>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <Gauge className="h-12 w-12 mx-auto text-primary mb-2" />
                      <p className="text-3xl font-bold">{meter.hours.toLocaleString()}h</p>
                      <p className="text-sm text-muted-foreground">Horas de operação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Alertas Automáticos
              </CardTitle>
              <CardDescription>
                Configure quando receber notificações de manutenção preventiva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Alerta crítico (10% restantes)", enabled: true },
                { label: "Alerta de aviso (20% restantes)", enabled: true },
                { label: "Lembrete (30% restantes)", enabled: false },
                { label: "Notificação por email", enabled: true },
                { label: "Notificação push mobile", enabled: true },
                { label: "Criar OS automaticamente quando vencer", enabled: false },
              ].map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{setting.label}</span>
                  <Button variant={setting.enabled ? "default" : "outline"} size="sm">
                    {setting.enabled ? "Ativo" : "Inativo"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
