/**
 * Smart Maintenance Planner - Planejador Inteligente de Manutenção
 * Calendário visual, PMS e gestão de recursos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wrench, Calendar, Clock, AlertTriangle, CheckCircle2,
  Plus, Filter, Download, Ship, Settings, Cog,
  Activity, TrendingUp, TrendingDown, BarChart3, Target,
  Brain, Sparkles, Timer, Users, Package, Anchor
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MaintenanceTask {
  id: string;
  code: string;
  title: string;
  equipment: string;
  system: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "scheduled" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  estimatedHours: number;
  assignedTo: string;
  vessel: string;
  category: "preventive" | "corrective" | "predictive";
  interval?: string;
  lastCompleted?: string;
}

const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: "m1",
    code: "ME-001",
    title: "Inspeção Motor Principal",
    equipment: "Motor Principal MAN B&W",
    system: "Propulsão",
    priority: "critical",
    status: "scheduled",
    dueDate: "2024-01-20",
    estimatedHours: 8,
    assignedTo: "Eq. Máquinas A",
    vessel: "MV Atlantic Star",
    category: "preventive",
    interval: "500h",
    lastCompleted: "2024-01-05"
  },
  {
    id: "m2",
    code: "HY-015",
    title: "Troca Óleo Hidráulico",
    equipment: "Sistema Hidráulico Convés",
    system: "Hidráulico",
    priority: "high",
    status: "in-progress",
    dueDate: "2024-01-18",
    estimatedHours: 4,
    assignedTo: "João Costa",
    vessel: "MV Atlantic Star",
    category: "preventive",
    interval: "1000h"
  },
  {
    id: "m3",
    code: "EL-042",
    title: "Teste Gerador de Emergência",
    equipment: "Gerador Emergência CAT",
    system: "Elétrico",
    priority: "medium",
    status: "scheduled",
    dueDate: "2024-01-22",
    estimatedHours: 2,
    assignedTo: "Pedro Silva",
    vessel: "MV Atlantic Star",
    category: "preventive",
    interval: "Mensal"
  },
  {
    id: "m4",
    code: "NA-008",
    title: "Calibração Radar",
    equipment: "Radar ARPA Furuno",
    system: "Navegação",
    priority: "high",
    status: "overdue",
    dueDate: "2024-01-10",
    estimatedHours: 3,
    assignedTo: "Carlos Oliveira",
    vessel: "MV Pacific Dream",
    category: "preventive",
    interval: "6 meses"
  },
  {
    id: "m5",
    code: "LS-022",
    title: "Inspeção Botes Salva-vidas",
    equipment: "Botes Salva-vidas 1-4",
    system: "Salvatagem",
    priority: "critical",
    status: "completed",
    dueDate: "2024-01-15",
    estimatedHours: 6,
    assignedTo: "Eq. Convés",
    vessel: "MV Atlantic Star",
    category: "preventive",
    interval: "Mensal",
    lastCompleted: "2024-01-15"
  },
];

const systems = [
  { name: "Propulsão", tasks: 12, completed: 10, color: "#6366f1" },
  { name: "Elétrico", tasks: 18, completed: 15, color: "#f59e0b" },
  { name: "Hidráulico", tasks: 8, completed: 6, color: "#3b82f6" },
  { name: "Navegação", tasks: 6, completed: 5, color: "#10b981" },
  { name: "Salvatagem", tasks: 10, completed: 9, color: "#ef4444" },
  { name: "HVAC", tasks: 4, completed: 4, color: "#8b5cf6" },
];

const priorityColors = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground",
};

const statusIcons = {
  scheduled: Clock,
  "in-progress": Activity,
  completed: CheckCircle2,
  overdue: AlertTriangle,
};

export default function SmartMaintenancePlanner() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [currentMonth] = useState(new Date());
  const [view, setView] = useState<"list" | "calendar">("list");

  const stats = {
    total: MAINTENANCE_TASKS.length,
    overdue: MAINTENANCE_TASKS.filter(t => t.status === "overdue").length,
    inProgress: MAINTENANCE_TASKS.filter(t => t.status === "in-progress").length,
    completed: MAINTENANCE_TASKS.filter(t => t.status === "completed").length,
    compliance: Math.round((MAINTENANCE_TASKS.filter(t => t.status === "completed").length / MAINTENANCE_TASKS.length) * 100),
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getTasksForDay = (date: Date) => {
    return MAINTENANCE_TASKS.filter(task => 
      isSameDay(new Date(task.dueDate), date)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Tarefas</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </div>
                <Wrench className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={stats.overdue > 0 ? "border-destructive/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                  <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
                  <p className="text-xs text-destructive">Ação urgente</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">Execução</p>
                </div>
                <Activity className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold text-success">{stats.completed}</p>
                  <p className="text-xs text-success">✓ OK</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Compliance PMS</p>
                  <p className="text-2xl font-bold text-success">{stats.compliance}%</p>
                  <Progress value={stats.compliance} className="h-1.5 mt-1" />
                </div>
                <Target className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48">
              <Ship className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Navio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Navios</SelectItem>
              <SelectItem value="atlantic">MV Atlantic Star</SelectItem>
              <SelectItem value="pacific">MV Pacific Dream</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-40">
              <Cog className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {systems.map(s => (
                <SelectItem key={s.name} value={s.name.toLowerCase()}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg">
            <Button 
              variant={view === "list" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setView("list")}
            >
              Lista
            </Button>
            <Button 
              variant={view === "calendar" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setView("calendar")}
            >
              Calendário
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {view === "list" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Tarefas de Manutenção
                </CardTitle>
                <CardDescription>
                  {MAINTENANCE_TASKS.length} tarefas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {MAINTENANCE_TASKS.map((task, index) => {
                      const StatusIcon = statusIcons[task.status];
                      const daysUntil = differenceInDays(new Date(task.dueDate), new Date());
                      
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                            task.status === "overdue" ? "border-destructive/50 bg-destructive/5" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                task.status === "completed" ? "bg-success/10" :
                                task.status === "overdue" ? "bg-destructive/10" :
                                task.status === "in-progress" ? "bg-primary/10" : "bg-muted"
                              }`}>
                                <StatusIcon className={`h-5 w-5 ${
                                  task.status === "completed" ? "text-success" :
                                  task.status === "overdue" ? "text-destructive" :
                                  task.status === "in-progress" ? "text-primary" : "text-muted-foreground"
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{task.code}</Badge>
                                  <Badge className={priorityColors[task.priority]}>
                                    {task.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {task.category}
                                  </Badge>
                                </div>
                                <h4 className="font-medium mt-1">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.equipment}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Ship className="h-3 w-3" />
                                    {task.vessel}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {task.assignedTo}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    {task.estimatedHours}h
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                daysUntil < 0 ? "text-destructive" :
                                daysUntil <= 3 ? "text-warning" : ""
                              }`}>
                                {format(new Date(task.dueDate), "dd/MM/yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {daysUntil < 0 ? `${Math.abs(daysUntil)} dias atrasado` :
                                 daysUntil === 0 ? "Hoje" :
                                 `Em ${daysUntil} dias`}
                              </p>
                              {task.interval && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  Intervalo: {task.interval}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Calendário de Manutenção
                </CardTitle>
                <CardDescription>
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((day, index) => {
                    const tasks = getTasksForDay(day);
                    const hasOverdue = tasks.some(t => t.status === "overdue");
                    const hasCritical = tasks.some(t => t.priority === "critical");
                    
                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0 }}
                        className={`p-2 min-h-20 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                          isSameDay(day, new Date()) ? "bg-primary/5 border-primary" : ""
                        } ${hasOverdue ? "border-destructive/50" : ""}`}
                      >
                        <p className={`text-sm font-medium ${
                          isSameDay(day, new Date()) ? "text-primary" : ""
                        }`}>
                          {format(day, "d")}
                        </p>
                        {tasks.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {tasks.slice(0, 2).map(task => (
                              <div 
                                key={task.id}
                                className={`text-xs p-1 rounded truncate ${
                                  task.status === "overdue" ? "bg-destructive/20 text-destructive" :
                                  task.priority === "critical" ? "bg-destructive/10 text-destructive" :
                                  task.status === "completed" ? "bg-success/10 text-success" :
                                  "bg-primary/10 text-primary"
                                }`}
                              >
                                {task.code}
                              </div>
                            ))}
                            {tasks.length > 2 && (
                              <p className="text-xs text-muted-foreground">+{tasks.length - 2}</p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Systems Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Por Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systems.map(system => (
                <div key={system.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{system.name}</span>
                    <span className="text-muted-foreground">
                      {system.completed}/{system.tasks}
                    </span>
                  </div>
                  <Progress 
                    value={(system.completed / system.tasks) * 100} 
                    className="h-1.5"
                    style={{ 
                      "--progress-color": system.color 
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Predictions */}
          <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent-foreground" />
                Manutenção Preditiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-sm">Bomba Óleo #2</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vibração anormal detectada. Probabilidade de falha: 73% em 15 dias.
                </p>
                <Button size="sm" className="w-full mt-2" variant="outline">
                  Agendar Inspeção
                </Button>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Gerador #1</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Próxima manutenção recomendada: 2.500h (atual: 2.350h)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Peças Necessárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Filtros óleo</span>
                  <Badge variant="outline" className="text-xs">4 un</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Juntas vedação</span>
                  <Badge variant="destructive" className="text-xs">Encomendar</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Óleo hidráulico</span>
                  <Badge variant="outline" className="text-xs">200L</Badge>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3" variant="outline">
                Ver Inventário
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
