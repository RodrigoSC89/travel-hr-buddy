/**
 * LVS AI Risk Heatmap por Seção
 * Mapa de calor visual com drill-down para itens críticos
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Flame, ShieldAlert, CheckCircle2, XCircle, Clock, Target, Zap
} from "lucide-react";
import { ALL_LVS_SECTIONS, type LVItem, type Section } from "./lvs-data";

interface HeatmapCell {
  code: string;
  title: string;
  score: number;
  ncCount: number;
  pendingCount: number;
  conformeCount: number;
  naCount: number;
  totalApplicable: number;
  riskLevel: "safe" | "caution" | "warning" | "danger" | "critical";
  items: LVItem[];
}

const RISK_CONFIG = {
  safe: { bg: "bg-emerald-500", text: "text-white", label: "Seguro", emoji: "✅" },
  caution: { bg: "bg-emerald-400/70", text: "text-white", label: "Atenção", emoji: "🟢" },
  warning: { bg: "bg-amber-500", text: "text-white", label: "Alerta", emoji: "⚠️" },
  danger: { bg: "bg-orange-600", text: "text-white", label: "Perigo", emoji: "🔶" },
  critical: { bg: "bg-destructive animate-pulse", text: "text-destructive-foreground", label: "Crítico", emoji: "🔴" }
};

const flattenItems = (section: Section): LVItem[] =>
  section.subsections.flatMap(sub => sub.items);

const getRiskLevel = (score: number, ncCount: number): HeatmapCell["riskLevel"] => {
  if (ncCount >= 5 || score < 30) return "critical";
  if (ncCount >= 3 || score < 50) return "danger";
  if (ncCount >= 1 || score < 70) return "warning";
  if (score < 90) return "caution";
  return "safe";
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "approved") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "rejected") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  if (status === "not_applicable") return <span className="text-[10px] text-muted-foreground font-mono">N/A</span>;
  return <Clock className="h-3.5 w-3.5 text-amber-500" />;
};

export const LVSRiskHeatmap: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const heatmapData = useMemo<HeatmapCell[]>(() => {
    return ALL_LVS_SECTIONS.map((section) => {
      const items = flattenItems(section);
      const conforme = items.filter((i: LVItem) => i.status === "approved").length;
      const nc = items.filter((i: LVItem) => i.status === "rejected").length;
      const na = items.filter((i: LVItem) => i.status === "not_applicable").length;
      const pending = items.filter((i: LVItem) => i.status === "pending" || i.status === "not_verified").length;
      const totalApplicable = items.length - na;
      const score = totalApplicable > 0 ? Math.round((conforme / totalApplicable) * 100) : 100;

      return {
        code: section.code, title: section.title, score,
        ncCount: nc, pendingCount: pending, conformeCount: conforme,
        naCount: na, totalApplicable, riskLevel: getRiskLevel(score, nc), items
      };
    });
  }, []);

  const filtered = useMemo(() => {
    if (filterRisk === "all") return heatmapData;
    return heatmapData.filter(c => c.riskLevel === filterRisk);
  }, [heatmapData, filterRisk]);

  const riskDistribution = useMemo(() => {
    const dist = { safe: 0, caution: 0, warning: 0, danger: 0, critical: 0 };
    heatmapData.forEach(c => dist[c.riskLevel]++);
    return dist;
  }, [heatmapData]);

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["safe", "caution", "warning", "danger", "critical"] as const).map(level => (
          <Button
            key={level}
            variant={filterRisk === level ? "default" : "outline"}
            className="h-auto py-3 flex-col gap-1"
            onClick={() => setFilterRisk(filterRisk === level ? "all" : level)}
          >
            <span className="text-2xl font-black">{riskDistribution[level]}</span>
            <span className="text-[10px]">{RISK_CONFIG[level].emoji} {RISK_CONFIG[level].label}</span>
          </Button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Mapa de Calor — Risco de Reprovação por Seção
            {filterRisk !== "all" && (
              <Badge variant="secondary" className="text-[10px] cursor-pointer" onClick={() => setFilterRisk("all")}>
                Filtro: {RISK_CONFIG[filterRisk as keyof typeof RISK_CONFIG]?.label} ✕
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
            {filtered.map(cell => {
              const config = RISK_CONFIG[cell.riskLevel];
              return (
                <button
                  key={cell.code}
                  onClick={() => setExpandedSection(expandedSection === cell.code ? null : cell.code)}
                  className={`${config.bg} ${config.text} rounded-lg p-3 text-center transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
                    expandedSection === cell.code ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  <div className="text-xl font-black">{cell.score}%</div>
                  <div className="text-[10px] font-semibold truncate">S{cell.code}</div>
                  <div className="text-[9px] opacity-80 truncate">{cell.title}</div>
                  {cell.ncCount > 0 && (
                    <div className="text-[9px] mt-1 font-bold">{cell.ncCount} NC</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Drill-down */}
          {expandedSection && (() => {
            const section = heatmapData.find(c => c.code === expandedSection);
            if (!section) return null;
            const problemItems = section.items.filter(i => i.status !== "approved" && i.status !== "not_applicable");
            return (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Drill-down: Seção {expandedSection} — {section.title}
                    <Badge variant="outline" className="ml-auto">
                      {section.ncCount} NCs | {section.pendingCount} Pendentes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-1">
                      {problemItems
                        .sort((a, b) => (a.status === "rejected" ? -1 : 1))
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 p-2 rounded text-xs ${
                              item.status === "rejected" ? "bg-destructive/10" : "bg-muted/30"
                            }`}
                          >
                            <StatusIcon status={item.status} />
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-muted-foreground">{item.ref}</span>
                              <span className="ml-2">{item.question}</span>
                            </div>
                            <Badge variant="outline" className="text-[9px] shrink-0">
                              {item.status === "rejected" ? "Não Conforme" : "Pendente"}
                            </Badge>
                          </div>
                        ))}
                      {problemItems.length === 0 && (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                          Todos os itens aplicáveis estão conformes!
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })()}
        </CardContent>
      </Card>

      {/* Priorização */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />Priorização de Resolução — Quick Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {heatmapData
              .filter(c => c.riskLevel === "critical" || c.riskLevel === "danger")
              .sort((a, b) => a.score - b.score)
              .map((section, idx) => (
                <div key={section.code} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className={`text-lg font-black ${
                    section.riskLevel === "critical" ? "text-destructive" : "text-orange-500"
                  }`}>#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">S{section.code} — {section.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {section.ncCount} não-conformidades • {section.pendingCount} pendentes
                    </div>
                  </div>
                  <Badge className={section.riskLevel === "critical" ? "bg-destructive" : "bg-orange-500"}>{section.score}%</Badge>
                </div>
              ))}
            {heatmapData.filter(c => c.riskLevel === "critical" || c.riskLevel === "danger").length === 0 && (
              <div className="text-center text-muted-foreground py-6 text-sm">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                Nenhuma seção em nível de perigo ou crítico!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
