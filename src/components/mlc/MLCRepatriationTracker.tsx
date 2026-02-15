/**
 * MLC Repatriation & Financial Security Tracker — Reg. 2.5 / 2.6
 * Connected to crew_members for real repatriation data
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plane, CheckCircle, AlertTriangle, Clock, Download,
  Shield, MapPin, Users
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RepatriationRecord {
  id: string;
  crewMember: string;
  rank: string;
  nationality: string;
  homePort: string;
  contractStart: string;
  contractEnd: string;
  maxMonthsOnboard: number;
  currentMonths: number;
  status: "ok" | "due_soon" | "overdue";
}

interface FinancialSecurity {
  id: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverage: string;
  validFrom: string;
  validTo: string;
  status: "valid" | "expiring" | "expired";
  regulation: string;
}

const FINANCIAL_SECURITY: FinancialSecurity[] = [
  { id: "FS01", type: "P&I Insurance", provider: "Gard P&I Club", policyNumber: "GP-2026-00142", coverage: "US$ 3 billion — unlimited for crew claims", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A2.5.2, A4.2" },
  { id: "FS02", type: "Financial Security — Repatriation", provider: "Gard P&I Club", policyNumber: "GP-REP-2026-009", coverage: "Repatriation costs + up to 4 months outstanding wages", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A2.5.2" },
  { id: "FS03", type: "Financial Security — Abandonment", provider: "Gard P&I Club", policyNumber: "GP-ABD-2026-009", coverage: "Essential needs + repatriation upon abandonment", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A2.5.2" },
  { id: "FS04", type: "Crew Medical Insurance", provider: "PEME Medical", policyNumber: "PM-2026-3315", coverage: "Medical treatment ashore + medical repatriation", validFrom: "2026-01-01", validTo: "2026-12-31", status: "valid", regulation: "MLC Reg. 4.1, 4.2" },
  { id: "FS05", type: "Wages Protection — Bank Guarantee", provider: "Banco do Brasil", policyNumber: "BB-GAR-2026-554", coverage: "4 months wages guarantee", validFrom: "2025-06-01", validTo: "2026-06-01", status: "expiring", regulation: "MLC Standard A2.5.2" },
];

const STATUS_CREW: Record<string, { label: string; color: string }> = {
  ok: { label: "OK", color: "text-success" },
  due_soon: { label: "Próximo", color: "text-warning" },
  overdue: { label: "Vencido", color: "text-destructive" },
};

export function MLCRepatriationTracker() {
  const [financial] = useState(FINANCIAL_SECURITY);

  // Fetch crew for repatriation tracking
  const { data: crewData, isLoading } = useQuery({
    queryKey: ["mlc-repatriation-crew"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, first_name, last_name, rank, nationality, contract_start, contract_end, status")
        .eq("status", "active")
        .not("contract_start", "is", null)
        .order("contract_end", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const crew: RepatriationRecord[] = useMemo(() => {
    if (!crewData || crewData.length === 0) return [];
    const now = new Date();
    return crewData.map((c: any) => {
      const start = new Date(c.contract_start);
      const end = new Date(c.contract_end || now);
      const currentMonths = Math.round((now.getTime() - start.getTime()) / (30 * 86400000));
      const maxMonths = 8;
      let status: "ok" | "due_soon" | "overdue" = "ok";
      if (currentMonths >= maxMonths) status = "overdue";
      else if (currentMonths >= maxMonths - 1) status = "due_soon";
      return {
        id: c.id,
        crewMember: `${c.first_name} ${c.last_name}`,
        rank: c.rank || "Marinheiro",
        nationality: c.nationality || "BR",
        homePort: `${c.nationality || "BR"}`,
        contractStart: c.contract_start,
        contractEnd: c.contract_end || "—",
        maxMonthsOnboard: maxMonths,
        currentMonths: Math.max(0, currentMonths),
        status,
      };
    });
  }, [crewData]);

  const crewStats = useMemo(() => ({
    ok: crew.filter(c => c.status === "ok").length,
    dueSoon: crew.filter(c => c.status === "due_soon").length,
    overdue: crew.filter(c => c.status === "overdue").length,
    total: crew.length,
  }), [crew]);

  const finStats = useMemo(() => ({
    valid: financial.filter(f => f.status === "valid").length,
    expiring: financial.filter(f => f.status === "expiring").length,
    expired: financial.filter(f => f.status === "expired").length,
    total: financial.length,
  }), [financial]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Repatriation & Financial Security — MLC Reg. 2.5 / 2.6 / 4.2
          </h3>
          <p className="text-sm text-muted-foreground">Dados em tempo real do Supabase • {crew.length} tripulantes</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Repatriation report exportado")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{crewStats.total}</p>
          <p className="text-[10px] text-muted-foreground">Tripulantes</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{crewStats.ok}</p>
          <p className="text-[10px] text-muted-foreground">OK Repatriação</p>
        </CardContent></Card>
        <Card className={crewStats.dueSoon > 0 ? "border-warning/20" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${crewStats.dueSoon > 0 ? "text-warning" : ""}`}>{crewStats.dueSoon}</p>
          <p className="text-[10px] text-muted-foreground">Próx. Repatriação</p>
        </CardContent></Card>
        <Card className={crewStats.overdue > 0 ? "border-destructive/30 bg-destructive/5" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${crewStats.overdue > 0 ? "text-destructive" : ""}`}>{crewStats.overdue}</p>
          <p className="text-[10px] text-muted-foreground">Vencidos</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{finStats.valid}</p>
          <p className="text-[10px] text-muted-foreground">Seguros Válidos</p>
        </CardContent></Card>
        <Card className={finStats.expiring > 0 ? "border-warning/20" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${finStats.expiring > 0 ? "text-warning" : ""}`}>{finStats.expiring}</p>
          <p className="text-[10px] text-muted-foreground">Seg. Vencendo</p>
        </CardContent></Card>
      </div>

      {crewStats.overdue > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3">
            <p className="text-sm font-semibold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> AÇÃO URGENTE: {crewStats.overdue} tripulante(s) com repatriação vencida
            </p>
            {crew.filter(c => c.status === "overdue").map(c => (
              <div key={c.id} className="flex items-center gap-2 text-sm mt-1">
                <Badge variant="destructive" className="text-[10px]">{c.rank}</Badge>
                <span className="font-medium">{c.crewMember}</span>
                <span className="text-xs text-muted-foreground">• {c.currentMonths}/{c.maxMonthsOnboard} meses</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Crew Repatriation Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Controle de Repatriação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
          ) : crew.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum tripulante ativo com contrato cadastrado.</p>
          ) : crew.map(c => {
            const pct = Math.round((c.currentMonths / c.maxMonthsOnboard) * 100);
            return (
              <div key={c.id} className={`p-2.5 rounded border ${c.status === "overdue" ? "bg-destructive/5 border-destructive/30" : c.status === "due_soon" ? "bg-warning/5 border-warning/30" : "border-border"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {c.status === "ok" ? <CheckCircle className="h-3.5 w-3.5 text-success" /> :
                     c.status === "due_soon" ? <Clock className="h-3.5 w-3.5 text-warning" /> :
                     <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    <span className="text-sm font-medium">{c.crewMember}</span>
                    <Badge variant="outline" className="text-[10px]">{c.rank}</Badge>
                    <Badge variant="outline" className="text-[10px]">{c.nationality}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={Math.min(pct, 100)} className={`flex-1 h-2 ${pct >= 100 ? "[&>div]:bg-destructive" : pct >= 85 ? "[&>div]:bg-warning" : ""}`} />
                  <span className={`text-xs font-bold ${pct >= 100 ? "text-destructive" : pct >= 85 ? "text-warning" : "text-muted-foreground"}`}>
                    {c.currentMonths}/{c.maxMonthsOnboard}m
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] text-muted-foreground mt-1">
                  <span>Embarque: {c.contractStart}</span>
                  <span>Término: {c.contractEnd}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Financial Security */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Garantia Financeira & P&I</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {financial.map(f => (
            <div key={f.id} className={`flex items-center gap-3 p-2.5 rounded border text-sm ${f.status === "expired" ? "bg-destructive/5 border-destructive/30" : f.status === "expiring" ? "bg-warning/5 border-warning/30" : "border-border"}`}>
              {f.status === "valid" ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" /> :
               f.status === "expiring" ? <Clock className="h-3.5 w-3.5 text-warning shrink-0" /> :
               <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{f.type}</span>
                  <Badge variant="outline" className="text-[10px]">{f.provider}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Apólice: {f.policyNumber} • {f.coverage}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Vigência: {f.validFrom} a {f.validTo} • {f.regulation}</div>
              </div>
              <Badge variant={f.status === "valid" ? "default" : f.status === "expiring" ? "secondary" : "destructive"} className="text-[10px] shrink-0">
                {f.status === "valid" ? "Válido" : f.status === "expiring" ? "Vencendo" : "Vencido"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
