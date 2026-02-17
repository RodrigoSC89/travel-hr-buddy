/**
 * Pack Diff Comparison - Side-by-side diff between two audit packs
 * v2: Auto-select, element improvement badges, trend sparkline
 */
import React, { useState, useMemo, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp, TrendingDown, Minus, ArrowRight, GitCompareArrows,
  CheckCircle2, AlertTriangle, XCircle, Award, Flame
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { EvidencePack, EvidenceElement } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  packs: EvidencePack[];
  onLoadPackElements: (packId: string) => Promise<EvidenceElement[]>;
}

export const PackDiffComparison = memo(({ packs, onLoadPackElements }: Props) => {
  const sortedPacks = useMemo(() =>
    [...packs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [packs]
  );

  const [packAId, setPackAId] = useState<string>("");
  const [packBId, setPackBId] = useState<string>("");
  const [elementsA, setElementsA] = useState<EvidenceElement[]>([]);
  const [elementsB, setElementsB] = useState<EvidenceElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoCompared, setAutoCompared] = useState(false);

  // Auto-select the 2 most recent packs
  useEffect(() => {
    if (sortedPacks.length >= 2 && !packAId && !packBId && !autoCompared) {
      setPackAId(sortedPacks[0].id);
      setPackBId(sortedPacks[1].id);
    }
  }, [sortedPacks, packAId, packBId, autoCompared]);

  // Auto-compare when both are selected via auto-select
  useEffect(() => {
    if (packAId && packBId && !autoCompared && elementsA.length === 0) {
      setAutoCompared(true);
      handleCompare();
    }
  }, [packAId, packBId]);

  const packA = packs.find(p => p.id === packAId);
  const packB = packs.find(p => p.id === packBId);

  const handleCompare = async () => {
    if (!packAId || !packBId) return;
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        onLoadPackElements(packAId),
        onLoadPackElements(packBId),
      ]);
      setElementsA(a);
      setElementsB(b);
    } finally {
      setLoading(false);
    }
  };

  const diffData = useMemo(() => {
    if (!elementsA.length || !elementsB.length) return [];
    return elementsA.map(elA => {
      const elB = elementsB.find(
        e => e.element_code === elA.element_code || e.element_number === elA.element_number
      );
      const scoreA = elA.compliance_score;
      const scoreB = elB?.compliance_score ?? 0;
      return {
        name: elA.element_code || `E${elA.element_number}`,
        fullName: elA.element_name,
        "Pack A": scoreA,
        "Pack B": scoreB,
        diff: scoreA - scoreB,
        matchedA: elA.matched_count,
        matchedB: elB?.matched_count ?? 0,
        unmatchedA: elA.unmatched_count,
        unmatchedB: elB?.unmatched_count ?? 0,
      };
    });
  }, [elementsA, elementsB]);

  const summary = useMemo(() => {
    if (!packA || !packB) return null;
    const scoreDiff = packA.overall_score - packB.overall_score;
    const matchedDiff = packA.matched_items - packB.matched_items;
    const unmatchedDiff = packA.unmatched_items - packB.unmatched_items;
    const improved = diffData.filter(d => d.diff > 2).length;
    const regressed = diffData.filter(d => d.diff < -2).length;
    const stable = diffData.filter(d => Math.abs(d.diff) <= 2).length;
    return { scoreDiff, matchedDiff, unmatchedDiff, improved, regressed, stable };
  }, [packA, packB, diffData]);

  if (packs.length < 2) return null;

  return (
    <Card>
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          Comparação Lado-a-Lado
          {summary && (
            <Badge variant="outline" className="text-[10px] ml-auto">
              {summary.improved} melhorados · {summary.regressed} regredidos · {summary.stable} estáveis
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">MAIS RECENTE</p>
            <Select value={packAId} onValueChange={(v) => { setPackAId(v); setAutoCompared(false); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Pack A (mais recente)" />
              </SelectTrigger>
              <SelectContent>
                {sortedPacks.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} ({p.overall_score.toFixed(0)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground mt-4" />

          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">ANTERIOR</p>
            <Select value={packBId} onValueChange={(v) => { setPackBId(v); setAutoCompared(false); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Pack B (anterior)" />
              </SelectTrigger>
              <SelectContent>
                {sortedPacks.filter(p => p.id !== packAId).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} ({p.overall_score.toFixed(0)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            onClick={handleCompare}
            disabled={!packAId || !packBId || loading}
            className="gap-1 mt-4"
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            {loading ? "Comparando..." : "Comparar"}
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && packA && packB && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-2 px-3 text-center">
                <p className="text-[10px] text-muted-foreground">Δ Score</p>
                <p className={cn("text-2xl font-bold", summary.scoreDiff > 0 ? "text-success" : summary.scoreDiff < 0 ? "text-destructive" : "text-muted-foreground")}>
                  {summary.scoreDiff > 0 ? "+" : ""}{summary.scoreDiff.toFixed(1)}%
                </p>
                {summary.scoreDiff > 0 ? <TrendingUp className="h-4 w-4 text-success mx-auto" /> : summary.scoreDiff < 0 ? <TrendingDown className="h-4 w-4 text-destructive mx-auto" /> : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-2 px-3 text-center">
                <p className="text-[10px] text-muted-foreground">Δ Encontradas</p>
                <p className={cn("text-2xl font-bold", summary.matchedDiff > 0 ? "text-success" : "text-muted-foreground")}>
                  {summary.matchedDiff > 0 ? "+" : ""}{summary.matchedDiff}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-2 px-3 text-center">
                <p className="text-[10px] text-muted-foreground">Δ Gaps</p>
                <p className={cn("text-2xl font-bold", summary.unmatchedDiff < 0 ? "text-success" : summary.unmatchedDiff > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {summary.unmatchedDiff > 0 ? "+" : ""}{summary.unmatchedDiff}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-2 px-3 text-center">
                <p className="text-[10px] text-muted-foreground">Melhorados</p>
                <div className="flex items-center justify-center gap-1">
                  <Award className="h-4 w-4 text-success" />
                  <p className="text-2xl font-bold text-success">{summary.improved}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-2 px-3 text-center">
                <p className="text-[10px] text-muted-foreground">Regredidos</p>
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-destructive" />
                  <p className="text-2xl font-bold text-destructive">{summary.regressed}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Diff Chart */}
        {diffData.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(200, diffData.length * 40)}>
            <BarChart data={diffData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={50} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                labelFormatter={(label) => diffData.find(d => d.name === label)?.fullName || label}
                formatter={(value: number, name: string) => [`${value.toFixed(0)}%`, name]}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="Pack A" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Pack B" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Element-level diff list with improvement badges */}
        {diffData.length > 0 && (
          <ScrollArea className="h-[220px]">
            <div className="space-y-1">
              {diffData
                .sort((a, b) => b.diff - a.diff)
                .map(d => (
                <div key={d.name} className="flex items-center gap-3 p-2 bg-muted/20 rounded text-sm">
                  {d.diff > 5 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                  ) : d.diff < -5 ? (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-mono text-xs w-10">{d.name}</span>
                  <span className="flex-1 truncate text-xs">{d.fullName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">{d["Pack A"].toFixed(0)}%</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-xs text-muted-foreground">{d["Pack B"].toFixed(0)}%</span>
                  </div>
                  <Badge
                    variant={d.diff > 5 ? "default" : d.diff < -5 ? "destructive" : "secondary"}
                    className="text-[10px] min-w-[48px] justify-center"
                  >
                    {d.diff > 0 ? "+" : ""}{d.diff.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});

PackDiffComparison.displayName = "PackDiffComparison";
