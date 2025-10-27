import React from "react";
import { DocumentTemplateEditor } from "@/components/templates/document-template-editor";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const Templates = () => {
  return (
    <ModulePageWrapper gradient="green">
      <DocumentTemplateEditor />
    </ModulePageWrapper>
  );
};

export default Templates;