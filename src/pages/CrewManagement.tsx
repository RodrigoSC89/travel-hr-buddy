import React from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { CrewManagementDashboard } from '@/components/maritime/crew-management-dashboard';

export default function CrewManagement() {
  return (
    <OrganizationLayout title="Gestão de Tripulação">
      <CrewManagementDashboard />
    </OrganizationLayout>
  );
}