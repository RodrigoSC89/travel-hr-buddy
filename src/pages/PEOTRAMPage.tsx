/**
 * PEOTRAM Page - Complete module with persistence, radar chart, PDF export, photo upload
 * 13 Elements ANP/Petrobras with full audit lifecycle
 */
import React, { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));
const LoadingFallback = () => <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { ComplianceVoiceChat } from "@/components/compliance/ComplianceVoiceChat";
import { CompliancePredictiveAI } from "@/components/compliance/CompliancePredictiveAI";
import { PeotramCorrelationMatrix } from "@/components/peotram/PeotramCorrelationMatrix";
import { PeotramElementSelector } from "@/components/peotram/PeotramElementSelector";
import { PeotramElementChecklist } from "@/components/peotram/PeotramElementChecklist";
import { PeotramAutoEvidenceEngine } from "@/components/peotram/PeotramAutoEvidenceEngine";
import { PeotramEvidenceTracker } from "@/components/peotram/PeotramEvidenceTracker";
import { PeotramRiskHeatMap } from "@/components/peotram/PeotramRiskHeatMap";
import { PeotramSmartScoring } from "@/components/peotram/PeotramSmartScoring";
import { PeotramNCAutoGenerator } from "@/components/peotram/PeotramNCAutoGenerator";
import { PeotramNCActionPlan } from "@/components/peotram/PeotramNCActionPlan";
import { PeotramAuditTimeline } from "@/components/peotram/PeotramAuditTimeline";
import { PeotramBenchmarking } from "@/components/peotram/PeotramBenchmarking";
import { PeotramLessonsLearned } from "@/components/peotram/PeotramLessonsLearned";
import { PeotramNCEscalation } from "@/components/peotram/PeotramNCEscalation";
import { PeotramMOCTracker } from "@/components/peotram/PeotramMOCTracker";
import { PeotramSATSystem } from "@/components/peotram/PeotramSATSystem";
import { PeotramDiverCertManager } from "@/components/peotram/PeotramDiverCertManager";
import { PeotramGasManagement } from "@/components/peotram/PeotramGasManagement";
import { PeotramReportGenerator } from "@/components/peotram/PeotramReportGenerator";
import { PeotramAuditWizard } from "@/components/peotram/PeotramAuditWizard";
import { PeotramRadarChart } from "@/components/peotram/PeotramRadarChart";
import { PeotramAuditCountdown } from "@/components/peotram/PeotramAuditCountdown";
import { PeotramAuditManager } from "@/components/peotram/PeotramAuditManager";
import { PeotramPDFExport } from "@/components/peotram/PeotramPDFExport";
import { PEOTRAM_ELEMENTS } from "@/data/peotram-elements-data";
import { usePeotramAudit } from "@/hooks/usePeotramAudit";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
import {
  Shield, Target, FileCheck, AlertTriangle, TrendingUp, CheckCircle,
  RefreshCw, Download, BarChart3, Activity, ClipboardCheck,
  Brain, Zap, Mic, Wand2, FileText, Save, History, Award, Lightbulb, GitBranch,
  Waves, Users, Fuel,
} from "lucide-react";

