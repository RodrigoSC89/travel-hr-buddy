/**
 * Smart Maintenance Scheduler - Agendamento Inteligente de Manutenção
 * Com previsão de IA e otimização de recursos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Settings,
  Plus,
  Search,
  Filter,
  Brain,
  Zap,
  BarChart3,
  Target,
  Ship,
  Gauge,
  Thermometer,
  Activity,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface MaintenanceTask {
  id: string;
  equipment: string;
  vessel: string;
  type: "preventive" | "corrective" | "predictive" | "condition_based";
  priority: "critical" | "high" | "medium" | "low";
  scheduledDate: Date;
  estimatedDuration: number; // hours
  status: "scheduled" | "in_progress" | "completed" | "overdue" | "postponed";
  assignedTo: string;
  parts: { name: string; quantity: number; inStock: boolean }[];
  description: string;
  aiScore?: number;
  healthTrend?: number[];
}

interface EquipmentHealth {
  id: string;
  name: string;
  vessel: string;
  healthScore: number;
  trend: "up" | "down" | "stable";
  lastMaintenance: Date;
  nextMaintenance: Date;
  runningHours: number;
  predictions: {
    component: string;
    probability: number;
    estimatedDate: Date;
  }[];
}

const HEALTH_TREND_DATA = [
  { day: "Seg", score: 92 },
  { day: "Ter", score: 91 },
  { day: "Qua", score: 89 },
  { day: "Qui", score: 88 },
  { day: "Sex", score: 87 },
  { day: "Sáb", score: 85 },
  { day: "Dom", score: 84 },
];

const MOCK_TASKS: MaintenanceTask[] = [
  {
    id: "1",
    equipment: "Motor Principal #1",
    vessel: "MV Atlantic Star",
    type: "predictive",
    priority: "critical",
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    estimatedDuration: 8,
    status: "scheduled",
    assignedTo: "Equipe A",
    parts: [
      { name: "Junta do cabeçote", quantity: 1, inStock: true },
      { name: "Filtro de óleo", quantity: 2, inStock: true },
      { name: "Correia", quantity: 1, inStock: false },
    ],
    description: "IA detectou anomalia térmica. Recomenda-se inspeção preventiva.",
    aiScore: 92,
    healthTrend: [95, 94, 92, 90, 88, 85, 84],
  },
  {
    id: "2",
    equipment: "Gerador Auxiliar #2",
    vessel: "MV Atlantic Star",
    type: "preventive",
    priority: "medium",
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    estimatedDuration: 4,
    status: "scheduled",
    assignedTo: "Equipe B",
    parts: [
      { name: "Kit de filtros", quantity: 1, inStock: true },
      { name: "Óleo lubrificante", quantity: 20, inStock: true },
    ],
    description: "Manutenção preventiva de 500 horas.",
    aiScore: 75,
    healthTrend: [98, 97, 96, 95, 94, 93, 92],
  },
  {
    id: "3",
    equipment: "Sistema de Governo",
    vessel: "MV Pacific Explorer",
    type: "corrective",
    priority: "high",
    scheduledDate: new Date(),
    estimatedDuration: 6,
    status: "in_progress",
    assignedTo: "Equipe A",
    parts: [
      { name: "Selo hidráulico", quantity: 4, inStock: true },
      { name: "Fluido hidráulico", quantity: 50, inStock: true },
    ],
    description: "Vazamento detectado no cilindro hidráulico.",
    aiScore: 88,
  },
];

const MOCK_EQUIPMENT_HEALTH: EquipmentHealth[] = [
  {
    id: "1",
    name: "Motor Principal #1",
    vessel: "MV Atlantic Star",
    healthScore: 84,
    trend: "down",
    lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextMaintenance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    runningHours: 12450,
    predictions: [
      { component: "Injetor #3", probability: 85, estimatedDate: addDays(new Date(), 15) },
      { component: "Bomba de combustível", probability: 45, estimatedDate: addDays(new Date(), 45) },
    ],
  },
  {
    id: "2",
    name: "Gerador Auxiliar #1",
    vessel: "MV Atlantic Star",
    healthScore: 92,
    trend: "stable",
    lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    runningHours: 8920,
    predictions: [],
  },
  {
    id: "3",
    name: "Sistema de Lastro",
    vessel: "MV Atlantic Star",
    healthScore: 96,
    trend: "up",
    lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    runningHours: 4560,
    predictions: [],
  },
];

export default function SmartMaintenanceScheduler() {
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const criticalTasks = MOCK_TASKS.filter((t) => t.priority === "critical").length;
  const inProgressTasks = MOCK_TASKS.filter((t) => t.status === "in_progress").length;
  const avgHealthScore = Math.round(
    MOCK_EQUIPMENT_HEALTH.reduce((acc, e) => acc + e.healthScore, 0) / MOCK_EQUIPMENT_HEALTH.length
  );

  const getTypeBadge = (type: MaintenanceTask["type"]) => {
    const config: Record<MaintenanceTask["type"], { label: string; color: string; showIcon?: boolean }> = {
      preventive: { label: "Preventiva", color: "bg-blue-500/10 text-blue-500" },
      corrective: { label: "Corretiva", color: "bg-destructive/10 text-destructive" },
      predictive: { label: "Preditiva", color: "bg-purple-500/10 text-purple-500", showIcon: true },
      condition_based: { label: "Condicional", color: "bg-cyan-500/10 text-cyan-500" },
    };
    const { label, color, showIcon } = config[type];
    return (
      <Badge className={color}>
        {showIcon && <Brain className="h-3 w-3 mr-1" />}
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: MaintenanceTask["priority"]) => {
    const config = {
      critical: { label: "Crítico", color: "bg-red-500 text-white" },
      high: { label: "Alta", color: "bg-amber-500/10 text-amber-500" },
      medium: { label: "Média", color: "bg-blue-500/10 text-blue-500" },
      low: { label: "Baixa", color: "bg-gray-500/10 text-gray-500" },
    };
    const { label, color } = config[priority];
    return <Badge className={color}>{label}</Badge>;
  };

  const getStatusBadge = (status: MaintenanceTask["status"]) => {
    const config = {
      scheduled: { label: "Agendada", color: "bg-blue-500/10 text-blue-500" },
      in_progress: { label: "Em Andamento", color: "bg-green-500/10 text-green-500" },
      completed: { label: "Concluída", color: "bg-gray-500/10 text-gray-500" },
      overdue: { label: "Atrasada", color: "bg-red-500/10 text-red-500" },
      postponed: { label: "Adiada", color: "bg-amber-500/10 text-amber-500" },
    };
    const { label, color } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold">{criticalTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold">{MOCK_TASKS.filter((t) => t.status === "scheduled").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Média</p>
                <p className="text-2xl font-bold">{avgHealthScore}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previsões IA</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Brain className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ordens de Manutenção</CardTitle>
                <CardDescription>Tarefas agendadas e em andamento</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-9 w-[180px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova OS
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Criar Ordem de Serviço</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preventive">Preventiva</SelectItem>
                              <SelectItem value="corrective">Corretiva</SelectItem>
                              <SelectItem value="predictive">Preditiva</SelectItem>
                              <SelectItem value="condition_based">Condicional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Prioridade</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">Crítica</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="low">Baixa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Equipamento</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o equipamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="motor1">Motor Principal #1</SelectItem>
                            <SelectItem value="gerador1">Gerador Auxiliar #1</SelectItem>
                            <SelectItem value="lastro">Sistema de Lastro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data</Label>
                          <Input type="date" />
                        </div>
                        <div>
                          <Label>Duração (horas)</Label>
                          <Input type="number" placeholder="8" />
                        </div>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea placeholder="Descreva a tarefa..." />
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => {
                          toast.success("Ordem de serviço criada!");
                          setShowNewTask(false);
                        }}>
                          Criar OS
                        </Button>
                        <Button variant="outline" onClick={() => setShowNewTask(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {MOCK_TASKS.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedTask(task)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTask?.id === task.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeBadge(task.type)}
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                          {task.aiScore && task.aiScore > 80 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              {task.aiScore}%
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium mt-2">{task.equipment}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {task.vessel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedDuration}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(task.scheduledDate, "dd/MM")}
                          </span>
                        </div>
                      </div>
                      {task.healthTrend && (
                        <div className="w-24 h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={task.healthTrend.map((v, i) => ({ i, v }))}>
                              <defs>
                                <linearGradient id={`health-${task.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="v"
                                stroke="#EF4444"
                                fill={`url(#health-${task.id})`}
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                    {/* Parts Status */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-1 flex-wrap">
                        {task.parts.map((part, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={part.inStock ? "" : "border-red-500 text-red-500"}
                          >
                            {part.name} ({part.quantity})
                            {!part.inStock && " ⚠️"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Equipment Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Saúde dos Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {MOCK_EQUIPMENT_HEALTH.map((equipment) => (
                  <div key={equipment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{equipment.name}</h4>
                        <p className="text-sm text-muted-foreground">{equipment.vessel}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-2xl font-bold ${getHealthColor(equipment.healthScore)}`}>
                          {equipment.healthScore}%
                        </span>
                        {equipment.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : equipment.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                    <Progress
                      value={equipment.healthScore}
                      className={`h-2 mt-3 ${
                        equipment.healthScore >= 90
                          ? "[&>div]:bg-green-500"
                          : equipment.healthScore >= 70
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-red-500"
                      }`}
                    />
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                      <div>
                        <span className="block">Horas de Operação</span>
                        <span className="font-medium text-foreground">{equipment.runningHours.toLocaleString()}h</span>
                      </div>
                      <div>
                        <span className="block">Próx. Manutenção</span>
                        <span className="font-medium text-foreground">
                          {differenceInDays(equipment.nextMaintenance, new Date())}d
                        </span>
                      </div>
                    </div>
                    {/* AI Predictions */}
                    {equipment.predictions.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium flex items-center gap-1 mb-2">
                          <Brain className="h-3 w-3" />
                          Previsões IA
                        </p>
                        {equipment.predictions.map((pred, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between text-xs p-2 rounded ${
                              pred.probability > 70 ? "bg-red-500/10" : "bg-amber-500/10"
                            }`}
                          >
                            <span>{pred.component}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{pred.probability}%</span>
                              <span className="text-muted-foreground">
                                ~{differenceInDays(pred.estimatedDate, new Date())}d
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Health Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tendência de Saúde da Frota
          </CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HEALTH_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis domain={[80, 100]} className="text-xs" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
