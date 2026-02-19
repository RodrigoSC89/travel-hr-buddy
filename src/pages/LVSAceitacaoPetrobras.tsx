/**
 * LVS Aceitação RSV Petrobras - Vessel Acceptance Checklist
 * Baseado na ET-3000.00-1500-91C-PLL-017 e especificações técnicas Petrobras
 * Padrão PEO-DP/PEOTRAM: Folders → Subfolders → LV Items → Evidências → IA
 */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartEvidenceOrganizer } from "@/components/compliance/smart-evidence-organizer";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Ship, Shield, Brain, ClipboardCheck, FolderTree,
  Target, TrendingUp, Sparkles
} from "lucide-react";
import { LVSAcceptanceDashboard } from "@/components/lvs-aceitacao/LVSAcceptanceDashboard";

const LVSAceitacaoPetrobras = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="LVS Aceitação RSV — Petrobras"
        description="Lista de Verificação de Aceitação de Embarcação • ET-3000.00-1500-91C-PLL-017 • ROV, Equipamentos, Habitabilidade, TI"
        gradient="indigo"
        badges={[
          { icon: Brain, label: "IA Assistida" },
          { icon: Shield, label: "Compliance Petrobras" },
          { icon: Target, label: "17+ Seções" },
          { icon: TrendingUp, label: "Score & Gaps" }
        ]}
      />

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="checklist" className="gap-1.5"><FolderTree className="h-3.5 w-3.5" /> Checklist LVS</TabsTrigger>
          <TabsTrigger value="evidence-organizer" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Organizador de Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <LVSAcceptanceDashboard />
        </TabsContent>

        <TabsContent value="evidence-organizer">
          <SmartEvidenceOrganizer framework={"lvs_petrobras" as any} />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default LVSAceitacaoPetrobras;
