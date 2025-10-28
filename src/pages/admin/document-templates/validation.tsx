import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText } from "lucide-react";
import DocumentTemplatesValidation from "@/modules/document-hub/templates/validation/DocumentTemplatesValidation";

export default function DocumentTemplatesValidationPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="green">
        <ModuleHeader
          icon={FileText}
          title="Document Templates - Validação"
          description="PATCH 397 - Sistema de templates de documentos"
          gradient="green"
        />
        <DocumentTemplatesValidation />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