const PEOTRAMPage = () => {
  const { handleExport, handleRefresh } = useMaritimeActions();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);

  const {
    currentAuditId, currentAudit, audits, auditsLoading, isSaving,
    createAudit, deleteAudit, saveProgress, completeAudit, loadAudit,
    uploadPhoto, getState, updateState, calculateScores, itemStates,
  } = usePeotramAudit();

  const totalItems = useMemo(() => PEOTRAM_ELEMENTS.reduce((acc, el) => acc + el.subelements.reduce((a, s) => a + s.items.length, 0), 0), []);
  const criticalElements = PEOTRAM_ELEMENTS.filter(e => e.isCritical);
  const scores = calculateScores();
  const selectedElement = selectedElementId ? PEOTRAM_ELEMENTS.find(e => e.id === selectedElementId) : null;

  // For comparison: find previous completed audit
  const completedAudits = audits.filter(a => a.status === "completed");
  const previousAudit = completedAudits.length > 1 ? completedAudits[1] : null;

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="PEOTRAM — Programa de Excelência Operacional"
        description="13 Elementos ANP/Petrobras • Checklist com Persistência • IA Integrada"
        gradient="red"
        badges={[
          { icon: Target, label: `${totalItems} Itens` },
          { icon: Shield, label: `${criticalElements.length} Críticos` },
          { icon: Brain, label: "IA Integrada" },
          { icon: FileCheck, label: currentAudit ? `${scores.scoredItems} avaliados` : "Sem auditoria" },
        ]}
      />

      {/* Active audit bar */}
      {currentAudit && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-warning text-warning">
                  {currentAudit.status === "in_progress" ? "Em Andamento" : "Concluída"}
                </Badge>
                <span className="text-sm font-medium">{currentAudit.vessel_name}</span>
                <span className="text-xs text-muted-foreground">• {currentAudit.auditor_name} • Ciclo {currentAudit.cycle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-warning">{scores.overallScore}%</span>
                <span className="text-xs text-muted-foreground">{scores.scoredItems}/{totalItems}</span>
                <Button size="sm" variant="outline" onClick={saveProgress} disabled={isSaving} className="gap-1">
                  <Save className="h-3 w-3" /> Salvar
                </Button>
                <PeotramPDFExport
                  vesselName={currentAudit.vessel_name}
                  auditorName={currentAudit.auditor_name || ""}
                  auditDate={currentAudit.audit_date}
                  cycle={currentAudit.cycle || "2025"}
                  elementScores={scores.elementScores}
                  itemStates={itemStates}
                  overallScore={scores.overallScore}
                />
                {currentAudit.status === "in_progress" && (
                  <Button size="sm" onClick={completeAudit} className="gap-1 bg-success hover:bg-success/90">
                    <CheckCircle className="h-3 w-3" /> Finalizar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="audits" className="gap-1.5"><History className="h-3.5 w-3.5" /> Auditorias</TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Checklist</TabsTrigger>
          <TabsTrigger value="smart-scoring" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Scoring IA</TabsTrigger>
          <TabsTrigger value="auto-evidence" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Evidências</TabsTrigger>
          <TabsTrigger value="nc-generator" className="gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> NCs</TabsTrigger>
          <TabsTrigger value="nc-action-plan" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Plano Ação</TabsTrigger>
          <TabsTrigger value="evidence-tracker" className="gap-1.5"><FileCheck className="h-3.5 w-3.5" /> Evidências Tracker</TabsTrigger>
          <TabsTrigger value="risk-heatmap" className="gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Mapa Riscos</TabsTrigger>
          <TabsTrigger value="report" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Relatório</TabsTrigger>
          <TabsTrigger value="audit-wizard" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> Wizard</TabsTrigger>
          <TabsTrigger value="ai-voice" className="gap-1.5"><Mic className="h-3.5 w-3.5" /> Voz IA</TabsTrigger>
          <TabsTrigger value="ai-predictive" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Preditiva</TabsTrigger>
          <TabsTrigger value="correlation" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Correlação</TabsTrigger>
          <TabsTrigger value="countdown" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Countdown</TabsTrigger>
          <TabsTrigger value="monitor" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Monitor</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Simulador</TabsTrigger>
          <TabsTrigger value="checklist-ia" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Checklist IA</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Timeline</TabsTrigger>
          <TabsTrigger value="benchmarking" className="gap-1.5"><Award className="h-3.5 w-3.5" /> Benchmarking</TabsTrigger>
          <TabsTrigger value="lessons" className="gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Lições</TabsTrigger>
          <TabsTrigger value="nc-escalation" className="gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Escalonamento</TabsTrigger>
          <TabsTrigger value="moc" className="gap-1.5"><GitBranch className="h-3.5 w-3.5" /> MOC</TabsTrigger>
          <TabsTrigger value="sat-system" className="gap-1.5"><Waves className="h-3.5 w-3.5" /> Sistema SAT</TabsTrigger>
          <TabsTrigger value="divers" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Mergulhadores</TabsTrigger>
          <TabsTrigger value="gas" className="gap-1.5"><Fuel className="h-3.5 w-3.5" /> Gestão Gases</TabsTrigger>
        </TabsList>

        {/* ============ OVERVIEW ============ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="md:col-span-2 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <span className="text-4xl font-bold text-warning">{scores.overallScore}%</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {scores.scoredItems}/{totalItems} itens • {scores.ncCount} NCs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1"><FileCheck className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Auditorias</p></div>
                <p className="text-2xl font-bold">{audits.length}</p>
                <p className="text-xs text-muted-foreground">{completedAudits.length} concluídas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">NCs</p></div>
                <p className="text-2xl font-bold text-destructive">{scores.ncCount}</p>
                <p className="text-xs text-muted-foreground">identificadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1"><Target className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Elementos</p></div>
                <p className="text-2xl font-bold">13</p>
                <p className="text-xs text-muted-foreground">{criticalElements.length} críticos</p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <PeotramRadarChart
            elementScores={scores.elementScores}
            comparisonScores={previousAudit?.element_scores as Record<string, number> | undefined}
            comparisonLabel={previousAudit ? `Ciclo ${previousAudit.cycle || "anterior"}` : undefined}
          />

          {/* Element Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-warning" />13 Elementos PEOTRAM</CardTitle>
              <CardDescription>Clique para abrir o checklist detalhado</CardDescription>
            </CardHeader>
            <CardContent>
              <PeotramElementSelector
                elements={PEOTRAM_ELEMENTS}
                selectedElementId={null}
                onSelectElement={(id) => { setSelectedElementId(id); setActiveTab("checklist"); }}
                elementScores={scores.elementScores}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ AUDIT HISTORY ============ */}
        <TabsContent value="audits" className="space-y-4">
          <PeotramAuditManager
            audits={audits}
            currentAuditId={currentAuditId}
            isLoading={auditsLoading}
            onCreateAudit={(p) => createAudit.mutate(p)}
            onLoadAudit={loadAudit}
            onDeleteAudit={(id: string) => deleteAudit.mutate(id)}
            isCreating={createAudit.isPending}
          />
          {/* Comparison section */}
          {completedAudits.length >= 2 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Comparação entre Ciclos</CardTitle>
              </CardHeader>
              <CardContent>
                <PeotramRadarChart
                  elementScores={(completedAudits[0].element_scores || {}) as Record<string, number>}
                  comparisonScores={(completedAudits[1].element_scores || {}) as Record<string, number>}
                  currentLabel={`${completedAudits[0].vessel_name} (${completedAudits[0].cycle})`}
                  comparisonLabel={`${completedAudits[1].vessel_name} (${completedAudits[1].cycle})`}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============ CHECKLIST ============ */}
        <TabsContent value="checklist" className="space-y-4">
          {!currentAuditId ? (
            <Card className="border-dashed border-warning/30">
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhuma Auditoria Ativa</p>
                <p className="text-sm mt-1 mb-4">Crie ou carregue uma auditoria na aba "Auditorias"</p>
                <Button onClick={() => setActiveTab("audits")} className="gap-1.5">
                  <History className="h-4 w-4" /> Ir para Auditorias
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <PeotramElementSelector
                elements={PEOTRAM_ELEMENTS}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                elementScores={scores.elementScores}
              />
              {selectedElement ? (
                <PeotramElementChecklist
                  element={selectedElement}
                  vesselName={currentAudit?.vessel_name}
                  auditorName={currentAudit?.auditor_name || ""}
                  getState={getState}
                  updateState={updateState}
                  onSaveProgress={saveProgress}
                  onUploadPhoto={uploadPhoto}
                  isSaving={isSaving}
                />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Selecione um Elemento</p>
                    <p className="text-sm mt-1">Clique em um dos 13 elementos acima</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="smart-scoring">
          <PeotramSmartScoring
            vesselName={currentAudit?.vessel_name}
            itemStates={itemStates}
            onApplyScores={(applied) => {
              for (const [id, score] of Object.entries(applied)) {
                updateState(id, { score });
              }
              toast.success("Notas IA aplicadas ao checklist!");
            }}
          />
        </TabsContent>
        <TabsContent value="auto-evidence">
          <PeotramAutoEvidenceEngine
            vesselName={currentAudit?.vessel_name}
            auditorName={currentAudit?.auditor_name || ""}
            onEvidenceGenerated={(itemId, evidence) => updateState(itemId, { aiEvidence: evidence })}
          />
        </TabsContent>
        <TabsContent value="nc-generator">
          <PeotramNCAutoGenerator
            vesselName={currentAudit?.vessel_name}
            auditorName={currentAudit?.auditor_name || ""}
            itemStates={itemStates}
          />
        </TabsContent>
        <TabsContent value="nc-action-plan"><PeotramNCActionPlan /></TabsContent>
        <TabsContent value="evidence-tracker"><PeotramEvidenceTracker /></TabsContent>
        <TabsContent value="risk-heatmap"><PeotramRiskHeatMap /></TabsContent>
        <TabsContent value="report">
          <PeotramReportGenerator
            vesselName={currentAudit?.vessel_name}
            auditorName={currentAudit?.auditor_name || ""}
            auditDate={currentAudit?.audit_date}
            cycle={currentAudit?.cycle || "2025"}
            elementScores={scores.elementScores}
          />
        </TabsContent>
        <TabsContent value="audit-wizard"><PeotramAuditWizard /></TabsContent>
        
        <TabsContent value="ai-voice">
          <ComplianceVoiceChat
            moduleId="peotram" moduleName="PEOTRAM"
            moduleDescription="Assistente de voz IA para auditoria PEOTRAM - 13 Elementos ANP/Petrobras"
            systemContext={`PEOTRAM - 13 elementos: 1-LGR, 2-CL, 3-GR, 4-OP (CRÍTICO), 5-ST, 6-MN (CRÍTICO), 7-GM, 8-AQ, 9-RH, 10-GI, 11-PE (CRÍTICO), 12-AI (CRÍTICO), 13-MC. Notas 0-4. NC: A(10d), B(15d), C(30d), D(60d).`}
            suggestedQuestions={[
              "Quais são os elementos críticos do PEOTRAM?",
              "Como pontuar nota 3 vs nota 4?",
              "Quais NCs mais comuns no Elemento 4?",
              "Me ajude com evidências do Elemento 6",
            ]}
          />
        </TabsContent>

        <TabsContent value="ai-predictive">
          <CompliancePredictiveAI
            moduleId="peotram" moduleName="PEOTRAM"
            moduleContext="Programa de Excelência Operacional (13 Elementos ANP/Petrobras)"
            riskAreas={PEOTRAM_ELEMENTS.filter(e => e.isCritical).map(e => ({
              name: `${e.sigla} - ${e.name}`,
              score: scores.elementScores[String(e.id)] || 50,
              trend: (scores.elementScores[String(e.id)] || 0) >= 80 ? "up" as const : "down" as const,
            }))}
          />
        </TabsContent>

        <TabsContent value="correlation">
          <PeotramCorrelationMatrix elementScores={scores.elementScores} />
        </TabsContent>

        <TabsContent value="countdown"><PeotramAuditCountdown /></TabsContent>

        <TabsContent value="monitor"><ProactiveComplianceMonitor /></TabsContent>
        <TabsContent value="timeline"><PeotramAuditTimeline /></TabsContent>
        <TabsContent value="benchmarking"><PeotramBenchmarking /></TabsContent>
        <TabsContent value="lessons"><PeotramLessonsLearned /></TabsContent>
        <TabsContent value="nc-escalation"><PeotramNCEscalation /></TabsContent>
        <TabsContent value="moc"><PeotramMOCTracker /></TabsContent>
        <TabsContent value="sat-system"><PeotramSATSystem /></TabsContent>
        <TabsContent value="divers"><PeotramDiverCertManager /></TabsContent>
        <TabsContent value="gas"><PeotramGasManagement /></TabsContent>

        <Suspense fallback={<LoadingFallback />}>
          <TabsContent value="interview">
            <ComplianceInterviewSimulator
              moduleId="peotram" moduleName="PEOTRAM"
              standardContext="PEOTRAM 2024 audit simulation. 13 elements: 1-LGR (Liderança), 2-CL (Conformidade Legal), 3-GR (Gestão de Riscos), 4-OP (Operações - CRÍTICO), 5-ST (Saúde e Segurança), 6-MN (Meio Ambiente - CRÍTICO), 7-GM (Gestão de Mudanças), 8-AQ (Aquisição), 9-RH (Recursos Humanos), 10-GI (Gestão da Informação), 11-PE (Emergências - CRÍTICO), 12-AI (Análise de Incidentes - CRÍTICO), 13-MC (Melhoria Contínua). Scoring 0-4. NC classifications A(10d), B(15d), C(30d), D(60d). Focus on ANP/Petrobras requirements."
            />
          </TabsContent>
          <TabsContent value="checklist-ia">
            <ComplianceAutoChecklistGenerator moduleId="peotram" moduleName="PEOTRAM" />
          </TabsContent>
        </Suspense>
      </Tabs>

      <ModuleActionButton
        moduleId="peotram" moduleName="PEOTRAM"
        actions={[
          { id: "audits", label: "Auditorias", icon: <History className="h-3 w-3" />, action: () => setActiveTab("audits") },
          { id: "checklist", label: "Checklist", icon: <ClipboardCheck className="h-3 w-3" />, action: () => setActiveTab("checklist") },
          { id: "save", label: "Salvar", icon: <Save className="h-3 w-3" />, action: saveProgress },
          { id: "report", label: "Relatório", icon: <FileText className="h-3 w-3" />, action: () => setActiveTab("report") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("PEOTRAM"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("PEOTRAM") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEOTRAMPage;
