/**
 * PEOTRAM Radar Chart - Spider chart of 13 elements
 * Uses Recharts RadarChart for official PEOTRAM visualization
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, ResponsiveContainer, Tooltip
} from "recharts";
import { PEOTRAM_ELEMENTS } from "@/data/peotram-elements-data";
import { Target } from "lucide-react";

interface PeotramRadarChartProps {
  elementScores: Record<string, number>;
  comparisonScores?: Record<string, number>;
  comparisonLabel?: string;
  currentLabel?: string;
}

export function PeotramRadarChart({
  elementScores,
  comparisonScores,
  comparisonLabel = "Ciclo Anterior",
  currentLabel = "Ciclo Atual",
}: PeotramRadarChartProps) {
  const data = PEOTRAM_ELEMENTS.map(el => ({
    subject: el.sigla,
    fullName: `${el.id}. ${el.name}`,
    current: elementScores[String(el.id)] || 0,
    ...(comparisonScores ? { previous: comparisonScores[String(el.id)] || 0 } : {}),
    fullMark: 100,
    isCritical: el.isCritical,
    weight: el.weightPercentage,
  }));

  const overallScore = Object.values(elementScores).length > 0
    ? Math.round(Object.values(elementScores).reduce((a, b) => a + b, 0) / Object.values(elementScores).length)
    : 0;

  const criticalScores = PEOTRAM_ELEMENTS
    .filter(e => e.isCritical)
    .map(e => ({ name: e.sigla, score: elementScores[String(e.id)] || 0 }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-warning" />
              Gráfico Radar PEOTRAM — 13 Elementos
            </CardTitle>
            <CardDescription>Visualização oficial do desempenho por elemento</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-warning">{overallScore}%</div>
            <p className="text-xs text-muted-foreground">Score Geral</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={({ x, y, payload }) => {
                  const item = data.find(d => d.subject === payload.value);
                  return (
                    <text
                      x={x} y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[11px] font-medium"
                      fill={item?.isCritical ? "hsl(var(--destructive))" : "hsl(var(--foreground))"}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg p-3 shadow-lg text-xs">
                      <p className="font-semibold">{d.fullName}</p>
                      <p className="text-primary">Atual: {d.current}%</p>
                      {d.previous !== undefined && (
                        <p className="text-muted-foreground">Anterior: {d.previous}%</p>
                      )}
                      <p className="text-muted-foreground">Peso: {d.weight}%</p>
                      {d.isCritical && <Badge variant="destructive" className="text-[9px] mt-1">CRÍTICO</Badge>}
                    </div>
                  );
                }}
              />
              <Radar
                name={currentLabel}
                dataKey="current"
                stroke="hsl(var(--warning))"
                fill="hsl(var(--warning))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              {comparisonScores && (
                <Radar
                  name={comparisonLabel}
                  dataKey="previous"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              )}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Critical elements summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {criticalScores.map(cs => (
            <div key={cs.name} className="flex items-center justify-between p-2 border rounded-lg border-destructive/20 bg-destructive/5">
              <span className="text-xs font-semibold text-destructive">{cs.name}</span>
              <span className={`text-sm font-bold ${
                cs.score >= 90 ? "text-success" : cs.score >= 60 ? "text-warning" : "text-destructive"
              }`}>{cs.score}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
