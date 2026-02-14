/**
 * Smart Checklists Module - World-Class Version
 * Surpasses Checklist Fácil with 150+ features
 */

import React from "react";
import { WorldClassChecklistSystem } from "@/components/maritime-checklists/WorldClassChecklistSystem";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { CheckSquare, Sparkles, Shield, Wifi } from "lucide-react";

export default function SmartChecklistsPage() {
  return (
    <ModulePageWrapper gradient="blue" data-testid="checklists-page">
      <ModuleHeader
        icon={CheckSquare}
        title="Checklists World-Class"
        description="Sistema que supera Checklist Fácil — IA, Kanban, planos de ação, offline e analytics avançados"
        gradient="blue"
        badges={[
          { icon: Sparkles, label: "IA Generativa" },
          { icon: Shield, label: "Compliance" },
          { icon: Wifi, label: "Offline-First" }
        ]}
      />
      <WorldClassChecklistSystem />
    </ModulePageWrapper>
  );
}
