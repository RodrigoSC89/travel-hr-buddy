import React from "react";
import { SuperAdminDashboard } from "@/components/admin/super-admin-dashboard";
import { OrganizationLayout } from "@/components/layout/organization-layout";

export default function SuperAdmin() {
  return (
    <OrganizationLayout 
      title="Super Administração" 
      requiresOrganization={false}
    >
      <SuperAdminDashboard />
    </OrganizationLayout>
  );
}