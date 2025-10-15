import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DPIntelligenceCenter } from "@/components/dp-intelligence/dp-intelligence-center";
import {
  Shield,
  TrendingUp,
  Database,
  Sparkles,
} from "lucide-react";

const DPIntelligence = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={TrendingUp}
        title="DP Intelligence Center"
        description="Centro de Inteligência de Incidentes DP com Análise por IA"
        gradient="indigo"
        badges={[
          { icon: Database, label: "IMCA Database" },
          { icon: Shield, label: "Normas IMCA/IMO/PEO-DP" },
          { icon: Sparkles, label: "Análise IA GPT-4" },
        ]}
      />

      <div className="container mx-auto p-6">
        <DPIntelligenceCenter />
      </div>
    </ModulePageWrapper>
  );
};

export default DPIntelligence;
