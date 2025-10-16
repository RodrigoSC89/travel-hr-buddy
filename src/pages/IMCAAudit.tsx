import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import IMCAAuditGenerator from "@/components/imca-audit/imca-audit-generator";
import {
  FileText,
  Shield,
  Brain,
  CheckSquare
} from "lucide-react";

const IMCAAudit = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileText}
        title="Auditoria Técnica IMCA DP"
        description="Geração de auditorias técnicas de Posicionamento Dinâmico com IA"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMCA, IMO, MTS" },
          { icon: Brain, label: "AI-Powered" },
          { icon: CheckSquare, label: "12 Módulos DP" }
        ]}
      />
      <IMCAAuditGenerator />
    </ModulePageWrapper>
  );
};

export default IMCAAudit;
