import React from "react";
import PredictiveAnalytics from "@/components/innovation/predictive-analytics";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Brain, TrendingUp, Target, Sparkles } from "lucide-react";

const PredictiveAnalyticsPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Análise Preditiva"
        description="Previsões avançadas e insights estratégicos com machine learning"
        gradient="purple"
        badges={[
          { icon: Sparkles, label: "Machine Learning" },
          { icon: TrendingUp, label: "247 Predições" },
          { icon: Target, label: "Precisão Avançada" }
        ]}
      />
      <PredictiveAnalytics />
    </ModulePageWrapper>
  );
};

export default PredictiveAnalyticsPage;