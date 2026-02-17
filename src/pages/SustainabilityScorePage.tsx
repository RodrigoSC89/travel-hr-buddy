import React from "react";
import { Leaf, TrendingUp, Award, BarChart3 } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const SustainabilityScore = safeLazyImport(
  () => import("@/components/esg/SustainabilityScore").then(m => ({ default: m.SustainabilityScore })),
  "Sustainability Score"
);

const SustainabilityScorePage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="green">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div variants={fadeUp}>
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
        </motion.div>
        <motion.div variants={fadeUp}>
          <SustainabilityScore />
        </motion.div>
      </motion.div>
    </ModulePageWrapper>
  );
};

export default SustainabilityScorePage;