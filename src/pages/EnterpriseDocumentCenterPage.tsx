/**
 * Enterprise Document Center Page
 * Central repository for manuals, procedures, checklists, forms
 * Superior to SoftExpert, Fluig, Unisea, TMmaster with AI integration
 */

import React from "react";
import { EnterpriseDocumentCenter } from "@/components/documents/enterprise-document-center";

export default function EnterpriseDocumentCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📁 Central de Documentos Enterprise</h1>
        <p className="text-muted-foreground">
          Gestão completa de manuais, procedimentos, checklists, formulários e documentos corporativos com IA integrada
        </p>
      </div>
      <EnterpriseDocumentCenter />
    </div>
  );
}
