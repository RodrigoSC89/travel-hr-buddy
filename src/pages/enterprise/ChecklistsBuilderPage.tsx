/**
 * Checklists Builder - World-Class Version
 * Redirects to the unified WorldClass Checklist System
 */
import React from "react";
import { WorldClassChecklistSystem } from "@/components/maritime-checklists/WorldClassChecklistSystem";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { CheckSquare, Sparkles, Shield, Wrench } from "lucide-react";

export default function ChecklistsBuilderPage() {
  return (
    <ModulePageWrapper gradient="blue" data-testid="checklists-builder-page">
      <ModuleHeader
        icon={CheckSquare}
        title="Construtor de Checklists"
        description="Criação e gestão avançada de checklists operacionais marítimos com IA"
        gradient="blue"
        badges={[
          { icon: Sparkles, label: "IA" },
          { icon: Shield, label: "Templates" },
          { icon: Wrench, label: "Builder" }
        ]}
      />
      <WorldClassChecklistSystem />
    </ModulePageWrapper>
  );
}
