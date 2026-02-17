/**
 * Evidence Dashboard - Visual analytics for audit evidence packs
 * Donut chart, bar charts per element, gap analysis
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
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, Target, Shield } from "lucide-react";
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

  const scoreColor = pack.overall_score >= 80 ? "text-green-500" : pack.overall_score >= 50 ? "text-yellow-500" : "text-destructive";

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
            <Progress value={pack.overall_score} className="mt-3 h-3 w-48 mx-auto" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                <p className="text-lg font-bold">{pack.matched_items}</p>
                <p className="text-[10px] text-muted-foreground">Encontradas</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" />
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
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
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
              {criticalGaps.map(item => (
                <div key={item.id} className="flex items-start gap-2 p-2 bg-destructive/5 rounded-md">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.item_number} — {item.item_text}</p>
                    {item.ai_suggestion && (
                      <p className="text-xs text-muted-foreground mt-0.5">💡 {item.ai_suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

EvidenceDashboard.displayName = "EvidenceDashboard";
