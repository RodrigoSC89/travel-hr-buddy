import React from "react";
import { Trophy, Star, Award, Target } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

// Lazy loading do sistema de gamificação com safeLazyImport
const GamificationSystem = safeLazyImport(
  () => import("@/components/innovation/gamification-system").then(module => ({ default: module.GamificationSystem })),
  "Gamification System"
);

const Gamification: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Trophy}
        title="Sistema de Gamificação"
        description="Conquistas, rankings e recompensas para aumentar o engajamento da equipe"
        gradient="orange"
        badges={[
          { icon: Star, label: "247 Usuários Ativos" },
          { icon: Award, label: "8 Conquistas" },
          { icon: Target, label: "Engajamento" }
        ]}
      />
      
      <GamificationSystem />
    </ModulePageWrapper>
  );
};

export default Gamification;