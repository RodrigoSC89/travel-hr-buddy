import React from 'react';
import { MaritimeDashboard } from '@/components/maritime/maritime-dashboard';
import { OrganizationLayout } from '@/components/layout/organization-layout';

export default function Maritime() {
  return (
    <OrganizationLayout title="Sistema Marítimo">
      <MaritimeDashboard />
    </OrganizationLayout>
  );
}