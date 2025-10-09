import React from "react";
import AdvancedSystemMonitor from "@/components/monitoring/advanced-system-monitor";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Activity, Server, AlertTriangle, TrendingUp } from "lucide-react";

const AdvancedSystemMonitorPage = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Activity}
        title="Monitor Avançado"
        description="Monitoramento avançado de sistema com análise profunda e relatórios em tempo real"
        gradient="blue"
        badges={[
          { icon: Server, label: "Infraestrutura" },
          { icon: AlertTriangle, label: "Alertas Inteligentes" },
          { icon: TrendingUp, label: "Performance" },
        ]}
      />
      <AdvancedSystemMonitor />
    </ModulePageWrapper>
  );
};

export default AdvancedSystemMonitorPage;
