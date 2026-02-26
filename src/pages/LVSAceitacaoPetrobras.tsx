/**
 * LVS Aceitação RSV Petrobras - Vessel Acceptance Checklist
 * Baseado na ET-3000.00-1500-91C-PLL-017 e especificações técnicas Petrobras
 * Padrão PEO-DP/PEOTRAM: Folders → Subfolders → LV Items → Evidências → IA
 * Com persistência Supabase e sessões de aceitação
 */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartEvidenceOrganizer } from "@/components/compliance/smart-evidence-organizer";
import { ComplianceInterviewSimulator } from "@/components/compliance/ai/ComplianceInterviewSimulator";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Ship, Shield, Brain, ClipboardCheck, FolderTree,
  Target, TrendingUp, FileSearch, ClipboardList,
  MessageSquare, Calendar, Zap, Archive, Gauge, Flame, FileText, BellRing
} from "lucide-react";
import { LVSAcceptanceDashboard } from "@/components/lvs-aceitacao/LVSAcceptanceDashboard";
import { LVSDocumentAnalyzer } from "@/components/lvs-aceitacao/LVSDocumentAnalyzer";
import { LVSActionPlanGenerator } from "@/components/lvs-aceitacao/LVSActionPlanGenerator";
import { LVSReadinessTimeline } from "@/components/lvs-aceitacao/LVSReadinessTimeline";
import { LVSSessionManager } from "@/components/lvs-aceitacao/LVSSessionManager";
import { LVSSmartGapCloser } from "@/components/lvs-aceitacao/LVSSmartGapCloser";
import { LVSAutoEvidenceBuilder } from "@/components/lvs-aceitacao/LVSAutoEvidenceBuilder";
import { LVSPetrobrasInspectionSimulator } from "@/components/lvs-aceitacao/LVSPetrobrasInspectionSimulator";
import { LVSBulkActionsProgress } from "@/components/lvs-aceitacao/LVSBulkActionsProgress";
import { LVSComplianceScorePredictor } from "@/components/lvs-aceitacao/LVSComplianceScorePredictor";
import { LVSRiskHeatmap } from "@/components/lvs-aceitacao/LVSRiskHeatmap";
import { LVSAuditPackGenerator } from "@/components/lvs-aceitacao/LVSAuditPackGenerator";
import { LVSNotificationCenter } from "@/components/lvs-aceitacao/LVSNotificationCenter";
import { useLVSPersistence } from "@/components/lvs-aceitacao/useLVSPersistence";

const LVSAceitacaoPetrobras = () => {
  const persistence = useLVSPersistence();

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

      {/* Session Manager */}
      <LVSSessionManager
        sessions={persistence.sessions}
        activeSession={persistence.activeSession}
        onCreateSession={persistence.createSession}
        onLoadSession={persistence.loadSession}
        isLoading={persistence.isLoading}
      />

      <Tabs defaultValue="checklist" className="w-full mt-4">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="checklist" className="gap-1.5"><FolderTree className="h-3.5 w-3.5" /> Checklist LVS</TabsTrigger>
          <TabsTrigger value="gap-closer" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Smart Gap Closer</TabsTrigger>
          <TabsTrigger value="evidence-builder" className="gap-1.5"><Archive className="h-3.5 w-3.5" /> Evidence Builder</TabsTrigger>
          <TabsTrigger value="readiness" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Readiness Timeline</TabsTrigger>
          <TabsTrigger value="document-analyzer" className="gap-1.5"><FileSearch className="h-3.5 w-3.5" /> Analisador de Documentos</TabsTrigger>
          <TabsTrigger value="action-plan" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Plano de Ação IA</TabsTrigger>
          <TabsTrigger value="inspection-sim" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Simulador Inspeção</TabsTrigger>
          <TabsTrigger value="bulk-actions" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Bulk Actions</TabsTrigger>
          <TabsTrigger value="score-predictor" className="gap-1.5"><Gauge className="h-3.5 w-3.5" /> Score Preditivo</TabsTrigger>
          <TabsTrigger value="risk-heatmap" className="gap-1.5"><Flame className="h-3.5 w-3.5" /> Risk Heatmap</TabsTrigger>
          <TabsTrigger value="audit-pack" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Audit Pack</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><BellRing className="h-3.5 w-3.5" /> Notificações</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Entrevista IA</TabsTrigger>
          <TabsTrigger value="evidence-organizer" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <LVSAcceptanceDashboard
            sections={persistence.sections}
            setSections={persistence.setSections}
            onSaveItemStatus={persistence.activeSession ? persistence.saveItemStatus : undefined}
          />
        </TabsContent>

        <TabsContent value="gap-closer">
          <LVSSmartGapCloser />
        </TabsContent>

        <TabsContent value="evidence-builder">
          <LVSAutoEvidenceBuilder />
        </TabsContent>

        <TabsContent value="readiness">
          <LVSReadinessTimeline />
        </TabsContent>

        <TabsContent value="document-analyzer">
          <LVSDocumentAnalyzer onSaveAnalysis={persistence.activeSession ? persistence.saveDocumentAnalysis : undefined} />
        </TabsContent>

        <TabsContent value="action-plan">
          <LVSActionPlanGenerator onSavePlan={persistence.activeSession ? persistence.saveActionPlan : undefined} />
        </TabsContent>

        <TabsContent value="inspection-sim">
          <LVSPetrobrasInspectionSimulator />
        </TabsContent>

        <TabsContent value="bulk-actions">
          <LVSBulkActionsProgress />
        </TabsContent>

        <TabsContent value="score-predictor">
          <LVSComplianceScorePredictor />
        </TabsContent>

        <TabsContent value="risk-heatmap">
          <LVSRiskHeatmap />
        </TabsContent>

        <TabsContent value="audit-pack">
          <LVSAuditPackGenerator />
        </TabsContent>

        <TabsContent value="notifications">
          <LVSNotificationCenter />
        </TabsContent>

        <TabsContent value="interview">
          <ComplianceInterviewSimulator
            moduleId="lvs_petrobras"
            moduleName="LVS Aceitação RSV Petrobras"
            standardContext="ET-3000.00-1500-91C-PLL-017: Lista de Verificação para Aceitação de Embarcação RSV (Remote Support Vessel) para contratos Petrobras. Cobre ROV, equipamentos de convés, habitabilidade, TI, segurança e navegação. Normas: NORMAM, SOLAS, MARPOL, STCW, MLC 2006."
          />
        </TabsContent>

        <TabsContent value="evidence-organizer">
          <SmartEvidenceOrganizer framework={"ism_isps"} />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default LVSAceitacaoPetrobras;
