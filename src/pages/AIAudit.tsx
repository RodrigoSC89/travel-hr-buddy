import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Brain, Shield, FileText, Activity } from "lucide-react";
import { AIAuditPanel } from "@/components/ai/AIAuditPanel";

const AIAuditPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Auditoria de IA"
        description="Logging completo de interações com IA para conformidade regulamentar"
        gradient="purple"
        badges={[
          { icon: Shield, label: "Conformidade" },
          { icon: Activity, label: "Métricas" },
          { icon: FileText, label: "Exportação" },
        ]}
      />
      <AIAuditPanel />
    </ModulePageWrapper>
  );
});

export default AIAuditPage;
