import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Target } from "lucide-react";
import MissionControlValidation from "@/modules/mission-control/validation/MissionControlValidation";

export default function MissionControlValidationPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="orange">
        <ModuleHeader
          icon={Target}
          title="Mission Control - Validação"
          description="Verificação completa da consolidação dos módulos"
          gradient="orange"
        />
        <MissionControlValidation />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
