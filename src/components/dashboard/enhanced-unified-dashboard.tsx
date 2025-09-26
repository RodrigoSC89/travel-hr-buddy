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
  RefreshCw,
  Crown,
  Shield,
  Smartphone,
  Ship,
  FileText,
  Brain,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedDashboardFilters } from './enhanced-dashboard-filters';

const EnhancedUnifiedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTenant, currentBranding, currentUser, tenantUsage } = useTenant();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState(['revenue', 'employees', 'efficiency', 'satisfaction']);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('30d');

  // Dados consolidados do sistema
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      revenue: { value: 2450000, change: 12.5, status: 'up' },
      employees: { value: 125, change: 4.2, status: 'up' },
      efficiency: { value: 94.2, change: 2.8, status: 'up' },
      satisfaction: { value: 4.6, change: 4.5, status: 'up' }
    },
    alerts: [
      { id: 1, title: 'Certificado STCW expirando em 15 dias', type: 'warning', priority: 'high', module: 'hr' },
      { id: 2, title: 'Meta de eficiência atingida', type: 'success', priority: 'low', module: 'fleet' },
      { id: 3, title: 'Análise IA disponível para PEOTRAM', type: 'info', priority: 'medium', module: 'peotram' },
      { id: 4, title: 'Backup automático concluído', type: 'success', priority: 'low', module: 'system' }
    ],
    recentActivities: [
      { id: 1, user: 'João Silva', action: 'Completou auditoria PEOTRAM #2024-001', time: '2h atrás', type: 'peotram', vessel: 'MV Ocean Explorer' },
      { id: 2, user: 'Maria Santos', action: 'Aprovou relatório mensal de frota', time: '4h atrás', type: 'fleet' },
      { id: 3, user: 'Carlos Lima', action: 'Atualizou cronograma de viagem', time: '6h atrás', type: 'travel' },
      { id: 4, user: 'Ana Costa', action: 'Upload de certificado STCW', time: '8h atrás', type: 'certificate' }
    ],
    systemHealth: {
      performance: 97,
      uptime: 99.9,
      activeUsers: tenantUsage?.active_users || 42,
      errorRate: 0.1,
      apiCalls: tenantUsage?.api_calls_made || 1250,
      storageUsed: tenantUsage?.storage_used_gb || 2.3
    },
    moduleStats: {
      peotram: { audits: tenantUsage?.peotram_audits_created || 15, completion: 92 },
      fleet: { vessels: tenantUsage?.vessels_managed || 8, efficiency: 94 },
      documents: { processed: tenantUsage?.documents_processed || 42, ai_analyzed: 38 },
      reports: { generated: tenantUsage?.reports_generated || 23, automated: 18 }
    }
  });

  const performanceData = [
    { time: '00:00', users: 15, performance: 92, api_calls: 120 },
    { time: '04:00', users: 8, performance: 95, api_calls: 80 },
    { time: '08:00', users: 35, performance: 88, api_calls: 280 },
    { time: '12:00', users: 45, performance: 85, api_calls: 350 },
    { time: '16:00', users: 38, performance: 90, api_calls: 290 },
    { time: '20:00', users: 25, performance: 94, api_calls: 180 }
  ];

  const moduleUsageData = [
    { name: 'PEOTRAM', value: 35, color: '#2563eb' },
    { name: 'Fleet', value: 28, color: '#7c3aed' },
    { name: 'HR', value: 20, color: '#059669' },
    { name: 'Analytics', value: 17, color: '#dc2626' }
  ];

  const quickActions = [
    { 
      title: 'Auditoria PEOTRAM', 
      description: 'Iniciar nova auditoria ou revisar pendentes', 
      icon: FileText, 
      path: '/peotram',
      color: 'bg-blue-500',
      count: dashboardData.moduleStats.peotram.audits,
      status: 'success'
    },
    { 
      title: 'Gestão da Frota', 
      description: 'Monitorar embarcações e performance', 
      icon: Ship, 
      path: '/fleet-dashboard',
      color: 'bg-purple-500',
      count: dashboardData.moduleStats.fleet.vessels,
      status: 'info'
    },
    { 
      title: 'Analytics Avançado', 
      description: 'Relatórios detalhados e insights', 
      icon: BarChart3, 
      path: '/advanced-analytics',
      color: 'bg-green-500',
      count: dashboardData.moduleStats.reports.generated,
      status: 'warning'
    },
    { 
      title: 'IA & Inovação', 
      description: 'Ferramentas de inteligência artificial', 
      icon: Brain, 
      path: '/ai-insights',
      color: 'bg-cyan-500',
      count: dashboardData.moduleStats.documents.ai_analyzed,
      status: 'success'
    },
    { 
      title: 'Sistema Marítimo', 
      description: 'Gestão completa marítima', 
      icon: Globe, 
      path: '/maritime',
      color: 'bg-indigo-500',
      count: dashboardData.systemHealth.activeUsers,
      status: 'info'
    },
    { 
      title: 'Scanner IA', 
      description: 'Análise inteligente de documentos', 
      icon: Zap, 
      path: '/advanced-documents',
      color: 'bg-orange-500',
      count: dashboardData.moduleStats.documents.processed,
      status: 'success'
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
    
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast({
      title: "Dashboard atualizado",
      description: "Dados atualizados com sucesso",
    });
  };

  const handleKPIToggle = (kpi: string) => {
    setSelectedKPIs(prev => 
      prev.includes(kpi) 
        ? prev.filter(k => k !== kpi)
        : [...prev, kpi]
    );
  };

  // Auto-update effect
  React.useEffect(() => {
    if (isAutoUpdate) {
      const interval = setInterval(refreshData, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [isAutoUpdate]);

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'peotram': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'fleet': return <Ship className="w-4 h-4 text-purple-500" />;
      case 'certificate': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'travel': return <Calendar className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const availableKPIs = {
    revenue: dashboardData.kpis.revenue,
    employees: dashboardData.kpis.employees,
    efficiency: dashboardData.kpis.efficiency,
    satisfaction: dashboardData.kpis.satisfaction
  };

  const displayName = currentBranding?.company_name || currentTenant?.name || 'Nautilus One';
  const userDisplayName = currentUser?.display_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Dashboard Filters */}
      <EnhancedDashboardFilters
        selectedKPIs={selectedKPIs}
        onKPIToggle={handleKPIToggle}
        filterPeriod={filterPeriod}
        onPeriodChange={setFilterPeriod}
        isAutoUpdate={isAutoUpdate}
        onAutoUpdateToggle={setIsAutoUpdate}
        lastUpdated={lastUpdated}
      />

      {/* Header Aprimorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <span>{displayName}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Plataforma SaaS Multicliente
                </Badge>
                {currentTenant?.plan_type && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {currentTenant.plan_type.charAt(0).toUpperCase() + currentTenant.plan_type.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta, <strong>{userDisplayName}</strong>! 
            Aqui está o resumo completo do seu sistema marítimo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
            className="bg-background hover:bg-accent shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={() => navigate('/executive')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Target className="w-4 h-4 mr-2" />
            Visão Executiva
          </Button>
        </div>
      </div>

      {/* KPIs Principais - Filtrados pela seleção do usuário */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {selectedKPIs.includes('revenue') && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">R$ {(availableKPIs.revenue.value / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+{availableKPIs.revenue.change}%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedKPIs.includes('employees') && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Funcionários Ativos</p>
                  <p className="text-2xl font-bold">{availableKPIs.employees.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">+{availableKPIs.employees.change}%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedKPIs.includes('efficiency') && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência Operacional</p>
                  <p className="text-2xl font-bold">{availableKPIs.efficiency.value.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">+{availableKPIs.efficiency.change}%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedKPIs.includes('satisfaction') && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Satisfação da Equipe</p>
                  <p className="text-2xl font-bold">{availableKPIs.satisfaction.value}/5</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">+{availableKPIs.satisfaction.change}%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Módulos e Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Módulos do Sistema</span>
            <Badge variant="outline" className="text-xs">
              {quickActions.length} módulos ativos
            </Badge>
          </CardTitle>
          <CardDescription>Acesso direto aos principais recursos da plataforma marítima</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg hover-lift transition-all cursor-pointer border-l-4 border-l-primary group bg-card shadow-sm"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-lg group-hover:shadow-xl transition-all">
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {action.count} itens
                          </Badge>
                          <span className={`text-xs ${getActionStatusColor(action.status)}`}>
                            ●
                          </span>
                        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance do Sistema (24h)</CardTitle>
            <CardDescription>Monitoramento em tempo real da plataforma</CardDescription>
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

        {/* Module Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso por Módulo</CardTitle>
            <CardDescription>Distribuição de acesso aos módulos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moduleUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moduleUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {moduleUsageData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Saúde do Sistema
            </CardTitle>
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

        {/* Alertas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Alertas e Notificações
              <Badge variant="destructive" className="text-xs">
                {dashboardData.alerts.filter(a => a.priority === 'high').length} Alta
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                {getStatusIcon(alert.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {alert.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {alert.module}
                    </Badge>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/notification-center')}>
              Ver Todos os Alertas
            </Button>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                  {activity.vessel && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {activity.vessel}
                    </Badge>
                  )}
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

export default EnhancedUnifiedDashboard;