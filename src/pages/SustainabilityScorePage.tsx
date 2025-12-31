/**
 * Sustainability Score Page - ESG consolidated scoring
 */
import React from "react";
import { Leaf, TrendingUp, Award, BarChart3 } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

const SustainabilityScore = safeLazyImport(
  () => import("@/components/esg/SustainabilityScore").then(m => ({ default: m.SustainabilityScore })),
  "Sustainability Score"
);

const SustainabilityScorePage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Leaf}
        title="Sustainability Score"
        description="Score ESG consolidado (0-100) com ranking de embarcações"
        gradient="green"
        badges={[
          { icon: TrendingUp, label: "Score 87/100" },
          { icon: Award, label: "Ranking" },
          { icon: BarChart3, label: "Benchmarking" }
        ]}
      />
      <SustainabilityScore />
    </ModulePageWrapper>
  );
};

export default SustainabilityScorePage;
