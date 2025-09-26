import React from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { VesselManagement } from '@/components/fleet/vessel-management';

export default function FleetManagement() {
  return (
    <OrganizationLayout title="Gestão de Frota">
      <VesselManagement />
    </OrganizationLayout>
  );
}