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
  Settings,
  Anchor,
  Waves,
  MapPin,
  TrendingDown,
  AlertCircle,
  Award,
  Building2,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Server,
  Eye,
  PieChart,
  LineChart,
  BarChart2
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedDashboardFilters } from './enhanced-dashboard-filters';
import FloatingActionButtons from '@/components/ui/floating-action-buttons';
import ProfessionalKPICards from '@/components/ui/professional-kpi-cards';
import SystemStatusDashboard from '@/components/ui/system-status-dashboard';
import ExecutiveMetricsPanel from '@/components/ui/executive-metrics-panel';
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

  // Enhanced dashboard data with professional metrics
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      revenue: { 
        value: 2450000, 
        change: 12.5, 
        status: 'up', 
        target: 3000000,
        previous: 2180000,
        forecast: 2850000
      },
      employees: { 
        value: 125, 
        change: 4.2, 
        status: 'up',
        active: 118,
        onLeave: 7,
        contractors: 15
      },
      efficiency: { 
        value: 94.2, 
        change: 2.8, 
        status: 'up',
        target: 95,
        industry_avg: 87.5
      },
      satisfaction: { 
        value: 4.6, 
        change: 4.5, 
        status: 'up',
        responses: 89,
        nps: 72
      }
    },
    financialMetrics: {
      grossMargin: 68.5,
      operatingMargin: 15.3,
      ebitda: 1850000,
      cashFlow: 980000,
      roe: 18.7,
      debt: 2100000
    },
    operationalMetrics: {
      vesselUtilization: 87.3,
      fuelEfficiency: 92.1,
      maintenanceCost: 340000,
      downtime: 2.1,
      safetyScore: 98.5,
      complianceRate: 99.2
    },
    alerts: [
      { id: 1, title: 'Certificado STCW da MV Ocean Explorer expira em 15 dias', type: 'warning', priority: 'high', module: 'hr', vessel: 'MV Ocean Explorer', date: '2024-01-15' },
      { id: 2, title: 'Meta mensal de eficiência operacional atingida - 94.2%', type: 'success', priority: 'medium', module: 'fleet', percentage: 94.2 },
      { id: 3, title: 'Análise IA detectou 3 oportunidades de otimização no PEOTRAM', type: 'info', priority: 'medium', module: 'peotram', insights: 3 },
      { id: 4, title: 'Backup automático da base de dados concluído com sucesso', type: 'success', priority: 'low', module: 'system', size: '2.3GB' },
      { id: 5, title: 'Manutenção preventiva agendada para MV Atlantic Dawn', type: 'warning', priority: 'medium', module: 'maintenance', vessel: 'MV Atlantic Dawn', date: '2024-01-20' }
    ],
    recentActivities: [
      { id: 1, user: 'João Silva', action: 'Completou auditoria PEOTRAM #2024-001 com score 98.5%', time: '2h atrás', type: 'peotram', vessel: 'MV Ocean Explorer', score: 98.5 },
      { id: 2, user: 'Maria Santos', action: 'Aprovou relatório mensal de frota - Janeiro 2024', time: '4h atrás', type: 'fleet', documents: 15 },
      { id: 3, user: 'Carlos Lima', action: 'Atualizou cronograma de viagem para rota Santos-Houston', time: '6h atrás', type: 'travel', route: 'Santos-Houston' },
      { id: 4, user: 'Ana Costa', action: 'Upload de certificado STCW renovado', time: '8h atrás', type: 'certificate', validity: '5 anos' },
      { id: 5, user: 'Pedro Oliveira', action: 'Finalizou inspeção de segurança com nota A+', time: '1d atrás', type: 'safety', grade: 'A+' }
    ],
    systemHealth: {
      performance: 97.3,
      uptime: 99.95,
      activeUsers: tenantUsage?.active_users || 42,
      errorRate: 0.08,
      apiCalls: tenantUsage?.api_calls_made || 1250,
      storageUsed: tenantUsage?.storage_used_gb || 2.3,
      totalStorage: 50,
      bandwidth: 245.8,
      responseTime: 180
    },
    moduleStats: {
      peotram: { 
        audits: tenantUsage?.peotram_audits_created || 15, 
        completion: 94.2,
        nonConformities: 3,
        avgScore: 96.8
      },
      fleet: { 
        vessels: tenantUsage?.vessels_managed || 8, 
        efficiency: 92.1,
        utilization: 87.3,
        routes: 24
      },
      documents: { 
        processed: tenantUsage?.documents_processed || 42, 
        ai_analyzed: 38,
        compliance: 99.1,
        digital: 89
      },
      reports: { 
        generated: tenantUsage?.reports_generated || 23, 
        automated: 18,
        scheduled: 45,
        real_time: 12
      }
    }
  });

  // Enhanced performance data
  const performanceData = [
    { time: '00:00', users: 15, performance: 95.2, api_calls: 120, revenue: 245000 },
    { time: '04:00', users: 8, performance: 97.1, api_calls: 80, revenue: 180000 },
    { time: '08:00', users: 35, performance: 91.3, api_calls: 280, revenue: 420000 },
    { time: '12:00', users: 45, performance: 88.7, api_calls: 350, revenue: 580000 },
    { time: '16:00', users: 38, performance: 93.4, api_calls: 290, revenue: 490000 },
    { time: '20:00', users: 25, performance: 96.8, api_calls: 180, revenue: 320000 }
  ];

  const revenueData = [
    { month: 'Jul', value: 2100000, target: 2200000, previous: 2080000 },
    { month: 'Ago', value: 2250000, target: 2300000, previous: 2150000 },
    { month: 'Set', value: 2180000, target: 2400000, previous: 2200000 },
    { month: 'Out', value: 2350000, target: 2500000, previous: 2280000 },
    { month: 'Nov', value: 2420000, target: 2600000, previous: 2350000 },
    { month: 'Dez', value: 2450000, target: 2700000, previous: 2420000 }
  ];

  const moduleUsageData = [
    { name: 'PEOTRAM', value: 35, color: '#1e40af', growth: 12.5 },
    { name: 'Fleet Management', value: 28, color: '#7c3aed', growth: 8.3 },
    { name: 'HR & Certificates', value: 20, color: '#059669', growth: 15.2 },
    { name: 'Analytics', value: 17, color: '#dc2626', growth: 22.1 }
  ];

  const operationalData = [
    { metric: 'Vessel Utilization', value: 87.3, target: 90, status: 'warning' },
    { metric: 'Fuel Efficiency', value: 92.1, target: 88, status: 'success' },
    { metric: 'Safety Score', value: 98.5, target: 95, status: 'success' },
    { metric: 'Compliance Rate', value: 99.2, target: 98, status: 'success' }
  ];

  const quickActions = [
    { 
      title: 'PEOTRAM Auditorias', 
      description: 'Sistema completo de auditorias marítimas', 
      icon: FileText, 
      path: '/peotram',
      color: 'from-blue-600 to-blue-700',
      count: dashboardData.moduleStats.peotram.audits,
      status: 'success',
      subtitle: `Score médio: ${dashboardData.moduleStats.peotram.avgScore}%`,
      metric: `${dashboardData.moduleStats.peotram.completion}% concluído`
    },
    { 
      title: 'Gestão da Frota', 
      description: 'Monitoramento avançado de embarcações', 
      icon: Ship, 
      path: '/fleet-dashboard',
      color: 'from-purple-600 to-purple-700',
      count: dashboardData.moduleStats.fleet.vessels,
      status: 'info',
      subtitle: `Utilização: ${dashboardData.operationalMetrics.vesselUtilization}%`,
      metric: `${dashboardData.moduleStats.fleet.routes} rotas ativas`
    },
    { 
      title: 'Analytics Avançado', 
      description: 'Business Intelligence e relatórios', 
      icon: BarChart3, 
      path: '/advanced-analytics',
      color: 'from-green-600 to-green-700',
      count: dashboardData.moduleStats.reports.generated,
      status: 'success',
      subtitle: `${dashboardData.moduleStats.reports.automated} automáticos`,
      metric: `${dashboardData.moduleStats.reports.real_time} em tempo real`
    },
    { 
      title: 'IA & Automação', 
      description: 'Inteligência artificial aplicada', 
      icon: Brain, 
      path: '/ai-insights',
      color: 'from-cyan-600 to-cyan-700',
      count: dashboardData.moduleStats.documents.ai_analyzed,
      status: 'success',
      subtitle: `${dashboardData.moduleStats.documents.compliance}% compliance`,
      metric: `${dashboardData.moduleStats.documents.digital}% digitalizados`
    },
    { 
      title: 'Centro Marítimo', 
      description: 'Hub completo de operações', 
      icon: Anchor, 
      path: '/maritime',
      color: 'from-indigo-600 to-indigo-700',
      count: dashboardData.systemHealth.activeUsers,
      status: 'info',
      subtitle: `${dashboardData.operationalMetrics.safetyScore}% segurança`,
      metric: `${dashboardData.systemHealth.uptime}% disponibilidade`
    },
    { 
      title: 'Scanner Inteligente', 
      description: 'Processamento IA de documentos', 
      icon: Zap, 
      path: '/advanced-documents',
      color: 'from-orange-600 to-orange-700',
      count: dashboardData.moduleStats.documents.processed,
      status: 'success',
      subtitle: `${dashboardData.moduleStats.documents.ai_analyzed} analisados`,
      metric: `99.1% precisão`
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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

  React.useEffect(() => {
    if (isAutoUpdate) {
      const interval = setInterval(refreshData, 60000);
      return () => clearInterval(interval);
    }
  }, [isAutoUpdate]);

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'info': return <Bell className="w-4 h-4 text-info" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'peotram': return <FileText className="w-4 h-4 text-info" />;
      case 'fleet': return <Ship className="w-4 h-4 text-primary" />;
      case 'certificate': return <Award className="w-4 h-4 text-success" />;
      case 'travel': return <MapPin className="w-4 h-4 text-warning" />;
      case 'safety': return <Shield className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success-foreground';
      case 'warning': return 'text-warning-foreground';
      case 'info': return 'text-info-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const displayName = currentBranding?.company_name || currentTenant?.name || 'Nautilus One';
  const userDisplayName = currentUser?.display_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="space-y-8 p-6">
      <EnhancedDashboardFilters
        selectedKPIs={selectedKPIs}
        onKPIToggle={handleKPIToggle}
        filterPeriod={filterPeriod}
        onPeriodChange={setFilterPeriod}
        isAutoUpdate={isAutoUpdate}
        onAutoUpdateToggle={setIsAutoUpdate}
        lastUpdated={lastUpdated}
      />

      {/* Professional Header with Enhanced Branding */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
        <Card className="relative border-2 border-primary/10 shadow-2xl bg-gradient-to-br from-card via-card to-card/95">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-sm opacity-30" />
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-light text-primary-foreground shadow-2xl">
                    <Anchor className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-sm border-primary/20 bg-primary/5">
                      <Crown className="w-4 h-4 mr-1" />
                      Sistema Marítimo Integrado
                    </Badge>
                    {currentTenant?.plan_type && (
                      <Badge className="text-sm bg-gradient-to-r from-secondary to-secondary-light">
                        <Award className="w-3 h-3 mr-1" />
                        {currentTenant.plan_type.charAt(0).toUpperCase() + currentTenant.plan_type.slice(1)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-sm">
                      <Activity className="w-3 h-3 mr-1" />
                      {dashboardData.systemHealth.activeUsers} usuários ativos
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-3 text-lg">
                    Bem-vindo de volta, <strong className="text-foreground">{userDisplayName}</strong>! 
                    <br />Painel executivo de operações marítimas em tempo real.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="bg-background/80 hover:bg-accent shadow-lg border-primary/20"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Atualizar Dados
                  </Button>
                  <Button 
                    onClick={() => navigate('/executive')}
                    className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:shadow-xl shadow-lg"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Visão Executiva
                  </Button>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>Última atualização: {lastUpdated.toLocaleTimeString()}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Sistema operacional - {dashboardData.systemHealth.uptime}% uptime
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Professional KPI Cards */}
      <ProfessionalKPICards />

      {/* Executive Metrics Panel */}
      <ExecutiveMetricsPanel />

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/10 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Performance Financeira
            </CardTitle>
            <CardDescription>Indicadores financeiros principais</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Margem Bruta</div>
                <div className="text-2xl font-bold text-green-600">{dashboardData.financialMetrics.grossMargin}%</div>
                <Progress value={dashboardData.financialMetrics.grossMargin} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Margem Operacional</div>
                <div className="text-2xl font-bold text-blue-600">{dashboardData.financialMetrics.operatingMargin}%</div>
                <Progress value={dashboardData.financialMetrics.operatingMargin * 2} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">EBITDA</div>
                <div className="text-2xl font-bold text-purple-600">R$ {(dashboardData.financialMetrics.ebitda / 1000000).toFixed(1)}M</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">ROE</div>
                <div className="text-2xl font-bold text-orange-600">{dashboardData.financialMetrics.roe}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/10 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-secondary" />
              Indicadores Operacionais
            </CardTitle>
            <CardDescription>Métricas de performance operacional</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {operationalData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' :
                      item.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{item.metric}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.value}%</div>
                    <div className="text-xs text-muted-foreground">Meta: {item.target}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Module Cards */}
      <Card className="border-2 border-primary/10 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                  <Globe className="w-6 h-6" />
                </div>
                Módulos Operacionais
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Centro de controle integrado - {quickActions.length} módulos ativos
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm border-primary/20 bg-primary/5">
              Sistema Completo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl hover-lift transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-primary/20 relative overflow-hidden"
                onClick={() => navigate(action.path)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-3 py-1 ${getActionStatusColor(action.status)} bg-background/50 backdrop-blur`}
                    >
                      {action.count} ativos
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{action.subtitle}</span>
                        <ArrowRight className="w-4 h-4 text-foreground/70 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="text-xs text-foreground/80 bg-accent/30 p-2 rounded-lg">
                        {action.metric}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-primary/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Performance em Tempo Real
            </CardTitle>
            <CardDescription>Monitoramento 24/7 do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  name="Usuários Ativos" 
                />
                <Area 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorPerformance)" 
                  name="Performance %" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-secondary" />
              Distribuição de Módulos
            </CardTitle>
            <CardDescription>Uso por categoria do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsPieChart>
                <Pie
                  data={moduleUsageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {moduleUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Alerts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-orange-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas do Sistema
            </CardTitle>
            <CardDescription>Notificações importantes e pendências</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData.alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <div className="mt-1">{getStatusIcon(alert.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm leading-relaxed">{alert.title}</div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {alert.module.toUpperCase()}
                      </span>
                      <Badge variant="outline" className={`text-xs ${
                        alert.priority === 'high' ? 'border-destructive text-destructive-foreground bg-destructive/10' :
                        alert.priority === 'medium' ? 'border-warning text-warning-foreground bg-warning/10' :
                        'border-muted-foreground text-muted-foreground bg-muted/10'
                      }`}>
                        {alert.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>Timeline de operações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData.recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm leading-relaxed">{activity.action}</div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {activity.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced System Health Monitor */}
      <SystemStatusDashboard />

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
      </div>
    </div>
  );
};

export default EnhancedUnifiedDashboard;