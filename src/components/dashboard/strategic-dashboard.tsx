import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Clock,
  Target,
  Zap,
  RefreshCw,
  Crown,
  Shield,
  Ship,
  FileText,
  Brain,
  Settings,
  Search,
  Download,
  Star,
  TrendingDown,
  AlertCircle,
  Award,
  BarChart3,
  Map
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ModuleActionButton from "@/components/ui/module-action-button";
import { MetricCard, AlertItem, ActivityItem, DashboardConfig } from "@/types/dashboard";
import { DashboardCharts, AIInsightsPanel } from "@/components/dashboard/dashboard-analytics";
import { DashboardKPIWidget, DashboardExportPanel, DashboardFilters } from "@/components/dashboard/dashboard-widgets";

const StrategicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<"admin" | "hr" | "operator" | "auditor">("admin");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState({});
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: "grid",
    activeWidgets: ["metrics", "alerts", "activities", "charts"],
    refreshInterval: 30,
    userRole: "admin"
  });

  // Helper function to format metric values
  const formatMetricValue = (value: number | string, unit: string = ""): string => {
    if (typeof value === "string") return value;
    
    switch (unit) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "BRL":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(value);
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(value);
    case "K":
      return `${(value / 1000).toFixed(1)}K`;
    case "M":
      return `${(value / 1000000).toFixed(1)}M`;
    default:
      return value.toLocaleString("pt-BR");
    }
  };

  // Get metrics based on selected profile
  const getProfileMetrics = (profile: string): MetricCard[] => {
    const metricsData = {
      admin: [
        { id: "system-health", title: "Saúde do Sistema", value: 98.5, change: 2.1, trend: "up" as const, icon: Activity, color: "text-success", subtitle: "Excelente", target: 99, unit: "%" },
        { id: "active-users", title: "Usuários Ativos", value: 1247, change: 8.3, trend: "up" as const, icon: Users, color: "text-primary", subtitle: "Hoje" },
        { id: "monthly-revenue", title: "Receita Mensal", value: 125000, change: 12.5, trend: "up" as const, icon: DollarSign, color: "text-success", unit: "BRL" },
        { id: "critical-alerts", title: "Alertas Críticos", value: 3, change: -25, trend: "down" as const, icon: AlertTriangle, color: "text-destructive", subtitle: "Últimas 24h" }
      ],
      hr: [
        { id: "crew-onboard", title: "Tripulação Embarcada", value: 145, change: 3.2, trend: "up" as const, icon: Users, color: "text-primary", subtitle: "Ativos" },
        { id: "certificates-expiring", title: "Certificados Vencendo", value: 12, change: -8.1, trend: "down" as const, icon: AlertCircle, color: "text-warning", subtitle: "30 dias" },
        { id: "training-completion", title: "Treinamentos Concluídos", value: 87.5, change: 15.2, trend: "up" as const, icon: Award, color: "text-success", unit: "%", target: 95 },
        { id: "hr-requests", title: "Solicitações RH", value: 28, change: 5.7, trend: "up" as const, icon: FileText, color: "text-info", subtitle: "Pendentes" }
      ],
      operator: [
        { id: "vessels-operational", title: "Embarcações Operacionais", value: 18, change: 0, trend: "stable" as const, icon: Ship, color: "text-success", subtitle: "De 20 total" },
        { id: "pending-checklists", title: "Checklists Pendentes", value: 7, change: -12.5, trend: "down" as const, icon: CheckCircle, color: "text-warning", subtitle: "Hoje" },
        { id: "equipment-status", title: "Equipamentos OK", value: 94.2, change: 1.8, trend: "up" as const, icon: Settings, color: "text-success", unit: "%", target: 98 },
        { id: "maintenance-due", title: "Manutenções Programadas", value: 5, change: 25, trend: "up" as const, icon: Clock, color: "text-info", subtitle: "Esta semana" }
      ],
      auditor: [
        { id: "peotram-compliance", title: "Conformidade PEOTRAM", value: 92.8, change: 4.3, trend: "up" as const, icon: Shield, color: "text-success", unit: "%", target: 95 },
        { id: "non-conformities", title: "Não Conformidades", value: 14, change: -18.2, trend: "down" as const, icon: AlertTriangle, color: "text-warning", subtitle: "Abertas" },
        { id: "audit-coverage", title: "Cobertura de Auditoria", value: 78.5, change: 8.9, trend: "up" as const, icon: Target, color: "text-primary", unit: "%", target: 85 },
        { id: "evidence-submitted", title: "Evidências Enviadas", value: 156, change: 12.7, trend: "up" as const, icon: FileText, color: "text-success", subtitle: "Este mês" }
      ]
    };

    return metricsData[profile as keyof typeof metricsData] || metricsData.admin;
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get metrics for selected profile
      const profileMetrics = getProfileMetrics(selectedProfile);
      setMetrics(profileMetrics);

      // Sample alerts data
      const sampleAlerts: AlertItem[] = [
        {
          id: "1",
          type: "warning",
          title: "Certificado STCW vencendo em 15 dias",
          description: "João Silva - Oficial de Máquinas",
          priority: "high",
          module: "RH",
          actionUrl: "/hr/certificates",
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          type: "error",
          title: "Não conformidade crítica encontrada",
          description: "Auditoria PEOTRAM - Embarcação MV Atlantic",
          priority: "critical",
          module: "PEOTRAM",
          actionUrl: "/peotram/audits",
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "3",
          type: "info",
          title: "Novo checklist disponível",
          description: "Inspeção de segurança semanal",
          priority: "medium",
          module: "Checklists",
          actionUrl: "/checklists",
          isRead: true,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      setAlerts(sampleAlerts);

      // Sample activities data
      const sampleActivities: ActivityItem[] = [
        {
          id: "1",
          type: "audit",
          title: "Auditoria PEOTRAM concluída",
          description: "MV Atlantic - Score: 94.2%",
          userName: "Carlos Mendes",
          module: "PEOTRAM",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          metadata: { score: 94.2, vesselId: "mv-atlantic" }
        },
        {
          id: "2",
          type: "checklist",
          title: "Checklist de segurança aprovado",
          description: "Inspeção diária - Ponte de comando",
          userName: "Ana Costa",
          module: "Checklists",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          metadata: { checklistId: "safety-daily", location: "bridge" }
        },
        {
          id: "3",
          type: "document",
          title: "Certificado atualizado",
          description: "STCW renovado para Pedro Santos",
          userName: "Maria Silva",
          module: "RH",
          createdAt: new Date(Date.now() - 5400000).toISOString(),
          metadata: { employeeId: "pedro-santos", certificateType: "STCW" }
        }
      ];

      setActivities(sampleActivities);
      setLastUpdated(new Date());

    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dashboard
  const refreshDashboard = () => {
    loadDashboardData();
    toast({
      title: "Dashboard Atualizado",
      description: "Dados atualizados com sucesso!",
    });
  };

  // Export dashboard data
  const handleExport = async (format: string, options?: any) => {
    setIsExporting(true);
    
    try {
      const exportData = {
        metrics,
        alerts,
        activities,
        profile: selectedProfile,
        timestamp: new Date().toISOString(),
        filters: dashboardFilters
      };

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Exportação Concluída",
        description: `Dashboard exportado em formato ${format.toUpperCase()} com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao exportar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Customize dashboard
  const handleCustomizeDashboard = () => {
    toast({
      title: "Personalização",
      description: "Abrindo configurações de personalização do dashboard...",
    });
    // Navigate to settings or open customization modal
    navigate("/settings?tab=dashboard");
  };

  // Open alerts center
  const handleAlertsCenter = () => {
    toast({
      title: "Central de Alertas",
      description: "Abrindo central de alertas do sistema...",
    });
    // Navigate to alerts page or open alerts panel
    setActiveTab("alerts");
  };

  // Global search handler
  const handleGlobalSearch = () => {
    toast({
      title: "Busca Global",
      description: "Ativando busca global do sistema (Ctrl+K)...",
    });
    // Focus on search input or open search modal
    const searchInput = document.querySelector("input[type=\"search\"]") as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  // AI Insights handler
  const handleAIInsights = () => {
    toast({
      title: "IA Insights",
      description: "Gerando insights inteligentes baseados em IA...",
    });
    // Navigate to AI insights or open insights panel
    setActiveTab("ai-insights");
  };

  // Initialize dashboard
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedProfile]);

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
              <Tabs value={selectedProfile} onValueChange={(value) => setSelectedProfile(value as unknown)}>
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
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">IA Insights</TabsTrigger>
            <TabsTrigger value="export">Exportação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    <div className="text-2xl font-bold mb-2">{formatMetricValue(metric.value, metric.unit)}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                        {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                        {metric.trend === "stable" && <Activity className="h-3 w-3 text-muted-foreground" />}
                        <span className={`font-medium ${
                          metric.trend === "up" ? "text-success" : 
                            metric.trend === "down" ? "text-destructive" : 
                              "text-muted-foreground"
                        }`}>
                          {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}%
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
                          <span>{formatMetricValue(metric.target, metric.unit || "")}</span>
                        </div>
                        <Progress 
                          value={((parseFloat(metric.value.toString().replace(/[^\d.]/g, "")) || 0) / metric.target) * 100} 
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
                        !alert.isRead ? "bg-muted/50" : ""
                      }`}
                      onClick={() => alert.actionUrl && navigate(alert.actionUrl)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          alert.type === "error" ? "bg-destructive/20 text-destructive" :
                            alert.type === "warning" ? "bg-warning/20 text-warning" :
                              alert.type === "info" ? "bg-info/20 text-info" :
                                "bg-success/20 text-success"
                        }`}>
                          {alert.type === "error" && <AlertTriangle className="h-3 w-3" />}
                          {alert.type === "warning" && <AlertCircle className="h-3 w-3" />}
                          {alert.type === "info" && <Bell className="h-3 w-3" />}
                          {alert.type === "success" && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                alert.priority === "critical" ? "border-destructive text-destructive" :
                                  alert.priority === "high" ? "border-warning text-warning" :
                                    "border-muted text-muted-foreground"
                              }`}
                            >
                              {alert.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{alert.module}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4" />
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
                Últimas atividades do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredActivities.slice(0, 10).map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.type === "audit" && <Shield className="h-4 w-4 text-primary" />}
                        {activity.type === "checklist" && <CheckCircle className="h-4 w-4 text-success" />}
                        {activity.type === "travel" && <Map className="h-4 w-4 text-info" />}
                        {activity.type === "document" && <FileText className="h-4 w-4 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <Badge variant="outline" className="text-xs">{activity.module}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{activity.userName}</span>
                          <span>•</span>
                          <span>{new Date(activity.createdAt).toLocaleString("pt-BR")}</span>
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
                    { title: "PEOTRAM", icon: Shield, route: "/peotram", color: "text-success" },
                    { title: "Frota", icon: Ship, route: "/fleet-management", color: "text-azure-600" },
                    { title: "RH", icon: Users, route: "/hr", color: "text-info" },
                    { title: "Viagens", icon: Map, route: "/travel", color: "text-warning" },
                    { title: "Relatórios", icon: BarChart3, route: "/reports", color: "text-primary" },
                    { title: "Configurações", icon: Settings, route: "/settings", color: "text-muted-foreground" }
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DashboardCharts profile={selectedProfile} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsightsPanel profile={selectedProfile} />
              </div>
              <div>
                <DashboardFilters 
                  onFilterChange={setDashboardFilters}
                  currentFilters={dashboardFilters}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <DashboardExportPanel 
              onExport={handleExport}
              isExporting={isExporting}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="dashboard"
        moduleName="Dashboard"
        moduleIcon={<LayoutDashboard className="h-4 w-4" />}
        actions={[
          {
            id: "refresh",
            label: "Atualizar Dados",
            icon: <RefreshCw className="h-4 w-4" />,
            action: refreshDashboard,
            variant: "default"
          },
          {
            id: "export",
            label: "Exportar Dashboard",
            icon: <Download className="h-4 w-4" />,
            action: () => handleExport("pdf"),
            variant: "outline"
          },
          {
            id: "customize",
            label: "Personalizar",
            icon: <Settings className="h-4 w-4" />,
            action: handleCustomizeDashboard,
            variant: "outline"
          },
          {
            id: "alerts",
            label: "Central de Alertas",
            icon: <Bell className="h-4 w-4" />,
            action: handleAlertsCenter,
            variant: "outline"
          }
        ]}
        quickActions={[
          {
            id: "global-search",
            label: "Busca Global",
            icon: <Search className="h-3 w-3" />,
            action: handleGlobalSearch,
            shortcut: "Ctrl+K"
          },
          {
            id: "ai-insights",
            label: "IA Insights",
            icon: <Brain className="h-3 w-3" />,
            action: handleAIInsights
          }
        ]}
      />
    </div>
  );
};

export default StrategicDashboard;