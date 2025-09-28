import React from 'react';
import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard';
import { OrganizationLayout } from '@/components/layout/organization-layout';

export default function Dashboard() {
  return (
    <OrganizationLayout showBackButton={false} requiresOrganization={false}>
      <EnhancedDashboard />
    </OrganizationLayout>
  );
}