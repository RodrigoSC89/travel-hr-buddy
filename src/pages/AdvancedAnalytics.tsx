import React from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { AdvancedFleetAnalytics } from '@/components/analytics/advanced-fleet-analytics';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

export default function AdvancedAnalytics() {
  return (
    <ModulePageWrapper gradient="blue">
      <OrganizationLayout title="Analytics Avançado">
        <AdvancedFleetAnalytics />
      </OrganizationLayout>
    </ModulePageWrapper>
  );
}