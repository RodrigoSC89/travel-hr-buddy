import React from 'react';
import { UserManagementMultiTenant } from '@/components/admin/user-management-multi-tenant';
import { OrganizationLayout } from '@/components/layout/organization-layout';

export default function Users() {
  return (
    <OrganizationLayout title="Gestão de Usuários">
      <UserManagementMultiTenant />
    </OrganizationLayout>
  );
}