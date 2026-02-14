/**
 * PEOTRAM Page - Programa de Excelência Operacional (13 Elementos ANP)
 * Full module with per-item checklists, AI evidence generation, voice assistant, predictive AI
 */
import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { ComplianceVoiceChat } from "@/components/compliance/ComplianceVoiceChat";
import { CompliancePredictiveAI } from "@/components/compliance/CompliancePredictiveAI";
import { ComplianceEvidenceGenerator } from "@/components/compliance/ComplianceEvidenceGenerator";
import { PeotramElementSelector } from "@/components/peotram/PeotramElementSelector";
import { PeotramElementChecklist } from "@/components/peotram/PeotramElementChecklist";
import { PeotramAutoEvidenceEngine } from "@/components/peotram/PeotramAutoEvidenceEngine";
import { PeotramSmartScoring } from "@/components/peotram/PeotramSmartScoring";
import { PeotramNCAutoGenerator } from "@/components/peotram/PeotramNCAutoGenerator";
import { PeotramReportGenerator } from "@/components/peotram/PeotramReportGenerator";
import { PeotramAuditWizard } from "@/components/peotram/PeotramAuditWizard";
import { PEOTRAM_ELEMENTS } from "@/data/peotram-elements-data";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
import {
  Shield, Target, FileCheck, AlertTriangle, TrendingUp, CheckCircle,
  Plus, RefreshCw, Download, BarChart3, Activity, ClipboardCheck,
  Anchor, Flame, Siren, Brain, Zap, Mic, Sparkles, Wand2, FileText,
} from "lucide-react";

