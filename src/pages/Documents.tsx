/**
 * PATCH 421 - Unified Document Management Hub
 * Consolidates documents/ and document-hub/ into single /documents route
 */

import React from "react";
import DocumentHub from "@/modules/document-hub";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText, Upload, Search, Shield, Brain } from "lucide-react";

const DocumentsPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={FileText}
        title="Document Management Hub"
        description="PATCH 421 - Unified document management with AI integration, templates, and storage"
        gradient="purple"
        badges={[
          { icon: Upload, label: "Upload & Storage" },
          { icon: Brain, label: "AI Analysis" },
          { icon: Search, label: "Smart Search" },
          { icon: Shield, label: "Secure" }
        ]}
      />
      <DocumentHub />
    </ModulePageWrapper>
  );
};

export default DocumentsPage;