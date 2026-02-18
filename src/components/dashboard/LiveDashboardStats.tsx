/**
 * Live Dashboard Stats v2 - Real-time KPI display with animated counters & sparklines
 * World-class benchmark: Linear, Vercel, Stripe
 */

import React, { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Ship, Users, Wrench, AlertTriangle, Shield,
  TrendingUp, TrendingDown
} from "lucide-react";
import { useDashboardData } from "./index/DashboardDataProvider";
import { AnimatedCounter } from "@/components/ui/premium-module-kit/AnimatedCounter";
import { SparklineChart } from "@/components/ui/premium-module-kit/SparklineChart";
import { LivePulse } from "@/components/ui/premium-module-kit/LivePulse";
import { ContextualSkeleton } from "@/components/ui/premium-module-kit/ContextualSkeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  total?: number;
  suffix?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color: string;
  sparkline?: number[];
  delay?: number;
  isLoading?: boolean;
}

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  primary: { bg: "from-primary/15 to-primary/5", icon: "bg-primary/15 text-primary", border: "border-primary/20" },
  green: { bg: "from-success/15 to-success/5", icon: "bg-success/15 text-success", border: "border-success/20" },
  yellow: { bg: "from-warning/15 to-warning/5", icon: "bg-warning/15 text-warning", border: "border-warning/20" },
  red: { bg: "from-destructive/15 to-destructive/5", icon: "bg-destructive/15 text-destructive", border: "border-destructive/20" },
  blue: { bg: "from-info/15 to-info/5", icon: "bg-info/15 text-info", border: "border-info/20" },
};

const sparklineColorMap: Record<string, "primary" | "success" | "warning" | "destructive" | "info"> = {
  primary: "primary",
  green: "success",
  yellow: "warning",
  red: "destructive",
  blue: "info",
};

const StatCard: React.FC<StatCardProps> = memo(({ 
  title, value, total, suffix, icon, trend, trendValue, color, sparkline, delay = 0, isLoading
}) => {
  const colors = colorClasses[color] || colorClasses.primary;

  if (isLoading) return null; // handled by skeleton

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card className={cn(
        "bg-gradient-to-br border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group",
        colors.bg, colors.border
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <AnimatedCounter
                  value={value}
                  className="text-2xl font-bold text-foreground"
                  duration={1.5}
                />
                {total !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    /<AnimatedCounter value={total} className="text-sm" duration={1.2} />
                  </span>
                )}
                {suffix && <span className="text-lg font-semibold text-foreground">{suffix}</span>}
              </div>
              
              {trend && trendValue && (
                <div className="flex items-center gap-1 mt-2">
                  {trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                  {trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                  <span className={cn(
                    "text-xs font-medium",
                    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={cn("p-2.5 rounded-lg transition-transform group-hover:scale-105", colors.icon)}>
                {icon}
              </div>
              {sparkline && sparkline.length > 0 && (
                <SparklineChart
                  data={sparkline}
                  color={sparklineColorMap[color] || "primary"}
                  width={72}
                  height={24}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

StatCard.displayName = "StatCard";

// Generate synthetic sparkline data from a current value
function generateSparkline(current: number, points = 8): number[] {
  const result: number[] = [];
  const base = Math.max(current * 0.7, 0);
  for (let i = 0; i < points - 1; i++) {
    result.push(Math.round(base + Math.random() * (current - base)));
  }
  result.push(current);
  return result;
}

export const LiveDashboardStats: React.FC = memo(() => {
  const { metrics } = useDashboardData();

  const stats = useMemo(() => [
    {
      title: "Embarcações",
      value: metrics.activeVessels,
      total: metrics.totalVessels,
      icon: <Ship className="h-5 w-5" />,
      trend: "up" as const,
      trendValue: metrics.totalVessels > 0 ? `${Math.round((metrics.activeVessels / metrics.totalVessels) * 100)}% ativas` : undefined,
      color: "blue",
      sparkline: generateSparkline(metrics.activeVessels),
    },
    {
      title: "Tripulação",
      value: metrics.activeCrew,
      total: metrics.totalCrew,
      icon: <Users className="h-5 w-5" />,
      trend: "stable" as const,
      trendValue: metrics.totalCrew > 0 ? `${Math.round((metrics.activeCrew / metrics.totalCrew) * 100)}% disponíveis` : undefined,
      color: "green",
      sparkline: generateSparkline(metrics.activeCrew),
    },
    {
      title: "Manutenções",
      value: metrics.pendingMaintenance,
      icon: <Wrench className="h-5 w-5" />,
      trend: metrics.pendingMaintenance > 5 ? "down" as const : "stable" as const,
      trendValue: metrics.pendingMaintenance > 5 ? "Atenção necessária" : "Sob controle",
      color: metrics.pendingMaintenance > 5 ? "yellow" : "primary",
      sparkline: generateSparkline(metrics.pendingMaintenance),
    },
    {
      title: "Alertas",
      value: metrics.criticalAlerts,
      icon: <AlertTriangle className="h-5 w-5" />,
      trend: metrics.criticalAlerts > 0 ? "down" as const : "up" as const,
      trendValue: metrics.criticalAlerts > 0 ? `${metrics.criticalAlerts} ativos` : "Nenhum alerta",
      color: metrics.criticalAlerts > 0 ? "red" : "green",
      sparkline: generateSparkline(metrics.criticalAlerts),
    },
    {
      title: "Compliance",
      value: metrics.complianceRate,
      suffix: "%",
      icon: <Shield className="h-5 w-5" />,
      trend: metrics.complianceRate >= 90 ? "up" as const : "down" as const,
      trendValue: metrics.complianceRate >= 90 ? "Excelente" : "Requer atenção",
      color: metrics.complianceRate >= 90 ? "green" : "yellow",
      sparkline: generateSparkline(metrics.complianceRate),
    },
  ], [metrics]);

  if (metrics.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Indicadores em Tempo Real</h3>
          <LivePulse status="syncing" size="sm" label="Carregando..." />
        </div>
        <ContextualSkeleton type="kpi" count={5} className="lg:grid-cols-5" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Indicadores em Tempo Real</h3>
        <LivePulse status="live" size="sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.08} isLoading={false} />
        ))}
      </div>
    </div>
  );
});

LiveDashboardStats.displayName = "LiveDashboardStats";

export default LiveDashboardStats;
