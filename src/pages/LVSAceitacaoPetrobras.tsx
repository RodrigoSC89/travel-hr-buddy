/**
 * LVS Aceitação RSV Petrobras - Vessel Acceptance Checklist
 * Baseado na ET-3000.00-1500-91C-PLL-017 e especificações técnicas Petrobras
 * Padrão PEO-DP/PEOTRAM: Folders → Subfolders → LV Items → Evidências → IA
 */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartEvidenceOrganizer } from "@/components/compliance/smart-evidence-organizer";
import { ComplianceInterviewSimulator } from "@/components/compliance/ai/ComplianceInterviewSimulator";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Ship, Shield, Brain, ClipboardCheck, FolderTree,
  Target, TrendingUp, Sparkles, FileSearch, ClipboardList,
  MessageSquare, Calendar
} from "lucide-react";
import { LVSAcceptanceDashboard } from "@/components/lvs-aceitacao/LVSAcceptanceDashboard";
import { LVSDocumentAnalyzer } from "@/components/lvs-aceitacao/LVSDocumentAnalyzer";
import { LVSActionPlanGenerator } from "@/components/lvs-aceitacao/LVSActionPlanGenerator";
import { LVSReadinessTimeline } from "@/components/lvs-aceitacao/LVSReadinessTimeline";

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
          <TabsTrigger value="readiness" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Readiness Timeline</TabsTrigger>
          <TabsTrigger value="document-analyzer" className="gap-1.5"><FileSearch className="h-3.5 w-3.5" /> Analisador de Documentos</TabsTrigger>
          <TabsTrigger value="action-plan" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Plano de Ação IA</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Simulador de Entrevista</TabsTrigger>
          <TabsTrigger value="evidence-organizer" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Organizador de Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <LVSAcceptanceDashboard />
        </TabsContent>

        <TabsContent value="readiness">
          <LVSReadinessTimeline />
        </TabsContent>

        <TabsContent value="document-analyzer">
          <LVSDocumentAnalyzer />
        </TabsContent>

        <TabsContent value="action-plan">
          <LVSActionPlanGenerator />
        </TabsContent>

        <TabsContent value="interview">
          <ComplianceInterviewSimulator
            moduleId="lvs_petrobras"
            moduleName="LVS Aceitação RSV Petrobras"
            standardContext="ET-3000.00-1500-91C-PLL-017: Lista de Verificação para Aceitação de Embarcação RSV (Remote Support Vessel) para contratos Petrobras. Cobre ROV, equipamentos de convés, habitabilidade, TI, segurança e navegação. Normas: NORMAM, SOLAS, MARPOL, STCW, MLC 2006."
          />
        </TabsContent>

        <TabsContent value="evidence-organizer">
          <SmartEvidenceOrganizer framework={"lvs_petrobras" as any} />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default LVSAceitacaoPetrobras;
