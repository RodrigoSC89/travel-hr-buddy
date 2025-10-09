import React from "react";
import AdvancedBusinessIntelligence from "@/components/business/advanced-business-intelligence";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Brain, TrendingUp, Target, Sparkles } from "lucide-react";

const BusinessIntelligencePage = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Brain}
        title="Business Intelligence"
        description="Insights de negócio, análises preditivas e dashboards executivos avançados"
        gradient="blue"
        badges={[
          { icon: Sparkles, label: "IA Preditiva" },
          { icon: TrendingUp, label: "342 Insights" },
          { icon: Target, label: "Decisões Estratégicas" }
        ]}
      />
      <AdvancedBusinessIntelligence />
    </ModulePageWrapper>
  );
};

export default BusinessIntelligencePage;