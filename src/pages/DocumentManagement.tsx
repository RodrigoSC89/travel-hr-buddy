import React from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { DocumentManagement } from '@/components/documents/document-management';

export default function DocumentManagementPage() {
  return (
    <OrganizationLayout title="Gestão de Documentos">
      <DocumentManagement />
    </OrganizationLayout>
  );
}