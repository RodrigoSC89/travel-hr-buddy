import React from "react";
import { EnhancedNotificationCenter } from "@/components/notifications/enhanced-notification-center";
import { OrganizationLayout } from "@/components/layout/organization-layout";

export default function NotificationCenterPage() {
  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <EnhancedNotificationCenter />
      </div>
    </OrganizationLayout>
  );
}