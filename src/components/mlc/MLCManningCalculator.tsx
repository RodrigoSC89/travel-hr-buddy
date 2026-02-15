/**
 * MLC Manning Level Calculator — Safe Manning Document Compliance
 * MLC Reg. 2.7 + SOLAS Chapter V/Reg. 14
 * Validates crew onboard vs minimum safe manning requirements
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  certified: number; // how many have valid STCW certs
  notes: string;
}

const DEFAULT_MANNING: ManningPosition[] = [
  { id: "1", department: "deck", rank: "Master", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "2", department: "deck", rank: "Chief Officer", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "3", department: "deck", rank: "2nd Officer", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "4", department: "deck", rank: "3rd Officer", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "5", department: "deck", rank: "Bosun", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "6", department: "deck", rank: "AB Seaman", minimumRequired: 4, currentOnboard: 3, certified: 3, notes: "1 vaga aberta — embarque previsto 20/02" },
  { id: "7", department: "deck", rank: "OS Seaman", minimumRequired: 2, currentOnboard: 2, certified: 2, notes: "" },
  { id: "8", department: "engine", rank: "Chief Engineer", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "9", department: "engine", rank: "2nd Engineer", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "10", department: "engine", rank: "3rd Engineer", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "11", department: "engine", rank: "Motorman/Oiler", minimumRequired: 3, currentOnboard: 3, certified: 3, notes: "" },
  { id: "12", department: "engine", rank: "Electrician", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "13", department: "catering", rank: "Chief Cook", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "Certificado STCW III/2 válido" },
  { id: "14", department: "catering", rank: "Steward", minimumRequired: 1, currentOnboard: 1, certified: 1, notes: "" },
  { id: "15", department: "other", rank: "DPO", minimumRequired: 2, currentOnboard: 2, certified: 2, notes: "IMCA DP scheme — ambos Advanced" },
  { id: "16", department: "other", rank: "Medic", minimumRequired: 1, currentOnboard: 0, certified: 0, notes: "Não requerido para esta classe" },
];

const DEPT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  deck: { label: "Convés", icon: <Anchor className="h-3.5 w-3.5" /> },
  engine: { label: "Máquinas", icon: <Ship className="h-3.5 w-3.5" /> },
  catering: { label: "Câmara", icon: <Users className="h-3.5 w-3.5" /> },
  other: { label: "Outros", icon: <Shield className="h-3.5 w-3.5" /> },
};

export function MLCManningCalculator() {
  const [positions, setPositions] = useState(DEFAULT_MANNING);
  const [vesselName, setVesselName] = useState("Nautilus Explorer");

  // Try to get real crew count
  const { data: crewCount } = useQuery({
    queryKey: ["manning-crew-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("crew_members").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
  });

  const stats = useMemo(() => {
    const totalRequired = positions.reduce((a, p) => a + p.minimumRequired, 0);
    const totalOnboard = positions.reduce((a, p) => a + p.currentOnboard, 0);
    const totalCertified = positions.reduce((a, p) => a + p.certified, 0);
    const shortfall = positions.filter(p => p.currentOnboard < p.minimumRequired);
    const certGap = positions.filter(p => p.certified < p.currentOnboard);
    const compliance = totalRequired > 0 ? Math.round((Math.min(totalOnboard, totalRequired) / totalRequired) * 100) : 0;

    const byDept = Object.keys(DEPT_LABELS).map(dept => {
      const deptPositions = positions.filter(p => p.department === dept);
      return {
        dept,
        required: deptPositions.reduce((a, p) => a + p.minimumRequired, 0),
        onboard: deptPositions.reduce((a, p) => a + p.currentOnboard, 0),
      };
    });

    return { totalRequired, totalOnboard, totalCertified, shortfall, certGap, compliance, byDept };
  }, [positions]);

  const updateOnboard = (id: string, delta: number) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, currentOnboard: Math.max(0, p.currentOnboard + delta) } : p));
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
            MLC Reg. 2.7 & SOLAS V/14 • {vesselName} • {stats.totalOnboard}/{stats.totalRequired} tripulantes
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Manning report exportado")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.certGap.length}</p>
          <p className="text-[10px] text-muted-foreground">Gaps Certificação</p>
        </CardContent></Card>
        <Card className={stats.compliance === 100 ? "border-success/20" : "border-warning/20"}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.compliance === 100 ? "text-success" : "text-warning"}`}>{stats.compliance}%</p>
            <p className="text-[10px] text-muted-foreground">Conformidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Shortfall Alert */}
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
                {p.notes && <span className="text-muted-foreground text-xs">({p.notes})</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Manning Table by Department */}
      {Object.entries(DEPT_LABELS).map(([dept, config]) => {
        const deptPositions = positions.filter(p => p.department === dept);
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
                  const hasCertGap = pos.certified < pos.currentOnboard;
                  return (
                    <div key={pos.id} className={`flex items-center gap-3 p-2 rounded text-sm ${isShort ? "bg-destructive/5" : ""}`}>
                      <span className="w-36 font-medium">{pos.rank}</span>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateOnboard(pos.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className={`w-8 text-center font-bold ${isShort ? "text-destructive" : ""}`}>{pos.currentOnboard}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateOnboard(pos.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-muted-foreground text-xs">/ {pos.minimumRequired} mín</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isShort ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle className="h-3.5 w-3.5 text-success" />}
                        {hasCertGap && <Badge variant="outline" className="text-[10px] border-warning text-warning">Cert Gap</Badge>}
                      </div>
                      {pos.notes && <span className="text-xs text-muted-foreground flex-1 truncate">{pos.notes}</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* MLC Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Requisitos MLC 2006 — Reg. 2.7</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            {[
              "Safe Manning Document (SMD) emitido pelo Estado de Bandeira",
              "Tripulação mínima para operação segura 24/7",
              "Qualificações STCW verificadas para todos os postos",
              "Registros de embarque e desembarque atualizados",
              "Conformidade com horas de trabalho/descanso (Reg. 2.3)",
              "Plano de contingência para shortfalls de manning",
            ].map((r, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 flex items-start gap-2">
                <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
