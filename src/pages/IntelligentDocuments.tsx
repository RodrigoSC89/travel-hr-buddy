import React from "react";
import IntelligentDocumentManager from "@/components/documents/intelligent-document-manager";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const IntelligentDocumentsPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <IntelligentDocumentManager />
    </ModulePageWrapper>
  );
};

export default IntelligentDocumentsPage;
