import React from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { IntelligentAlertSystem } from "@/components/intelligence/intelligent-alert-system";

export default function IntelligentAlerts() {
  return (
    <OrganizationLayout title="Alertas Inteligentes">
      <IntelligentAlertSystem />
    </OrganizationLayout>
  );
}