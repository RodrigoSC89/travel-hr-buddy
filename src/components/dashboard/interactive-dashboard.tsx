import React, { useState, useEffect } from 'react';
import { QuickActions } from '@/components/ui/quick-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  CheckCircle
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => (
  <Card className="hover-scale cursor-pointer transition-all hover:shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center space-x-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {change}%
            </span>
          </div>
        </div>
        <div className="text-muted-foreground">
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
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const TaskProgressCard: React.FC<{ task: TaskProgress }> = ({ task }) => {
  const statusColors = {
    pending: 'bg-yellow-500',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500'
  };

  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  };

  return (
    <Card className={`border-l-4 ${priorityColors[task.priority]} hover-scale transition-all`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{task.title}</h4>
            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
              {task.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
               task.status === 'in-progress' ? <Activity className="w-3 h-3 mr-1" /> :
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

export const InteractiveDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskProgress[]>([
    { id: '1', title: 'Implementar autenticação', progress: 100, status: 'completed', priority: 'high' },
    { id: '2', title: 'Dashboard interativo', progress: 85, status: 'in-progress', priority: 'high' },
    { id: '3', title: 'Integração Supabase', progress: 60, status: 'in-progress', priority: 'medium' },
    { id: '4', title: 'Testes unitários', progress: 20, status: 'pending', priority: 'medium' },
    { id: '5', title: 'Documentação', progress: 0, status: 'pending', priority: 'low' }
  ]);

  const [metrics] = useState([
    { title: 'Usuários Ativos', value: '2,543', change: 12.5, icon: <Users className="h-8 w-8" />, trend: 'up' as const },
    { title: 'Receita Mensal', value: 'R$ 45.2k', change: 8.2, icon: <DollarSign className="h-8 w-8" />, trend: 'up' as const },
    { title: 'Taxa de Conversão', value: '3.2%', change: -2.4, icon: <Target className="h-8 w-8" />, trend: 'down' as const },
    { title: 'Performance', value: '94%', change: 5.1, icon: <Zap className="h-8 w-8" />, trend: 'up' as const }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === 'in-progress' && Math.random() > 0.7) {
            const newProgress = Math.min(task.progress + Math.floor(Math.random() * 5), 100);
            return {
              ...task,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'in-progress'
            };
          }
          return task;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overallProgress = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Principal</h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso e métricas em tempo real
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Geral do Projeto</CardTitle>
                <CardDescription>
                  {completedTasks} de {tasks.length} tarefas concluídas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-blue-500">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Em Progresso</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-yellow-500">
                      {tasks.filter(t => t.status === 'pending').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas atualizações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2 min', action: 'Sistema de autenticação ativado', type: 'success' },
                    { time: '15 min', action: 'Dashboard atualizado', type: 'info' },
                    { time: '1h', action: 'Novo usuário registrado', type: 'info' },
                    { time: '2h', action: 'Backup realizado', type: 'success' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Analytics detalhados em desenvolvimento...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};