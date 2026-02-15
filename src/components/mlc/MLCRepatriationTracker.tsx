/**
 * MLC Repatriation & Financial Security Tracker — Reg. 2.5 / 2.6
 * Track P&I coverage, repatriation entitlements, financial security
 * Critical for Flag State inspections and PSC
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plane, CheckCircle, AlertTriangle, Clock, Download,
  Shield, DollarSign, FileText, MapPin, Users, Anchor, CalendarClock
} from "lucide-react";
import { toast } from "sonner";

interface RepatriationRecord {
  id: string;
  crewMember: string;
  rank: string;
  nationality: string;
  homePort: string;
  seaContractStart: string;
  seaContractEnd: string;
  maxMonthsOnboard: number;
  currentMonths: number;
  repatriationEntitlement: string;
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

const CREW_DATA: RepatriationRecord[] = [
  { id: "R01", crewMember: "Carlos Silva", rank: "Comandante", nationality: "BR", homePort: "Santos, SP", seaContractStart: "2025-08-15", seaContractEnd: "2026-04-15", maxMonthsOnboard: 8, currentMonths: 6, repatriationEntitlement: "A cada 8 meses", status: "ok" },
  { id: "R02", crewMember: "João Oliveira", rank: "Imediato", nationality: "BR", homePort: "Rio de Janeiro, RJ", seaContractStart: "2025-07-01", seaContractEnd: "2026-03-01", maxMonthsOnboard: 8, currentMonths: 7, repatriationEntitlement: "A cada 8 meses", status: "due_soon" },
  { id: "R03", crewMember: "Pedro Santos", rank: "Ch. Máquinas", nationality: "BR", homePort: "Vitória, ES", seaContractStart: "2025-09-01", seaContractEnd: "2026-05-01", maxMonthsOnboard: 8, currentMonths: 5, repatriationEntitlement: "A cada 8 meses", status: "ok" },
  { id: "R04", crewMember: "André Costa", rank: "DPO Classe B", nationality: "BR", homePort: "Macaé, RJ", seaContractStart: "2025-06-15", seaContractEnd: "2026-02-15", maxMonthsOnboard: 8, currentMonths: 8, repatriationEntitlement: "A cada 8 meses", status: "overdue" },
  { id: "R05", crewMember: "Ravi Patel", rank: "3º Oficial", nationality: "IN", homePort: "Mumbai, India", seaContractStart: "2025-10-01", seaContractEnd: "2026-06-01", maxMonthsOnboard: 8, currentMonths: 4, repatriationEntitlement: "A cada 8 meses + voo internacional", status: "ok" },
  { id: "R06", crewMember: "Marcos Almeida", rank: "Marinheiro", nationality: "BR", homePort: "Belém, PA", seaContractStart: "2025-11-01", seaContractEnd: "2026-07-01", maxMonthsOnboard: 8, currentMonths: 3, repatriationEntitlement: "A cada 8 meses", status: "ok" },
  { id: "R07", crewMember: "Felipe Rocha", rank: "Eletricista", nationality: "BR", homePort: "Salvador, BA", seaContractStart: "2025-07-20", seaContractEnd: "2026-03-20", maxMonthsOnboard: 8, currentMonths: 7, repatriationEntitlement: "A cada 8 meses", status: "due_soon" },
];

const FINANCIAL_SECURITY: FinancialSecurity[] = [
  { id: "FS01", type: "P&I Insurance", provider: "Gard P&I Club", policyNumber: "GP-2026-00142", coverage: "US$ 3 billion — unlimited for crew claims", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A2.5.2, A4.2" },
  { id: "FS02", type: "Financial Security — Repatriation", provider: "Gard P&I Club", policyNumber: "GP-REP-2026-009", coverage: "Repatriation costs + up to 4 months outstanding wages", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A2.5.2" },
  { id: "FS03", type: "Financial Security — Abandonment", provider: "Gard P&I Club", policyNumber: "GP-ABD-2026-009", coverage: "Essential needs + repatriation upon abandonment", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A2.5.2" },
  { id: "FS04", type: "Financial Security — Shipowner Liability", provider: "Gard P&I Club", policyNumber: "GP-SOL-2026-009", coverage: "Contractual claims: death, disability, sickness", validFrom: "2026-02-20", validTo: "2027-02-20", status: "valid", regulation: "MLC Standard A4.2.1" },
  { id: "FS05", type: "Crew Medical Insurance", provider: "PEME Medical", policyNumber: "PM-2026-3315", coverage: "Medical treatment ashore + medical repatriation", validFrom: "2026-01-01", validTo: "2026-12-31", status: "valid", regulation: "MLC Reg. 4.1, 4.2" },
  { id: "FS06", type: "Wages Protection — Bank Guarantee", provider: "Banco do Brasil", policyNumber: "BB-GAR-2026-554", coverage: "4 months wages guarantee", validFrom: "2025-06-01", validTo: "2026-06-01", status: "expiring", regulation: "MLC Standard A2.5.2" },
];

const STATUS_CREW: Record<string, { label: string; color: string }> = {
  ok: { label: "OK", color: "text-success" },
  due_soon: { label: "Próximo", color: "text-warning" },
  overdue: { label: "Vencido", color: "text-destructive" },
};

export function MLCRepatriationTracker() {
  const [crew] = useState(CREW_DATA);
  const [financial] = useState(FINANCIAL_SECURITY);

  const crewStats = useMemo(() => {
    const ok = crew.filter(c => c.status === "ok").length;
    const dueSoon = crew.filter(c => c.status === "due_soon").length;
    const overdue = crew.filter(c => c.status === "overdue").length;
    return { ok, dueSoon, overdue, total: crew.length };
  }, [crew]);

  const finStats = useMemo(() => {
    const valid = financial.filter(f => f.status === "valid").length;
    const expiring = financial.filter(f => f.status === "expiring").length;
    const expired = financial.filter(f => f.status === "expired").length;
    return { valid, expiring, expired, total: financial.length };
  }, [financial]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Repatriation & Financial Security — MLC Reg. 2.5 / 2.6 / 4.2
          </h3>
          <p className="text-sm text-muted-foreground">
            Direitos de repatriação, garantia financeira P&I, seguro de abandono
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Repatriation report exportado")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
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

      {/* Overdue Alert */}
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
                <span className="text-xs text-muted-foreground">• {c.currentMonths}/{c.maxMonthsOnboard} meses • Destino: {c.homePort}</span>
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
          {crew.map(c => {
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.homePort}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={pct} className={`flex-1 h-2 ${pct >= 100 ? "[&>div]:bg-destructive" : pct >= 85 ? "[&>div]:bg-warning" : ""}`} />
                  <span className={`text-xs font-bold ${pct >= 100 ? "text-destructive" : pct >= 85 ? "text-warning" : "text-muted-foreground"}`}>
                    {c.currentMonths}/{c.maxMonthsOnboard}m
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] text-muted-foreground mt-1">
                  <span>Embarque: {c.seaContractStart}</span>
                  <span>Término: {c.seaContractEnd}</span>
                  <span>{c.repatriationEntitlement}</span>
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
                <div className="text-xs text-muted-foreground mt-0.5">
                  <span>Apólice: {f.policyNumber} • Cobertura: {f.coverage}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Vigência: {f.validFrom} a {f.validTo} • {f.regulation}
                </div>
              </div>
              <Badge variant={f.status === "valid" ? "default" : f.status === "expiring" ? "secondary" : "destructive"} className="text-[10px] shrink-0">
                {f.status === "valid" ? "Válido" : f.status === "expiring" ? "Vencendo" : "Vencido"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MLC Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Requisitos MLC — Repatriação & Segurança Financeira</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            {[
              "Reg 2.5: Direito à repatriação sem custo ao marítimo",
              "Reg 2.5.2: Garantia financeira para repatriação obrigatória",
              "Max 11 meses contínuos a bordo (12 meses excepcional)",
              "Reg 2.6: Compensação por perda ou naufrágio do navio",
              "Standard A4.2: Responsabilidade do armador por doença/lesão",
              "Certificado de garantia financeira disponível a bordo",
              "P&I Club com cobertura para abandono de marítimos",
              "Custos de repatriação: viagem, alojamento, alimentação, bagagem",
            ].map((r, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 flex items-start gap-2">
                <Shield className="h-3 w-3 text-primary mt-0.5 shrink-0" /><span>{r}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
