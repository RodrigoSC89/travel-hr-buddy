
/**
 * Página de Validação do Editor de Templates
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import TemplateValidationReport from "@/modules/document-hub/templates/validation/TemplateValidationReport";

export default function TemplateValidationPage() {
  return (
    <ModulePageWrapper gradient="blue">
      <TemplateValidationReport />
    </ModulePageWrapper>
  );
}
