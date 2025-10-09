import React from "react";
import StrategicDashboard from "@/components/dashboard/strategic-dashboard";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { BarChart3, TrendingUp, Activity, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={BarChart3}
        title="Dashboard Estratégico"
        description="Visão completa de KPIs, métricas e insights estratégicos do sistema"
        gradient="blue"
        badges={[
          { icon: TrendingUp, label: "Analytics em Tempo Real" },
          { icon: Activity, label: "Métricas Avançadas" },
          { icon: Zap, label: "Insights IA" }
        ]}
      />
      <StrategicDashboard />
    </ModulePageWrapper>
  );
}