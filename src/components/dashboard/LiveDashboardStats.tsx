/**
 * Live Dashboard Stats - Real-time KPI display
 * Fetches and displays live data from Supabase
 */

import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { 
  Ship, 
  Users, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Shield
} from "lucide-react";
import { useDashboardData, DashboardMetrics } from "./index/DashboardDataProvider";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = memo(({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = "primary",
  isLoading = false
}) => {
  const colorClasses: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    green: "from-green-500/20 to-green-500/5 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    red: "from-red-500/20 to-red-500/5 border-red-500/30",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  };

  const iconColorClasses: Record<string, string> = {
    primary: "bg-primary/20 text-primary",
    green: "bg-green-500/20 text-green-500",
    yellow: "bg-yellow-500/20 text-yellow-500",
    red: "bg-red-500/20 text-red-500",
    blue: "bg-blue-500/20 text-blue-500",
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br ${colorClasses[color]} border`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={`text-xs font-medium ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${iconColorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

export const LiveDashboardStats: React.FC = memo(() => {
  const { metrics } = useDashboardData();

  const stats = [
    {
      title: "Embarcações",
      value: metrics.isLoading ? "-" : `${metrics.activeVessels}/${metrics.totalVessels}`,
      subtitle: "Em operação",
      icon: <Ship className="h-5 w-5" />,
      trend: "up" as const,
      trendValue: metrics.totalVessels > 0 ? `${Math.round((metrics.activeVessels / metrics.totalVessels) * 100)}% ativas` : undefined,
      color: "blue",
    },
    {
      title: "Tripulação",
      value: metrics.isLoading ? "-" : `${metrics.activeCrew}/${metrics.totalCrew}`,
      subtitle: "Tripulantes ativos",
      icon: <Users className="h-5 w-5" />,
      trend: "stable" as const,
      trendValue: metrics.totalCrew > 0 ? `${Math.round((metrics.activeCrew / metrics.totalCrew) * 100)}% disponíveis` : undefined,
      color: "green",
    },
    {
      title: "Manutenções",
      value: metrics.isLoading ? "-" : metrics.pendingMaintenance,
      subtitle: "Pendentes",
      icon: <Wrench className="h-5 w-5" />,
      trend: metrics.pendingMaintenance > 5 ? "down" as const : "stable" as const,
      trendValue: metrics.pendingMaintenance > 5 ? "Atenção necessária" : "Sob controle",
      color: metrics.pendingMaintenance > 5 ? "yellow" : "primary",
    },
    {
      title: "Alertas",
      value: metrics.isLoading ? "-" : metrics.criticalAlerts,
      subtitle: "Ativos",
      icon: <AlertTriangle className="h-5 w-5" />,
      trend: metrics.criticalAlerts > 0 ? "down" as const : "up" as const,
      trendValue: metrics.criticalAlerts > 0 ? `${metrics.criticalAlerts} alertas ativos` : "Nenhum alerta",
      color: metrics.criticalAlerts > 0 ? "red" : "green",
    },
    {
      title: "Compliance",
      value: metrics.isLoading ? "-" : `${metrics.complianceRate}%`,
      subtitle: "Taxa de conformidade",
      icon: <Shield className="h-5 w-5" />,
      trend: metrics.complianceRate >= 90 ? "up" as const : "down" as const,
      trendValue: metrics.complianceRate >= 90 ? "Excelente" : "Requer atenção",
      color: metrics.complianceRate >= 90 ? "green" : "yellow",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Indicadores em Tempo Real</h3>
        <Badge variant="outline" className="text-xs">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          Live
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
            isLoading={metrics.isLoading}
          />
        ))}
      </div>
    </div>
  );
});

LiveDashboardStats.displayName = "LiveDashboardStats";

export default LiveDashboardStats;
