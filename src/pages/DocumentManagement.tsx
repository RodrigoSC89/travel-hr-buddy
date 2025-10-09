import React from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { DocumentManagementCenter } from "@/components/documents/document-management-center";

export default function DocumentManagementPage() {
  return (
    <OrganizationLayout title="Gestão de Documentos">
      <DocumentManagementCenter />
    </OrganizationLayout>
  );
}