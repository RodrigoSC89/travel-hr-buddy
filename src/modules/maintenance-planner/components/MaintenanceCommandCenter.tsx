/**
 * Maintenance Command Center - Premium Maintenance Management
 * Centro de controle de manutenção com preditiva, ordens e inventário
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Wrench,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Ship,
  Cpu,
  Gauge,
  Activity,
  XCircle,
  RefreshCw,
  Plus,
  Filter,
  Search,
  FileText,
  History,
  Target,
  Zap,
  ThermometerSun,
  Droplets,
  Cog,
  Anchor,
  Eye,
  Play,
  Pause,
  Bot,
  Sparkles,
} from "lucide-react";

// Tipos
interface WorkOrder {
  id: string;
  title: string;
  equipment: string;
  vessel: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "pending_parts" | "completed";
  dueDate: string;
  assignee: string;
  type: "corrective" | "preventive" | "predictive";
}

interface Equipment {
  id: string;
  name: string;
  vessel: string;
  health: number;
  status: "operational" | "degraded" | "critical" | "offline";
  lastMaintenance: string;
  nextMaintenance: string;
  runningHours: number;
}

interface SparePartStock {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  minStock: number;
  vessel: string;
  location: string;
  status: "ok" | "low" | "critical";
}

// Dados
const WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-001",
    title: "Revisão Motor Principal",
    equipment: "Motor Caterpillar 3516",
    vessel: "MV Atlantic Star",
    priority: "critical",
    status: "in_progress",
    dueDate: "2024-02-15",
    assignee: "Carlos Mendes",
    type: "preventive",
  },
  {
    id: "WO-002",
    title: "Substituição Bomba de Água",
    equipment: "Bomba Auxiliar #2",
    vessel: "MV Pacific Queen",
    priority: "high",
    status: "pending_parts",
    dueDate: "2024-02-12",
    assignee: "João Santos",
    type: "corrective",
  },
  {
    id: "WO-003",
    title: "Calibração Sensores",
    equipment: "Sistema de Navegação",
    vessel: "MV Ocean Voyager",
    priority: "medium",
    status: "open",
    dueDate: "2024-02-20",
    assignee: "Ana Costa",
    type: "predictive",
  },
  {
    id: "WO-004",
    title: "Troca de Óleo Gerador",
    equipment: "Gerador Diesel #1",
    vessel: "MV Atlantic Star",
    priority: "medium",
    status: "completed",
    dueDate: "2024-02-08",
    assignee: "Pedro Lima",
    type: "preventive",
  },
  {
    id: "WO-005",
    title: "Inspeção Casco",
    equipment: "Casco/Hull",
    vessel: "MV Pacific Queen",
    priority: "low",
    status: "open",
    dueDate: "2024-03-01",
    assignee: "Maria Silva",
    type: "preventive",
  },
];

const EQUIPMENT: Equipment[] = [
  {
    id: "eq-1",
    name: "Motor Principal",
    vessel: "MV Atlantic Star",
    health: 87,
    status: "operational",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-03-15",
    runningHours: 12450,
  },
  {
    id: "eq-2",
    name: "Gerador #1",
    vessel: "MV Atlantic Star",
    health: 92,
    status: "operational",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-04-01",
    runningHours: 8920,
  },
  {
    id: "eq-3",
    name: "Bomba Auxiliar #2",
    vessel: "MV Pacific Queen",
    health: 45,
    status: "degraded",
    lastMaintenance: "2023-11-20",
    nextMaintenance: "2024-02-10",
    runningHours: 15670,
  },
  {
    id: "eq-4",
    name: "Sistema de Navegação",
    vessel: "MV Ocean Voyager",
    health: 78,
    status: "operational",
    lastMaintenance: "2024-01-28",
    nextMaintenance: "2024-02-28",
    runningHours: 3200,
  },
  {
    id: "eq-5",
    name: "Compressor de Ar",
    vessel: "MV Pacific Queen",
    health: 23,
    status: "critical",
    lastMaintenance: "2023-09-15",
    nextMaintenance: "2023-12-15",
    runningHours: 21340,
  },
];

const SPARE_PARTS: SparePartStock[] = [
  { id: "sp-1", name: "Filtro de Óleo", partNumber: "FO-3516-01", quantity: 15, minStock: 10, vessel: "MV Atlantic Star", location: "Almoxarifado A1", status: "ok" },
  { id: "sp-2", name: "Junta de Motor", partNumber: "JM-CAT-02", quantity: 3, minStock: 5, vessel: "MV Atlantic Star", location: "Almoxarifado A2", status: "low" },
  { id: "sp-3", name: "Selo Mecânico", partNumber: "SM-BP-45", quantity: 1, minStock: 3, vessel: "MV Pacific Queen", location: "Almoxarifado B1", status: "critical" },
  { id: "sp-4", name: "Correia Alternador", partNumber: "CA-GEN-12", quantity: 8, minStock: 4, vessel: "MV Ocean Voyager", location: "Almoxarifado C1", status: "ok" },
  { id: "sp-5", name: "Rolamento 6208", partNumber: "RL-6208-2RS", quantity: 4, minStock: 6, vessel: "MV Pacific Queen", location: "Almoxarifado B2", status: "low" },
];

export function MaintenanceCommandCenter() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getPriorityBadge = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-destructive text-destructive-foreground">Crítico</Badge>;
      case "high":
        return <Badge className="bg-warning text-warning-foreground">Alto</Badge>;
      case "medium":
        return <Badge className="bg-accent text-accent-foreground">Médio</Badge>;
      case "low":
        return <Badge className="bg-info text-info-foreground">Baixo</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
    switch (status) {
      case "open":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Aberta</Badge>;
      case "in_progress":
        return <Badge className="bg-info/20 text-info"><Play className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case "pending_parts":
        return <Badge className="bg-warning/20 text-warning"><Package className="h-3 w-3 mr-1" />Aguardando Peças</Badge>;
      case "completed":
        return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Concluída</Badge>;
      default:
        return null;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-success";
    if (health >= 50) return "text-warning";
    return "text-destructive";
  };

  // Métricas
  const metrics = {
    openOrders: 12,
    criticalOrders: 3,
    overdueOrders: 2,
    completedThisMonth: 45,
    mtbf: 2456, // Mean Time Between Failures
    mttr: 4.2, // Mean Time To Repair
    equipmentHealth: 78,
    partsLowStock: 5,
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-info" />
              <span className="text-sm text-muted-foreground">Ordens Abertas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.openOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Críticas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.criticalOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Atrasadas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.overdueOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Concluídas/Mês</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.completedThisMonth}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">MTBF</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.mtbf}h</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-accent-foreground" />
              <span className="text-sm text-muted-foreground">MTTR</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.mttr}h</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-secondary-foreground" />
              <span className="text-sm text-muted-foreground">Saúde Frota</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.equipmentHealth}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Estoque Baixo</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.partsLowStock}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Ordens</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Cog className="h-4 w-4" />
              <span className="hidden sm:inline">Equipamentos</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Preditiva</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventário</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
          </div>
        </div>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ordens Críticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Ordens Críticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {WORK_ORDERS.filter(wo => wo.priority === "critical" || wo.priority === "high").slice(0, 3).map((order) => (
                    <div key={order.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{order.id}</span>
                            {getPriorityBadge(order.priority)}
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm">{order.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.vessel} • {order.equipment}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Visualizar ordem de serviço" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipamentos com Problemas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-warning" />
                  Equipamentos em Alerta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EQUIPMENT.filter(eq => eq.health < 80).map((equip) => (
                    <div key={equip.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{equip.name}</p>
                          <p className="text-xs text-muted-foreground">{equip.vessel}</p>
                        </div>
                        <span className={`text-lg font-bold ${getHealthColor(equip.health)}`}>
                          {equip.health}%
                        </span>
                      </div>
                      <Progress value={equip.health} className={`h-2 ${
                        equip.health < 50 ? "[&>div]:bg-destructive" : "[&>div]:bg-warning"
                      }`} />
                      <p className="text-xs text-muted-foreground mt-2">
                        {equip.runningHours.toLocaleString()}h de operação
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Insights de Manutenção (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium text-sm">Previsão de Falha</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Compressor de Ar #3 tem 78% de probabilidade de falha nos próximos 15 dias. 
                    Recomenda-se inspeção imediata.
                  </p>
                  <Button variant="link" className="px-0 mt-2 text-primary">
                    Criar Ordem de Serviço →
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-medium text-sm">Otimização</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Agrupar manutenções do MV Atlantic Star pode economizar 
                    ~R$ 45.000 em custos de mão de obra.
                  </p>
                  <Button variant="link" className="px-0 mt-2 text-primary">
                    Ver Sugestão →
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">Estoque</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    5 peças críticas em estoque baixo. Lead time médio: 12 dias. 
                    Recomenda-se pedido urgente.
                  </p>
                  <Button variant="link" className="px-0 mt-2 text-primary">
                    Ver Itens →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ordens de Serviço */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription>Gerencie todas as ordens de manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {WORK_ORDERS.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-medium">{order.id}</span>
                            {getPriorityBadge(order.priority)}
                            {getStatusBadge(order.status)}
                            <Badge variant="outline" className="text-xs">
                              {order.type === "preventive" ? "Preventiva" : order.type === "corrective" ? "Corretiva" : "Preditiva"}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{order.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.equipment} • {order.vessel}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vence: {order.dueDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              {order.assignee}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Visualizar ordem" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ver documento" title="Documento">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Equipamentos */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EQUIPMENT.map((equip) => (
              <Card key={equip.id} className={`hover:border-primary/50 transition-colors ${
                equip.status === "critical" ? "border-red-500/50" : ""
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        equip.status === "operational" ? "bg-success/10" :
                        equip.status === "degraded" ? "bg-warning/10" :
                        "bg-destructive/10"
                      }`}>
                        <Cog className={`h-5 w-5 ${
                          equip.status === "operational" ? "text-success" :
                          equip.status === "degraded" ? "text-warning" :
                          "text-destructive"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{equip.name}</h4>
                        <p className="text-xs text-muted-foreground">{equip.vessel}</p>
                      </div>
                    </div>
                    <span className={`text-xl font-bold ${getHealthColor(equip.health)}`}>
                      {equip.health}%
                    </span>
                  </div>
                  
                  <Progress value={equip.health} className={`h-2 mb-4 ${
                    equip.health >= 80 ? "[&>div]:bg-success" :
                    equip.health >= 50 ? "[&>div]:bg-warning" :
                    "[&>div]:bg-destructive"
                  }`} />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <p>Última Manutenção</p>
                      <p className="font-medium text-foreground">{equip.lastMaintenance}</p>
                    </div>
                    <div>
                      <p>Próxima Manutenção</p>
                      <p className="font-medium text-foreground">{equip.nextMaintenance}</p>
                    </div>
                    <div className="col-span-2">
                      <p>Horas de Operação</p>
                      <p className="font-medium text-foreground">{equip.runningHours.toLocaleString()}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Manutenção Preditiva */}
        <TabsContent value="predictive" className="space-y-4">
          <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-500" />
                Motor de Manutenção Preditiva
              </CardTitle>
              <CardDescription>
                Análise de IA baseada em sensores, histórico e padrões de falha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { equipment: "Compressor de Ar #3", vessel: "MV Pacific Queen", probability: 78, days: 15, action: "Substituir válvula de alívio" },
                  { equipment: "Bomba de Combustível", vessel: "MV Atlantic Star", probability: 45, days: 45, action: "Verificar vedações" },
                  { equipment: "Turbocharger", vessel: "MV Ocean Voyager", probability: 32, days: 60, action: "Inspeção visual" },
                ].map((prediction) => (
                  <div key={prediction.equipment} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{prediction.equipment}</h4>
                        <p className="text-sm text-muted-foreground">{prediction.vessel}</p>
                      </div>
                      <Badge className={
                        prediction.probability >= 70 ? "bg-destructive" :
                        prediction.probability >= 40 ? "bg-warning" :
                        "bg-success"
                      }>
                        {prediction.probability}% risco
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 rounded bg-muted/50">
                      <p className="text-sm">
                        <span className="font-medium">Previsão:</span> Falha em aproximadamente {prediction.days} dias
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Ação recomendada:</span> {prediction.action}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar OS
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Inventário */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventário de Peças</CardTitle>
                  <CardDescription>Estoque de peças sobressalentes por embarcação</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Peça
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {SPARE_PARTS.map((part) => (
                    <div key={part.id} className={`p-4 rounded-lg border ${
                      part.status === "critical" ? "border-red-500/50 bg-red-500/5" :
                      part.status === "low" ? "border-amber-500/50 bg-amber-500/5" :
                      "bg-card"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{part.name}</h4>
                            <Badge variant="outline" className="text-xs font-mono">
                              {part.partNumber}
                            </Badge>
                            <Badge className={
                              part.status === "critical" ? "bg-red-500" :
                              part.status === "low" ? "bg-amber-500" :
                              "bg-emerald-500"
                            }>
                              {part.status === "critical" ? "Crítico" : part.status === "low" ? "Baixo" : "OK"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {part.vessel} • {part.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{part.quantity}</p>
                          <p className="text-xs text-muted-foreground">Mín: {part.minStock}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaintenanceCommandCenter;
