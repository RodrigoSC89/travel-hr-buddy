import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Search,
  Download,
  Filter,
  SortDesc,
  Maximize2,
  Minimize2,
  Plus,
  Eye,
  EyeOff,
  Star,
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
  PieChart,
  LineChart,
  BarChart2,
  Map
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ModuleActionButton from '@/components/ui/module-action-button';

// Strategic Dashboard Data Types
interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  target?: number;
  unit?: string;
  onClick?: () => void;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: 'audit' | 'checklist' | 'travel' | 'document';
  title: string;
  description: string;
  userName: string;
  userAvatar?: string;
  module: string;
  createdAt: string;
  metadata?: any;
}

interface DashboardConfig {
  layout: 'grid' | 'compact' | 'executive';
  activeWidgets: string[];
  refreshInterval: number;
  userRole: string;
}

const StrategicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<'admin' | 'hr' | 'operator' | 'auditor'>('admin');
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: 'grid',
    activeWidgets: ['metrics', 'alerts', 'activities', 'charts'],
    refreshInterval: 30,
    userRole: 'admin'
  });
  
  // Dashboard Data
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Chart Data
  const [chartData, setChartData] = useState({
    performance: [],
    fleet: [],
    compliance: [],
    financial: []
  });

  // Load real-time data from Supabase
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load Metrics
      const { data: metricsData } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(20);

      // Load Alerts
      const { data: alertsData } = await supabase
        .from('dashboard_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load Activities
      const { data: activitiesData } = await supabase
        .from('dashboard_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      // Process and set data
      if (metricsData) {
        const processedMetrics = processMetricsData(metricsData);
        setMetrics(processedMetrics);
      }

      if (alertsData) {
        setAlerts(alertsData.map(alert => ({
          id: alert.id,
          type: alert.alert_type as any,
          title: alert.title,
          description: alert.description || '',
          priority: alert.priority as any,
          module: alert.module,
          actionUrl: alert.action_url || undefined,
          isRead: alert.is_read,
          createdAt: alert.created_at
        })));
      }

      if (activitiesData) {
        setActivities(activitiesData.map(activity => ({
          id: activity.id,
          type: activity.activity_type as any,
          title: activity.title,
          description: activity.description || '',
          userName: activity.user_name,
          userAvatar: activity.user_avatar || undefined,
          module: activity.module,
          createdAt: activity.created_at,
          metadata: activity.metadata
        })));
      }

      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados. Tentando novamente...",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process metrics data based on user profile
  const processMetricsData = (data: any[]): MetricCard[] => {
    const metricsByProfile = {
      admin: [
        { key: 'Active Vessels', icon: Ship, color: 'text-azure-600' },
        { key: 'Fleet Utilization', icon: Activity, color: 'text-success' },
        { key: 'Safety Score', icon: Shield, color: 'text-warning' },
        { key: 'Revenue', icon: DollarSign, color: 'text-primary' },
        { key: 'Active Crew', icon: Users, color: 'text-info' },
        { key: 'PEOTRAM Compliance', icon: CheckCircle, color: 'text-success' }
      ],
      hr: [
        { key: 'Active Crew', icon: Users, color: 'text-info' },
        { key: 'PEOTRAM Compliance', icon: CheckCircle, color: 'text-success' },
        { key: 'Document Compliance', icon: FileText, color: 'text-warning' },
        { key: 'Safety Score', icon: Shield, color: 'text-warning' }
      ],
      operator: [
        { key: 'Active Vessels', icon: Ship, color: 'text-azure-600' },
        { key: 'Fleet Utilization', icon: Activity, color: 'text-success' },
        { key: 'Fuel Efficiency', icon: Zap, color: 'text-primary' },
        { key: 'Safety Score', icon: Shield, color: 'text-warning' }
      ],
      auditor: [
        { key: 'PEOTRAM Compliance', icon: CheckCircle, color: 'text-success' },
        { key: 'Document Compliance', icon: FileText, color: 'text-warning' },
        { key: 'Safety Score', icon: Shield, color: 'text-warning' },
        { key: 'Active Vessels', icon: Ship, color: 'text-azure-600' }
      ]
    };

    const profileMetrics = metricsByProfile[selectedProfile] || metricsByProfile.admin;
    
    return profileMetrics.map(profileMetric => {
      const metricData = data.find(m => m.metric_name === profileMetric.key);
      if (!metricData) return null;
      
      return {
        id: metricData.id,
        title: metricData.metric_name,
        value: formatMetricValue(metricData.metric_value, metricData.metric_unit),
        change: metricData.metric_change || 0,
        trend: getTrend(metricData.metric_change || 0),
        icon: profileMetric.icon,
        color: profileMetric.color,
        subtitle: metricData.department,
        target: metricData.metric_target,
        unit: metricData.metric_unit,
        onClick: () => handleMetricClick(metricData.metric_type)
      };
    }).filter(Boolean) as MetricCard[];
  };

  const formatMetricValue = (value: number, unit: string) => {
    if (unit === 'BRL') return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'people' || unit === 'units') return value.toString();
    return `${value.toFixed(1)} ${unit}`;
  };

  const getTrend = (change: number): 'up' | 'down' | 'stable' => {
    if (change > 1) return 'up';
    if (change < -1) return 'down';
    return 'stable';
  };

  const handleMetricClick = (metricType: string) => {
    const routes = {
      operational: '/fleet-management',
      financial: '/analytics',
      safety: '/maritime',
      compliance: '/peotram',
      hr: '/hr'
    };
    
    if (routes[metricType as keyof typeof routes]) {
      navigate(routes[metricType as keyof typeof routes]);
    }
  };

  const refreshDashboard = async () => {
    toast({
      title: "Atualizando Dashboard",
      description: "Carregando dados mais recentes...",
    });
    await loadDashboardData();
    toast({
      title: "Dashboard Atualizado",
      description: "Dados atualizados com sucesso!",
    });
  };

  // Initialize dashboard
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, dashboardConfig.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [selectedProfile, dashboardConfig.refreshInterval]);

  // Filter alerts and activities based on search
  const filteredAlerts = alerts.filter(alert => 
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-azure/5 to-primary/10 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-lg font-medium text-muted-foreground">Carregando Dashboard Estratégico...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azure/5 to-primary/10">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Dashboard Estratégico
                </h1>
                <p className="text-muted-foreground">
                  Visão inteligente e personalizada do Nautilus One
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Profile Selector */}
              <Tabs value={selectedProfile} onValueChange={(value) => setSelectedProfile(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="hr" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    RH
                  </TabsTrigger>
                  <TabsTrigger value="operator" className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    Operador
                  </TabsTrigger>
                  <TabsTrigger value="auditor" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Auditor
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Actions */}
              <Button variant="outline" size="sm" onClick={refreshDashboard}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Última atualização: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar métricas, alertas, atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {alerts.filter(a => !a.isRead).length} novos alertas
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card 
              key={metric.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
              onClick={metric.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.color} group-hover:scale-110 transition-transform`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{metric.value}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                    {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                    {metric.trend === 'stable' && <Activity className="h-3 w-3 text-muted-foreground" />}
                    <span className={`font-medium ${
                      metric.trend === 'up' ? 'text-success' : 
                      metric.trend === 'down' ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                  {metric.subtitle && (
                    <Badge variant="secondary" className="text-xs">
                      {metric.subtitle}
                    </Badge>
                  )}
                </div>
                {metric.target && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Meta</span>
                      <span>{formatMetricValue(metric.target, metric.unit || '')}</span>
                    </div>
                    <Progress 
                      value={((parseFloat(metric.value.toString().replace(/[^\d.]/g, '')) || 0) / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning" />
                Alertas Prioritários
              </CardTitle>
              <CardDescription>
                {filteredAlerts.filter(a => !a.isRead).length} alertas não lidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {filteredAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    !alert.isRead ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => alert.actionUrl && navigate(alert.actionUrl)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded-full ${
                      alert.type === 'error' ? 'bg-destructive/20 text-destructive' :
                      alert.type === 'warning' ? 'bg-warning/20 text-warning' :
                      alert.type === 'info' ? 'bg-info/20 text-info' :
                      'bg-success/20 text-success'
                    }`}>
                      {alert.type === 'error' && <AlertTriangle className="h-3 w-3" />}
                      {alert.type === 'warning' && <AlertCircle className="h-3 w-3" />}
                      {alert.type === 'info' && <Bell className="h-3 w-3" />}
                      {alert.type === 'success' && <CheckCircle className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <Badge 
                          variant={
                            alert.priority === 'critical' ? 'destructive' :
                            alert.priority === 'high' ? 'default' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.module}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p>Nenhum alerta encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas {activities.length} atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {filteredActivities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'audit' ? 'bg-success/20 text-success' :
                    activity.type === 'checklist' ? 'bg-info/20 text-info' :
                    activity.type === 'travel' ? 'bg-warning/20 text-warning' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {activity.type === 'audit' && <Shield className="h-4 w-4" />}
                    {activity.type === 'checklist' && <CheckCircle className="h-4 w-4" />}
                    {activity.type === 'travel' && <Map className="h-4 w-4" />}
                    {activity.type === 'document' && <FileText className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{activity.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.module}
                        </Badge>
                      </div>
                      {activity.metadata?.score && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.metadata.score}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhuma atividade encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Navegação Rápida
            </CardTitle>
            <CardDescription>
              Acesso direto aos módulos mais importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { title: 'PEOTRAM', icon: Shield, route: '/peotram', color: 'text-success' },
                { title: 'Frota', icon: Ship, route: '/fleet-management', color: 'text-azure-600' },
                { title: 'RH', icon: Users, route: '/hr', color: 'text-info' },
                { title: 'Viagens', icon: Map, route: '/travel', color: 'text-warning' },
                { title: 'Relatórios', icon: BarChart3, route: '/reports', color: 'text-primary' },
                { title: 'Configurações', icon: Settings, route: '/settings', color: 'text-muted-foreground' }
              ].map((item) => (
                <Button 
                  key={item.title}
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2 hover:shadow-md transition-all"
                  onClick={() => navigate(item.route)}
                >
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                  <span className="text-sm font-medium">{item.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="dashboard"
        moduleName="Dashboard"
        moduleIcon={<LayoutDashboard className="h-4 w-4" />}
        actions={[
          {
            id: 'refresh',
            label: 'Atualizar Dados',
            icon: <RefreshCw className="h-4 w-4" />,
            action: refreshDashboard,
            variant: 'default'
          },
          {
            id: 'export',
            label: 'Exportar Dashboard',
            icon: <Download className="h-4 w-4" />,
            action: () => console.log('Exportar dashboard'),
            variant: 'outline'
          },
          {
            id: 'customize',
            label: 'Personalizar',
            icon: <Settings className="h-4 w-4" />,
            action: () => console.log('Personalizar dashboard'),
            variant: 'outline'
          },
          {
            id: 'alerts',
            label: 'Central de Alertas',
            icon: <Bell className="h-4 w-4" />,
            action: () => console.log('Central de alertas'),
            variant: 'outline'
          }
        ]}
        quickActions={[
          {
            id: 'global-search',
            label: 'Busca Global',
            icon: <Search className="h-3 w-3" />,
            action: () => console.log('Busca global'),
            shortcut: 'Ctrl+K'
          },
          {
            id: 'ai-insights',
            label: 'IA Insights',
            icon: <Brain className="h-3 w-3" />,
            action: () => console.log('IA Insights')
          }
        ]}
      />
    </div>
  );
};

export default StrategicDashboard;