import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";
import {
  Brain,
  Shield,
  FileText,
  TrendingUp
} from "lucide-react";

const DPIntelligence = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Brain}
        title="Centro de Inteligência DP"
        description="Base de conhecimento de incidentes DP com análise por IA"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMCA Compliance" },
          { icon: FileText, label: "Relatórios Técnicos" },
          { icon: TrendingUp, label: "Análise IA" }
        ]}
      />
      <DPIntelligenceCenter />
    </ModulePageWrapper>
  );
};

export default DPIntelligence;
