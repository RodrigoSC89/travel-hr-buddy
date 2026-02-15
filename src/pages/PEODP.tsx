import React, { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { PeoDpManager } from "@/components/peo-dp/peo-dp-manager";
import { ASOGStatusBoard } from "@/components/peo-dp/ASOGStatusBoard";
import { PeoDPFMEAAnalysis } from "@/components/peo-dp/PeoDPFMEAAnalysis";
import { PeoDPTrialsManager } from "@/components/peo-dp/PeoDPTrialsManager";
import { PeoDPKPIDashboard } from "@/components/peo-dp/PeoDPKPIDashboard";
import { PeoDPAuditPrep } from "@/components/peo-dp/PeoDPAuditPrep";
import { PeoDPDocumentsManager } from "@/components/peo-dp/PeoDPDocumentsManager";
import { PeoDPCalculatorPCLVC } from "@/components/peo-dp/PeoDPCalculatorPCLVC";
import { PeoDPAdherenceForm } from "@/components/peo-dp/PeoDPAdherenceForm";
import { PeoDPManualGapAnalysis } from "@/components/peo-dp/PeoDPManualGapAnalysis";
import { PeoDPFMEAGapAssessment } from "@/components/peo-dp/PeoDPFMEAGapAssessment";
import { PeoDPEmergencyDrills } from "@/components/peo-dp/PeoDPEmergencyDrills";
import { DPOCompetenceTracker } from "@/components/peo-dp/DPOCompetenceTracker";
import { PeoDPSmartGapCloser } from "@/components/peo-dp/PeoDPSmartGapCloser";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Anchor, Target, Brain, TrendingUp,
  CheckCircle, RefreshCw, Download, Settings, Activity,
  BarChart3, ClipboardCheck, AlertTriangle, FileText, Calculator, BookOpen, Zap
} from "lucide-react";

const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));

const LoadingFallback = () => <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;

const PEODP = () => {
  const { handleRefresh, handleExport } = useMaritimeActions();

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="PEO-DP — Plano de Excelência Operacional DP"
        description="Dynamic Positioning • 7 Pilares • 54+ Requisitos • IMCA M 190 & Petrobras 2026"
        gradient="indigo"
        badges={[
          { icon: Brain, label: "IA & Validação" },
          { icon: Shield, label: "Compliance IMCA" },
          { icon: Target, label: "7 Pilares" },
          { icon: TrendingUp, label: "KPIs & IEODP" }
        ]}
      />

      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="plan" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Plano DP</TabsTrigger>
          <TabsTrigger value="kpis" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> IEODP & KPIs</TabsTrigger>
          <TabsTrigger value="adherence" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Aderência J-4</TabsTrigger>
          <TabsTrigger value="manual-gap" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> GAP Manual K-1</TabsTrigger>
          <TabsTrigger value="fmea" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> FMECA</TabsTrigger>
          <TabsTrigger value="fmea-gap" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> GAP FMEA N-1</TabsTrigger>
          <TabsTrigger value="trials" className="gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> DP Trials</TabsTrigger>
          <TabsTrigger value="drills" className="gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Emergência O-1</TabsTrigger>
          <TabsTrigger value="asog" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> ASOG</TabsTrigger>
          <TabsTrigger value="pclvc" className="gap-1.5"><Calculator className="h-3.5 w-3.5" /> PCLVC</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Docs I-4</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Audit Prep</TabsTrigger>
          <TabsTrigger value="dpo-competence" className="gap-1.5"><Target className="h-3.5 w-3.5" /> DPO Competence</TabsTrigger>
          <TabsTrigger value="gap-closer" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Gap Closer</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Simulador</TabsTrigger>
          <TabsTrigger value="checklist-ia" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Checklist IA</TabsTrigger>
        </TabsList>

        <TabsContent value="plan"><div id="peo-dp-plan"><PeoDpManager /></div></TabsContent>
        <TabsContent value="kpis"><PeoDPKPIDashboard /></TabsContent>
        <TabsContent value="adherence"><PeoDPAdherenceForm /></TabsContent>
        <TabsContent value="manual-gap"><PeoDPManualGapAnalysis /></TabsContent>
        <TabsContent value="fmea"><PeoDPFMEAAnalysis /></TabsContent>
        <TabsContent value="fmea-gap"><PeoDPFMEAGapAssessment /></TabsContent>
        <TabsContent value="trials"><PeoDPTrialsManager /></TabsContent>
        <TabsContent value="drills"><PeoDPEmergencyDrills /></TabsContent>
        <TabsContent value="asog"><ASOGStatusBoard /></TabsContent>
        <TabsContent value="pclvc"><PeoDPCalculatorPCLVC /></TabsContent>
        <TabsContent value="docs"><PeoDPDocumentsManager /></TabsContent>
        <TabsContent value="audit-prep"><PeoDPAuditPrep /></TabsContent>
        <TabsContent value="dpo-competence"><DPOCompetenceTracker /></TabsContent>
        <TabsContent value="gap-closer"><PeoDPSmartGapCloser /></TabsContent>
        <Suspense fallback={<LoadingFallback />}>
          <TabsContent value="interview">
            <ComplianceInterviewSimulator
              moduleId="peo-dp" moduleName="PEO-DP"
              standardContext="PEO-DP Petrobras 2026 audit simulation. 7 pillars covering Management, Competence, Procedures, Training, Operations, Maintenance, and DP Tests. Focus on IEODP indicators, FMEA/FMECA compliance, ASOG/CAM procedures, DP trials records, DPO qualifications per IMCA M 117, emergency drill scenarios (Anexo O-1), and adherence form (Anexo J-4)."
            />
          </TabsContent>
          <TabsContent value="checklist-ia">
            <ComplianceAutoChecklistGenerator moduleId="peo-dp" moduleName="PEO-DP" />
          </TabsContent>
        </Suspense>
      </Tabs>

      <ModuleActionButton
        moduleId="peo-dp" moduleName="PEO-DP"
        actions={[
          { id: "plan", label: "Plano DP", icon: <Target className="h-3 w-3" />, action: () => {} },
          { id: "kpis", label: "IEODP", icon: <BarChart3 className="h-3 w-3" />, action: () => {} },
          { id: "fmea", label: "FMECA", icon: <Settings className="h-3 w-3" />, action: () => {} },
          { id: "trials", label: "Trials", icon: <CheckCircle className="h-3 w-3" />, action: () => {} },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("PEO-DP"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("PEO-DP") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEODP;
