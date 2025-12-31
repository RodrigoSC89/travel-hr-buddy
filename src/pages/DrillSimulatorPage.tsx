/**
 * Drill Simulator Page - Emergency scenario simulations
 */
import React from "react";
import { Target, AlertTriangle, Users, Award } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

const DrillSimulator = safeLazyImport(
  () => import("@/components/safety/DrillSimulator").then(m => ({ default: m.DrillSimulator })),
  "Drill Simulator"
);

const DrillSimulatorPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Target}
        title="Simulador de Drill"
        description="Simule cenários de emergência: Incêndio, Abandono, MOB, Vazamento"
        gradient="orange"
        badges={[
          { icon: AlertTriangle, label: "Emergências" },
          { icon: Users, label: "Tripulação" },
          { icon: Award, label: "Avaliação" }
        ]}
      />
      <DrillSimulator />
    </ModulePageWrapper>
  );
};

export default DrillSimulatorPage;
