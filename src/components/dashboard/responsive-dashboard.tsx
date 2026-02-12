import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Globe,
  Building,
  Plane
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
  gradient?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend, gradient = "from-blue-500 to-cyan-400" }) => (
  <Card className="hover-scale cursor-pointer transition-all hover:shadow-lg group overflow-hidden relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
    <CardContent className="p-6 relative">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display">{value}</p>
          <div className="flex items-center space-x-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}>
              {change > 0 ? "+" : ""}{change}%
            </span>
          </div>
        </div>
        <div className={`text-foreground/80 group-hover:bg-gradient-to-br group-hover:${gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface TaskProgress {
  id: string;
  title: string;
  progress: number;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

const TaskProgressCard: React.FC<{ task: TaskProgress }> = ({ task }) => {
  const statusColors = {
    pending: "bg-warning",
    "in-progress": "bg-primary",
    completed: "bg-success"
  };

  const priorityColors = {
    low: "border-l-success",
    medium: "border-l-warning",
    high: "border-l-destructive"
  };

  return (
    <Card className={`border-l-4 ${priorityColors[task.priority]} hover-scale transition-all`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm sm:text-base">{task.title}</h4>
            <Badge variant={task.status === "completed" ? "default" : "secondary"} className="text-xs">
              {task.status === "completed" ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                task.status === "in-progress" ? <Activity className="w-3 h-3 mr-1" /> :
                  <AlertTriangle className="w-3 h-3 mr-1" />}
              {task.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ResponsiveDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskProgress[]>([
    { id: "1", title: "Implementar autenticação", progress: 100, status: "completed", priority: "high" },
    { id: "2", title: "Dashboard interativo", progress: 95, status: "in-progress", priority: "high" },
    { id: "3", title: "Integração Supabase", progress: 75, status: "in-progress", priority: "medium" },
    { id: "4", title: "Testes unitários", progress: 40, status: "in-progress", priority: "medium" },
    { id: "5", title: "Documentação", progress: 15, status: "pending", priority: "low" }
  ]);

  const [metrics] = useState([
    { 
      title: "Usuários Ativos", 
      value: "2,543", 
      change: 12.5, 
      icon: <Users className="h-6 w-6 sm:h-8 sm:w-8" />, 
      trend: "up" as const,
      gradient: "from-blue-500 to-cyan-400"
    },
    { 
      title: "Receita Mensal", 
      value: "R$ 45.2k", 
      change: 8.2, 
      icon: <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />, 
      trend: "up" as const,
      gradient: "from-green-500 to-emerald-400"
    },
    { 
      title: "Taxa de Conversão", 
      value: "3.2%", 
      change: -2.4, 
      icon: <Target className="h-6 w-6 sm:h-8 sm:w-8" />, 
      trend: "down" as const,
      gradient: "from-orange-500 to-red-400"
    },
    { 
      title: "Performance", 
      value: "94%", 
      change: 5.1, 
      icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8" />, 
      trend: "up" as const,
      gradient: "from-secondary to-accent"
    }
  ]);

  const [quickStats] = useState([
    { label: "Viagens Ativas", value: "23", icon: Plane, color: "text-primary" },
    { label: "Funcionários", value: "1,247", icon: Users, color: "text-success" },
    { label: "Escritórios", value: "8", icon: Building, color: "text-secondary-foreground" },
    { label: "Países", value: "12", icon: Globe, color: "text-warning" }
  ]);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setTasks(prevTasks => 
        prevTasks.map((task, idx) => {
          if (task.status === "in-progress" && tick % (4 + idx) === 0) {
            const newProgress = Math.min(task.progress + 2, 100);
            return {
              ...task,
              progress: newProgress,
              status: newProgress === 100 ? "completed" : "in-progress"
            };
          }
          return task;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const overallProgress = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Acompanhe o progresso e métricas em tempo real
          </p>
        </div>
        <Button 
          className="hover-scale w-full sm:w-auto"
          onClick={() => {
            const csvRows = [
              "Métrica;Valor",
              ...quickStats.map((s) => `${s.label};${s.value}`)
            ];
            const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Relatório exportado!");
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Ver Relatório
        </Button>
      </div>

      {/* Quick Stats - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="hover-scale transition-all">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                <div>
                  <p className="text-lg sm:text-2xl font-bold font-display">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tarefas</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Progresso Geral do Projeto</CardTitle>
                <CardDescription className="text-sm">
                  {completedTasks} de {tasks.length} tarefas concluídas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-bold">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-success">{completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {tasks.filter(t => t.status === "in-progress").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Em Progresso</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-warning">
                      {tasks.filter(t => t.status === "pending").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Atividade Recente</CardTitle>
                <CardDescription className="text-sm">
                  Últimas atualizações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "2 min", action: "Sistema de autenticação ativado", type: "success" },
                    { time: "15 min", action: "Dashboard atualizado", type: "info" },
                    { time: "1h", action: "Novo usuário registrado", type: "info" },
                    { time: "2h", action: "Backup realizado", type: "success" }
                  ].map((activity) => (
                    <div key={activity.action} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === "success" ? "bg-success" : "bg-primary"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">há {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskProgressCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançados</CardTitle>
              <CardDescription>
                Métricas detalhadas e insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="font-medium">Performance do Sistema</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Uptime</span><span className="font-medium text-foreground">99.9%</span></div>
                    <div className="flex justify-between"><span>Tempo de resposta</span><span className="font-medium text-foreground">&lt;200ms</span></div>
                    <div className="flex justify-between"><span>Queries/min</span><span className="font-medium text-foreground">~45</span></div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="font-medium">Uso por Módulo</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Operations</span><span className="font-medium text-foreground">34%</span></div>
                    <div className="flex justify-between"><span>People</span><span className="font-medium text-foreground">28%</span></div>
                    <div className="flex justify-between"><span>Compliance</span><span className="font-medium text-foreground">22%</span></div>
                    <div className="flex justify-between"><span>Outros</span><span className="font-medium text-foreground">16%</span></div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};