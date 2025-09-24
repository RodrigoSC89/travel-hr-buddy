import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Target,
  Calendar,
  Award,
  Zap,
  Brain,
  Eye,
  BarChart3,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const QuickStatsCard = ({ icon: Icon, title, value, change, trend, description, color = "blue" }) => {
  const trendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const TrendIcon = trendIcon;
  
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-200/50",
    green: "from-green-500/20 to-emerald-500/20 border-green-200/50",
    purple: "from-purple-500/20 to-violet-500/20 border-purple-200/50",
    orange: "from-orange-500/20 to-red-500/20 border-orange-200/50",
    teal: "from-teal-500/20 to-cyan-500/20 border-teal-200/50",
    rose: "from-rose-500/20 to-pink-500/20 border-rose-200/50"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 text-${color}-600`} />
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center gap-2">
              <TrendIcon className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-${color}-500/10`}>
            <Icon className={`w-8 h-8 text-${color}-600`} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

const ActivityCard = ({ title, description, time, status, icon: Icon, priority = "medium" }) => {
  const statusColors = {
    completed: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    urgent: "text-red-600 bg-red-100"
  };

  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-blue-500",
    low: "border-l-green-500"
  };

  return (
    <div className={`p-4 border rounded-lg bg-card/50 hover:bg-card/80 transition-colors border-l-4 ${priorityColors[priority]}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>
              {status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  );
};

export const EnhancedDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const quickStats = [
    {
      icon: DollarSign,
      title: "Receita Mensal",
      value: "R$ 285.000",
      change: "+12.5%",
      trend: "up",
      description: "Crescimento consistente nos últimos 3 meses",
      color: "green"
    },
    {
      icon: Users,
      title: "Usuários Ativos",
      value: "1.2k",
      change: "+8.3%",
      trend: "up",
      description: "Maior engajamento da equipe",
      color: "blue"
    },
    {
      icon: Activity,
      title: "Produtividade",
      value: "94%",
      change: "+5.7%",
      trend: "up",
      description: "Eficiência operacional melhorou",
      color: "purple"
    },
    {
      icon: Target,
      title: "Metas Atingidas",
      value: "87%",
      change: "-2.1%",
      trend: "down",
      description: "Revisar estratégias de Q4",
      color: "orange"
    }
  ];

  const recentActivities = [
    {
      title: "Relatório de Vendas Gerado",
      description: "Análise automática de performance Q3 foi concluída",
      time: "há 5 minutos",
      status: "completed",
      icon: BarChart3,
      priority: "high"
    },
    {
      title: "Workflow de Aprovação Ativo",
      description: "3 documentos aguardando revisão executiva",
      time: "há 15 minutos",
      status: "pending",
      icon: CheckCircle,
      priority: "medium"
    },
    {
      title: "Alerta de Sistema",
      description: "Certificados SSL expiram em 14 dias",
      time: "há 1 hora",
      status: "urgent",
      icon: AlertTriangle,
      priority: "high"
    },
    {
      title: "IA Processou Dados",
      description: "Insights de mercado atualizados com tendências",
      time: "há 2 horas",
      status: "completed",
      icon: Brain,
      priority: "low"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <QuickStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Métricas principais dos últimos 30 dias
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedPeriod === '7d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('7d')}
                  >
                    7d
                  </Button>
                  <Button 
                    variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('30d')}
                  >
                    30d
                  </Button>
                  <Button 
                    variant={selectedPeriod === '90d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('90d')}
                  >
                    90d
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* KPI Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Receita vs Meta</span>
                      <span className="text-sm text-muted-foreground">95%</span>
                    </div>
                    <Progress value={95} className="h-3" />
                    <p className="text-xs text-muted-foreground">R$ 285k de R$ 300k meta mensal</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Satisfação Cliente</span>
                      <span className="text-sm text-muted-foreground">98%</span>
                    </div>
                    <Progress value={98} className="h-3" />
                    <p className="text-xs text-muted-foreground">Excelente feedback dos usuários</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Eficiência Operacional</span>
                      <span className="text-sm text-muted-foreground">87%</span>
                    </div>
                    <Progress value={87} className="h-3" />
                    <p className="text-xs text-muted-foreground">Otimização de processos ativa</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Adoção de IA</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-3" />
                    <p className="text-xs text-muted-foreground">Excelente integração IA</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Ações Rápidas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Relatório
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      Otimizar
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Brain className="w-4 h-4 mr-2" />
                      Análise IA
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Expandir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas atualizações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityCard key={index} {...activity} />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todas as Atividades
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights Preview */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Insight IA do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Oportunidade Identificada:</strong> Implementar automação 
                  no processo de aprovação pode reduzir tempo de processamento em 40%.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Confiança: 94%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ROI: Alto
                  </Badge>
                </div>
                <Button size="sm" className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  Ver Análise Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};