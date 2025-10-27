import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const Templates = () => {
  return (
    <ModulePageWrapper gradient="green">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Document Templates</h1>
        <p className="text-muted-foreground">Template editor coming soon...</p>
      </div>
    </ModulePageWrapper>
  );
};

export default Templates;