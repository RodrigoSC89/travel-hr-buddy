import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle2, 
  Activity, 
  Users, 
  TrendingUp, 
  Clock,
  BarChart3,
  Anchor,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  onClick?: () => void;
  actionLabel?: string;
}

const ModernKPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "blue",
  onClick,
  actionLabel
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-azure-500 to-azure-600",
      icon: "bg-azure-100 text-azure-700",
      text: "text-azure-600",
      badge: "bg-azure-100 text-azure-700 border-azure-200"
    },
    green: {
      bg: "bg-gradient-to-br from-success to-success/80",
      icon: "bg-success/10 text-success",
      text: "text-success",
      badge: "bg-success/10 text-success border-success/20"
    },
    yellow: {
      bg: "bg-gradient-to-br from-warning to-warning/80",
      icon: "bg-warning/10 text-warning",
      text: "text-warning",
      badge: "bg-warning/10 text-warning border-warning/20"
    },
    red: {
      bg: "bg-gradient-to-br from-destructive to-destructive/80",
      icon: "bg-destructive/10 text-destructive",
      text: "text-destructive",
      badge: "bg-destructive/10 text-destructive border-destructive/20"
    },
    purple: {
      bg: "bg-gradient-to-br from-accent to-accent/80",
      icon: "bg-accent/10 text-accent-foreground",
      text: "text-accent-foreground",
      badge: "bg-accent/10 text-accent-foreground border-accent/20"
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden bg-card">
      {/* Header com gradiente */}
      <div className={`${classes.bg} p-4 text-white relative overflow-hidden`}>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-primary-foreground/90">{title}</h3>
            <div className="text-2xl font-bold text-primary-foreground mt-1">{value}</div>
            {subtitle && (
              <p className="text-xs text-primary-foreground/80 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-3 bg-primary-foreground/10 rounded-full backdrop-blur-sm">
            {icon}
          </div>
        </div>
        
        {/* Pattern decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="w-full h-full bg-primary-foreground rounded-full transform translate-x-12 -translate-y-12"></div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {trend && (
            <Badge variant="outline" className={`${classes.badge} font-medium`}>
              {trend}
            </Badge>
          )}
          
          {onClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClick}
              className={`${classes.text} hover:bg-accent ml-auto`}
              aria-label={actionLabel || `Ver detalhes de ${title}`}
            >
              {actionLabel || "Ver mais"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ExecutiveDashboardProps {
  className?: string;
}

export const ModernExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ className }) => {
  const navigate = useNavigate();

  const kpis = [
    {
      title: "Conformidade PEOTRAM",
      value: "96.8%",
      subtitle: "Última auditoria: 15/09/2025",
      trend: "+2.3% vs mês anterior",
      icon: <Shield className="w-6 h-6 text-primary-foreground" />,
      color: "green" as const,
      onClick: () => navigate("/compliance?standard=peotram"),
      actionLabel: "Ver PEOTRAM"
    },
    {
      title: "Tripulação Ativa",
      value: "247",
      subtitle: "12 embarcações em operação",
      trend: "98% certificados válidos",
      icon: <Users className="w-6 h-6 text-primary-foreground" />,
      color: "blue" as const,
      onClick: () => navigate("/maritime-command"),
      actionLabel: "Ver Frota"
    },
    {
      title: "Certificações",
      value: "28",
      subtitle: "Vencendo em 30 dias",
      trend: "Ação necessária",
      icon: <AlertTriangle className="w-6 h-6 text-primary-foreground" />,
      color: "yellow" as const,
      onClick: () => navigate("/maritime-command"),
      actionLabel: "Verificar"
    },
    {
      title: "Eficiência Operacional",
      value: "94.2%",
      subtitle: "Média dos últimos 30 dias",
      trend: "+1.8% vs período anterior",
      icon: <TrendingUp className="w-6 h-6 text-primary-foreground" />,
      color: "purple" as const,
      onClick: () => navigate("/analytics-command"),
      actionLabel: "Analytics"
    },
    {
      title: "Tempo Médio de Resposta",
      value: "4.2h",
      subtitle: "Resolução de incidentes",
      trend: "-15 min vs média",
      icon: <Clock className="w-6 h-6 text-primary-foreground" />,
      color: "green" as const,
      onClick: () => navigate("/command?tab=monitoring"),
      actionLabel: "Monitor"
    },
    {
      title: "Disponibilidade da Frota",
      value: "92%",
      subtitle: "11 de 12 embarcações ativas",
      trend: "Dentro da meta (>90%)",
      icon: <Anchor className="w-6 h-6 text-primary-foreground" />,
      color: "blue" as const,
      onClick: () => navigate("/fleet-command"),
      actionLabel: "Frota"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard Executivo</h2>
          <p className="text-muted-foreground mt-1">
            Visão geral das operações marítimas e indicadores de performance
          </p>
        </div>
        <Badge className="bg-success/10 text-success border-success/20 px-3 py-1">
          <Activity className="w-4 h-4 mr-1" />
          Sistema Online
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <ModernKPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            trend={kpi.trend}
            icon={kpi.icon}
            color={kpi.color}
            onClick={kpi.onClick}
            actionLabel={kpi.actionLabel}
          />
        ))}
      </div>

      {/* Status Cards Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-azure-200 bg-gradient-to-br from-azure-50 to-azure-100 dark:from-azure-900/50 dark:to-azure-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-azure-800 dark:text-azure-200">
              <CheckCircle2 className="w-5 h-5" />
              Status Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Embarcações Ativas</span>
                <Badge className="bg-success/10 text-success">11/12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Conformidade Regulatória</span>
                <Badge className="bg-success/10 text-success">96.8%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Tripulação Certificada</span>
                <Badge className="bg-primary/10 text-primary">98%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <BarChart3 className="w-5 h-5" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Eficiência Geral</span>
                <Badge className="bg-success/10 text-success">94.2%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Tempo de Resposta</span>
                <Badge className="bg-primary/10 text-primary">4.2h</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Disponibilidade</span>
                <Badge className="bg-success/10 text-success">99.1%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernExecutiveDashboard;