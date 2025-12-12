import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface ModuleStatus {
  id: string;
  name: string;
  status: "operational" | "warning" | "critical" | "offline";
  health: number;
  lastUpdate: string;
  alerts: number;
}

interface KPIDashboardProps {
  modules: ModuleStatus[];
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ modules }) => {
  const operationalCount = modules.filter(m => m.status === "operational").length;
  const warningCount = modules.filter(m => m.status === "warning").length;
  const criticalCount = modules.filter(m => m.status === "critical").length;
  const averageHealth = Math.round(modules.reduce((sum, m) => sum + m.health, 0) / modules.length);
  const totalAlerts = modules.reduce((sum, m) => sum + m.alerts, 0);

  const kpis = [
    {
      label: "Operational Modules",
      value: `${operationalCount}/${modules.length}`,
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Average Health",
      value: `${averageHealth}%`,
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Active Alerts",
      value: totalAlerts.toString(),
      icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "System Uptime",
      value: "99.8%",
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">{kpi.label}</p>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                {kpi.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
