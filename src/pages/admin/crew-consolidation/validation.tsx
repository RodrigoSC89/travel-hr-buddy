import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Users } from "lucide-react";
import { CrewConsolidationValidation } from "@/modules/crew/validation/CrewConsolidationValidation";

export default function CrewConsolidationValidationPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={Users}
          title="Crew Consolidation - Validação"
          description="PATCH 398 - Unificação Crew App + Crew Management"
          gradient="purple"
        />
        <CrewConsolidationValidation />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
