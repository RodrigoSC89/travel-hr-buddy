/**
 * PEO-DP Smart Gap Closer — One-click audit gap resolution
 * Prioritized action items across all 7 PEO-DP sections
 * AI-powered recommendations for closing gaps fastest
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target, CheckCircle, AlertTriangle, Clock, Brain, Zap,
  Download, Shield, ArrowRight, Anchor, FileText, Settings, Activity
} from "lucide-react";
import { toast } from "sonner";

type GapPriority = "critical" | "high" | "medium";
type GapStatus = "open" | "in_progress" | "resolved";

interface AuditGap {
  id: string;
  section: string;
  sectionName: string;
  requirement: string;
  currentState: string;
  requiredState: string;
  priority: GapPriority;
  status: GapStatus;
  estimatedEffort: string;
  responsible: string;
  aiRecommendation: string;
  dueDate: string;
  impactOnScore: number; // percentage points improvement
}

const PRIORITY_CONFIG: Record<GapPriority, { label: string; color: string }> = {
  critical: { label: "Crítico", color: "bg-destructive text-destructive-foreground" },
  high: { label: "Alto", color: "bg-warning text-warning-foreground" },
  medium: { label: "Médio", color: "bg-muted text-foreground" },
};

const GAPS: AuditGap[] = [
  {
    id: "G01", section: "3.1", sectionName: "Gerenciamento", requirement: "Manual de Operações DP atualizado",
    currentState: "Rev.03 — falta seção ASOG/CAM conforme IMCA M 220 Rev.2",
    requiredState: "Manual com ASOG/CAM atualizado e aprovado",
    priority: "critical", status: "in_progress", estimatedEffort: "3 dias", responsible: "DPO Sênior",
    aiRecommendation: "Use o template IMCA M 220 Rev.2 para atualizar a seção de ASOG/CAM. Inclua matriz de condições AMBER/RED com ações específicas para cada cenário de perda de posição.",
    dueDate: "2026-02-20", impactOnScore: 4,
  },
  {
    id: "G02", section: "3.1", sectionName: "Gerenciamento", requirement: "Atas de análise crítica Q4/2024 e Q1/2025",
    currentState: "Apenas ata Q3/2024 disponível",
    requiredState: "Atas trimestrais dos últimos 12 meses",
    priority: "high", status: "open", estimatedEffort: "1 dia", responsible: "QSMS",
    aiRecommendation: "Realize reunião de análise crítica urgente cobrindo Q4/2024 e Q1/2025. Inclua revisão de KPIs IEODP, eventos DP e ações de FMEA/FMECA.",
    dueDate: "2026-02-25", impactOnScore: 2,
  },
  {
    id: "G03", section: "3.2", sectionName: "Recursos", requirement: "Capability Plot atualizado (<12 meses)",
    currentState: "Cap Plot de 2023 — mais de 24 meses",
    requiredState: "Cap Plot com dados de campo recentes",
    priority: "critical", status: "open", estimatedEffort: "5 dias", responsible: "DPO Sênior",
    aiRecommendation: "Solicite atualização do Capability Plot ao fornecedor do sistema DP com dados de campo dos últimos 12 meses. Inclua análise de pior caso (single failure) conforme IMCA M 140.",
    dueDate: "2026-02-28", impactOnScore: 5,
  },
  {
    id: "G04", section: "3.2", sectionName: "Recursos", requirement: "Inventário de spare parts DP",
    currentState: "Sem inventário formal de sobressalentes DP",
    requiredState: "Inventário completo com níveis mínimos definidos",
    priority: "high", status: "open", estimatedEffort: "2 dias", responsible: "Ch. Máquinas",
    aiRecommendation: "Crie inventário cobrindo: sensores de referência, UPS, módulos de controle DP, thrusters spare parts. Use a lista de componentes críticos do FMEA como base.",
    dueDate: "2026-03-01", impactOnScore: 3,
  },
  {
    id: "G05", section: "3.3", sectionName: "Competência", requirement: "Familiarização vessel-specific de 2 DPOs",
    currentState: "2 DPOs sem registro de familiarização completa",
    requiredState: "100% DPOs com familiarização registrada",
    priority: "high", status: "in_progress", estimatedEffort: "2 dias", responsible: "DPO Sênior",
    aiRecommendation: "Complete o checklist de familiarização vessel-specific para os 2 DPOs pendentes. Inclua: sistemas DP, ASOG/CAM, operações específicas do vessel, exercícios práticos.",
    dueDate: "2026-02-22", impactOnScore: 2,
  },
  {
    id: "G06", section: "3.3", sectionName: "Competência", requirement: "Treinamento técnico DP do 2º técnico",
    currentState: "Apenas 1 técnico com treinamento Kongsberg",
    requiredState: "2 técnicos com treinamento do fabricante",
    priority: "medium", status: "open", estimatedEffort: "5 dias (curso)", responsible: "RH",
    aiRecommendation: "Agende treinamento Kongsberg/Rolls-Royce para o segundo técnico. Enquanto aguarda, documente o plano de treinamento como evidência de progresso.",
    dueDate: "2026-03-15", impactOnScore: 2,
  },
  {
    id: "G07", section: "3.4", sectionName: "Operações", requirement: "Footprint Analysis para todas locações ativas",
    currentState: "Apenas template disponível — sem análises específicas",
    requiredState: "Footprint analysis para cada locação operacional",
    priority: "high", status: "open", estimatedEffort: "3 dias", responsible: "DPO Sênior",
    aiRecommendation: "Realize footprint analysis para cada locação ativa usando dados de vento, corrente e obstruções. Documente no formato IMCA M 103 e vincule ao plano de operação DP.",
    dueDate: "2026-02-28", impactOnScore: 3,
  },
  {
    id: "G08", section: "3.5", sectionName: "Manutenção", requirement: "Inspeções de sensores de referência",
    currentState: "Faltam inspeções de sensores de referência no calendário",
    requiredState: "Calendário completo com inspeções trimestrais",
    priority: "high", status: "open", estimatedEffort: "1 dia", responsible: "Ch. Máquinas",
    aiRecommendation: "Adicione inspeções trimestrais de DGPS, Gyro, MRU, Wind Sensors ao calendário PMS. Agende a primeira inspeção para a próxima semana como evidência imediata.",
    dueDate: "2026-02-20", impactOnScore: 2,
  },
  {
    id: "G09", section: "3.6", sectionName: "Emergência", requirement: "Exercício de emergência DP com relatório completo",
    currentState: "Último exercício sem relatório formal e análise",
    requiredState: "Exercício semestral com relatório, fotos e lições aprendidas",
    priority: "critical", status: "open", estimatedEffort: "1 dia", responsible: "Comandante",
    aiRecommendation: "Programe exercício de emergência DP (Drive Off / Drift Off) para a próxima semana. Prepare: cenário, checklist de ações, formulário de avaliação, câmera para registro fotográfico.",
    dueDate: "2026-02-22", impactOnScore: 5,
  },
  {
    id: "G10", section: "3.7", sectionName: "DP Trials", requirement: "DP Annual Trials Report atualizado",
    currentState: "Relatório de DP Trials sem cobertura de todos testes mandatórios",
    requiredState: "Relatório completo conforme IMCA M 190",
    priority: "critical", status: "in_progress", estimatedEffort: "2 dias", responsible: "DPO Sênior",
    aiRecommendation: "Revise o relatório de DP Trials contra a checklist IMCA M 190. Certifique-se de incluir: testes de blackout, testes de referência, WCFDI, testes de alarme e override.",
    dueDate: "2026-02-25", impactOnScore: 6,
  },
];

export function PeoDPSmartGapCloser() {
  const [gaps, setGaps] = useState(GAPS);

  const stats = useMemo(() => {
    const open = gaps.filter(g => g.status === "open").length;
    const inProgress = gaps.filter(g => g.status === "in_progress").length;
    const resolved = gaps.filter(g => g.status === "resolved").length;
    const total = gaps.length;
    const criticalOpen = gaps.filter(g => g.priority === "critical" && g.status !== "resolved").length;
    const potentialImprovement = gaps.filter(g => g.status !== "resolved").reduce((a, g) => a + g.impactOnScore, 0);
    const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { open, inProgress, resolved, total, criticalOpen, potentialImprovement, resolvedPct };
  }, [gaps]);

  const updateStatus = (id: string, status: GapStatus) => {
    setGaps(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    toast.success(`Gap ${id} → ${status === "resolved" ? "Resolvido ✓" : status === "in_progress" ? "Em andamento" : "Aberto"}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Smart Gap Closer — PEO-DP
          </h3>
          <p className="text-sm text-muted-foreground">
            Resolução priorizada de gaps com recomendações IA • {stats.total} gaps identificados
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Gap report exportado")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Gaps</p>
        </CardContent></Card>
        <Card className={stats.criticalOpen > 0 ? "border-destructive/30 bg-destructive/5" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.criticalOpen > 0 ? "text-destructive" : "text-success"}`}>{stats.criticalOpen}</p>
            <p className="text-[10px] text-muted-foreground">Críticos Abertos</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.open}</p>
          <p className="text-[10px] text-muted-foreground">Abertos</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
          <p className="text-[10px] text-muted-foreground">Em Andamento</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.resolved}</p>
          <p className="text-[10px] text-muted-foreground">Resolvidos</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-primary">+{stats.potentialImprovement}%</p>
          <p className="text-[10px] text-muted-foreground">Ganho Potencial</p>
        </CardContent></Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso de Fechamento</span>
            <span className="font-bold">{stats.resolvedPct}%</span>
          </div>
          <Progress value={stats.resolvedPct} className="h-3" />
        </CardContent>
      </Card>

      {/* Gap Cards - sorted by priority */}
      <div className="space-y-3">
        {[...gaps].sort((a, b) => {
          const pOrder = { critical: 0, high: 1, medium: 2 };
          const sOrder = { open: 0, in_progress: 1, resolved: 2 };
          return (sOrder[a.status] - sOrder[b.status]) || (pOrder[a.priority] - pOrder[b.priority]);
        }).map(gap => (
          <Card key={gap.id} className={gap.status === "resolved" ? "opacity-60" : gap.priority === "critical" ? "border-destructive/30" : ""}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {gap.status === "resolved" ? <CheckCircle className="h-3.5 w-3.5 text-success" /> :
                     gap.status === "in_progress" ? <Clock className="h-3.5 w-3.5 text-primary" /> :
                     <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    <Badge variant="outline" className="text-xs">§{gap.section} {gap.sectionName}</Badge>
                    <Badge className={`text-[10px] ${PRIORITY_CONFIG[gap.priority].color}`}>{PRIORITY_CONFIG[gap.priority].label}</Badge>
                    {gap.status === "resolved" && <Badge variant="outline" className="text-[10px] border-success text-success">RESOLVIDO</Badge>}
                  </div>
                  <p className="text-sm font-medium">{gap.requirement}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">+{gap.impactOnScore}%</p>
                  <p className="text-[10px] text-muted-foreground">impacto</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div><span className="text-destructive font-medium">Estado atual:</span> {gap.currentState}</div>
                  <div><span className="text-success font-medium">Requerido:</span> {gap.requiredState}</div>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div>Responsável: <span className="font-medium text-foreground">{gap.responsible}</span></div>
                  <div>Esforço: {gap.estimatedEffort} • Prazo: {gap.dueDate}</div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-2.5 rounded bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Brain className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-primary mb-0.5">Recomendação IA</p>
                    <p className="text-xs">{gap.aiRecommendation}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {gap.status !== "resolved" && (
                <div className="flex gap-2 pt-1 border-t">
                  {gap.status !== "in_progress" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => updateStatus(gap.id, "in_progress")}>
                      <ArrowRight className="h-3 w-3" /> Iniciar
                    </Button>
                  )}
                  <Button size="sm" className="gap-1 text-xs h-7 bg-success hover:bg-success/90" onClick={() => updateStatus(gap.id, "resolved")}>
                    <CheckCircle className="h-3 w-3" /> Marcar Resolvido
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