const PEOTRAMPage = () => {
  const { handleExport, handleRefresh, handleGenerateReport } = useMaritimeActions();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  const [vesselName, setVesselName] = useState("");
  const [auditorName, setAuditorName] = useState("");

  // Fetch data
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["peotram-audits"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("*")
        .or("audit_type.ilike.%peotram%,scope.ilike.%peotram%,audit_type.ilike.%anp%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ["peotram-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("*")
        .or("source.ilike.%peotram%,source.ilike.%anp%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ["peotram-actions"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("action_items")
        .select("*")
        .ilike("source_module", "%peotram%")
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    },
    staleTime: 30000,
  });

  // Computed stats
  const totalItems = useMemo(() => PEOTRAM_ELEMENTS.reduce((acc, el) => acc + el.subelements.reduce((a, s) => a + s.items.length, 0), 0), []);
  const criticalElements = PEOTRAM_ELEMENTS.filter(e => e.isCritical);
  const openNCs = nonConformities.filter((nc: any) => nc.status === "open").length;
  const completedAudits = audits.filter((a: any) => a.status === "completed" || a.status === "closed").length;
  const pendingActions = actionItems.filter((a: any) => a.status !== "completed" && a.status !== "closed").length;

  const selectedElement = selectedElementId ? PEOTRAM_ELEMENTS.find(e => e.id === selectedElementId) : null;

  const handleRefreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["peotram-audits"] });
    await queryClient.invalidateQueries({ queryKey: ["peotram-ncs"] });
    await queryClient.invalidateQueries({ queryKey: ["peotram-actions"] });
    toast.success("Dados PEOTRAM atualizados");
  };

  const evidenceElements = PEOTRAM_ELEMENTS.map(e => ({ id: e.id, name: `${e.sigla} - ${e.name}` }));

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="PEOTRAM - Programa de Excelência Operacional"
        description="13 Elementos ANP/Petrobras • Checklist Completo com IA Integrada"
        gradient="red"
        badges={[
          { icon: Target, label: `${totalItems} Itens` },
          { icon: Shield, label: `${criticalElements.length} Críticos` },
          { icon: Brain, label: "IA Integrada" },
          { icon: FileCheck, label: "Evidências Auto" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" /> Checklist
          </TabsTrigger>
          <TabsTrigger value="smart-scoring" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" /> Scoring IA
          </TabsTrigger>
          <TabsTrigger value="auto-evidence" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Evidências Auto
          </TabsTrigger>
          <TabsTrigger value="nc-generator" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Gerador NCs
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Relatório
          </TabsTrigger>
          <TabsTrigger value="audit-wizard" className="gap-1.5">
            <Wand2 className="h-3.5 w-3.5" /> Wizard Prep
          </TabsTrigger>
          <TabsTrigger value="ai-voice" className="gap-1.5">
            <Mic className="h-3.5 w-3.5" /> Voz IA
          </TabsTrigger>
          <TabsTrigger value="ai-predictive" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Preditiva
          </TabsTrigger>
          <TabsTrigger value="ncs" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> NCs
          </TabsTrigger>
          <TabsTrigger value="monitor" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Monitor
          </TabsTrigger>
        </TabsList>

        {/* ============ OVERVIEW ============ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="md:col-span-2 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Itens PEOTRAM</p>
                    <span className="text-4xl font-bold text-warning">{totalItems}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      em 13 elementos • {criticalElements.length} elementos críticos
                    </p>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/30" />
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="214 214" className="text-warning" />
                    </svg>
                    <Anchor className="absolute inset-0 m-auto h-7 w-7 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1"><FileCheck className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Auditorias</p></div>
                <p className="text-2xl font-bold">{audits.length}</p>
                <p className="text-xs text-muted-foreground">{completedAudits} concluídas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">NCs Abertas</p></div>
                <p className="text-2xl font-bold text-destructive">{openNCs}</p>
                <p className="text-xs text-muted-foreground">{nonConformities.length} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1"><Target className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Ações</p></div>
                <p className="text-2xl font-bold">{pendingActions}</p>
                <p className="text-xs text-muted-foreground">pendentes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-warning" />13 Elementos PEOTRAM</CardTitle>
              <CardDescription>Clique para abrir o checklist detalhado de cada elemento</CardDescription>
            </CardHeader>
            <CardContent>
              <PeotramElementSelector elements={PEOTRAM_ELEMENTS} selectedElementId={null} onSelectElement={(id) => { setSelectedElementId(id); setActiveTab("checklist"); }} />
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Elementos Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalElements.map(el => (
                  <div key={el.id} className="flex items-center gap-3 p-3 border border-destructive/20 rounded-lg hover:bg-destructive/5 cursor-pointer transition-colors" onClick={() => { setSelectedElementId(el.id); setActiveTab("checklist"); }}>
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">{el.id}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{el.name}</p>
                      <p className="text-xs text-muted-foreground">{el.subelements.reduce((a, s) => a + s.items.length, 0)} itens • Peso: {el.weightPercentage}%</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ CHECKLIST ============ */}
        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Embarcação</Label><Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome da embarcação" className="h-8 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Auditor</Label><Input value={auditorName} onChange={e => setAuditorName(e.target.value)} placeholder="Nome do auditor" className="h-8 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Data da Auditoria</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="h-8 text-sm" /></div>
              </div>
            </CardContent>
          </Card>
          <PeotramElementSelector elements={PEOTRAM_ELEMENTS} selectedElementId={selectedElementId} onSelectElement={setSelectedElementId} />
          {selectedElement ? (
            <PeotramElementChecklist element={selectedElement} vesselName={vesselName} auditorName={auditorName} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Selecione um Elemento</p>
                <p className="text-sm mt-1">Clique em um dos 13 elementos acima para abrir o checklist completo</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============ SMART SCORING ============ */}
        <TabsContent value="smart-scoring" className="space-y-4">
          <PeotramSmartScoring />
        </TabsContent>

        {/* ============ AUTO EVIDENCE ============ */}
        <TabsContent value="auto-evidence" className="space-y-4">
          <PeotramAutoEvidenceEngine />
        </TabsContent>

        {/* ============ NC GENERATOR ============ */}
        <TabsContent value="nc-generator" className="space-y-4">
          <PeotramNCAutoGenerator />
        </TabsContent>

        {/* ============ REPORT GENERATOR ============ */}
        <TabsContent value="report" className="space-y-4">
          <PeotramReportGenerator />
        </TabsContent>

        {/* ============ AUDIT WIZARD ============ */}
        <TabsContent value="audit-wizard" className="space-y-4">
          <PeotramAuditWizard />
        </TabsContent>

        {/* ============ NCs ============ */}
        <TabsContent value="ncs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Não Conformidades PEOTRAM</CardTitle>
            </CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40 text-success" />
                  <p>Nenhuma NC PEOTRAM registrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nonConformities.map((nc: any) => (
                    <div key={nc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{nc.title || nc.nc_number}</p>
                        <p className="text-sm text-muted-foreground">{nc.description?.substring(0, 120)}</p>
                      </div>
                      <Badge variant={nc.status === "open" ? "destructive" : "default"}>{nc.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ AI VOICE ============ */}
        <TabsContent value="ai-voice" className="space-y-4">
          <ComplianceVoiceChat
            moduleId="peotram" moduleName="PEOTRAM"
            moduleDescription="Assistente de voz IA para auditoria PEOTRAM - 13 Elementos ANP/Petrobras"
            systemContext={`PEOTRAM é o Programa de Excelência Operacional em Transporte Marítimo da Petrobras com 13 elementos:
1-LGR (Liderança), 2-CL (Conformidade Legal), 3-GR (Gestão de Riscos), 4-OP (Operação - CRÍTICO),
5-ST (Saúde e Segurança do Trabalho), 6-MN (Manutenção - CRÍTICO), 7-GM (Gestão de Mudanças),
8-AQ (Aquisição), 9-RH (Recursos Humanos), 10-GI (Gestão de Informação), 11-PE (Planejamento de Emergências - CRÍTICO),
12-AI (Análise de Incidentes - CRÍTICO), 13-MC (Melhoria Contínua).
Sistema de notas 0-4. Classificações NC: A (Crítica/10 dias), B (Grave/15 dias), C (Moderada/30 dias), D (Leve/60 dias).`}
            suggestedQuestions={[
              "Quais são os elementos críticos do PEOTRAM?",
              "Como pontuar um item nota 3 vs nota 4?",
              "Quais NCs mais comuns no Elemento 4 (Operação)?",
              "Me ajude a preparar evidências para o Elemento 6 (Manutenção)",
            ]}
          />
        </TabsContent>

        {/* ============ AI PREDICTIVE ============ */}
        <TabsContent value="ai-predictive" className="space-y-4">
          <CompliancePredictiveAI
            moduleId="peotram" moduleName="PEOTRAM"
            moduleContext="Programa de Excelência Operacional em Transporte Marítimo (13 Elementos ANP/Petrobras)."
            riskAreas={[
              { name: "Liderança (LGR)", score: 95, trend: "up" },
              { name: "Operação (OP)", score: 78, trend: "down" },
              { name: "Manutenção (MN)", score: 82, trend: "stable" },
              { name: "Emergências (PE)", score: 85, trend: "stable" },
            ]}
          />
        </TabsContent>

        {/* ============ MONITOR ============ */}
        <TabsContent value="monitor" className="space-y-4">
          <ProactiveComplianceMonitor />
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="peotram" moduleName="PEOTRAM"
        actions={[
          { id: "checklist", label: "Checklist", icon: <ClipboardCheck className="h-3 w-3" />, action: () => setActiveTab("checklist") },
          { id: "smart-scoring", label: "Scoring IA", icon: <Brain className="h-3 w-3" />, action: () => setActiveTab("smart-scoring") },
          { id: "auto-evidence", label: "Evidências Auto", icon: <Zap className="h-3 w-3" />, action: () => setActiveTab("auto-evidence") },
          { id: "nc-generator", label: "Gerador NCs", icon: <AlertTriangle className="h-3 w-3" />, action: () => setActiveTab("nc-generator") },
          { id: "report", label: "Relatório", icon: <FileText className="h-3 w-3" />, action: () => setActiveTab("report") },
          { id: "audit-wizard", label: "Wizard Prep", icon: <Wand2 className="h-3 w-3" />, action: () => setActiveTab("audit-wizard") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: handleRefreshAll, shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("PEOTRAM") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEOTRAMPage;
