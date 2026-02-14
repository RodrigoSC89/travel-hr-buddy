import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { CreateSGSOIncidentDialog } from "@/components/sgso/CreateSGSOIncidentDialog";
import { toast } from "sonner";
import {
  Shield, AlertTriangle, FileCheck, Bell, Target, Users, BookOpen, Activity, Plus, RefreshCw, Download, Eye, Search, Brain, ClipboardCheck, CheckCircle2, GitCompare, Calendar
} from "lucide-react";

const ComplianceSGIAutoEvidence = lazy(() => import('@/components/compliance/ai/ComplianceSGIAutoEvidence').then(m => ({ default: m.ComplianceSGIAutoEvidence })));
const ComplianceGapAnalyzer = lazy(() => import('@/components/compliance/ai/ComplianceGapAnalyzer').then(m => ({ default: m.ComplianceGapAnalyzer })));
const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceOneClickAuditPrep = lazy(() => import('@/components/compliance/ai/ComplianceOneClickAuditPrep').then(m => ({ default: m.ComplianceOneClickAuditPrep })));
const ComplianceRegulatoryChangeTracker = lazy(() => import('@/components/compliance/ai/ComplianceRegulatoryChangeTracker').then(m => ({ default: m.ComplianceRegulatoryChangeTracker })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));
const ComplianceDocCrossReference = lazy(() => import('@/components/compliance/ai/ComplianceDocCrossReference').then(m => ({ default: m.ComplianceDocCrossReference })));
const ComplianceTimeline = lazy(() => import('@/components/compliance/ai/ComplianceTimeline').then(m => ({ default: m.ComplianceTimeline })));
const ComplianceScoreBenchmark = lazy(() => import('@/components/compliance/ai/ComplianceScoreBenchmark').then(m => ({ default: m.ComplianceScoreBenchmark })));
const ComplianceAutoNCResolver = lazy(() => import('@/components/compliance/ai/ComplianceAutoNCResolver').then(m => ({ default: m.ComplianceAutoNCResolver })));
const CompliancePhotoEvidenceAI = lazy(() => import('@/components/compliance/ai/CompliancePhotoEvidenceAI').then(m => ({ default: m.CompliancePhotoEvidenceAI })));
const CompliancePSCRiskPredictor = lazy(() => import('@/components/compliance/ai/CompliancePSCRiskPredictor').then(m => ({ default: m.CompliancePSCRiskPredictor })));

const AILoader = () => <div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

const SGSO_CHECKLIST_ITEMS = [
  "Política de SGSO documentada e assinada",
  "Identificação de perigos e avaliação de riscos",
  "Objetivos, metas e programas definidos",
  "Estrutura e responsabilidades documentadas",
  "Competência e treinamento registrados",
  "Documentação do manual SGSO atualizada",
  "Controle operacional e procedimentos padronizados",
  "Gerenciamento de mudanças implementado",
  "Planejamento e resposta a emergências",
  "Monitoramento e medição de indicadores",
  "Investigação de incidentes e ações corretivas",
  "Não conformidades tratadas e verificadas",
  "Controle de registros organizado",
  "Programa de auditoria interna implementado",
  "Análise crítica pela direção realizada",
  "Programa de melhoria contínua ativo",
  "Canais de comunicação definidos e efetivos",
];

