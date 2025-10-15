import React from "react";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { BarChart3 } from "lucide-react";
import { DashboardJobs } from "@/components/bi";

export default function BIJobsPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper>
        <ModuleHeader
          icon={BarChart3}
          title="BI - Jobs por Componente"
          description="Análise de jobs finalizados por componente com tempo médio de conclusão"
        />
        
        <div className="p-6">
          <DashboardJobs />
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
