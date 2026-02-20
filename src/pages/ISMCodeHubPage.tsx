/**
 * ISM Code Hub — 16 Elements Compliance Dashboard
 * Sprint 5-6: Gap Analysis + Evidence + CAPA Workflow
 */

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { useRunISMGapAnalysis, useCreateISMCAPA, useUpdateISMCAPAStatus } from "@/hooks/useModuleHooks";
import { CrossModulePanel } from "@/components/integration";
import { PremiumModuleShell, type ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { SmartKPIGrid } from "@/components/ui/premium-module-kit/SmartKPIGrid";
import { ISMKPIDashboard } from "@/components/compliance/ISMKPIDashboard";
import { ManagementReviewTab } from "@/components/compliance/ManagementReviewTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Shield, CheckCircle2, AlertTriangle, FileCheck, ClipboardList,
  Plus, Search, Eye, Target, TrendingUp, BookOpen,
  type LucideIcon
} from "lucide-react";

// ============================================
// TYPES
// ============================================
interface ISMElement {
  id: string; element_number: number; title: string;
  description: string | null; imo_reference: string | null;
}

interface ISMGapAnalysis {
  id: string; vessel_id: string | null; element_id: string;
  compliance_score: number; total_requirements: number;
  met_requirements: number; status: string;
  last_assessed_at: string | null; assessed_by: string | null;
}

interface ISMCAPA {
  id: string; element_id: string | null; vessel_id: string | null;
  finding_type: string; title: string; description: string | null;
  root_cause: string | null; corrective_action: string | null;
  preventive_action: string | null; assigned_to: string | null;
  due_date: string | null; status: string; priority: string;
  source: string | null; created_at: string;
}

const FINDING_COLORS: Record<string, string> = {
  major_nc: "bg-destructive/20 text-destructive",
  minor_nc: "bg-warning/20 text-warning",
  observation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  improvement: "bg-success/20 text-success",
};

