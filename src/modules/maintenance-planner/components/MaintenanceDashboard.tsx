/**
 * Maintenance Dashboard - Premium Maintenance Module
 * Connected to real Supabase data via useMaintenanceDashboardData
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useMaintenanceDashboardData } from "@/hooks/useMaintenanceDashboardData";
import type { WorkOrder, Equipment } from "@/hooks/useMaintenanceDashboardData";
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, Calendar, Settings, Gauge, Activity,
  TrendingUp, Search, Plus, Filter, Ship, Cog, Thermometer, Zap, BarChart3, Brain,
  Bell, FileText, Users, Package, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusColor = (status: WorkOrder["status"]) => {
  const colors: Record<string, string> = {
    "open": "bg-blue-500", "in-progress": "bg-amber-500", "waiting-parts": "bg-purple-500",
    "completed": "bg-emerald-500", "cancelled": "bg-gray-500"
  };
  return colors[status] || "bg-muted";
};

const getPriorityColor = (priority: WorkOrder["priority"]) => {
  const colors: Record<string, string> = {
    "low": "text-blue-600 bg-blue-100", "medium": "text-amber-600 bg-amber-100",
    "high": "text-orange-600 bg-orange-100", "critical": "text-red-600 bg-red-100"
  };
  return colors[priority] || "text-muted-foreground bg-muted";
};

const getHealthColor = (score: number) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
};

export default function MaintenanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { workOrders, equipment, isLoading, error, refetch, stats } = useMaintenanceDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Erro ao carregar dados de manutenção</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  const filteredWorkOrders = workOrders.filter(wo =>
    wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.vessel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.equipment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ordens Abertas</p>
                <p className="text-3xl font-bold">{stats.openOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {workOrders.filter(wo => wo.status === "in-progress").length} em andamento
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.criticalOrders > 0 && "border-destructive/50")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className={cn("text-3xl font-bold", stats.criticalOrders > 0 && "text-destructive")}>{stats.criticalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">Requerem ação imediata</p>
              </div>
              <div className={cn("p-3 rounded-xl", stats.criticalOrders > 0 ? "bg-destructive/20" : "bg-muted")}>
                <AlertTriangle className={cn("h-6 w-6", stats.criticalOrders > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde da Frota</p>
                <p className={cn("text-3xl font-bold", getHealthColor(stats.avgHealthScore))}>{stats.avgHealthScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {equipment.filter(eq => eq.status === "operational").length} equipamentos OK
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
                <p className="text-sm text-muted-foreground">Vencidas</p>
                <p className={cn("text-3xl font-bold", stats.overdueOrders > 0 ? "text-amber-600" : "")}>{stats.overdueOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">Manutenções atrasadas</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical equipment alert */}
      {equipment.some(eq => eq.status === "critical") && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Equipamento em Estado Crítico</p>
                <p className="text-sm text-muted-foreground">
                  {equipment.find(eq => eq.status === "critical")?.name}
                  {equipment.find(eq => eq.status === "critical")?.predictedFailure && 
                    ` - Falha prevista para ${equipment.find(eq => eq.status === "critical")?.predictedFailure}`}
                </p>
              </div>
              <Button variant="destructive" size="sm">Ver Detalhes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {workOrders.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma ordem de serviço</h3>
            <p className="text-muted-foreground mb-4">Crie sua primeira ordem de manutenção.</p>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Ordem</Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Visão Geral</TabsTrigger>
            <TabsTrigger value="workorders" className="gap-2"><FileText className="h-4 w-4" />Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2"><Cog className="h-4 w-4" />Equipamentos</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cronograma de Manutenções</CardTitle>
                <CardDescription>Ordens ativas ordenadas por data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredWorkOrders
                    .filter(wo => wo.status !== "completed")
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 8)
                    .map((wo) => (
                      <div key={wo.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className={cn("w-2 h-12 rounded-full", getStatusColor(wo.status))} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{wo.title}</span>
                            <Badge className={cn("text-xs", getPriorityColor(wo.priority))}>{wo.priority}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{wo.vessel}</span>
                            <span className="flex items-center gap-1"><Cog className="h-3 w-3" />{wo.equipment}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{wo.assignedTo}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm"><Calendar className="h-4 w-4" />{wo.dueDate}</div>
                          {wo.completedHours !== undefined && (
                            <Progress value={(wo.completedHours / wo.estimatedHours) * 100} className="h-2 w-20 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Por Tipo</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Preventiva", key: "preventive", icon: Calendar, color: "text-blue-600 bg-blue-100" },
                    { type: "Corretiva", key: "corrective", icon: Wrench, color: "text-amber-600 bg-amber-100" },
                    { type: "Preditiva", key: "predictive", icon: Brain, color: "text-purple-600 bg-purple-100" },
                    { type: "Emergência", key: "emergency", icon: AlertTriangle, color: "text-red-600 bg-red-100" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", item.color)}><item.icon className="h-4 w-4" /></div>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <Badge variant="secondary">{workOrders.filter(wo => wo.type === item.key).length}</Badge>
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
              <CardDescription>{filteredWorkOrders.length} ordens encontradas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredWorkOrders.map((wo) => (
                    <div key={wo.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{wo.id}</Badge>
                            <Badge className={cn("text-xs", getPriorityColor(wo.priority))}>
                              {wo.priority === "critical" ? "Crítico" : wo.priority === "high" ? "Alta" : wo.priority === "medium" ? "Média" : "Baixa"}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {wo.type === "preventive" ? "Preventiva" : wo.type === "corrective" ? "Corretiva" : wo.type === "predictive" ? "Preditiva" : "Emergência"}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{wo.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{wo.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{wo.vessel}</span>
                            <span className="flex items-center gap-1"><Cog className="h-3 w-3" />{wo.equipment}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{wo.estimatedHours}h estimadas</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">{wo.status.replace("-", " ")}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Monitorados</CardTitle>
              <CardDescription>Status de saúde baseado em manutenções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment.map((eq) => (
                  <div key={eq.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{eq.name}</h4>
                          <Badge variant="outline">{eq.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{eq.vessel}</p>
                      </div>
                      <Badge variant={eq.status === "operational" ? "default" : eq.status === "degraded" ? "secondary" : "destructive"}>
                        {eq.status === "operational" ? "Operacional" : eq.status === "degraded" ? "Degradado" : "Crítico"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Saúde</span>
                        <p className={cn("font-bold", getHealthColor(eq.healthScore))}>{eq.healthScore}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Horas</span>
                        <p className="font-medium">{eq.runningHours.toLocaleString()}h</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Última Manut.</span>
                        <p className="font-medium">{eq.lastMaintenance}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Próxima</span>
                        <p className="font-medium">{eq.nextMaintenance}</p>
                      </div>
                    </div>
                    <Progress value={eq.healthScore} className="h-2 mt-3" />
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
