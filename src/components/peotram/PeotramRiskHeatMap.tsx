/**
 * PEOTRAM Risk Heat Map — Visual risk matrix per element
 * Severity x Probability grid with color-coded cells
 * Identifies highest-risk areas for audit preparation priority
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Download, Shield, Target, TrendingUp,
  CheckCircle, Info
} from "lucide-react";
import { toast } from "sonner";

interface RiskItem {
  id: string;
  elementId: number;
  elementSigla: string;
  elementName: string;
  riskDescription: string;
  probability: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  mitigation: string;
  status: "open" | "mitigated" | "accepted";
}

const PROB_LABELS = ["", "Raro", "Improvável", "Possível", "Provável", "Quase Certo"];
const SEV_LABELS = ["", "Insignificante", "Menor", "Moderada", "Maior", "Catastrófica"];

const RISK_COLOR = (score: number) => {
  if (score >= 15) return "bg-destructive text-destructive-foreground";
  if (score >= 10) return "bg-warning text-warning-foreground";
  if (score >= 5) return "bg-warning/50 text-foreground";
  return "bg-success/20 text-success-foreground";
};

const RISK_LABEL = (score: number) => {
  if (score >= 15) return "Crítico";
  if (score >= 10) return "Alto";
  if (score >= 5) return "Médio";
  return "Baixo";
};

const RISKS: RiskItem[] = [
  { id: "RK01", elementId: 1, elementSigla: "LGR", elementName: "Liderança", riskDescription: "Falta de comprometimento da alta direção com SMS", probability: 2, severity: 5, riskScore: 10, mitigation: "Atas de reunião de análise crítica pela direção", status: "mitigated" },
  { id: "RK02", elementId: 2, elementSigla: "PGR", elementName: "Planejamento e Gestão de Riscos", riskDescription: "Análise de risco desatualizada para operações críticas", probability: 3, severity: 4, riskScore: 12, mitigation: "Atualizar APR/PT para todas operações no escopo", status: "open" },
  { id: "RK03", elementId: 3, elementSigla: "II", elementName: "Informação e Instruções", riskDescription: "Procedimentos operacionais não revisados no prazo", probability: 4, severity: 3, riskScore: 12, mitigation: "Calendário de revisão de SOPs com alerta automático", status: "open" },
  { id: "RK04", elementId: 4, elementSigla: "OP", elementName: "Operações", riskDescription: "Permissões de trabalho incompletas ou vencidas", probability: 3, severity: 4, riskScore: 12, mitigation: "Digitalizar PTs com workflow de aprovação", status: "mitigated" },
  { id: "RK05", elementId: 5, elementSigla: "MO", elementName: "Mudanças Organizacionais", riskDescription: "Mudanças de pessoal sem handover documentado", probability: 3, severity: 3, riskScore: 9, mitigation: "Checklist de handover obrigatório com evidência", status: "mitigated" },
  { id: "RK06", elementId: 6, elementSigla: "MN", elementName: "Manutenção", riskDescription: "Certificados de equipamentos críticos vencidos", probability: 3, severity: 5, riskScore: 15, mitigation: "Painel de vencimentos com alerta 90/60/30 dias", status: "open" },
  { id: "RK07", elementId: 7, elementSigla: "GP", elementName: "Gestão de Projetos", riskDescription: "MOC sem análise de impacto documentada", probability: 2, severity: 3, riskScore: 6, mitigation: "Template MOC com campos obrigatórios", status: "mitigated" },
  { id: "RK08", elementId: 8, elementSigla: "AD", elementName: "Aquisição de Bens e Serviços", riskDescription: "Fornecedores críticos sem avaliação de SMS", probability: 3, severity: 3, riskScore: 9, mitigation: "Qualificação de fornecedores com critérios SMS", status: "accepted" },
  { id: "RK09", elementId: 9, elementSigla: "RH", elementName: "Recursos Humanos", riskDescription: "Certificações STCW próximas do vencimento", probability: 4, severity: 4, riskScore: 16, mitigation: "Tracker de certificações com renovação antecipada", status: "open" },
  { id: "RK10", elementId: 10, elementSigla: "SS", elementName: "Saúde e Segurança", riskDescription: "CIPA com mandato vencido", probability: 2, severity: 3, riskScore: 6, mitigation: "Calendário eleitoral com antecedência de 60 dias", status: "mitigated" },
  { id: "RK11", elementId: 11, elementSigla: "PE", elementName: "Preparação para Emergência", riskDescription: "Exercícios de abandono sem relatório formal", probability: 4, severity: 5, riskScore: 20, mitigation: "Template de relatório obrigatório pós-exercício", status: "open" },
  { id: "RK12", elementId: 12, elementSigla: "AI", elementName: "Análise de Incidentes", riskDescription: "Investigações sem análise de causa raiz completa", probability: 3, severity: 4, riskScore: 12, mitigation: "Método Bow-Tie/5 Porquês obrigatório", status: "open" },
  { id: "RK13", elementId: 13, elementSigla: "MC", elementName: "Melhoria Contínua", riskDescription: "Ações corretivas em atraso sem justificativa", probability: 3, severity: 3, riskScore: 9, mitigation: "Workflow de escalação automática por prazo", status: "mitigated" },
];

export function PeotramRiskHeatMap() {
  const [risks] = useState(RISKS);
  const [selectedCell, setSelectedCell] = useState<{ p: number; s: number } | null>(null);

  const stats = useMemo(() => {
    const critical = risks.filter(r => r.riskScore >= 15 && r.status === "open").length;
    const high = risks.filter(r => r.riskScore >= 10 && r.riskScore < 15 && r.status === "open").length;
    const mitigated = risks.filter(r => r.status === "mitigated").length;
    const avgScore = Math.round(risks.reduce((a, r) => a + r.riskScore, 0) / risks.length);
    return { critical, high, mitigated, avgScore, total: risks.length };
  }, [risks]);

  // Build heat map matrix
  const matrix = useMemo(() => {
    const m: Map<string, RiskItem[]> = new Map();
    risks.forEach(r => {
      const key = `${r.probability}-${r.severity}`;
      const existing = m.get(key) || [];
      existing.push(r);
      m.set(key, existing);
    });
    return m;
  }, [risks]);

  const cellRisks = selectedCell ? matrix.get(`${selectedCell.p}-${selectedCell.s}`) || [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Mapa de Riscos PEOTRAM
          </h3>
          <p className="text-sm text-muted-foreground">
            Matriz Probabilidade × Severidade — 13 Elementos ANP/Petrobras
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(RISKS, "PEOTRAM Risk HeatMap")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={stats.critical > 0 ? "border-destructive/30 bg-destructive/5" : "border-success/20"}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.critical > 0 ? "text-destructive" : "text-success"}`}>{stats.critical}</p>
            <p className="text-[10px] text-muted-foreground">Riscos Críticos</p>
          </CardContent>
        </Card>
        <Card className={stats.high > 0 ? "border-warning/20" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.high > 0 ? "text-warning" : ""}`}>{stats.high}</p>
          <p className="text-[10px] text-muted-foreground">Riscos Altos</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.mitigated}</p>
          <p className="text-[10px] text-muted-foreground">Mitigados</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.avgScore >= 12 ? "text-destructive" : stats.avgScore >= 8 ? "text-warning" : "text-success"}`}>{stats.avgScore}</p>
          <p className="text-[10px] text-muted-foreground">Score Médio</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Riscos</p>
        </CardContent></Card>
      </div>

      {/* Heat Map Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Matriz de Riscos — Clique para ver detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left w-24">P \ S</th>
                  {[1, 2, 3, 4, 5].map(s => (
                    <th key={s} className="p-1 text-center min-w-[80px]">
                      <span className="text-[10px]">{SEV_LABELS[s]}</span>
                      <br /><span className="text-muted-foreground">{s}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map(p => (
                  <tr key={p}>
                    <td className="p-1 font-medium">
                      <span className="text-[10px]">{PROB_LABELS[p]}</span>
                      <br /><span className="text-muted-foreground">{p}</span>
                    </td>
                    {[1, 2, 3, 4, 5].map(s => {
                      const score = p * s;
                      const cellItems = matrix.get(`${p}-${s}`) || [];
                      const isSelected = selectedCell?.p === p && selectedCell?.s === s;
                      return (
                        <td key={s} className="p-0.5">
                          <button
                            onClick={() => cellItems.length > 0 ? setSelectedCell({ p, s }) : null}
                            className={`w-full h-14 rounded border transition-all text-center ${RISK_COLOR(score)} ${isSelected ? "ring-2 ring-primary" : ""} ${cellItems.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-60"}`}
                            aria-label={`Probabilidade ${p}, Severidade ${s}, Score ${score}`}
                          >
                            <span className="font-bold text-sm">{score}</span>
                            {cellItems.length > 0 && (
                              <div className="text-[9px] mt-0.5 font-semibold">
                                {cellItems.map(r => r.elementSigla).join(", ")}
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-3 text-[10px]">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive" /> Crítico (≥15)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning" /> Alto (10-14)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning/50" /> Médio (5-9)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success/20" /> Baixo (1-4)</div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Detail */}
      {selectedCell && cellRisks.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Riscos — P:{selectedCell.p} × S:{selectedCell.s} = {selectedCell.p * selectedCell.s}
              <Badge className={RISK_COLOR(selectedCell.p * selectedCell.s) + " text-[10px]"}>{RISK_LABEL(selectedCell.p * selectedCell.s)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cellRisks.map(r => (
              <div key={r.id} className="p-2.5 rounded border space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "open" ? "destructive" : r.status === "mitigated" ? "default" : "secondary"} className="text-[10px]">{r.elementSigla}</Badge>
                  <span className="text-sm font-medium">{r.riskDescription}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{r.status === "open" ? "Aberto" : r.status === "mitigated" ? "Mitigado" : "Aceito"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Mitigação:</strong> {r.mitigation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Risks Ranked */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Ranking de Riscos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[...risks].sort((a, b) => b.riskScore - a.riskScore).map(r => (
            <div key={r.id} className="flex items-center gap-2 p-1.5 rounded text-sm hover:bg-muted/50">
              <Badge className={RISK_COLOR(r.riskScore) + " text-[10px] w-8 justify-center"}>{r.riskScore}</Badge>
              <Badge variant={r.status === "open" ? "destructive" : "outline"} className="text-[10px]">{r.elementSigla}</Badge>
              <span className="flex-1 truncate">{r.riskDescription}</span>
              {r.status === "mitigated" && <CheckCircle className="h-3 w-3 text-success" />}
              {r.status === "open" && <AlertTriangle className="h-3 w-3 text-warning" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
