/**
 * LVS Acceptance Dashboard - Petrobras Vessel Acceptance Checklist
 * Estrutura: Seção → Subseção → Item LV → Evidência
 * Baseado na ET-3000.00-1500-91C-PLL-017 (rev6)
 * Usa dados centralizados de lvs-data.ts
 */
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  ChevronRight, ChevronDown, Search, Download, CheckCircle2,
  XCircle, Clock, AlertTriangle, FileText, Camera, FolderOpen, FolderTree,
  BarChart3, Target, Brain, Eye, Sparkles, Loader2, Filter
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  ALL_LVS_SECTIONS, ET_REFERENCES,
  type Section, type LVItem, type ItemStatus
} from "./lvs-data";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import ReactMarkdown from "react-markdown";

// ─── Status Config ───────────────────────────────────────────
const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: "Aprovado", color: "bg-success/20 text-success", icon: CheckCircle2 },
  pending: { label: "Pendente", color: "bg-warning/20 text-warning", icon: Clock },
  rejected: { label: "Rejeitado", color: "bg-destructive/20 text-destructive", icon: XCircle },
  not_applicable: { label: "N/A", color: "bg-muted text-muted-foreground", icon: AlertTriangle },
  not_verified: { label: "Não Verificado", color: "bg-muted text-muted-foreground", icon: Eye },
};
const CHART_COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted))", "hsl(var(--primary))"];

