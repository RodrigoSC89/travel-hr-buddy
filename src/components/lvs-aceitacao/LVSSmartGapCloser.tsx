/**
 * LVS Smart Gap Closer — One-click gap resolution for Petrobras vessel acceptance
 * AI-powered prioritized action items across all LVS sections/ETs
 * Generates specific corrective actions with responsible, effort, deadline and impact
 */
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Target, CheckCircle2, AlertTriangle, Clock, Brain, Zap,
  Download, ArrowRight, Search, Filter, TrendingUp, Loader2,
  User, Calendar, Wrench, FileText, XCircle
} from "lucide-react";
import { ALL_LVS_SECTIONS, ET_REFERENCES, type ItemStatus } from "./lvs-data";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import ReactMarkdown from "react-markdown";

type GapPriority = "critical" | "high" | "medium" | "low";
type GapStatus = "open" | "in_progress" | "resolved";

interface LVSGap {
  id: string;
  ref: string;
  question: string;
  sectionCode: string;
  sectionTitle: string;
  etRef: string;
  methodology: string;
  pendency: string;
  itemStatus: ItemStatus;
  priority: GapPriority;
  gapStatus: GapStatus;
  responsible: string;
  estimatedEffort: string;
  deadline: string;
  impactOnScore: number;
  aiRecommendation: string;
}

const PRIORITY_CONFIG: Record<GapPriority, { label: string; color: string; order: number }> = {
  critical: { label: "Crítico", color: "bg-destructive text-destructive-foreground", order: 0 },
  high: { label: "Alto", color: "bg-warning text-warning-foreground", order: 1 },
  medium: { label: "Médio", color: "bg-primary/20 text-primary", order: 2 },
  low: { label: "Baixo", color: "bg-muted text-muted-foreground", order: 3 },
};

const STATUS_ICONS: Record<GapStatus, React.ElementType> = {
  open: AlertTriangle,
  in_progress: Clock,
  resolved: CheckCircle2,
};

const RESPONSIBLE_MAP: Record<string, string> = {
  "ROV": "Supervisor ROV",
  "Guindaste": "Guindasteiro Chefe",
  "Segurança": "Safety Officer",
  "Navegação": "Comandante",
  "Habitabilidade": "Imediato",
  "TI": "TI Bordo",
  "Máquinas": "Ch. Máquinas",
  "Equipamentos": "Superintendente",
  "default": "Coordenador de Aceitação",
};

function inferPriority(item: { itemStatus: ItemStatus; pendency: string; methodology: string }): GapPriority {
  if (item.itemStatus === "rejected") return "critical";
  if (item.pendency.toLowerCase().includes("falta") && item.pendency.toLowerCase().includes("teste")) return "critical";
  if (item.pendency.toLowerCase().includes("documento") || item.pendency.toLowerCase().includes("certificado")) return "high";
  if (item.itemStatus === "pending") return "medium";
  return "low";
}

