import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Shield, Users, FileCheck, Brain, Scale, Globe } from "lucide-react";
import { MLCInspectionDashboard } from "@/components/mlc/MLCInspectionDashboard";

const MLCInspection: React.FC = () => {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Shield}
        title="MLC Inspection"
        description="Maritime Labour Convention 2006 - Sistema Digital de Inspeção e Conformidade"
        gradient="green"
        badges={[
          { icon: Scale, label: "MLC 2006" },
          { icon: Globe, label: "ILO" },
          { icon: Brain, label: "IA Integrada" },
        ]}
      />
      <MLCInspectionDashboard />
    </ModulePageWrapper>
  );
};

export default MLCInspection;
