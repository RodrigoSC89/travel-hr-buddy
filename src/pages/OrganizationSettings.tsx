import React from "react";
import { OrganizationCustomization } from "@/components/admin/organization-customization";
import { OrganizationBrandingPreview } from "@/components/admin/organization-branding-preview";
import { OrganizationStatsCards } from "@/components/admin/organization-stats-cards";
import { OrganizationLayout } from "@/components/layout/organization-layout";

export default function OrganizationSettings() {
  return (
    <OrganizationLayout title="Configurações da Organização">
      <div className="space-y-6">
        <OrganizationStatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrganizationCustomization />
          </div>
          <div className="lg:col-span-1">
            <OrganizationBrandingPreview />
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}
