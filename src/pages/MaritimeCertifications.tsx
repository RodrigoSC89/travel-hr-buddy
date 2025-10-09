import React from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { MaritimeCertificationManager } from "@/components/maritime/maritime-certification-manager";

export default function MaritimeCertifications() {
  return (
    <OrganizationLayout title="Certificações Marítimas">
      <MaritimeCertificationManager />
    </OrganizationLayout>
  );
}