const SGSO = () => {
  const { handleGenerateReport, handleExport, handleRefresh } = useMaritimeActions();
  const navigate = useNavigate();
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);

  const handleViewPractices = () => {
    const practicesTab = document.querySelector('[value="practices"]') as HTMLElement;
    if (practicesTab) { practicesTab.click(); toast.success("17 Práticas ANP", { description: "Navegando para gestão das práticas" }); }
    else { const el = document.getElementById('sgso-practices'); if (el) el.scrollIntoView({ behavior: 'smooth' }); toast.success("17 Práticas ANP"); }
  };
  const handleViewRiskMatrix = () => { const t = document.querySelector('[value="risks"]') as HTMLElement; if (t) { t.click(); toast.success("Matriz de Riscos"); } };
  const handleViewIncidents = () => { const t = document.querySelector('[value="incidents"]') as HTMLElement; if (t) { t.click(); toast.success("Gestão de Incidentes"); } };
  const handleViewAudits = () => { const t = document.querySelector('[value="audits"]') as HTMLElement; if (t) { t.click(); toast.success("Auditorias"); } };
  const handleViewTraining = () => { const t = document.querySelector('[value="training"]') as HTMLElement; if (t) { t.click(); toast.success("Treinamentos"); } };
  const handleANPReports = () => handleGenerateReport("Relatórios ANP");
  const handlePDFReport = () => navigate("/sgso/report");
  const handleNewIncident = () => setIncidentDialogOpen(true);

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="SGSO - Sistema de Gestão de Segurança Operacional"
        description="Compliance ANP Resolução 43/2007 - 17 Práticas Obrigatórias"
        gradient="red"
        badges={[
          { icon: FileCheck, label: "Compliance ANP" },
          { icon: Target, label: "17 Práticas" },
          { icon: Shield, label: "Segurança Total" },
          { icon: Brain, label: "AI Suite" }
        ]}
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-4">
          <TabsTrigger value="dashboard" className="gap-2"><Activity className="h-4 w-4" />Dashboard SGSO</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2"><Shield className="h-4 w-4" />Monitor Conformidade</TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-1"><Search className="h-3 w-3" />SGI Evidence</TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-1"><AlertTriangle className="h-3 w-3" />Gap Analyzer</TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-1"><Brain className="h-3 w-3" />Interview Sim</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1"><ClipboardCheck className="h-3 w-3" />Audit Prep</TabsTrigger>
          <TabsTrigger value="reg-tracker" className="gap-1"><BookOpen className="h-3 w-3" />Reg. Tracker</TabsTrigger>
          <TabsTrigger value="checklist-gen" className="gap-1"><CheckCircle2 className="h-3 w-3" />Checklist Gen</TabsTrigger>
          <TabsTrigger value="doc-crossref" className="gap-1"><GitCompare className="h-3 w-3" />Doc Cross-Ref</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1"><Calendar className="h-3 w-3" />Timeline</TabsTrigger>
          <TabsTrigger value="score-benchmark" className="gap-1"><Target className="h-3 w-3" />Benchmarking</TabsTrigger>
          <TabsTrigger value="nc-resolver" className="gap-1"><AlertTriangle className="h-3 w-3" />NC Resolver</TabsTrigger>
          <TabsTrigger value="photo-ai" className="gap-1"><Eye className="h-3 w-3" />Foto IA</TabsTrigger>
          <TabsTrigger value="psc-risk" className="gap-1"><Shield className="h-3 w-3" />Risco PSC</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div id="sgso-practices"><SgsoDashboard /></div>
        </TabsContent>
        <TabsContent value="compliance">
          <ProactiveComplianceMonitor />
        </TabsContent>

        {/* AI Disruptive Suite */}
        <TabsContent value="sgi-evidence">
          <Suspense fallback={<AILoader />}><ComplianceSGIAutoEvidence moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="gap-analyzer">
          <Suspense fallback={<AILoader />}><ComplianceGapAnalyzer moduleId="sgso" moduleName="SGSO ANP" standards={["ANP Resolução 43/2007", "SGSO 17 Práticas", "ISO 45001", "OHSAS 18001"]} /></Suspense>
        </TabsContent>
        <TabsContent value="interview-sim">
          <Suspense fallback={<AILoader />}><ComplianceInterviewSimulator moduleId="sgso" moduleName="SGSO ANP" standardContext="SGSO ANP Resolução 43/2007 cobrindo as 17 práticas obrigatórias: Política, Riscos, Objetivos, Estrutura, Competência, Documentação, Controle Operacional, Mudanças, Emergências, Monitoramento, Incidentes, NCs, Registros, Auditoria, Análise Crítica, Melhoria Contínua e Comunicação" /></Suspense>
        </TabsContent>
        <TabsContent value="audit-prep">
          <Suspense fallback={<AILoader />}><ComplianceOneClickAuditPrep moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="reg-tracker">
          <Suspense fallback={<AILoader />}><ComplianceRegulatoryChangeTracker moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="checklist-gen">
          <Suspense fallback={<AILoader />}><ComplianceAutoChecklistGenerator moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="doc-crossref">
          <Suspense fallback={<AILoader />}><ComplianceDocCrossReference moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="timeline">
          <Suspense fallback={<AILoader />}><ComplianceTimeline moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="score-benchmark">
          <Suspense fallback={<AILoader />}><ComplianceScoreBenchmark moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="nc-resolver">
          <Suspense fallback={<AILoader />}><ComplianceAutoNCResolver moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="photo-ai">
          <Suspense fallback={<AILoader />}><CompliancePhotoEvidenceAI moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
        <TabsContent value="psc-risk">
          <Suspense fallback={<AILoader />}><CompliancePSCRiskPredictor moduleId="sgso" moduleName="SGSO ANP" /></Suspense>
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="sgso"
        moduleName="SGSO"
        actions={[
          { id: "practices", label: "17 Práticas ANP", icon: <Shield className="h-3 w-3" />, action: handleViewPractices },
          { id: "risks", label: "Matriz de Riscos", icon: <AlertTriangle className="h-3 w-3" />, action: handleViewRiskMatrix },
          { id: "incidents", label: "Gestão Incidentes", icon: <Bell className="h-3 w-3" />, action: handleViewIncidents },
          { id: "audits", label: "Auditorias", icon: <FileCheck className="h-3 w-3" />, action: handleViewAudits },
          { id: "training", label: "Treinamentos", icon: <Users className="h-3 w-3" />, action: handleViewTraining },
          { id: "reports", label: "Relatórios ANP", icon: <BookOpen className="h-3 w-3" />, action: handleANPReports },
          { id: "pdf-report", label: "Relatório PDF", icon: <FileCheck className="h-3 w-3" />, action: handlePDFReport, variant: "default" }
        ]}
        quickActions={[
          { id: "new-incident", label: "Novo Incidente", icon: <Plus className="h-3 w-3" />, action: handleNewIncident },
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("SGSO"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("SGSO") }
        ]}
      />

      <CreateSGSOIncidentDialog
        open={incidentDialogOpen}
        onOpenChange={setIncidentDialogOpen}
        onSuccess={() => toast.success("Dashboard atualizado")}
      />
    </ModulePageWrapper>
  );
};

export default SGSO;
