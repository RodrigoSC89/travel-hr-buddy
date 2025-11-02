import React from "react";
import { ProfessionalKPICard } from "@/components/dashboard/professional-kpi-card";
import { Ship, CheckCircle, DollarSign, Target } from "lucide-react";

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

export const KPIGrid = React.memo<KPIGridProps>(({
  revenueValue = "72.5",
  revenueChange = 12.5,
  vesselsValue = "24",
  vesselsChange = 8.3,
  complianceValue = "94.2",
  complianceChange = 2.8,
  efficiencyValue = "89.7",
  efficiencyChange = 5.2,
}) => {
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
