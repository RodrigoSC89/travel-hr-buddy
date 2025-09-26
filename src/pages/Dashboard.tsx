import React from 'react';
import { WelcomeCard } from '@/components/dashboard/welcome-card';
import { GlobalDashboard } from '@/components/dashboard/global-dashboard';
import { OrganizationManagementToolbar } from '@/components/admin/organization-management-toolbar';
import { OrganizationLayout } from '@/components/layout/organization-layout';

export default function Dashboard() {
  return (
    <OrganizationLayout showBackButton={false} requiresOrganization={false}>
      <div className="space-y-6">
        <WelcomeCard />
        <OrganizationManagementToolbar />
        <GlobalDashboard />
      </div>
    </OrganizationLayout>
  );
}