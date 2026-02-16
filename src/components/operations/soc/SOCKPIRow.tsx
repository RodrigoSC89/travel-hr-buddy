import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Ship, Users, FileCheck, Wrench, Bell, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  status?: "good" | "warning" | "critical";
}

const statusColors = {
  good: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon: Icon, status = "good" }) => (
  <Card>
    <CardContent className="pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={cn("text-2xl font-bold", statusColors[status])}>{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {change >= 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
              <span className={change >= 0 ? "text-success" : "text-destructive"}>{Math.abs(change)}%</span>
              <span className="text-muted-foreground">vs ontem</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", status === "good" ? "bg-success/10" : status === "warning" ? "bg-warning/10" : "bg-destructive/10")}>
          <Icon className={cn("h-6 w-6", statusColors[status])} />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface SOCKPIRowProps {
  vesselCount: number;
  activeCrew: number;
  complianceRate: number;
  activeAlertCount: number;
  criticalAlertCount: number;
}

export const SOCKPIRow: React.FC<SOCKPIRowProps> = ({
  vesselCount, activeCrew, complianceRate, activeAlertCount, criticalAlertCount
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <KPICard title="Embarcações Ativas" value={vesselCount} icon={Ship} status="good" change={5} />
    <KPICard title="Tripulantes Ativos" value={activeCrew} icon={Users} status="good" change={2} />
    <KPICard title="Compliance Geral" value={`${complianceRate}%`} icon={FileCheck} status={complianceRate < 80 ? "warning" : "good"} change={3} />
    <KPICard title="Manutenções Pendentes" value={12} icon={Wrench} status="warning" change={-8} />
    <KPICard title="Alertas Ativos" value={activeAlertCount} icon={Bell} status={criticalAlertCount > 0 ? "critical" : "good"} />
    <KPICard title="Uptime" value="99.9%" icon={Activity} status="good" />
  </div>
);
