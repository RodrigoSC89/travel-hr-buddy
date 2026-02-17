/**
 * Evidence Dashboard v2 - Visual analytics + AI recommendations
 */
import React, { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, Target, Shield, Lightbulb, ArrowUpCircle } from "lucide-react";
import type { EvidencePack, EvidenceElement, EvidenceItem } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  pack: EvidencePack;
  elements: EvidenceElement[];
  items: EvidenceItem[];
}

const COLORS = {
  found: "hsl(var(--chart-2))",
  partial: "hsl(var(--chart-4))",
  not_found: "hsl(var(--chart-1))",
  pending: "hsl(var(--muted-foreground))",
};

export const EvidenceDashboard = memo(({ pack, elements, items }: Props) => {
  const pieData = useMemo(() => [
    { name: "Encontradas", value: pack.matched_items, color: COLORS.found },
    { name: "Parciais", value: pack.partial_items, color: COLORS.partial },
    { name: "Não Encontradas", value: pack.unmatched_items, color: COLORS.not_found },
    { name: "Pendentes", value: Math.max(0, pack.total_items - pack.matched_items - pack.partial_items - pack.unmatched_items), color: COLORS.pending },
  ].filter(d => d.value > 0), [pack]);

  const barData = useMemo(() =>
    elements
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(el => ({
        name: el.element_code || `E${el.element_number}`,
        fullName: el.element_name,
        Encontradas: el.matched_count,
        Parciais: el.partial_count,
        "Não Encontradas": el.unmatched_count,
        score: el.compliance_score,
      })),
    [elements]
  );

  const radarData = useMemo(() =>
    elements
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 12)
      .map(el => ({
        subject: el.element_code || `E${el.element_number}`,
        score: el.compliance_score,
        fullMark: 100,
      })),
    [elements]
  );

  const criticalGaps = useMemo(() =>
    items
      .filter(i => i.is_critical && (i.evidence_status === "not_found" || i.evidence_status === "pending"))
      .slice(0, 8),
    [items]
  );

  // AI Recommendations - prioritized improvement suggestions
  const recommendations = useMemo(() => {
    const recs: { priority: "high" | "medium" | "low"; text: string; impact: string }[] = [];

    // 1. Critical items without evidence
    const criticalCount = items.filter(i => i.is_critical && i.evidence_status === "not_found").length;
    if (criticalCount > 0) {
      recs.push({
        priority: "high",
        text: `${criticalCount} itens CRÍTICOS sem evidência — resolva estes primeiro para evitar não-conformidades maiores`,
        impact: `+${Math.min(15, criticalCount * 3)}% no score estimado`,
      });
    }

    // 2. Elements below 50%
    const lowElements = elements.filter(e => e.compliance_score < 50);
    if (lowElements.length > 0) {
      recs.push({
        priority: "high",
        text: `${lowElements.length} elemento(s) abaixo de 50%: ${lowElements.map(e => e.element_code || `E${e.element_number}`).join(", ")}`,
        impact: "Risco alto de não-conformidade nestes elementos",
      });
    }

    // 3. Partial items that could be upgraded
    const partialCount = items.filter(i => i.evidence_status === "partial").length;
    if (partialCount > 0) {
      recs.push({
        priority: "medium",
        text: `${partialCount} itens com evidência parcial — complemente com documentos adicionais da biblioteca`,
        impact: `+${Math.min(10, partialCount * 2)}% no score estimado`,
      });
    }

    // 4. Items with AI suggestions
    const withSuggestions = items.filter(i => i.ai_suggestion && i.evidence_status !== "found").length;
    if (withSuggestions > 0) {
      recs.push({
        priority: "medium",
        text: `${withSuggestions} itens possuem sugestões da IA — revise-as para acelerar o preenchimento`,
        impact: "Redução de tempo de preparação",
      });
    }

    // 5. Overall readiness
    if (pack.overall_score >= 80) {
      recs.push({
        priority: "low",
        text: "Pacote com boa cobertura! Foque em completar os gaps restantes e validar as respostas IA",
        impact: "Pronto para revisão final",
      });
    }

    return recs;
  }, [items, elements, pack]);

  const scoreColor = pack.overall_score >= 80 ? "text-success" : pack.overall_score >= 50 ? "text-warning" : "text-destructive";
  const readinessLabel = pack.overall_score >= 90 ? "Pronto" : pack.overall_score >= 70 ? "Quase Pronto" : pack.overall_score >= 50 ? "Em Progresso" : "Atenção Urgente";
  const readinessColor = pack.overall_score >= 90 ? "bg-success" : pack.overall_score >= 70 ? "bg-warning" : pack.overall_score >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className="space-y-4">
      {/* Top Row - Score + Donut + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Score */}
        <Card className="flex flex-col items-center justify-center">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Score Geral</p>
            <p className={cn("text-5xl font-black", scoreColor)}>
              {pack.overall_score.toFixed(0)}%
            </p>
            <Badge className={cn("mt-2 text-xs text-white", readinessColor)}>
              {readinessLabel}
            </Badge>
            <Progress value={pack.overall_score} className="mt-3 h-3 w-48 mx-auto" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                <p className="text-lg font-bold">{pack.matched_items}</p>
                <p className="text-[10px] text-muted-foreground">Encontradas</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-4 w-4 text-warning mx-auto" />
                <p className="text-lg font-bold">{pack.partial_items}</p>
                <p className="text-[10px] text-muted-foreground">Parciais</p>
              </div>
              <div className="text-center">
                <XCircle className="h-4 w-4 text-destructive mx-auto" />
                <p className="text-lg font-bold">{pack.unmatched_items}</p>
                <p className="text-[10px] text-muted-foreground">Faltando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card>
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm">Distribuição de Evidências</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm">Cobertura por Elemento</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Recomendações de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 bg-background rounded-lg">
                  <ArrowUpCircle className={cn(
                    "h-4 w-4 shrink-0 mt-0.5",
                    rec.priority === "high" ? "text-destructive" :
                    rec.priority === "medium" ? "text-warning" : "text-success"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{rec.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      📊 {rec.impact}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[9px] shrink-0",
                    rec.priority === "high" ? "border-destructive/50 text-destructive" :
                    rec.priority === "medium" ? "border-warning/50 text-warning" : "border-success/50 text-success"
                  )}>
                    {rec.priority === "high" ? "ALTA" : rec.priority === "medium" ? "MÉDIA" : "BAIXA"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bar Chart - Per Element Breakdown */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Evidências por Elemento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 40)}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={50} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                labelFormatter={(label) => {
                  const item = barData.find(d => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Encontradas" stackId="a" fill={COLORS.found} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Parciais" stackId="a" fill={COLORS.partial} />
              <Bar dataKey="Não Encontradas" stackId="a" fill={COLORS.not_found} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <Shield className="h-4 w-4" />
              Gaps Críticos ({criticalGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2">
              {criticalGaps.map(item => {
                const el = elements.find(e => e.id === item.element_id);
                return (
                  <div key={item.id} className="flex items-start gap-2 p-2 bg-destructive/5 rounded-md">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      {el && (
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          {el.element_code || `E${el.element_number}`} — {el.element_name}
                        </p>
                      )}
                      <p className="text-sm font-medium">{item.item_number} — {item.item_text}</p>
                      {item.ai_suggestion && (
                        <p className="text-xs text-muted-foreground mt-0.5">💡 {item.ai_suggestion}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

EvidenceDashboard.displayName = "EvidenceDashboard";
