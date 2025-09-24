import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Target,
  Zap,
  Globe,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dados simulados consolidados
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      revenue: { value: 2450000, change: 12.5, status: 'up' },
      employees: { value: 125, change: 4.2, status: 'up' },
      efficiency: { value: 94.2, change: 2.8, status: 'up' },
      satisfaction: { value: 4.6, change: 4.5, status: 'up' }
    },
    alerts: [
      { id: 1, title: 'Certificado expirando', type: 'warning', priority: 'medium' },
      { id: 2, title: 'Meta de vendas atingida', type: 'success', priority: 'low' },
      { id: 3, title: 'Sistema otimização sugerida', type: 'info', priority: 'medium' }
    ],
    recentActivities: [
      { id: 1, user: 'João Silva', action: 'Completou treinamento STCW', time: '2h atrás', type: 'certificate' },
      { id: 2, user: 'Maria Santos', action: 'Aprovado relatório mensal', time: '4h atrás', type: 'report' },
      { id: 3, user: 'Carlos Lima', action: 'Atualizado cronograma viagem', time: '6h atrás', type: 'travel' }
    ],
    systemHealth: {
      performance: 95,
      uptime: 99.9,
      activeUsers: 42,
      errorRate: 0.1
    }
  });

  const performanceData = [
    { time: '00:00', users: 15, performance: 92 },
    { time: '04:00', users: 8, performance: 95 },
    { time: '08:00', users: 35, performance: 88 },
    { time: '12:00', users: 45, performance: 85 },
    { time: '16:00', users: 38, performance: 90 },
    { time: '20:00', users: 25, performance: 94 }
  ];

  const quickActions = [
    { 
      title: 'Relatórios Avançados', 
      description: 'Gerar relatórios detalhados', 
      icon: BarChart3, 
      path: '/advanced-reports',
      color: 'bg-blue-500'
    },
    { 
      title: 'Dashboard Executivo', 
      description: 'Visão estratégica completa', 
      icon: Target, 
      path: '/executive',
      color: 'bg-purple-500'
    },
    { 
      title: 'Monitor Sistema', 
      description: 'Performance em tempo real', 
      icon: Activity, 
      path: '/system-monitor',
      color: 'bg-green-500'
    },
    { 
      title: 'Centro Notificações', 
      description: 'Alertas inteligentes', 
      icon: Bell, 
      path: '/notification-center',
      color: 'bg-orange-500'
    },
    { 
      title: 'IA & Inovação', 
      description: 'Ferramentas avançadas', 
      icon: Zap, 
      path: '/innovation',
      color: 'bg-cyan-500'
    },
    { 
      title: 'Sistema Marítimo', 
      description: 'Gestão completa marítima', 
      icon: Globe, 
      path: '/maritime',
      color: 'bg-indigo-500'
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular atualização dos dados
    setDashboardData(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        efficiency: { ...prev.kpis.efficiency, value: prev.kpis.efficiency.value + Math.random() * 2 - 1 }
      },
      systemHealth: {
        ...prev.systemHealth,
        performance: Math.max(90, Math.min(100, prev.systemHealth.performance + Math.random() * 4 - 2))
      }
    }));
    
    setIsRefreshing(false);
    toast({
      title: "Dashboard atualizado",
      description: "Dados atualizados com sucesso",
    });
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'report': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'travel': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            Dashboard Principal - Nautilus One
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.email?.split('@')[0] || 'Usuário'}! 
            Aqui está o resumo do seu sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/executive')}>
            <Target className="w-4 h-4 mr-2" />
            Visão Executiva
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">R$ {(dashboardData.kpis.revenue.value / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+{dashboardData.kpis.revenue.change}%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Funcionários</p>
                <p className="text-2xl font-bold">{dashboardData.kpis.employees.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">+{dashboardData.kpis.employees.change}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold">{dashboardData.kpis.efficiency.value.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">+{dashboardData.kpis.efficiency.change}%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold">{dashboardData.kpis.satisfaction.value}/5</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">+{dashboardData.kpis.satisfaction.change}%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso direto aos principais módulos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg hover-lift transition-all cursor-pointer border-l-4 border-l-primary">
                <CardContent className="p-4" onClick={() => navigate(action.path)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg">
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance do Sistema (24h)</CardTitle>
            <CardDescription>Usuários ativos e performance geral</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Usuários" />
                <Area type="monotone" dataKey="performance" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Performance %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Saúde do Sistema</CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Performance Geral</span>
                <span className="text-sm">{dashboardData.systemHealth.performance}%</span>
              </div>
              <Progress value={dashboardData.systemHealth.performance} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm">{dashboardData.systemHealth.uptime}%</span>
              </div>
              <Progress value={dashboardData.systemHealth.uptime} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{dashboardData.systemHealth.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Usuários Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{dashboardData.systemHealth.errorRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Alertas e Notificações
              <Button variant="outline" size="sm" onClick={() => navigate('/notification-center')}>
                Ver Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(alert.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <Badge variant="outline" className="mt-1">
                    {alert.priority}
                  </Badge>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedDashboard;