import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText, Shield, History, Users } from "lucide-react";
import { DocumentWorkflowPanel } from "@/components/documents/DocumentWorkflowPanel";

const DocumentWorkflowPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileText}
        title="Workflow de Documentos"
        description="Controle de versão, aprovação e distribuição de documentos ISM/MLC"
        gradient="blue"
        badges={[
          { icon: Shield, label: "ISM/MLC" },
          { icon: History, label: "Versionamento" },
          { icon: Users, label: "Aprovações" },
        ]}
      />
      <DocumentWorkflowPanel />
    </ModulePageWrapper>
  );
});

export default DocumentWorkflowPage;
