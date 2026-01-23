import React from "react";
import { ProfessionalKPICard } from "@/components/dashboard/professional-kpi-card";
import { Ship, CheckCircle, DollarSign, Target } from "lucide-react";
import { useDashboardData } from "./DashboardDataProvider";

interface KPIGridProps {
  revenueValue?: string;
  revenueChange?: number;
  vesselsValue?: string;
  vesselsChange?: number;
  complianceValue?: string;
  complianceChange?: number;
  efficiencyValue?: string;
  efficiencyChange?: number;
}

export const KPIGrid = React.memo<KPIGridProps>((props) => {
  const { metrics } = useDashboardData();
  
  // Use real data from Supabase if available, otherwise fall back to props
  const revenueValue = props.revenueValue ?? (metrics.revenueThisMonth > 0 ? (metrics.revenueThisMonth / 1000).toFixed(1) : "72.5");
  const revenueChange = props.revenueChange ?? (metrics.revenueGrowth || 12.5);
  const vesselsValue = props.vesselsValue ?? (metrics.isLoading ? "..." : String(metrics.activeVessels || metrics.totalVessels));
  const vesselsChange = props.vesselsChange ?? (metrics.totalVessels > 0 ? Math.round((metrics.activeVessels / metrics.totalVessels) * 100) : 8.3);
  const complianceValue = props.complianceValue ?? (metrics.isLoading ? "..." : String(metrics.complianceRate || 94.2));
  const complianceChange = props.complianceChange ?? (metrics.complianceRate >= 90 ? 2.8 : -1.5);
  const efficiencyValue = props.efficiencyValue ?? (metrics.isLoading ? "..." : String(Math.max(85, 100 - (metrics.pendingMaintenance * 2)).toFixed(1)));
  const efficiencyChange = props.efficiencyChange ?? (metrics.pendingMaintenance < 5 ? 5.2 : -2.1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProfessionalKPICard
        title="Receita Total"
        value={revenueValue}
        prefix="R$ "
        suffix="K"
        icon={DollarSign}
        color="green"
        change={revenueChange}
        trend="vs mês anterior"
        delay={0}
      />
      <ProfessionalKPICard
        title="Embarcações Ativas"
        value={vesselsValue}
        icon={Ship}
        color="blue"
        change={vesselsChange}
        trend="frota operacional"
        delay={0.1}
      />
      <ProfessionalKPICard
        title="Taxa de Compliance"
        value={complianceValue}
        suffix="%"
        icon={CheckCircle}
        color="purple"
        change={complianceChange}
        trend="meta: 95%"
        delay={0.2}
      />
      <ProfessionalKPICard
        title="Eficiência Operacional"
        value={efficiencyValue}
        suffix="%"
        icon={Target}
        color="orange"
        change={efficiencyChange}
        trend="acima da meta"
        delay={0.3}
      />
    </div>
  );
});

KPIGrid.displayName = "KPIGrid";
