import React from 'react';
import { OrganizationCustomization } from '@/components/admin/organization-customization';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

export default function OrganizationSettings() {
  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-background">
        <OrganizationCustomization />
      </div>
    </OrganizationProvider>
  );
}