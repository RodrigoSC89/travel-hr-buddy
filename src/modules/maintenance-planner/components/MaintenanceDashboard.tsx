/**
 * Maintenance Dashboard - Premium Maintenance Module
 * Gestão completa de manutenção preditiva e preventiva
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Settings,
  Gauge,
  Activity,
  TrendingUp,
  Search,
  Plus,
  Filter,
  Ship,
  Cog,
  Thermometer,
  Zap,
  BarChart3,
  Brain,
  Bell,
  FileText,
  Users,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkOrder {
  id: string;
  title: string;
  type: "preventive" | "corrective" | "predictive" | "emergency";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "waiting-parts" | "completed" | "cancelled";
  equipment: string;
  vessel: string;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  completedHours?: number;
  description: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  vessel: string;
  status: "operational" | "degraded" | "critical" | "offline";
  healthScore: number;
  lastMaintenance: string;
  nextMaintenance: string;
  runningHours: number;
  predictedFailure?: string;
}

// Mock data
const mockWorkOrders: WorkOrder[] = [
  { id: "WO-001", title: "Troca de óleo do motor principal", type: "preventive", priority: "medium", status: "in-progress", equipment: "Motor MAN B&W", vessel: "MV Atlantic Star", assignedTo: "João Silva", dueDate: "2024-01-20", estimatedHours: 8, completedHours: 4, description: "Troca programada de óleo lubrificante" },
  { id: "WO-002", title: "Reparo bomba de combustível", type: "corrective", priority: "high", status: "waiting-parts", equipment: "Bomba Injetora #2", vessel: "MV Pacific Dream", assignedTo: "Carlos Santos", dueDate: "2024-01-18", estimatedHours: 12, description: "Vazamento detectado na bomba" },
  { id: "WO-003", title: "Inspeção turbocompressor", type: "predictive", priority: "medium", status: "open", equipment: "Turbo ABB", vessel: "MV Atlantic Star", assignedTo: "Pedro Costa", dueDate: "2024-01-25", estimatedHours: 6, description: "Análise de vibração indicou desgaste" },
  { id: "WO-004", title: "Calibração sensores temperatura", type: "preventive", priority: "low", status: "completed", equipment: "Sensores Sala de Máquinas", vessel: "MV Ocean Pride", assignedTo: "Ana Oliveira", dueDate: "2024-01-15", estimatedHours: 4, completedHours: 3.5, description: "Calibração trimestral" },
  { id: "WO-005", title: "Falha no gerador de emergência", type: "emergency", priority: "critical", status: "in-progress", equipment: "Gerador CAT 3512", vessel: "MV Pacific Dream", assignedTo: "Carlos Santos", dueDate: "2024-01-17", estimatedHours: 16, completedHours: 8, description: "Gerador não partiu no teste semanal" },
];

const mockEquipment: Equipment[] = [
  { id: "EQ-001", name: "Motor Principal MAN B&W", type: "Propulsão", vessel: "MV Atlantic Star", status: "operational", healthScore: 92, lastMaintenance: "2024-01-05", nextMaintenance: "2024-02-05", runningHours: 12450 },
  { id: "EQ-002", name: "Gerador CAT 3512 #1", type: "Geração", vessel: "MV Pacific Dream", status: "critical", healthScore: 45, lastMaintenance: "2023-12-10", nextMaintenance: "2024-01-17", runningHours: 8920, predictedFailure: "2024-01-25" },
  { id: "EQ-003", name: "Compressor de Ar Atlas", type: "Auxiliar", vessel: "MV Atlantic Star", status: "degraded", healthScore: 68, lastMaintenance: "2023-11-20", nextMaintenance: "2024-01-22", runningHours: 5600 },
  { id: "EQ-004", name: "Sistema de Lastro", type: "Deck", vessel: "MV Ocean Pride", status: "operational", healthScore: 88, lastMaintenance: "2024-01-10", nextMaintenance: "2024-04-10", runningHours: 3200 },
  { id: "EQ-005", name: "Purificador Alfa Laval", type: "Combustível", vessel: "MV Atlantic Star", status: "operational", healthScore: 95, lastMaintenance: "2024-01-12", nextMaintenance: "2024-03-12", runningHours: 7800 },
];

const getStatusColor = (status: WorkOrder["status"]) => {
  const colors = {
    "open": "bg-blue-500",
    "in-progress": "bg-amber-500",
    "waiting-parts": "bg-purple-500",
    "completed": "bg-emerald-500",
    "cancelled": "bg-gray-500"
  };
  return colors[status];
};

const getPriorityColor = (priority: WorkOrder["priority"]) => {
  const colors = {
    "low": "text-blue-600 bg-blue-100",
    "medium": "text-amber-600 bg-amber-100",
    "high": "text-orange-600 bg-orange-100",
    "critical": "text-red-600 bg-red-100"
  };
  return colors[priority];
};

const getHealthColor = (score: number) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
};

export default function MaintenanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const openOrders = mockWorkOrders.filter(wo => wo.status !== "completed" && wo.status !== "cancelled").length;
  const criticalOrders = mockWorkOrders.filter(wo => wo.priority === "critical" && wo.status !== "completed").length;
  const overdueOrders = mockWorkOrders.filter(wo => new Date(wo.dueDate) < new Date() && wo.status !== "completed").length;
  const avgHealthScore = Math.round(mockEquipment.reduce((sum, eq) => sum + eq.healthScore, 0) / mockEquipment.length);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ordens Abertas</p>
                <p className="text-3xl font-bold">{openOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockWorkOrders.filter(wo => wo.status === "in-progress").length} em andamento
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(criticalOrders > 0 && "border-destructive/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className={cn("text-3xl font-bold", criticalOrders > 0 && "text-destructive")}>{criticalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requerem ação imediata
                </p>
              </div>
              <div className={cn("p-3 rounded-xl", criticalOrders > 0 ? "bg-destructive/20" : "bg-muted")}>
                <AlertTriangle className={cn("h-6 w-6", criticalOrders > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde da Frota</p>
                <p className={cn("text-3xl font-bold", getHealthColor(avgHealthScore))}>{avgHealthScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockEquipment.filter(eq => eq.status === "operational").length} equipamentos OK
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previsões IA</p>
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs text-amber-600 mt-1">
                  Falhas previstas próx. 30 dias
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de equipamento crítico */}
      {mockEquipment.some(eq => eq.status === "critical") && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Equipamento em Estado Crítico</p>
                <p className="text-sm text-muted-foreground">
                  {mockEquipment.find(eq => eq.status === "critical")?.name} - Falha prevista para{" "}
                  {mockEquipment.find(eq => eq.status === "critical")?.predictedFailure}
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="workorders" className="gap-2">
              <FileText className="h-4 w-4" />
              Ordens de Serviço
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Cog className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="predictive" className="gap-2">
              <Brain className="h-4 w-4" />
              Manutenção Preditiva
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline de Manutenções */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cronograma de Manutenções</CardTitle>
                <CardDescription>Próximas 2 semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWorkOrders
                    .filter(wo => wo.status !== "completed")
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 5)
                    .map((wo) => (
                      <div key={wo.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className={cn("w-2 h-12 rounded-full", getStatusColor(wo.status))} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{wo.title}</span>
                            <Badge className={cn("text-xs", getPriorityColor(wo.priority))}>
                              {wo.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              {wo.vessel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Cog className="h-3 w-3" />
                              {wo.equipment}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {wo.assignedTo}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4" />
                            {wo.dueDate}
                          </div>
                          {wo.completedHours !== undefined && (
                            <Progress 
                              value={(wo.completedHours / wo.estimatedHours) * 100} 
                              className="h-2 w-20 mt-2"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Status por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Por Tipo de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Preventiva", count: mockWorkOrders.filter(wo => wo.type === "preventive").length, icon: Calendar, color: "text-blue-600 bg-blue-100" },
                    { type: "Corretiva", count: mockWorkOrders.filter(wo => wo.type === "corrective").length, icon: Wrench, color: "text-amber-600 bg-amber-100" },
                    { type: "Preditiva", count: mockWorkOrders.filter(wo => wo.type === "predictive").length, icon: Brain, color: "text-purple-600 bg-purple-100" },
                    { type: "Emergência", count: mockWorkOrders.filter(wo => wo.type === "emergency").length, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", item.color)}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workorders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription>Todas as ordens de manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {mockWorkOrders.map((wo) => (
                    <div key={wo.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{wo.id}</Badge>
                            <Badge className={cn("text-xs", getPriorityColor(wo.priority))}>
                              {wo.priority === "critical" ? "Crítico" : 
                               wo.priority === "high" ? "Alta" : 
                               wo.priority === "medium" ? "Média" : "Baixa"}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {wo.type === "preventive" ? "Preventiva" :
                               wo.type === "corrective" ? "Corretiva" :
                               wo.type === "predictive" ? "Preditiva" : "Emergência"}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{wo.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{wo.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              {wo.vessel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Cog className="h-3 w-3" />
                              {wo.equipment}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {wo.estimatedHours}h estimadas
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(
                            wo.status === "completed" ? "bg-emerald-500" :
                            wo.status === "in-progress" ? "bg-amber-500" :
                            wo.status === "waiting-parts" ? "bg-purple-500" : "bg-blue-500"
                          )}>
                            {wo.status === "completed" ? "Concluída" :
                             wo.status === "in-progress" ? "Em Andamento" :
                             wo.status === "waiting-parts" ? "Aguardando Peças" :
                             wo.status === "open" ? "Aberta" : "Cancelada"}
                          </Badge>
                          <p className="text-sm mt-2">Prazo: {wo.dueDate}</p>
                          <p className="text-xs text-muted-foreground">{wo.assignedTo}</p>
                          {wo.completedHours !== undefined && (
                            <div className="mt-2">
                              <Progress 
                                value={(wo.completedHours / wo.estimatedHours) * 100} 
                                className="h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {wo.completedHours}/{wo.estimatedHours}h
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEquipment.map((eq) => (
              <Card key={eq.id} className={cn(
                eq.status === "critical" && "border-destructive/50 bg-destructive/5",
                eq.status === "degraded" && "border-amber-500/50 bg-amber-500/5"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{eq.name}</h4>
                      <p className="text-sm text-muted-foreground">{eq.vessel}</p>
                    </div>
                    <Badge variant={
                      eq.status === "operational" ? "default" :
                      eq.status === "degraded" ? "secondary" : "destructive"
                    }>
                      {eq.status === "operational" ? "Operacional" :
                       eq.status === "degraded" ? "Degradado" :
                       eq.status === "critical" ? "Crítico" : "Offline"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Saúde</span>
                        <span className={cn("font-medium", getHealthColor(eq.healthScore))}>
                          {eq.healthScore}%
                        </span>
                      </div>
                      <Progress 
                        value={eq.healthScore} 
                        className={cn(
                          "h-2",
                          eq.healthScore < 60 && "[&>div]:bg-destructive",
                          eq.healthScore >= 60 && eq.healthScore < 80 && "[&>div]:bg-amber-500"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Horas de Operação</span>
                        <p className="font-medium">{eq.runningHours.toLocaleString()}h</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Próx. Manutenção</span>
                        <p className="font-medium">{eq.nextMaintenance}</p>
                      </div>
                    </div>

                    {eq.predictedFailure && (
                      <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-sm">
                        <Brain className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">
                          Falha prevista: {eq.predictedFailure}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full mt-4" size="sm">
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Manutenção Preditiva com IA
              </CardTitle>
              <CardDescription>
                Análise de dados de sensores para prever falhas antes que ocorram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockEquipment
                  .filter(eq => eq.healthScore < 80)
                  .map((eq) => (
                    <div key={eq.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{eq.name}</h4>
                          <p className="text-sm text-muted-foreground">{eq.vessel}</p>
                        </div>
                        <div className={cn(
                          "p-2 rounded-full",
                          eq.healthScore < 60 ? "bg-destructive/20" : "bg-amber-500/20"
                        )}>
                          <Gauge className={cn(
                            "h-5 w-5",
                            eq.healthScore < 60 ? "text-destructive" : "text-amber-600"
                          )} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">Temperatura Rolamento</span>
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">78°C</span>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">Vibração</span>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">4.2 mm/s</span>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">Consumo Elétrico</span>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Normal</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-600">Recomendação IA</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {eq.healthScore < 60 
                            ? "Manutenção urgente recomendada. Substituição do rolamento prevista para evitar parada não programada."
                            : "Agendar inspeção preventiva nas próximas 2 semanas. Monitorar tendência de aquecimento."
                          }
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Package className="h-4 w-4 mr-2" />
                          Peças
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