function inferResponsible(sectionTitle: string): string {
  for (const [key, value] of Object.entries(RESPONSIBLE_MAP)) {
    if (sectionTitle.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return RESPONSIBLE_MAP.default;
}

function estimateEffort(item: { methodology: string; pendency: string }): string {
  if (item.pendency.toLowerCase().includes("teste")) return "2-3 dias";
  if (item.pendency.toLowerCase().includes("certificado")) return "1-5 dias";
  if (item.pendency.toLowerCase().includes("foto")) return "< 1 dia";
  if (item.pendency.toLowerCase().includes("documento")) return "1-2 dias";
  return "1-3 dias";
}

export function LVSSmartGapCloser() {
  const { generate, isLoading: aiLoading } = useNautilusAI();
  const [filterET, setFilterET] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [gapStatuses, setGapStatuses] = useState<Record<string, GapStatus>>({});
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkAIResult, setBulkAIResult] = useState<string | null>(null);
  const [showBulkAI, setShowBulkAI] = useState(false);

  // Build gaps from LVS data
  const allGaps: LVSGap[] = useMemo(() => {
    return ALL_LVS_SECTIONS.flatMap(sec =>
      sec.subsections.flatMap(sub =>
        sub.items
          .filter(item => item.status === "pending" || item.status === "rejected" || item.status === "not_verified")
          .map(item => {
            const priority = inferPriority({ itemStatus: item.status, pendency: item.pendency, methodology: item.methodology });
            return {
              id: item.id,
              ref: item.ref,
              question: item.question,
              sectionCode: sec.code,
              sectionTitle: sec.title,
              etRef: sec.etRef,
              methodology: item.methodology,
              pendency: item.pendency || "A definir",
              itemStatus: item.status,
              priority,
              gapStatus: (gapStatuses[item.id] || "open") as GapStatus,
              responsible: inferResponsible(sec.title),
              estimatedEffort: estimateEffort({ methodology: item.methodology, pendency: item.pendency }),
              deadline: item.deadline || "",
              impactOnScore: priority === "critical" ? 3 : priority === "high" ? 2 : 1,
              aiRecommendation: aiRecommendations[item.id] || "",
            };
          })
      )
    ).sort((a, b) => PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order);
  }, [gapStatuses, aiRecommendations]);

  // Filter
  const filteredGaps = useMemo(() => {
    return allGaps.filter(g => {
      if (filterET !== "all" && g.etRef !== filterET) return false;
      if (filterPriority !== "all" && g.priority !== filterPriority) return false;
      if (searchTerm && !g.question.toLowerCase().includes(searchTerm.toLowerCase()) && !g.ref.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [allGaps, filterET, filterPriority, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const open = allGaps.filter(g => g.gapStatus === "open").length;
    const inProgress = allGaps.filter(g => g.gapStatus === "in_progress").length;
    const resolved = allGaps.filter(g => g.gapStatus === "resolved").length;
    const critical = allGaps.filter(g => g.priority === "critical" && g.gapStatus !== "resolved").length;
    const high = allGaps.filter(g => g.priority === "high" && g.gapStatus !== "resolved").length;
    const potentialImprovement = allGaps.filter(g => g.gapStatus !== "resolved").reduce((a, g) => a + g.impactOnScore, 0);
    const resolvedPct = allGaps.length > 0 ? Math.round((resolved / allGaps.length) * 100) : 0;
    return { total: allGaps.length, open, inProgress, resolved, critical, high, potentialImprovement, resolvedPct };
  }, [allGaps]);

  const updateGapStatus = (id: string, status: GapStatus) => {
    setGapStatuses(prev => ({ ...prev, [id]: status }));
    toast.success(`Gap ${status === "resolved" ? "resolvido ✓" : status === "in_progress" ? "em andamento" : "reaberto"}`);
  };

  // AI for single gap
  const generateAIForGap = useCallback(async (gap: LVSGap) => {
    setGeneratingId(gap.id);
    const result = await generate("peodp",
      `Você é um especialista em aceitação de embarcações RSV Petrobras (ET-3000.00-1500-91C-PLL-017).

ITEM DA LVS COM GAP:
- Referência: ${gap.ref}
- Seção: ${gap.sectionCode} — ${gap.sectionTitle}
- ET: ${gap.etRef}
- Questão: ${gap.question}
- Metodologia de verificação: ${gap.methodology}
- Pendência atual: ${gap.pendency}
- Status: ${gap.itemStatus === "rejected" ? "REJEITADO" : "PENDENTE"}

GERE UMA RECOMENDAÇÃO CONCISA (máx 3 frases):
1. Ação corretiva específica
2. Evidência esperada pelo inspetor Petrobras
3. Dica prática para resolução rápida`,
      { framework: "lvs_petrobras" }
    );
    if (result) {
      setAiRecommendations(prev => ({ ...prev, [gap.id]: result.response }));
    }
    setGeneratingId(null);
  }, [generate]);

  // Bulk AI analysis
  const generateBulkAI = useCallback(async () => {
    setShowBulkAI(true);
    setBulkAIResult(null);
    const criticalGaps = allGaps.filter(g => g.gapStatus !== "resolved" && (g.priority === "critical" || g.priority === "high")).slice(0, 30);
    const gapSummary = criticalGaps.map(g =>
      `[${g.ref}] ${g.question} — ${g.itemStatus === "rejected" ? "REJEITADO" : "PENDENTE"} — Pendência: ${g.pendency}`
    ).join("\n");

    const result = await generate("peodp",
      `Você é o Coordenador de Aceitação de Embarcação RSV Petrobras. Analise os gaps críticos e gere um PLANO DE AÇÃO EXECUTIVO.

${stats.total} GAPS TOTAIS | ${stats.critical} CRÍTICOS | ${stats.high} ALTOS

GAPS PRIORITÁRIOS:
${gapSummary}

GERE:
1. **Top 5 Ações Imediatas** (próximas 48h) — com responsável e evidência esperada
2. **Padrões Identificados** — agrupamento dos gaps por tipo (testes subsea, documentação, certificados)
3. **Estimativa de Prazo** — quantos dias para fechar todos os gaps
4. **Riscos de Rejeição** — itens que podem causar reprovação na inspeção
5. **Quick Wins** — gaps que podem ser fechados em menos de 1 dia

Formate como relatório executivo com markdown.`,
      { framework: "lvs_petrobras", gapCount: stats.total, criticalCount: stats.critical }
    );
    if (result) setBulkAIResult(result.response);
  }, [allGaps, stats, generate]);

  // CSV Export
  const exportCSV = () => {
    const headers = "REF,ET,Seção,Questão,Status Item,Prioridade,Status Gap,Responsável,Esforço,Pendência\n";
    const rows = allGaps.map(g =>
      `"${g.ref}","${g.etRef}","${g.sectionCode} ${g.sectionTitle}","${g.question}",${g.itemStatus},${g.priority},${g.gapStatus},"${g.responsible}","${g.estimatedEffort}","${g.pendency}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lvs-gaps-petrobras.csv"; a.click();
    toast.success("Gaps exportados!");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Smart Gap Closer — LVS Petrobras
          </h3>
          <p className="text-sm text-muted-foreground">
            Resolução priorizada com IA • {stats.total} gaps • {stats.critical} críticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generateBulkAI} disabled={aiLoading}>
            <Brain className="h-3.5 w-3.5 mr-1" /> Análise IA Global
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", icon: FileText },
          { label: "Críticos", value: stats.critical, color: "text-destructive", icon: XCircle, highlight: stats.critical > 0 },
          { label: "Altos", value: stats.high, color: "text-warning", icon: AlertTriangle },
          { label: "Abertos", value: stats.open, color: "text-muted-foreground", icon: Clock },
          { label: "Em Andamento", value: stats.inProgress, color: "text-primary", icon: Wrench },
          { label: "Resolvidos", value: stats.resolved, color: "text-success", icon: CheckCircle2 },
          { label: "Ganho Score", value: `+${stats.potentialImprovement}%`, color: "text-primary", icon: TrendingUp },
        ].map(kpi => (
          <Card key={kpi.label} className={kpi.highlight ? "border-destructive/30 bg-destructive/5" : ""}>
            <CardContent className="p-2.5 text-center">
              <kpi.icon className={`h-4 w-4 mx-auto mb-0.5 ${kpi.color}`} />
              <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[9px] text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso de Fechamento</span>
            <span className="font-bold">{stats.resolvedPct}%</span>
          </div>
          <Progress value={stats.resolvedPct} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Bulk AI Result */}
      {showBulkAI && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> Análise IA — Plano de Ação Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bulkAIResult ? (
              <ScrollArea className="h-[350px] rounded border p-4 bg-primary/5">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{bulkAIResult}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">Gerando plano executivo...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por REF ou texto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-8 text-sm" />
        </div>
        <Select value={filterET} onValueChange={setFilterET}>
          <SelectTrigger className="w-36 h-8 text-xs"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ETs</SelectItem>
            {ET_REFERENCES.map(et => <SelectItem key={et.id} value={et.id}>{et.id}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioridade</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filteredGaps.length} gaps</Badge>
      </div>

      {/* Gap Cards */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-2 pr-2">
          {filteredGaps.map(gap => {
            const StatusIcon = STATUS_ICONS[gap.gapStatus];
            return (
              <Card key={gap.id} className={
                gap.gapStatus === "resolved" ? "opacity-50" :
                gap.priority === "critical" ? "border-destructive/30" :
                gap.priority === "high" ? "border-warning/20" : ""
              }>
                <CardContent className="p-3 space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <StatusIcon className={`h-3.5 w-3.5 ${
                          gap.gapStatus === "resolved" ? "text-success" :
                          gap.gapStatus === "in_progress" ? "text-primary" : "text-warning"
                        }`} />
                        <Badge variant="outline" className="text-[10px] font-mono">{gap.ref}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{gap.etRef}</Badge>
                        <Badge className={`text-[9px] ${PRIORITY_CONFIG[gap.priority].color}`}>
                          {PRIORITY_CONFIG[gap.priority].label}
                        </Badge>
                        {gap.itemStatus === "rejected" && (
                          <Badge className="text-[9px] bg-destructive text-destructive-foreground">REJEITADO</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-tight">{gap.question}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">+{gap.impactOnScore}%</p>
                      <p className="text-[9px] text-muted-foreground">impacto</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" /> {gap.responsible}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {gap.estimatedEffort}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Wrench className="h-3 w-3" /> {gap.methodology}
                    </div>
                    {gap.deadline && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {gap.deadline}
                      </div>
                    )}
                  </div>

                  {/* Pendency */}
                  {gap.pendency && gap.pendency !== "A definir" && (
                    <div className="text-xs p-1.5 rounded bg-warning/10 border border-warning/20 text-warning">
                      <span className="font-medium">Pendência:</span> {gap.pendency}
                    </div>
                  )}

                  {/* AI Recommendation */}
                  {gap.aiRecommendation && (
                    <div className="p-2 rounded bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                          <ReactMarkdown>{gap.aiRecommendation}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {gap.gapStatus !== "resolved" && (
                    <div className="flex gap-1.5 pt-1 border-t">
                      {!gap.aiRecommendation && (
                        <Button size="sm" variant="outline" className="text-[10px] h-6 gap-1" onClick={() => generateAIForGap(gap)} disabled={generatingId === gap.id}>
                          {generatingId === gap.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                          IA
                        </Button>
                      )}
                      {gap.gapStatus !== "in_progress" && (
                        <Button size="sm" variant="outline" className="text-[10px] h-6 gap-1" onClick={() => updateGapStatus(gap.id, "in_progress")}>
                          <ArrowRight className="h-3 w-3" /> Iniciar
                        </Button>
                      )}
                      <Button size="sm" className="text-[10px] h-6 gap-1 bg-success hover:bg-success/90" onClick={() => updateGapStatus(gap.id, "resolved")}>
                        <CheckCircle2 className="h-3 w-3" /> Resolver
                      </Button>
                    </div>
                  )}
                  {gap.gapStatus === "resolved" && (
                    <div className="flex gap-1.5 pt-1 border-t">
                      <Button size="sm" variant="ghost" className="text-[10px] h-6 gap-1" onClick={() => updateGapStatus(gap.id, "open")}>
                        Reabrir
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filteredGaps.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success opacity-50" />
              <p className="text-sm">Nenhum gap encontrado para os filtros selecionados</p>
            </CardContent></Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
