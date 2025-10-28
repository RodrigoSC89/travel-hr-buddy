import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Navigation } from "lucide-react";
import NavigationCopilotValidation from "@/modules/navigation-copilot/validation/NavigationCopilotValidation";

export default function NavigationCopilotValidationPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={Navigation}
          title="Navigation Copilot - Validação"
          description="PATCH 400 - Assistente de navegação inteligente com IA"
          gradient="purple"
        />
        <NavigationCopilotValidation />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
