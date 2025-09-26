import React from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { AdvancedFleetAnalytics } from '@/components/analytics/advanced-fleet-analytics';

export default function AdvancedAnalytics() {
  return (
    <OrganizationLayout title="Analytics Avançado">
      <AdvancedFleetAnalytics />
    </OrganizationLayout>
  );
}