import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-profile";
import { WelcomeCard } from "./welcome-card";
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
  CheckCircle,
  Rocket,
  Trophy,
  Star,
  Crown,
  Diamond,
  Flame,
  Heart,
  Globe
} from "lucide-react";

const InteractiveStatsCard = ({ icon: Icon, title, value, change, trend, description, color = "blue", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    blue: {
      gradient: "from-info/20 via-info/10 to-info/20",
      border: "border-info/30",
      icon: "text-info-foreground",
      bg: "bg-info/15",
      glow: "shadow-info/25"
    },
    green: {
      gradient: "from-success/20 via-success/10 to-success/20",
      border: "border-success/30", 
      icon: "text-success-foreground",
      bg: "bg-success/15",
      glow: "shadow-success/25"
    },
    purple: {
      gradient: "from-primary/20 via-primary/10 to-primary/20",
      border: "border-primary/30",
      icon: "text-primary-foreground", 
      bg: "bg-primary/15",
      glow: "shadow-primary/25"
    },
    orange: {
      gradient: "from-warning/20 via-warning/10 to-warning/20",
      border: "border-warning/30",
      icon: "text-warning-foreground",
      bg: "bg-warning/15", 
      glow: "shadow-warning/25"
    },
    rose: {
      gradient: "from-destructive/20 via-destructive/10 to-destructive/20",
      border: "border-destructive/30",
      icon: "text-destructive-foreground",
      bg: "bg-destructive/15",
      glow: "shadow-destructive/25"
    }
  };

  const colors = colorClasses[color];

  return (
    <Card 
      className={`relative overflow-hidden group cursor-pointer transition-all duration-700 transform
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${isHovered ? `scale-105 ${colors.glow} shadow-2xl` : "shadow-lg"}
        bg-gradient-to-br ${colors.gradient} ${colors.border} border backdrop-blur-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
        <div className="absolute top-8 right-6 w-1 h-1 bg-secondary/50 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-accent/40 rounded-full animate-ping" style={{ animationDelay: "2s" }} />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${colors.bg} backdrop-blur-sm transition-all duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                {title}
              </span>
            </div>
            
            <div className="text-3xl font-bold font-display bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary-foreground transition-all duration-500">
              {value}
            </div>
            
            <div className="flex items-center gap-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-success-foreground" : "text-destructive-foreground"}`}>
                {change}
              </span>
              <Sparkles className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
          
          <div className={`p-4 rounded-2xl ${colors.bg} backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 float-element`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
        </div>
        
        <p className="text-xs text-foreground/70 opacity-70 group-hover:opacity-100 transition-all duration-300">
          {description}
        </p>
        
        {/* Progress Bar Animation */}
        <div className="mt-4 relative">
          <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-1000 ${isVisible ? "w-full" : "w-0"}`}
              style={{ transitionDelay: `${delay + 200}ms` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FloatingActionButton = ({ icon: Icon, label, onClick, color = "primary", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Button
      onClick={onClick}
      aria-label={label}
      className={`group relative overflow-hidden bg-gradient-to-r from-primary to-primary-glow text-azure-50 
        transition-all duration-500 transform hover:scale-110 hover:shadow-2xl hover:-rotate-2
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        rounded-2xl p-6 h-auto flex-col gap-3 min-w-[140px] hover:from-primary-glow hover:to-primary
        shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-4 focus:ring-primary/30`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-azure-100/20 to-transparent 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] 
        group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-center">{label}</span>
      </div>
    </Button>
  );
};

const PulsingNotificationCard = ({ title, description, time, priority = "medium", icon: Icon }) => {
  const priorityColors = {
    high: "border-l-destructive bg-destructive/10 text-destructive-foreground",
    medium: "border-l-info bg-info/10 text-info-foreground", 
    low: "border-l-success bg-success/10 text-success-foreground"
  };

  return (
    <div className={`group p-4 border-l-4 rounded-xl ${priorityColors[priority]} 
      hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-lg backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-card/80 border border-border backdrop-blur-sm 
          group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/70">{time}</span>
              {priority === "high" && <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />}
            </div>
          </div>
          <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const EnhancedDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [isLoaded, setIsLoaded] = useState(false);
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const quickActions = [
    { 
      icon: BarChart3, 
      label: "Relatórios IA", 
      action: () => {
        console.log("📊 Relatórios IA clicked");
        navigate("/reports");
        toast({ title: "📊 Relatórios IA", description: "Abrindo sistema de relatórios inteligentes" });
      }
    },
    { 
      icon: Brain, 
      label: "Analytics", 
      action: () => {
        console.log("🧠 Analytics clicked");
        navigate("/analytics");
        toast({ title: "🧠 Analytics", description: "Abrindo painel de análises" });
      }
    },
    { 
      icon: Users, 
      label: "RH Maritime", 
      action: () => {
        console.log("👥 RH Maritime clicked");
        navigate("/hr");
        toast({ title: "👥 RH Maritime", description: "Abrindo recursos humanos marítimos" });
      }
    },
    { 
      icon: Rocket, 
      label: "Inovação", 
      action: () => {
        console.log("🚀 Inovação clicked");
        navigate("/intelligence");
        toast({ title: "🚀 Inovação", description: "Abrindo centro de inteligência e inovação" });
      }
    }
  ];

  const recentActivities = [
    {
      title: "Relatório de Vendas Gerado",
      description: "Análise automática de performance Q3 foi concluída com insights revolucionários",
      time: "há 5 minutos",
      priority: "high",
      icon: BarChart3
    },
    {
      title: "Workflow de Aprovação Ativo",
      description: "3 documentos aguardando revisão executiva com IA de análise",
      time: "há 15 minutos", 
      priority: "medium",
      icon: CheckCircle
    },
    {
      title: "Sistema de IA Atualizado",
      description: "Nova versão do motor de IA com 25% mais precisão implementada",
      time: "há 1 hora",
      priority: "high",
      icon: Brain
    },
    {
      title: "Certificados SSL Renovados",
      description: "Segurança aprimorada com criptografia quântica ativada",
      time: "há 2 horas",
      priority: "low",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 space-y-8 p-6">
        {/* Revolutionary Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl hero-gradient p-8 text-azure-50 
          transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm animate-pulse-glow">
                <Rocket className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  Dashboard Revolucionário
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md text-primary-foreground font-semibold">
                  Bem-vindo(a), {profile?.full_name || "Usuário"} 
                  <Crown className="inline-block w-6 h-6 ml-2 text-warning animate-bounce drop-shadow-lg" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md text-primary-foreground font-medium">
              Sistema de gestão mais avançado do mercado com IA, automação e experiência 
              completamente hipnotizante para revolucionar sua produtividade.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-primary shadow-lg border border-primary/30">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">IA Preditiva</span>
              </div>
              <div className="flex items-center gap-2 bg-info/90 text-info-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-info shadow-lg border border-info/30">
                <Globe className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Global Scale</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-secondary shadow-lg border border-secondary/30">
                <Diamond className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Premium Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className={`transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
          style={{ transitionDelay: "200ms" }}>
          <WelcomeCard />
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <InteractiveStatsCard 
              key={index} 
              {...stat} 
              delay={300 + (index * 100)} 
            />
          ))}
        </div>

        {/* Floating Action Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <FloatingActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.action}
              delay={700 + (index * 100)}
            />
          ))}
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Overview */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl overflow-hidden group 
              transition-all duration-700 hover:scale-[1.01] backdrop-blur-sm border border-border/50">
              
              {/* Animated Header Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-2xl font-display">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse-glow">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-gradient">Performance Overview</span>
                      <Flame className="w-6 h-6 text-orange-500 animate-bounce" />
                    </CardTitle>
                    <CardDescription className="text-base opacity-80 group-hover:opacity-100 transition-opacity mt-2">
                      Métricas revolucionárias em tempo real • Última atualização: agora
                      <Star className="inline-block w-4 h-4 ml-2 text-warning animate-pulse" />
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2 p-1 bg-muted/30 rounded-xl backdrop-blur-sm">
                    {["7d", "30d", "90d"].map((period) => (
                      <Button 
                        key={period}
                        variant={selectedPeriod === period ? "default" : "ghost"} 
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                        className="rounded-lg hover:scale-105 transition-all duration-200 relative overflow-hidden"
                      >
                        {selectedPeriod === period && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow animate-gradient-shift" />
                        )}
                        <span className="relative z-10">{period}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-8">
                  {/* Enhanced KPI Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { icon: DollarSign, label: "Receita vs Meta", value: 95, color: "emerald", detail: "R$ 285k de R$ 300k meta mensal" },
                      { icon: Users, label: "Satisfação Cliente", value: 98, color: "blue", detail: "Excelente feedback • 4.9/5 avaliação média" },
                      { icon: Activity, label: "Eficiência Operacional", value: 87, color: "purple", detail: "Automação ativa • 23% melhoria este mês" },
                      { icon: Brain, label: "Adoção de IA", value: 92, color: "orange", detail: "IA integrada • 15 modelos ativos" }
                    ].map((kpi, index) => (
                      <div key={index} className="group space-y-4 p-6 rounded-xl bg-gradient-to-br from-background/50 to-primary/5 
                        hover:from-primary/10 hover:to-primary/5 transition-all duration-500 hover:scale-105 hover:shadow-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold flex items-center gap-2">
                            <kpi.icon className="w-4 h-4 text-primary" />
                            {kpi.label}
                            <Trophy className="w-3 h-3 text-warning opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-xl font-bold text-primary font-display">{kpi.value}%</span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={kpi.value} 
                            className="h-3 bg-muted/30"
                          />
                          <div className="absolute inset-0 h-3 bg-gradient-to-r from-primary/40 to-primary-glow/40 rounded-full 
                            animate-shimmer opacity-20 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <p className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">
                          {kpi.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Quick Actions */}
                  <div className="pt-6 border-t border-border/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 font-display">
                      <Zap className="w-5 h-5 text-primary animate-pulse" />
                      Ações Revolucionárias
                      <Sparkles className="w-4 h-4 text-primary" />
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: Eye, label: "Ver Relatório", url: "/reports" },
                        { icon: Zap, label: "Otimizar IA", url: "/analytics" },
                        { icon: Brain, label: "Análise IA", url: "/analytics" },
                        { icon: Rocket, label: "Inovação", url: "/intelligence" }
                      ].map((action, index) => (
                        <Button 
                          key={index}
                          variant="outline" 
                          size="sm" 
                          className="justify-start h-14 hover:scale-105 transition-all duration-300 group relative overflow-hidden
                            hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => window.open(action.url, "_blank")}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300" />
                          <action.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                          <span className="relative z-10">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Activities Sidebar */}
          <div className="space-y-6">
            <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />
                  Atividades Inteligentes
                  <Heart className="h-4 w-4 text-destructive animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <PulsingNotificationCard key={index} {...activity} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revolutionary Features Showcase */}
        <Card className="overflow-hidden bg-gradient-to-br from-card to-primary/5 hover:shadow-2xl transition-all duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-display">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-gradient">Recursos Revolucionários do Sistema</span>
              <Crown className="h-6 w-6 text-warning animate-bounce" />
            </CardTitle>
            <CardDescription className="text-base">
              Funcionalidades que ainda não existem no mercado mundial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🧠", title: "IA Quântica", desc: "Processamento neural avançado com algoritmos quânticos proprietários", color: "blue" },
                { icon: "🚀", title: "Automação Total", desc: "Sistema completamente autônomo com aprendizado contínuo", color: "purple" },
                { icon: "🔮", title: "Previsão Temporal", desc: "Análise preditiva com precisão de 99.7% usando machine learning", color: "cyan" },
                { icon: "⚡", title: "Performance Extrema", desc: "Velocidade de processamento 1000x superior aos concorrentes", color: "yellow" },
                { icon: "🛡️", title: "Segurança Quântica", desc: "Criptografia quântica inviolável com certificação militar", color: "green" },
                { icon: "🌍", title: "Escala Global", desc: "Infraestrutura planetária com replicação em tempo real", color: "indigo" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-background/50 to-primary/5 border border-border/50
                    hover:scale-105 hover:shadow-lg transition-all duration-500 cursor-pointer
                    hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-primary mb-2 font-display group-hover:text-primary-glow transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};