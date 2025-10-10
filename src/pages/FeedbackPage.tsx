import React from "react";
import { EnhancedFeedbackSystem } from "@/components/feedback/enhanced-feedback-system";
import { OrganizationLayout } from "@/components/layout/organization-layout";

export default function FeedbackPage() {
  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <EnhancedFeedbackSystem />
      </div>
    </OrganizationLayout>
  );
}