// ─── Component ────────────────────────────────────────────────
export function LVSAcceptanceDashboard() {
  const [sections, setSections] = useState<Section[]>(ALL_LVS_SECTIONS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterET, setFilterET] = useState<string>("all");
  const [mainTab, setMainTab] = useState("tree");
  const [editDialog, setEditDialog] = useState<LVItem | null>(null);

  // AI
  const { analyze, isLoading: aiLoading } = useNautilusAI();
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // Toggle expand
  const toggleSection = (id: string) => setExpandedSections(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSubSection = (id: string) => setExpandedSubSections(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Update item status
  const updateItemStatus = useCallback((itemId: string, status: ItemStatus) => {
    setSections(prev => prev.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.map(item => item.id === itemId ? { ...item, status } : item)
      }))
    })));
    toast.success(`Status atualizado para ${STATUS_CONFIG[status].label}`);
  }, []);

  const updateItemFields = useCallback((itemId: string, fields: Partial<LVItem>) => {
    setSections(prev => prev.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.map(item => item.id === itemId ? { ...item, ...fields } : item)
      }))
    })));
  }, []);

  // Analytics (computed from current sections state, respecting ET filter)
  const displaySections = useMemo(() => {
    if (filterET === "all") return sections;
    return sections.filter(s => s.etRef === filterET);
  }, [sections, filterET]);

  const analytics = useMemo(() => {
    const allItems = displaySections.flatMap(s => s.subsections.flatMap(ss => ss.items));
    const total = allItems.length;
    const approved = allItems.filter(i => i.status === "approved").length;
    const pending = allItems.filter(i => i.status === "pending").length;
    const rejected = allItems.filter(i => i.status === "rejected").length;
    const notVerified = allItems.filter(i => i.status === "not_verified").length;
    const na = allItems.filter(i => i.status === "not_applicable").length;
    const applicable = total - na;
    const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

    const statusDist = [
      { name: "Aprovado", value: approved },
      { name: "Pendente", value: pending },
      { name: "Rejeitado", value: rejected },
      { name: "Não Verificado", value: notVerified },
      { name: "N/A", value: na },
    ].filter(d => d.value > 0);

    const sectionScores = displaySections.map(sec => {
      const items = sec.subsections.flatMap(ss => ss.items);
      const secApplicable = items.filter(i => i.status !== "not_applicable").length;
      const secApproved = items.filter(i => i.status === "approved").length;
      return {
        name: sec.code,
        score: secApplicable > 0 ? Math.round((secApproved / secApplicable) * 100) : 0,
        total: items.length,
        approved: secApproved,
      };
    });

    const radarData = sectionScores.filter(s => s.total > 0).map(s => ({
      metric: s.name,
      value: s.score,
    }));

    const withPendency = allItems.filter(i => i.pendency).length;

    return { total, approved, pending, rejected, notVerified, na, applicable, score, statusDist, sectionScores, radarData, withPendency };
  }, [displaySections]);

  // Filtering (search + status on top of ET filter)
  const filteredSections = useMemo(() => {
    let base = displaySections;
    if (!searchTerm && filterStatus === "all") return base;
    return base.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.filter(item => {
          const matchSearch = !searchTerm || item.question.toLowerCase().includes(searchTerm.toLowerCase()) || item.ref.toLowerCase().includes(searchTerm.toLowerCase());
          const matchStatus = filterStatus === "all" || item.status === filterStatus;
          return matchSearch && matchStatus;
        })
      })).filter(sub => sub.items.length > 0)
    })).filter(sec => sec.subsections.length > 0);
  }, [displaySections, searchTerm, filterStatus]);

  // CSV Export
  const exportCSV = () => {
    const headers = ["ET", "REF", "Questão", "Status", "Metodologia", "Observações", "Pendência", "Prazo", "Foto"];
    const allItems = displaySections.flatMap(s => s.subsections.flatMap(ss => ss.items.map(i => ({ ...i, etRef: s.etRef }))));
    const rows = allItems.map(i => [i.etRef, i.ref, `"${i.question}"`, STATUS_CONFIG[i.status].label, `"${i.methodology}"`, `"${i.observations}"`, `"${i.pendency}"`, i.deadline, i.hasPhoto ? "Sim" : "Não"].join(","));
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lvs-aceitacao-petrobras.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  // AI Gap Analysis
  const runAIGapAnalysis = async () => {
    setAiDialogOpen(true);
    setAiResult(null);

    const allItems = displaySections.flatMap(s => s.subsections.flatMap(ss => ss.items));
    const gaps = allItems.filter(i => i.status === "pending" || i.status === "rejected" || i.status === "not_verified");
    const gapSummary = gaps.slice(0, 50).map(g => `[${g.ref}] ${g.question} — Status: ${STATUS_CONFIG[g.status].label}${g.pendency ? ` — Pendência: ${g.pendency}` : ""}`).join("\n");

    const result = await analyze("peodp", 
      `Analise os gaps da LVS de Aceitação de Embarcação RSV Petrobras (ET-3000.00-1500-91C-PLL-017).

DADOS DO CHECKLIST:
- Total de itens: ${analytics.total}
- Aprovados: ${analytics.approved} (${analytics.score}%)
- Pendentes: ${analytics.pending}
- Rejeitados: ${analytics.rejected}
- Não verificados: ${analytics.notVerified}

GAPS IDENTIFICADOS (${gaps.length} itens):
${gapSummary}

TAREFA:
1. Priorize os gaps mais críticos para a aceitação da embarcação
2. Sugira ações corretivas específicas para cada gap rejeitado
3. Identifique padrões nos gaps (documentação faltante, testes pendentes, etc.)
4. Estime o esforço necessário para atingir 100% de aprovação
5. Recomende um plano de ação com cronograma sugerido`,
      { framework: "lvs_petrobras", score: analytics.score, totalItems: analytics.total }
    );

    if (result) {
      setAiResult(result.response);
    }
  };

  return (
    <div className="space-y-6">
      {/* ET Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filterET === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterET("all")}
        >
          <Filter className="h-3.5 w-3.5 mr-1" /> Todas ETs ({ALL_LVS_SECTIONS.length} seções)
        </Button>
        {ET_REFERENCES.map(et => (
          <Button
            key={et.id}
            variant={filterET === et.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterET(et.id)}
          >
            {et.description} ({et.sections})
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={runAIGapAnalysis} disabled={aiLoading}>
          <Brain className="h-4 w-4 mr-1" /> Gap Analysis IA
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {[
          { icon: FileText, label: "Total Itens", value: analytics.total, color: "text-primary" },
          { icon: CheckCircle2, label: "Aprovados", value: analytics.approved, color: "text-success" },
          { icon: Clock, label: "Pendentes", value: analytics.pending, color: "text-warning" },
          { icon: XCircle, label: "Rejeitados", value: analytics.rejected, color: "text-destructive" },
          { icon: Eye, label: "Não Verificados", value: analytics.notVerified, color: "text-muted-foreground" },
          { icon: Target, label: "Score", value: `${analytics.score}%`, color: analytics.score >= 80 ? "text-success" : analytics.score >= 50 ? "text-warning" : "text-destructive" },
          { icon: AlertTriangle, label: "Pendências", value: analytics.withPendency, color: analytics.withPendency > 0 ? "text-warning" : "text-success" },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="tree"><FolderTree className="h-3.5 w-3.5 mr-1" /> Pastas & Itens</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Analytics</TabsTrigger>
          <TabsTrigger value="pendencies"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Pendências ({analytics.withPendency})</TabsTrigger>
        </TabsList>

        {/* ─── Tree View ──────────────────── */}
        <TabsContent value="tree">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por REF ou texto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={() => {
              setExpandedSections(new Set(displaySections.map(s => s.id)));
              setExpandedSubSections(new Set(displaySections.flatMap(s => s.subsections.map(ss => ss.id))));
            }}><FolderOpen className="h-4 w-4 mr-1" /> Expandir Tudo</Button>
          </div>

          {/* Score Progress */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Score Geral de Aceitação</span>
                <span className={`text-2xl font-bold ${analytics.score >= 80 ? 'text-success' : analytics.score >= 50 ? 'text-warning' : 'text-destructive'}`}>{analytics.score}%</span>
              </div>
              <Progress value={analytics.score} className="h-3" />
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="text-success">● {analytics.approved} Aprovados</span>
                <span className="text-warning">● {analytics.pending} Pendentes</span>
                <span className="text-destructive">● {analytics.rejected} Rejeitados</span>
                <span>● {analytics.notVerified} Não Verificados</span>
              </div>
            </CardContent>
          </Card>

          {/* Sections (Folders) */}
          <div className="space-y-2">
            {filteredSections.map(section => {
              const isExpanded = expandedSections.has(section.id);
              const sectionItems = section.subsections.flatMap(ss => ss.items);
              const secApproved = sectionItems.filter(i => i.status === "approved").length;
              const secTotal = sectionItems.length;
              const secScore = secTotal > 0 ? Math.round((secApproved / secTotal) * 100) : 0;
              const Icon = section.icon;

              return (
                <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">{section.code}</Badge>
                            <span className="font-semibold text-sm truncate">{section.title}</span>
                            <Badge variant="secondary" className="text-[9px] shrink-0">{section.etRef}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={secScore} className="flex-1 h-1.5 max-w-[200px]" />
                            <span className="text-xs text-muted-foreground">{secApproved}/{secTotal}</span>
                          </div>
                        </div>
                        <Badge className={secScore === 100 ? "bg-success/20 text-success" : secScore >= 50 ? "bg-warning/20 text-warning" : "bg-muted"}>{secScore}%</Badge>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 space-y-1 mt-1">
                    {section.subsections.map(sub => {
                      const subExpanded = expandedSubSections.has(sub.id);
                      const subApproved = sub.items.filter(i => i.status === "approved").length;
                      return (
                        <Collapsible key={sub.id} open={subExpanded} onOpenChange={() => toggleSubSection(sub.id)}>
                          <CollapsibleTrigger asChild>
                            <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                              <CardContent className="p-3 flex items-center gap-3">
                                {subExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium flex-1">{sub.title}</span>
                                <span className="text-xs text-muted-foreground">{subApproved}/{sub.items.length}</span>
                              </CardContent>
                            </Card>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="ml-8 space-y-1 mt-1">
                            {sub.items.map(item => {
                              const cfg = STATUS_CONFIG[item.status];
                              const StatusIcon = cfg.icon;
                              return (
                                <Card key={item.id} className={`${item.status === "rejected" ? "border-destructive/50" : item.status === "pending" ? "border-warning/50" : ""}`}>
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-2">
                                      <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color.split(" ")[1]}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded shrink-0">{item.ref}</code>
                                          <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                                          {item.hasPhoto && <Camera className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                        <p className="text-sm leading-snug">{item.question}</p>
                                        <p className="text-xs text-muted-foreground mt-1">📋 {item.methodology}</p>
                                        {item.pendency && <p className="text-xs text-warning mt-1">⚠️ {item.pendency}</p>}
                                        {item.observations && <p className="text-xs text-muted-foreground mt-1">💬 {item.observations}</p>}
                                      </div>
                                      <div className="flex flex-col gap-1 shrink-0">
                                        <Select value={item.status} onValueChange={(v) => updateItemStatus(item.id, v as ItemStatus)}>
                                          <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                                          </SelectContent>
                                        </Select>
                                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditDialog(item)}>Editar</Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Analytics Tab ──────────────────── */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Acceptance Readiness Radar</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição de Status</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.statusDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Score por Seção</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.sectionScores.filter(s => s.total > 0)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="score" name="Score %" radius={[4, 4, 0, 0]}>
                      {analytics.sectionScores.filter(s => s.total > 0).map((s, i) => (
                        <Cell key={i} fill={s.score >= 80 ? "hsl(var(--success))" : s.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Pendencies Tab ──────────────────── */}
        <TabsContent value="pendencies">
          {(() => {
            const pendItems = displaySections.flatMap(s => s.subsections.flatMap(ss => ss.items.filter(i => i.status === "pending" || i.status === "rejected" || i.pendency)));
            return pendItems.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="text-muted-foreground">Nenhuma pendência encontrada!</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-2">
                {pendItems.map(item => {
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <Card key={item.id} className={item.status === "rejected" ? "border-destructive/50" : "border-warning/50"}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <cfg.icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color.split(" ")[1]}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.ref}</code>
                            <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                            {item.deadline && <span className="text-xs text-muted-foreground">📅 {item.deadline}</span>}
                          </div>
                          <p className="text-sm">{item.question}</p>
                          {item.pendency && <p className="text-xs text-warning mt-1">⚠️ Pendência: {item.pendency}</p>}
                        </div>
                        <Select value={item.status} onValueChange={(v) => updateItemStatus(item.id, v as ItemStatus)}>
                          <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Editar Item LV</DialogTitle></DialogHeader>
          {editDialog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Referência</label>
                <Input value={editDialog.ref} readOnly className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium">Questão</label>
                <p className="text-sm text-muted-foreground border rounded p-2">{editDialog.question}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea value={editDialog.observations} onChange={e => setEditDialog({ ...editDialog, observations: e.target.value })} placeholder="Adicionar observações..." />
              </div>
              <div>
                <label className="text-sm font-medium">Pendência</label>
                <Textarea value={editDialog.pendency} onChange={e => setEditDialog({ ...editDialog, pendency: e.target.value })} placeholder="Descrever pendência..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prazo</label>
                  <Input type="date" value={editDialog.deadline} onChange={e => setEditDialog({ ...editDialog, deadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editDialog.status} onValueChange={v => setEditDialog({ ...editDialog, status: v as ItemStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                if (editDialog) {
                  updateItemFields(editDialog.id, {
                    observations: editDialog.observations,
                    pendency: editDialog.pendency,
                    deadline: editDialog.deadline,
                    status: editDialog.status,
                  });
                  setEditDialog(null);
                  toast.success("Item atualizado!");
                }
              }}>Salvar Alterações</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Gap Analysis Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Gap Analysis IA — LVS Aceitação Petrobras
              <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1" />IA</Badge>
            </DialogTitle>
          </DialogHeader>
          {aiLoading && !aiResult && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analisando gaps com IA...</p>
              <p className="text-xs text-muted-foreground mt-1">Processando {analytics.total} itens do checklist</p>
            </div>
          )}
          {aiResult && (
            <ScrollArea className="h-[500px] rounded-lg border p-4 bg-muted/30">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{aiResult}</ReactMarkdown>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
