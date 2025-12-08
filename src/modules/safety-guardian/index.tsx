/**
 * Safety Guardian Module - Complete
 * Sistema completo de segurança com IA preditiva e generativa
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SafetyDashboardComplete } from "./components/SafetyDashboardComplete";
import {
  Shield,
  AlertTriangle,
  BarChart3,
  Brain,
  GraduationCap,
} from "lucide-react";

const SafetyGuardianModule: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="Safety Guardian"
        description="Sistema Integrado de Segurança com IA Preditiva e Treinamento"
        gradient="orange"
        badges={[
          { icon: AlertTriangle, label: "Incidentes" },
          { icon: Brain, label: "IA Preditiva" },
          { icon: BarChart3, label: "TRIR/LTI" },
          { icon: GraduationCap, label: "Treinamento" },
        ]}
      />
      <SafetyDashboardComplete />
    </ModulePageWrapper>
  );
};

export default SafetyGuardianModule;
