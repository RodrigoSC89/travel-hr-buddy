import React from 'react';
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

export default function SuperAdmin() {
  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-background">
        <SuperAdminDashboard />
      </div>
    </OrganizationProvider>
  );
}