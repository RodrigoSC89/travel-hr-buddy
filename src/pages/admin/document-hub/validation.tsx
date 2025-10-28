import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText } from "lucide-react";
import DocumentHubValidation from "@/modules/document-hub/validation/DocumentHubValidation";

export default function DocumentHubValidationPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={FileText}
          title="Document Hub - Validação"
          description="Verificação completa da consolidação do módulo"
          gradient="blue"
        />
        <DocumentHubValidation />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
