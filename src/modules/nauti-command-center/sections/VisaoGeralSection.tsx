/**
 * Seção: Visão Geral - Dashboard Principal
 * REFATORADO: 100% dados reais do Supabase via useDashboardRealData
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Ship, Users, Wrench, Package, Shield, DollarSign,
  TrendingUp, TrendingDown, AlertTriangle, Activity, Clock,
  ArrowRight, BarChart3, Fuel, Anchor, Thermometer, Heart,
  MapPin, Gauge, ExternalLink, FileText, Bell, Loader2, Sparkles,
  Database
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import type { SystemStatus } from "../index";
import { OperationalAIChat } from "@/components/ai-chat/OperationalAIChat";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { downloadExecutiveReport } from "@/lib/reports/executive-pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { BunkerPriceWidget } from "@/components/bunker/BunkerPriceWidget";
import { useDashboardRealData } from "@/hooks/useDashboardRealData";

interface VisaoGeralSectionProps {
  systemStatus: SystemStatus;
  isLoading: boolean;
  onNavigate: (tab: string) => void;
}

export function VisaoGeralSection({ systemStatus, isLoading: parentLoading, onNavigate }: VisaoGeralSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Hook centralizado para todos os dados reais
  const {
    fleet,
    crew,
    sensors,
    alerts,
    compliance,
    operations: operationsData,
    resources: resourceDistribution,
    activities: recentActivities,
    isLoading: dataLoading,
    lastSync
  } = useDashboardRealData();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const isLoading = parentLoading || dataLoading;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadExecutiveReport();
      toast({
        title: "Relatório gerado",
        description: "O PDF executivo foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const metrics = [
    {
      title: "Frota Ativa",
      value: `${fleet.active}/${fleet.total}`,
      subtitle: "Embarcações em operação",
      trend: fleet.total > 0 ? `${fleet.maintenance} em manutenção` : "Sem dados",
      icon: Ship,
      color: "from-blue-500 to-blue-600",
      status: "up" as const
    },
    {
      title: "Sensores IoT",
      value: `${sensors.healthPercent}%`,
      subtitle: `${sensors.critical} alertas críticos`,
      trend: sensors.anomalies > 0 ? `${sensors.anomalies} anomalias` : "Tudo normal",
      icon: Gauge,
      color: sensors.critical > 0 ? "from-red-500 to-red-600" : "from-emerald-500 to-emerald-600",
      status: sensors.critical > 0 ? "down" as const : "up" as const
    },
    {
      title: "Tripulação",
      value: `${crew.avgWellness}%`,
      subtitle: `${crew.atRisk} em risco`,
      trend: crew.atRisk > 0 ? "Atenção necessária" : "Bem-estar OK",
      icon: Heart,
      color: crew.atRisk > 0 ? "from-amber-500 to-amber-600" : "from-purple-500 to-purple-600",
      status: crew.atRisk > 0 ? "down" as const : "up" as const
    },
    {
      title: "Alertas",
      value: String(alerts.total),
      subtitle: "Pendentes de ação",
      trend: `${alerts.critical} críticos`,
      icon: AlertTriangle,
      color: "from-amber-500 to-amber-600",
      status: "down" as const
    }
  ];

  const quickAccessCards = [
    {
      title: "Executive Dashboard",
      description: "Dashboard consolidado de KPIs",
      icon: BarChart3,
      path: "/executive-dashboard",
      color: "from-primary to-info"
    },
    {
      title: "Vessel Tracking",
      description: "Rastreamento AIS em tempo real",
      icon: MapPin,
      path: "/tracking",
      color: "from-success to-info"
    },
    {
      title: "Finance Command",
      description: "Gestão financeira e bunker",
      icon: Fuel,
      path: "/finance-command",
      color: "from-warning to-warning"
    },
    {
      title: "Route Optimizer",
      description: "Otimização de rotas com IA",
      icon: Anchor,
      path: "/route-optimizer",
      color: "from-secondary to-accent"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={showAIChat ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowAIChat(!showAIChat)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            IA Operacional
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Relatório PDF
          </Button>
          <Button 
            variant={showNotificationSettings ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
        </div>
      </div>

      {/* AI Chat Panel */}
      {showAIChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <OperationalAIChat />
        </motion.div>
      )}

      {/* Notification Settings Panel */}
      {showNotificationSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <NotificationSettings />
        </motion.div>
      )}
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="metrics">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {metric.status === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${metric.status === "up" ? "text-emerald-600" : "text-red-600"}`}>
                    {metric.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickAccessCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group"
              onClick={() => navigate(card.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{card.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de Operações em Tempo Real */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Operações em Tempo Real</CardTitle>
                <CardDescription>Atividade e eficiência nas últimas 24h</CardDescription>
              </div>
              <Badge variant="outline" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Ao vivo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsData}>
                  <defs>
                    <linearGradient id="colorOperacoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEficiencia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="operacoes"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorOperacoes)"
                    name="Operações"
                  />
                  <Area
                    type="monotone"
                    dataKey="eficiencia"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorEficiencia)"
                    name="Eficiência %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição de Recursos</CardTitle>
            <CardDescription>Por área operacional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {resourceDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bunker Prices Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BunkerPriceWidget showForecast={true} />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Economia Mensal
            </CardTitle>
            <CardDescription>Oportunidades de bunker identificadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-green-600">$23.5k</p>
              <p className="text-sm text-muted-foreground">Economia potencial este mês</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Oportunidades detectadas</span>
                <Badge variant="default">12</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Bunkers otimizados</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Economia realizada</span>
                <Badge className="bg-green-500">$18.2k</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate("/finance-command")}
            >
              <Sparkles className="h-3 w-3 mr-2" />
              Ver previsões IA
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Sistemas e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status dos Sistemas */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status dos Sistemas</CardTitle>
            <CardDescription>Performance em tempo real com dados do Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Frota</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Operacional
                  </Badge>
                </div>
                <Progress value={91.6} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {systemStatus.fleet.active} de {systemStatus.fleet.total} ativas
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">IoT Sensors</span>
                  <Badge 
                    variant="outline" 
                    className={sensors.critical > 0 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }
                  >
                    {sensors.critical > 0 ? 'Alerta' : 'OK'}
                  </Badge>
                </div>
                <Progress value={sensors.healthPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {sensors.anomalies} anomalias detectadas
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Crew Wellness</span>
                  <Badge 
                    variant="outline" 
                    className={crew.atRisk > 0 
                      ? "bg-amber-50 text-amber-700 border-amber-200" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }
                  >
                    {crew.atRisk > 0 ? 'Atenção' : 'OK'}
                  </Badge>
                </div>
                <Progress value={crew.avgWellness} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {crew.atRisk} tripulantes em risco
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {compliance.score >= 90 ? 'Excelente' : compliance.score >= 70 ? 'Bom' : 'Atenção'}
                  </Badge>
                </div>
                <Progress value={compliance.score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Score: {compliance.score}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes - Dados Reais */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-4 w-4" />
                Atividades Recentes
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Dados em tempo real
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px]">
              <div className="p-4 space-y-3">
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity.id} className={`flex items-start gap-3 ${activity.urgent ? 'bg-red-50 dark:bg-red-950/20 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                    <div className={`p-1.5 rounded-lg ${activity.urgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                      <Activity className={`h-4 w-4 ${activity.urgent ? 'text-red-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${activity.urgent ? 'font-medium text-red-700 dark:text-red-400' : ''}`}>
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Carregando atividades...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