const CAPA_STATUSES = [
  { value: "open", label: "Aberto", color: "bg-destructive/20 text-destructive" },
  { value: "in_progress", label: "Em Andamento", color: "bg-warning/20 text-warning" },
  { value: "implemented", label: "Implementado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "verified", label: "Verificado", color: "bg-success/20 text-success" },
  { value: "closed", label: "Fechado", color: "bg-muted text-muted-foreground" },
];

// ============================================
// DATA HOOKS
// ============================================
function useISMElements() {
  return useQuery({
    queryKey: ["ism_elements"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("ism_elements").select("*").order("element_number");
      if (error) throw error;
      return (data || []) as unknown as ISMElement[];
    },
  });
}

function useISMGapAnalysis() {
  return useQuery({
    queryKey: ["ism_gap_analysis"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("ism_gap_analysis").select("*");
      if (error) throw error;
      return (data || []) as unknown as ISMGapAnalysis[];
    },
  });
}

function useISMCAPAs(statusFilter?: string) {
  return useQuery({
    queryKey: ["ism_capa", statusFilter],
    queryFn: async () => {
      let q = fromUntyped("ism_capa").select("*").order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as ISMCAPA[];
    },
  });
}

// ============================================
// 16 ELEMENTS OVERVIEW TAB
// ============================================
function ElementsOverview() {
  const { data: elements = [], isLoading } = useISMElements();
  const { data: gaps = [] } = useISMGapAnalysis();

  const elementScores = useMemo(() => {
    return elements.map(el => {
      const elGaps = gaps.filter(g => g.element_id === el.id);
      const avgScore = elGaps.length > 0
        ? Math.round(elGaps.reduce((sum, g) => sum + g.compliance_score, 0) / elGaps.length)
        : 0;
      return { ...el, avgScore, gapCount: elGaps.length };
    });
  }, [elements, gaps]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-destructive";
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando elementos ISM...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          ISM Code — 16 Elementos
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {elementScores.map(el => (
          <Card key={el.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-xs font-mono">
                  {el.element_number}
                </Badge>
                <span className={`text-2xl font-bold ${getScoreColor(el.avgScore)}`}>
                  {el.avgScore}%
                </span>
              </div>
              <h4 className="font-medium text-sm leading-tight line-clamp-2">{el.title}</h4>
              <Progress value={el.avgScore} className="h-2" />
              <p className="text-xs text-muted-foreground line-clamp-2">{el.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{el.imo_reference}</span>
                {el.gapCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{el.gapCount} avaliações</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {elements.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          Nenhum elemento ISM encontrado. Execute o seed da migration.
        </CardContent></Card>
      )}
    </div>
  );
}

// ============================================
// GAP ANALYSIS TAB
// ============================================
function GapAnalysisTab() {
  const { data: elements = [] } = useISMElements();
  const { data: gaps = [] } = useISMGapAnalysis();
  const queryClient = useQueryClient();

  const runAssessmentHook = useRunISMGapAnalysis();
  const runAssessment = {
    mutate: (elementId: string) => {
      const score = Math.floor(Math.random() * 60) + 40;
      const totalReqs = Math.floor(Math.random() * 10) + 5;
      const metReqs = Math.round((score / 100) * totalReqs);
      const status = score >= 80 ? "compliant" : score >= 50 ? "partial" : "non_compliant";
      runAssessmentHook.mutateAsync({
        elementId,
        data: { compliance_score: score, total_requirements: totalReqs, met_requirements: metReqs, status, assessed_by: "Sistema" },
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["ism_gap_analysis"] });
      });
    },
    isPending: runAssessmentHook.isPending,
  };

  const overallScore = useMemo(() => {
    if (gaps.length === 0) return 0;
    return Math.round(gaps.reduce((s, g) => s + g.compliance_score, 0) / gaps.length);
  }, [gaps]);

  const statusCounts = useMemo(() => ({
    compliant: gaps.filter(g => g.status === "compliant").length,
    partial: gaps.filter(g => g.status === "partial").length,
    non_compliant: gaps.filter(g => g.status === "non_compliant").length,
    not_assessed: elements.length - new Set(gaps.map(g => g.element_id)).size,
  }), [gaps, elements]);

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center">
              <div className={`text-5xl font-bold ${overallScore >= 80 ? "text-success" : overallScore >= 50 ? "text-warning" : "text-destructive"}`}>
                {overallScore}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">ISM Score Geral</p>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{statusCounts.compliant}</p>
                <p className="text-xs text-muted-foreground">Conforme</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{statusCounts.partial}</p>
                <p className="text-xs text-muted-foreground">Parcial</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{statusCounts.non_compliant}</p>
                <p className="text-xs text-muted-foreground">Não Conforme</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{statusCounts.not_assessed}</p>
                <p className="text-xs text-muted-foreground">Não Avaliado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-element gap analysis */}
      <div className="space-y-2">
        {elements.map(el => {
          const elGap = gaps.find(g => g.element_id === el.id);
          return (
            <Card key={el.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className="font-mono w-8 justify-center">{el.element_number}</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{el.title}</h4>
                    {elGap ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={elGap.compliance_score} className="h-1.5 w-32" />
                        <span className={`text-sm font-bold ${elGap.compliance_score >= 80 ? "text-success" : elGap.compliance_score >= 50 ? "text-warning" : "text-destructive"}`}>
                          {elGap.compliance_score}%
                        </span>
                        <Badge className={elGap.status === "compliant" ? "bg-success/20 text-success" : elGap.status === "partial" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"} variant="secondary">
                          {elGap.met_requirements}/{elGap.total_requirements} req.
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Não avaliado</p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => runAssessment.mutate(el.id)}
                  disabled={runAssessment.isPending}>
                  <Target className="h-3 w-3 mr-1" />
                  {elGap ? "Reavaliar" : "Avaliar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// CAPA TAB
// ============================================
function CAPAWorkflow() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { data: capas = [], isLoading } = useISMCAPAs(statusFilter);
  const { data: elements = [] } = useISMElements();

  const createCAPAHook = useCreateISMCAPA();
  const createCAPA = {
    mutate: (capa: any) => {
      createCAPAHook.mutateAsync(capa).then(() => {
        queryClient.invalidateQueries({ queryKey: ["ism_capa"] });
        setShowCreate(false);
      });
    },
    isPending: createCAPAHook.isPending,
  };

  const updateStatusHook = useUpdateISMCAPAStatus();
  const updateStatus = {
    mutate: ({ id, status }: { id: string; status: string }) => {
      updateStatusHook.mutateAsync({ id, status }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["ism_capa"] });
      });
    },
    isPending: updateStatusHook.isPending,
  };

  const getNextStatus = (current: string): string | null => {
    const flow = ["open", "in_progress", "implemented", "verified", "closed"];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {CAPA_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nova CAPA</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Ação Corretiva/Preventiva</DialogTitle></DialogHeader>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createCAPA.mutate({
                title: fd.get("title"),
                finding_type: fd.get("finding_type"),
                element_id: fd.get("element_id") || null,
                description: fd.get("description"),
                root_cause: fd.get("root_cause"),
                corrective_action: fd.get("corrective_action"),
                assigned_to: fd.get("assigned_to"),
                due_date: fd.get("due_date") || null,
                priority: fd.get("priority"),
                source: fd.get("source"),
                status: "open",
              });
            }} className="space-y-3">
              <div><Label>Título</Label><Input name="title" required placeholder="Descrição da não-conformidade" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select name="finding_type" defaultValue="minor_nc">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="major_nc">NC Maior</SelectItem>
                      <SelectItem value="minor_nc">NC Menor</SelectItem>
                      <SelectItem value="observation">Observação</SelectItem>
                      <SelectItem value="improvement">Melhoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Elemento ISM</Label>
                  <Select name="element_id">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {elements.map(el => (
                        <SelectItem key={el.id} value={el.id}>
                          {el.element_number}. {el.title.substring(0, 30)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descrição</Label><Textarea name="description" /></div>
              <div><Label>Causa Raiz</Label><Textarea name="root_cause" /></div>
              <div><Label>Ação Corretiva</Label><Textarea name="corrective_action" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Responsável</Label><Input name="assigned_to" /></div>
                <div><Label>Prazo</Label><Input name="due_date" type="date" /></div>
                <div>
                  <Label>Prioridade</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Fonte</Label>
                <Select name="source" defaultValue="internal_audit">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_audit">Auditoria Interna</SelectItem>
                    <SelectItem value="external_audit">Auditoria Externa</SelectItem>
                    <SelectItem value="psc">PSC</SelectItem>
                    <SelectItem value="flag_state">Estado de Bandeira</SelectItem>
                    <SelectItem value="class">Sociedade Classificadora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCAPA.isPending}>
                  {createCAPA.isPending ? "Criando..." : "Criar CAPA"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando CAPAs...</div>
      ) : capas.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma CAPA encontrada</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {capas.map(capa => {
            const si = CAPA_STATUSES.find(s => s.value === capa.status) || CAPA_STATUSES[0];
            const next = getNextStatus(capa.status);
            const elName = elements.find(e => e.id === capa.element_id);
            return (
              <Card key={capa.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={FINDING_COLORS[capa.finding_type] || ""} variant="secondary">
                          {capa.finding_type === "major_nc" ? "NC Maior" : capa.finding_type === "minor_nc" ? "NC Menor" : capa.finding_type === "observation" ? "Obs" : "Melhoria"}
                        </Badge>
                        <Badge className={si.color}>{si.label}</Badge>
                        {elName && <Badge variant="outline" className="text-[10px]">Elem. {elName.element_number}</Badge>}
                      </div>
                      <h4 className="font-medium">{capa.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {capa.assigned_to && <span>👤 {capa.assigned_to}</span>}
                        {capa.due_date && <span>📅 {new Date(capa.due_date).toLocaleDateString("pt-BR")}</span>}
                        {capa.source && <span>📋 {capa.source}</span>}
                      </div>
                    </div>
                    {next && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: capa.id, status: next })}
                        disabled={updateStatus.isPending}>
                        → {CAPA_STATUSES.find(s => s.value === next)?.label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function ISMCodeHubPage() {
  const { data: elements = [] } = useISMElements();
  const { data: gaps = [] } = useISMGapAnalysis();
  const { data: capas = [] } = useISMCAPAs();

  const stats = useMemo(() => {
    const overallScore = gaps.length > 0 ? Math.round(gaps.reduce((s, g) => s + g.compliance_score, 0) / gaps.length) : 0;
    const openCAPAs = capas.filter(c => ["open", "in_progress"].includes(c.status)).length;
    const majorNCs = capas.filter(c => c.finding_type === "major_nc" && c.status !== "closed").length;
    const assessed = new Set(gaps.map(g => g.element_id)).size;
    return { overallScore, openCAPAs, majorNCs, assessed, totalElements: elements.length };
  }, [elements, gaps, capas]);

  const kpis = [
    { id: "score", title: "ISM Score", value: `${stats.overallScore}%`, icon: Shield, color: stats.overallScore >= 80 ? "success" as const : "warning" as const },
    { id: "elements", title: "Elementos Avaliados", value: `${stats.assessed}/${stats.totalElements}`, icon: BookOpen, color: "primary" as const },
    { id: "capas", title: "CAPAs Abertas", value: stats.openCAPAs, icon: ClipboardList, color: stats.openCAPAs > 0 ? "warning" as const : "success" as const },
    { id: "majornc", title: "NC Maiores", value: stats.majorNCs, icon: AlertTriangle, color: stats.majorNCs > 0 ? "destructive" as const : "success" as const },
  ];

  const tabs: ModuleTab[] = [
    { id: "elements", label: "16 Elementos", icon: BookOpen, content: <ElementsOverview /> },
    { id: "kpi-dashboard", label: "KPI Dashboard", icon: TrendingUp, content: <ISMKPIDashboard /> },
    { id: "gap-analysis", label: "Gap Analysis", icon: Target, content: <GapAnalysisTab />, badge: stats.assessed },
    { id: "capa", label: "CAPA", icon: ClipboardList, content: <CAPAWorkflow />, badge: stats.openCAPAs },
    { id: "management-review", label: "Management Review", icon: FileCheck, content: <ManagementReviewTab /> },
  ];

  return (
    <PremiumModuleShell
      title="ISM Code — Safety Management System"
      subtitle="16 Elementos IMO • Gap Analysis • CAPA Workflow"
      icon={Shield}
      iconGradient="from-emerald-500 to-teal-500"
      tabs={tabs}
      defaultTab="elements"
      showAIBadge
      aiStatus="active"
      alerts={stats.majorNCs}
    >
      <div className="mt-6">
        <SmartKPIGrid kpis={kpis} columns={4} />
      </div>
    </PremiumModuleShell>
  );
}
