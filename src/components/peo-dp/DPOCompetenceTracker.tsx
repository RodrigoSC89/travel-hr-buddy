/**
 * DPO Competence Tracker — IMCA M 117 / Petrobras PEO-DP
 * Connected to crew_members + crew_certifications tables
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Navigation, Clock, CheckCircle, AlertTriangle,
  Download, Target, Calendar, BookOpen, Award, Ship
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type CertStatus = "valid" | "expiring" | "expired" | "pending";

interface DPOperator {
  id: string;
  name: string;
  rank: string;
  dpCertLevel: string;
  certNumber: string;
  certExpiry: string;
  certStatus: CertStatus;
  schemePhase: string;
  totalDPHours: number;
  requiredHours: number;
  dpClassHours: Record<string, number>;
  complianceScore: number;
}

const SCHEME_CONFIG: Record<string, { label: string; color: string; requiredHours: number }> = {
  trainee: { label: "Treinee", color: "bg-muted text-foreground", requiredHours: 0 },
  scheme_1: { label: "Fase 1 (Inicial)", color: "bg-warning text-warning-foreground", requiredHours: 480 },
  scheme_2: { label: "Fase 2 (Intermediário)", color: "bg-primary text-primary-foreground", requiredHours: 1200 },
  unlimited: { label: "Unlimited", color: "bg-success text-success-foreground", requiredHours: 3600 },
};

const CERT_STATUS_CONFIG: Record<CertStatus, { label: string; color: string }> = {
  valid: { label: "Válido", color: "text-success" },
  expiring: { label: "Vencendo (<90d)", color: "text-warning" },
  expired: { label: "Vencido", color: "text-destructive" },
  pending: { label: "Pendente", color: "text-muted-foreground" },
};

function getCertStatus(expiryDate: string): CertStatus {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  if (diff < 0) return "expired";
  if (diff < 90 * 86400000) return "expiring";
  return "valid";
}

export function DPOCompetenceTracker() {
  const [filterPhase, setFilterPhase] = useState("all");

  // Fetch DPO crew from Supabase
  const { data: crewData, isLoading } = useQuery({
    queryKey: ["dpo-competence-crew"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, first_name, last_name, rank, status")
        .or("rank.ilike.%DPO%,rank.ilike.%DP Operator%,rank.ilike.%Dynamic%");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch certifications for DPOs
  const { data: certsData } = useQuery({
    queryKey: ["dpo-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("*")
        .ilike("certificate_name", "%DP%");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const operators: DPOperator[] = useMemo(() => {
    if (!crewData || crewData.length === 0) {
      // Fallback data for demo
      return [
        { id: "1", name: "Carlos Mendes", rank: "Sr. DPO", dpCertLevel: "DP Unlimited", certNumber: "IMCA-DP-UNL-2023-0456", certExpiry: "2027-03-15", certStatus: "valid", schemePhase: "unlimited", totalDPHours: 5840, requiredHours: 3600, dpClassHours: { DP1: 1200, DP2: 3400, DP3: 1240 }, complianceScore: 98 },
        { id: "2", name: "Ricardo Ferreira", rank: "DPO", dpCertLevel: "DP Advanced", certNumber: "IMCA-DP-ADV-2024-0789", certExpiry: "2026-06-20", certStatus: "expiring", schemePhase: "scheme_2", totalDPHours: 2100, requiredHours: 1200, dpClassHours: { DP1: 400, DP2: 1500, DP3: 200 }, complianceScore: 85 },
        { id: "3", name: "Ana Costa", rank: "DPO Trainee", dpCertLevel: "DP Basic", certNumber: "IMCA-DP-BAS-2025-0123", certExpiry: "2028-01-10", certStatus: "valid", schemePhase: "scheme_1", totalDPHours: 320, requiredHours: 480, dpClassHours: { DP1: 120, DP2: 200, DP3: 0 }, complianceScore: 67 },
      ];
    }

    return crewData.map((crew: any) => {
      const cert = certsData?.find((c: any) => c.employee_id === crew.id && c.certification_name?.includes("DP"));
      const expiry = cert?.expiry_date || "2027-01-01";
      const certStatus = getCertStatus(expiry);
      return {
        id: crew.id,
        name: `${crew.first_name} ${crew.last_name}`,
        rank: crew.rank || "DPO",
        dpCertLevel: cert?.certification_name || "DP Advanced",
        certNumber: cert?.certificate_number || "N/A",
        certExpiry: expiry,
        certStatus,
        schemePhase: "scheme_2",
        totalDPHours: 0,
        requiredHours: 1200,
        dpClassHours: { DP1: 0, DP2: 0, DP3: 0 },
        complianceScore: certStatus === "valid" ? 90 : certStatus === "expiring" ? 70 : 40,
      };
    });
  }, [crewData, certsData]);

  const filtered = filterPhase === "all" ? operators : operators.filter(o => o.schemePhase === filterPhase);

  const stats = useMemo(() => ({
    total: operators.length,
    unlimited: operators.filter(o => o.schemePhase === "unlimited").length,
    certValid: operators.filter(o => o.certStatus === "valid").length,
    certExpiring: operators.filter(o => o.certStatus === "expiring").length,
    certExpired: operators.filter(o => o.certStatus === "expired").length,
    avgScore: operators.length > 0 ? Math.round(operators.reduce((a, o) => a + o.complianceScore, 0) / operators.length) : 0,
    totalHours: operators.reduce((a, o) => a + o.totalDPHours, 0),
  }), [operators]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            DPO Competence Tracker
          </h3>
          <p className="text-sm text-muted-foreground">
            IMCA M 117 Scheme • {stats.total} DPOs • {stats.totalHours.toLocaleString()}h DP acumuladas
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(operators, "DPO Competence Report")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">DPOs Total</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.unlimited}</p>
          <p className="text-[10px] text-muted-foreground">Unlimited</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.certValid}</p>
          <p className="text-[10px] text-muted-foreground">Cert. Válidos</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.certExpiring}</p>
          <p className="text-[10px] text-muted-foreground">Vencendo</p>
        </CardContent></Card>
        <Card className={stats.certExpired > 0 ? "border-destructive/30 bg-destructive/5" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.certExpired > 0 ? "text-destructive" : ""}`}>{stats.certExpired}</p>
            <p className="text-[10px] text-muted-foreground">Vencidos</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.avgScore}%</p>
          <p className="text-[10px] text-muted-foreground">Score Médio</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.totalHours.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Horas DP Total</p>
        </CardContent></Card>
      </div>

      {stats.certExpired > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3">
            {operators.filter(o => o.certStatus === "expired").map(o => (
              <div key={o.id} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="font-medium">{o.name}</span>
                <Badge variant="destructive" className="text-[10px]">{o.dpCertLevel}</Badge>
                <span className="text-muted-foreground">— Certificado vencido em {o.certExpiry}</span>
                <Badge variant="outline" className="text-[10px] border-destructive">AÇÃO URGENTE</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Select value={filterPhase} onValueChange={setFilterPhase}>
        <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Fases</SelectItem>
          {Object.entries(SCHEME_CONFIG).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {isLoading ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando DPOs...</CardContent></Card>
        ) : filtered.map(op => {
          const hoursProgress = op.requiredHours > 0 ? Math.min(100, Math.round((op.totalDPHours / op.requiredHours) * 100)) : 100;
          const schemeConfig = SCHEME_CONFIG[op.schemePhase] || SCHEME_CONFIG.scheme_2;
          return (
            <Card key={op.id} className={op.certStatus === "expired" ? "border-destructive/30" : op.certStatus === "expiring" ? "border-warning/20" : ""}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold">{op.name}</span>
                      <Badge variant="outline" className="text-xs">{op.rank}</Badge>
                      <Badge className={`text-[10px] ${schemeConfig.color}`}>{schemeConfig.label}</Badge>
                      <Badge variant="outline" className="text-xs">{op.dpCertLevel}</Badge>
                      <span className={`text-xs font-medium ${CERT_STATUS_CONFIG[op.certStatus].color}`}>
                        {CERT_STATUS_CONFIG[op.certStatus].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Cert: {op.certNumber}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Validade: {op.certExpiry}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-bold ${op.complianceScore >= 90 ? "text-success" : op.complianceScore >= 70 ? "text-warning" : "text-destructive"}`}>
                      {op.complianceScore}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Horas DP: {op.totalDPHours.toLocaleString()}h / {op.requiredHours.toLocaleString()}h requeridas</span>
                    <span className="font-bold">{hoursProgress}%</span>
                  </div>
                  <Progress value={hoursProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(op.dpClassHours).map(([cls, hrs]) => (
                    <div key={cls} className="p-2 rounded bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">{cls}</p>
                      <p className="text-sm font-bold">{hrs.toLocaleString()}h</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
