import React from "react";
import SystemOverview from "@/components/dashboard/system-overview";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { BarChart3 } from "lucide-react";

const SystemOverviewPage = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={BarChart3}
        title="Visão Geral do Sistema"
        description="Monitoramento completo de todos os componentes do Nautilus One"
        gradient="blue"
      />
      <SystemOverview />
    </ModulePageWrapper>
  );
};

export default SystemOverviewPage;