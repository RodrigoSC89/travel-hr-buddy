import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { WelcomeCard } from './welcome-card';
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
    blue: "from-blue-500/20 via-blue-400/10 to-cyan-500/20 border-blue-200/50",
    green: "from-green-500/20 via-green-400/10 to-emerald-500/20 border-green-200/50",
    purple: "from-purple-500/20 via-purple-400/10 to-violet-500/20 border-purple-200/50",
    orange: "from-orange-500/20 via-orange-400/10 to-red-500/20 border-orange-200/50",
    teal: "from-teal-500/20 via-teal-400/10 to-cyan-500/20 border-teal-200/50",
    rose: "from-rose-500/20 via-rose-400/10 to-pink-500/20 border-rose-200/50"
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600", 
    purple: "text-purple-600",
    orange: "text-orange-600",
    teal: "text-teal-600",
    rose: "text-rose-600"
  };

  const bgColors = {
    blue: "bg-blue-500/10",
    green: "bg-green-500/10",
    purple: "bg-purple-500/10", 
    orange: "bg-orange-500/10",
    teal: "bg-teal-500/10",
    rose: "bg-rose-500/10"
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg group cursor-pointer border backdrop-blur-sm transition-all duration-300`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${iconColors[color]}`} />
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {value}
            </div>
            <div className="flex items-center gap-2">
              <TrendIcon className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'} group-hover:scale-110 transition-transform`} />
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${bgColors[color]} backdrop-blur-sm group-hover:scale-105 transition-all duration-300`}>
            <Icon className={`w-8 h-8 ${iconColors[color]}`} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const ActivityCard = ({ title, description, time, status, icon: Icon, priority = "medium" }) => {
  const statusColors = {
    completed: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    pending: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
    urgent: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
  };

  const priorityColors = {
    high: "border-l-red-500 shadow-red-500/20",
    medium: "border-l-blue-500 shadow-blue-500/20",
    low: "border-l-green-500 shadow-green-500/20"
  };

  const iconColors = {
    high: "bg-red-500/10 text-red-600",
    medium: "bg-blue-500/10 text-blue-600", 
    low: "bg-green-500/10 text-green-600"
  };

  return (
    <div className={`group p-4 border rounded-xl bg-card hover:scale-[1.01] transition-all duration-300 border-l-4 ${priorityColors[priority]} hover:shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl backdrop-blur-sm ${iconColors[priority]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{title}</h4>
            <Badge variant="outline" className={`text-xs transition-all duration-300 ${statusColors[status]} group-hover:scale-105`}>
              {status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
          <span className="text-xs text-muted-foreground opacity-60 group-hover:opacity-80 transition-opacity">
            {time}
          </span>
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
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 backdrop-blur-sm border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Dashboard Inteligente
            </h1>
            <p className="text-muted-foreground text-lg opacity-80">
              Monitoramento em tempo real com insights poderosos de IA
            </p>
          </div>
        </div>

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
          <Card className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 hover:shadow-lg overflow-hidden group transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Performance Overview
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base opacity-80 group-hover:opacity-100 transition-opacity">
                    Métricas principais em tempo real • Última atualização: agora
                  </CardDescription>
                </div>
                <div className="flex gap-2 p-1 bg-muted/30 rounded-xl backdrop-blur-sm">
                  <Button 
                    variant={selectedPeriod === '7d' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('7d')}
                    className="rounded-lg hover:scale-105 transition-all duration-200"
                  >
                    7d
                  </Button>
                  <Button 
                    variant={selectedPeriod === '30d' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('30d')}
                    className="rounded-lg hover:scale-105 transition-all duration-200"
                  >
                    30d
                  </Button>
                  <Button 
                    variant={selectedPeriod === '90d' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('90d')}
                    className="rounded-lg hover:scale-105 transition-all duration-200"
                  >
                    90d
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-8">
                {/* KPI Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group space-y-4 p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Receita vs Meta
                      </span>
                      <span className="text-lg font-bold text-green-600">95%</span>
                    </div>
                    <div className="relative">
                      <Progress value={95} className="h-4 bg-muted/30" />
                      <div className="absolute inset-0 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20" />
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      R$ 285k de R$ 300k meta mensal • Faltam R$ 15k
                    </p>
                  </div>
                  
                  <div className="group space-y-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Satisfação Cliente
                      </span>
                      <span className="text-lg font-bold text-blue-600">98%</span>
                    </div>
                    <div className="relative">
                      <Progress value={98} className="h-4 bg-muted/30" />
                      <div className="absolute inset-0 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-20" />
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Excelente feedback • 4.9/5 avaliação média
                    </p>
                  </div>
                  
                  <div className="group space-y-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-violet-500/5 hover:from-purple-500/10 hover:to-violet-500/10 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        Eficiência Operacional
                      </span>
                      <span className="text-lg font-bold text-purple-600">87%</span>
                    </div>
                    <div className="relative">
                      <Progress value={87} className="h-4 bg-muted/30" />
                      <div className="absolute inset-0 h-4 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full opacity-20" />
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Automação ativa • 23% melhoria este mês
                    </p>
                  </div>
                  
                  <div className="group space-y-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-red-500/5 hover:from-orange-500/10 hover:to-red-500/10 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        <Brain className="w-4 h-4 text-orange-600" />
                        Adoção de IA
                      </span>
                      <span className="text-lg font-bold text-orange-600">92%</span>
                    </div>
                    <div className="relative">
                      <Progress value={92} className="h-4 bg-muted/30" />
                      <div className="absolute inset-0 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-20" />
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      IA integrada • 15 modelos ativos
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-border/50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Ações Rápidas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start hover:scale-105 group h-12 transition-all duration-200"
                      onClick={() => window.open('/reports', '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Ver Relatório
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start hover:scale-105 group h-12 transition-all duration-200"
                      onClick={() => window.open('/analytics', '_blank')}
                    >
                      <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Otimizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start hover:scale-105 group h-12 transition-all duration-200"
                      onClick={() => window.open('/analytics', '_blank')}
                    >
                      <Brain className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Análise IA
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start hover:scale-105 group h-12 transition-all duration-200"
                      onClick={() => window.open('/settings', '_blank')}
                    >
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
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
          <Card className="glass-card bg-gradient-to-br from-muted/20 to-muted/5 hover-lift group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-primary/10 animate-pulse-glow">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Feed de Atividades
                </span>
              </CardTitle>
              <CardDescription className="opacity-80 group-hover:opacity-100 transition-opacity">
                Monitoramento em tempo real • Atualizações ao vivo
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ActivityCard {...activity} />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 hover-lift hover-glow group h-12">
                <span className="group-hover:scale-105 transition-transform flex items-center">
                  Ver Todas as Atividades
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights Preview */}
          <Card className="glass-card bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-cyan-500/15 hover-lift group overflow-hidden animate-morphing border-2 border-purple-200/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-purple-500/20 animate-float">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-pulse-glow" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  IA Insight Premium
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-200/20">
                  <p className="text-sm leading-relaxed">
                    <strong className="text-purple-600">🎯 Oportunidade Premium:</strong> Implementar automação 
                    inteligente no processo de aprovação pode reduzir tempo de processamento em 
                    <span className="font-bold text-green-600"> 40%</span> e aumentar eficiência em 
                    <span className="font-bold text-blue-600"> 60%</span>.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 animate-bounce-in">
                    🎯 Confiança: 94%
                  </Badge>
                  <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 animate-bounce-in">
                    💰 ROI: Alto
                  </Badge>
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 animate-bounce-in">
                    ⚡ Impacto: Imediato
                  </Badge>
                </div>
                <Button size="sm" className="w-full hover-lift hover-glow group h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Brain className="w-4 h-4 mr-2 group-hover:animate-wiggle" />
                  <span className="group-hover:scale-105 transition-transform">
                    Implementar Automação IA
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
};