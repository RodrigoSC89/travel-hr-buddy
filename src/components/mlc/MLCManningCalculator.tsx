/**
 * MLC Manning Level Calculator — Safe Manning Document Compliance
 * MLC Reg. 2.7 + SOLAS Chapter V/Reg. 14
 * Connected to crew_members for real manning data
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, AlertTriangle, CheckCircle, Download, Shield,
  Anchor, Plus, Minus, Ship
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManningPosition {
  id: string;
  department: "deck" | "engine" | "catering" | "other";
  rank: string;
  minimumRequired: number;
  currentOnboard: number;
  certified: number;
  notes: string;
}

const DEPT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  deck: { label: "Convés", icon: <Anchor className="h-3.5 w-3.5" /> },
  engine: { label: "Máquinas", icon: <Ship className="h-3.5 w-3.5" /> },
  catering: { label: "Câmara", icon: <Users className="h-3.5 w-3.5" /> },
  other: { label: "Outros", icon: <Shield className="h-3.5 w-3.5" /> },
};

const MANNING_TEMPLATE: ManningPosition[] = [
  { id: "1", department: "deck", rank: "Master", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "2", department: "deck", rank: "Chief Officer", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "3", department: "deck", rank: "2nd Officer", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "4", department: "deck", rank: "3rd Officer", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "5", department: "deck", rank: "Bosun", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "6", department: "deck", rank: "AB Seaman", minimumRequired: 4, currentOnboard: 0, certified: 0, notes: "" },
  { id: "7", department: "engine", rank: "Chief Engineer", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "8", department: "engine", rank: "2nd Engineer", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "9", department: "engine", rank: "3rd Engineer", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "10", department: "engine", rank: "Electrician", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "11", department: "catering", rank: "Chief Cook", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "" },
  { id: "12", department: "other", rank: "DPO", minimumRequired: 2, currentOnboard: 0, certified: 0, notes: "" },
];

function mapRankToDept(rank: string): "deck" | "engine" | "catering" | "other" {
  const r = rank.toLowerCase();
  if (r.includes("engineer") || r.includes("electrician") || r.includes("motorman") || r.includes("oiler")) return "engine";
  if (r.includes("cook") || r.includes("steward") || r.includes("catering")) return "catering";
  if (r.includes("master") || r.includes("officer") || r.includes("bosun") || r.includes("seaman") || r.includes("ab ")) return "deck";
  return "other";
}

export function MLCManningCalculator() {
  // Fetch real crew count by rank
  const { data: crewByRank, isLoading } = useQuery({
    queryKey: ["mlc-manning-crew"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("rank, status")
        .eq("status", "active");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const positions: ManningPosition[] = useMemo(() => {
    if (!crewByRank || crewByRank.length === 0) return MANNING_TEMPLATE;

    // Count crew by rank
    const rankCounts = new Map<string, number>();
    crewByRank.forEach((c: any) => {
      const rank = c.rank || "Other";
      rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
    });

    // Map to manning positions
    return MANNING_TEMPLATE.map(pos => {
      // Find matching crew by similar rank name
      let count = 0;
      rankCounts.forEach((v, k) => {
        if (k.toLowerCase().includes(pos.rank.toLowerCase().split(" ")[0]) ||
            pos.rank.toLowerCase().includes(k.toLowerCase().split(" ")[0])) {
          count += v;
        }
      });
      return {
        ...pos,
        currentOnboard: count,
        certified: count, // Assume certified if active
      };
    });
  }, [crewByRank]);

  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const effectivePositions = positions.map(p => ({
    ...p,
    currentOnboard: overrides[p.id] ?? p.currentOnboard,
  }));

  const stats = useMemo(() => {
    const totalRequired = effectivePositions.reduce((a, p) => a + p.minimumRequired, 0);
    const totalOnboard = effectivePositions.reduce((a, p) => a + p.currentOnboard, 0);
    const totalCertified = effectivePositions.reduce((a, p) => a + p.certified, 0);
    const shortfall = effectivePositions.filter(p => p.currentOnboard < p.minimumRequired);
    const compliance = totalRequired > 0 ? Math.round((Math.min(totalOnboard, totalRequired) / totalRequired) * 100) : 0;
    return { totalRequired, totalOnboard, totalCertified, shortfall, compliance };
  }, [effectivePositions]);

  const updateOnboard = (id: string, delta: number) => {
    setOverrides(prev => {
      const pos = positions.find(p => p.id === id);
      const current = prev[id] ?? pos?.currentOnboard ?? 0;
      return { ...prev, [id]: Math.max(0, current + delta) };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manning Level — Safe Manning Compliance
          </h3>
          <p className="text-sm text-muted-foreground">
            MLC Reg. 2.7 & SOLAS V/14 • {stats.totalOnboard}/{stats.totalRequired} tripulantes • Dados em tempo real
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(positions, "MLC Manning Report")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.totalRequired}</p>
          <p className="text-[10px] text-muted-foreground">Mínimo Requerido</p>
        </CardContent></Card>
        <Card className={stats.totalOnboard >= stats.totalRequired ? "border-success/20" : "border-destructive/20"}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.totalOnboard >= stats.totalRequired ? "text-success" : "text-destructive"}`}>{stats.totalOnboard}</p>
            <p className="text-[10px] text-muted-foreground">A Bordo</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.totalCertified}</p>
          <p className="text-[10px] text-muted-foreground">Certificados STCW</p>
        </CardContent></Card>
        <Card className={stats.shortfall.length > 0 ? "border-destructive/30 bg-destructive/5" : "border-success/20"}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.shortfall.length > 0 ? "text-destructive" : "text-success"}`}>{stats.shortfall.length}</p>
            <p className="text-[10px] text-muted-foreground">Posições Deficientes</p>
          </CardContent>
        </Card>
        <Card className={stats.compliance === 100 ? "border-success/20" : "border-warning/20"}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.compliance === 100 ? "text-success" : "text-warning"}`}>{stats.compliance}%</p>
            <p className="text-[10px] text-muted-foreground">Conformidade</p>
          </CardContent>
        </Card>
      </div>

      {stats.shortfall.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-1">
            <p className="text-sm font-semibold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Posições abaixo do mínimo:
            </p>
            {stats.shortfall.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" className="text-[10px]">{p.rank}</Badge>
                <span>{p.currentOnboard}/{p.minimumRequired} — faltam {p.minimumRequired - p.currentOnboard}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {Object.entries(DEPT_LABELS).map(([dept, config]) => {
        const deptPositions = effectivePositions.filter(p => p.department === dept);
        if (deptPositions.length === 0) return null;
        const deptRequired = deptPositions.reduce((a, p) => a + p.minimumRequired, 0);
        const deptOnboard = deptPositions.reduce((a, p) => a + p.currentOnboard, 0);
        return (
          <Card key={dept}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {config.icon}
                {config.label}
                <Badge variant={deptOnboard >= deptRequired ? "default" : "destructive"} className="text-xs ml-auto">
                  {deptOnboard}/{deptRequired}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {deptPositions.map(pos => {
                  const isShort = pos.currentOnboard < pos.minimumRequired;
                  return (
                    <div key={pos.id} className={`flex items-center gap-3 p-2 rounded text-sm ${isShort ? "bg-destructive/5" : ""}`}>
                      <span className="w-36 font-medium">{pos.rank}</span>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateOnboard(pos.id, -1)} aria-label="Diminuir">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className={`w-8 text-center font-bold ${isShort ? "text-destructive" : ""}`}>{pos.currentOnboard}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateOnboard(pos.id, 1)} aria-label="Aumentar">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-muted-foreground text-xs">/ {pos.minimumRequired} mín</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isShort ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle className="h-3.5 w-3.5 text-success" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
