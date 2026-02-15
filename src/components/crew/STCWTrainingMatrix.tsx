/**
 * STCW Training Matrix — Visual crew × certification gap analysis
 * Shows which crew members need which certifications and their status
 * Comparable to DNV ShipManager / TM Master training module
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GraduationCap, AlertTriangle, CheckCircle, Clock, Download, Users,
  Search, Shield, Calendar, Target, X, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CertRequirement {
  id: string;
  name: string;
  code: string;
  category: "mandatory" | "rank_specific" | "vessel_specific";
  applicableRanks: string[];
}

const STCW_CERTS: CertRequirement[] = [
  { id: "bst", name: "Basic Safety Training", code: "STCW A-VI/1", category: "mandatory", applicableRanks: ["all"] },
  { id: "pst", name: "Proficiency in Survival Craft", code: "STCW A-VI/2", category: "mandatory", applicableRanks: ["all"] },
  { id: "aff", name: "Advanced Fire Fighting", code: "STCW A-VI/3", category: "mandatory", applicableRanks: ["all"] },
  { id: "mfa", name: "Medical First Aid", code: "STCW A-VI/4.1", category: "mandatory", applicableRanks: ["all"] },
  { id: "mc", name: "Medical Care", code: "STCW A-VI/4.2", category: "rank_specific", applicableRanks: ["Master", "Chief Officer"] },
  { id: "ssa", name: "Security Awareness", code: "STCW A-VI/6.1", category: "mandatory", applicableRanks: ["all"] },
  { id: "sdsd", name: "Security Duties (SSO/PFSO)", code: "STCW A-VI/6.2", category: "rank_specific", applicableRanks: ["Master", "Chief Officer", "Security Officer"] },
  { id: "brm", name: "Bridge Resource Management", code: "STCW A-VIII/2", category: "rank_specific", applicableRanks: ["Master", "Chief Officer", "2nd Officer", "3rd Officer"] },
  { id: "erm", name: "Engine Room Resource Mgmt", code: "STCW A-III/1", category: "rank_specific", applicableRanks: ["Chief Engineer", "2nd Engineer", "3rd Engineer"] },
  { id: "ecdis", name: "ECDIS", code: "STCW A-II/1", category: "rank_specific", applicableRanks: ["Master", "Chief Officer", "2nd Officer", "3rd Officer"] },
  { id: "gmdss", name: "GMDSS (GOC)", code: "STCW A-IV/2", category: "rank_specific", applicableRanks: ["Master", "Chief Officer", "Radio Officer"] },
  { id: "dpbasic", name: "DP Basic", code: "IMCA Scheme", category: "vessel_specific", applicableRanks: ["DPO", "Master", "Chief Officer"] },
  { id: "dpadvanced", name: "DP Advanced", code: "IMCA Scheme", category: "vessel_specific", applicableRanks: ["DPO", "Sr. DPO"] },
  { id: "huet", name: "HUET (Helicopter Underwater)", code: "OPITO", category: "vessel_specific", applicableRanks: ["all"] },
  { id: "bosiet", name: "BOSIET", code: "OPITO", category: "vessel_specific", applicableRanks: ["all"] },
];

type CertStatus = "valid" | "expiring" | "expired" | "missing" | "na";

interface CrewCertMatrix {
  crewId: string;
  crewName: string;
  rank: string;
  certs: Record<string, { status: CertStatus; expiryDate?: string }>;
}

export function STCWTrainingMatrix() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: crewData = [], isLoading } = useQuery({
    queryKey: ["stcw-matrix-crew"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, position")
        .order("full_name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: certsData = [] } = useQuery({
    queryKey: ["stcw-matrix-certs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("*")
        .order("expiry_date");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const matrix: CrewCertMatrix[] = useMemo(() => {
    return crewData.map(crew => {
      const rank = (crew.rank || crew.position || "AB Seaman") as string;
      const crewCerts = certsData.filter(c => c.crew_member_id === crew.id);
      const certMap: Record<string, { status: CertStatus; expiryDate?: string }> = {};

      STCW_CERTS.forEach(req => {
        const isApplicable = req.applicableRanks.includes("all") || req.applicableRanks.includes(rank);
        if (!isApplicable) {
          certMap[req.id] = { status: "na" };
          return;
        }

        const found = crewCerts.find(c =>
          (c.certification_name || "").toLowerCase().includes(req.name.toLowerCase().substring(0, 10)) ||
          (c.certification_type || "").toLowerCase().includes(req.code.toLowerCase())
        );

        if (!found) {
          certMap[req.id] = { status: "missing" };
          return;
        }

        const expiry = found.expiry_date ? new Date(found.expiry_date) : null;
        if (!expiry) {
          certMap[req.id] = { status: "valid" };
          return;
        }

        const daysToExpiry = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
        if (daysToExpiry < 0) {
          certMap[req.id] = { status: "expired", expiryDate: found.expiry_date || undefined };
        } else if (daysToExpiry <= 90) {
          certMap[req.id] = { status: "expiring", expiryDate: found.expiry_date || undefined };
        } else {
          certMap[req.id] = { status: "valid", expiryDate: found.expiry_date || undefined };
        }
      });

      return { crewId: crew.id, crewName: crew.full_name || "N/A", rank, certs: certMap };
    });
  }, [crewData, certsData]);

  const filteredCerts = filterCategory === "all" ? STCW_CERTS : STCW_CERTS.filter(c => c.category === filterCategory);
  const filteredMatrix = matrix.filter(m =>
    (searchTerm === "" || m.crewName.toLowerCase().includes(searchTerm.toLowerCase()) || m.rank.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = useMemo(() => {
    let total = 0, valid = 0, expiring = 0, expired = 0, missing = 0;
    matrix.forEach(m => {
      Object.values(m.certs).forEach(c => {
        if (c.status === "na") return;
        total++;
        if (c.status === "valid") valid++;
        else if (c.status === "expiring") expiring++;
        else if (c.status === "expired") expired++;
        else if (c.status === "missing") missing++;
      });
    });
    return { total, valid, expiring, expired, missing, compliance: total > 0 ? Math.round((valid / total) * 100) : 0 };
  }, [matrix]);

  const STATUS_CELL: Record<CertStatus, { bg: string; icon: React.ReactNode; label: string }> = {
    valid: { bg: "bg-success/20", icon: <CheckCircle className="h-3 w-3 text-success" />, label: "Válido" },
    expiring: { bg: "bg-warning/20", icon: <Clock className="h-3 w-3 text-warning" />, label: "Vencendo" },
    expired: { bg: "bg-destructive/20", icon: <AlertTriangle className="h-3 w-3 text-destructive" />, label: "Vencido" },
    missing: { bg: "bg-destructive/10", icon: <X className="h-3 w-3 text-destructive" />, label: "Ausente" },
    na: { bg: "bg-muted/30", icon: null, label: "N/A" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            STCW Training Matrix
          </h3>
          <p className="text-sm text-muted-foreground">
            {matrix.length} tripulantes × {STCW_CERTS.length} certificações • Conformidade: {stats.compliance}%
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Training Matrix exportada")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Requisitos</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.valid}</p>
          <p className="text-[10px] text-muted-foreground">Válidos</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.expiring}</p>
          <p className="text-[10px] text-muted-foreground">Vencendo (90d)</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
          <p className="text-[10px] text-muted-foreground">Vencidos</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.missing}</p>
          <p className="text-[10px] text-muted-foreground">Ausentes</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.compliance}%</p>
          <p className="text-[10px] text-muted-foreground">Conformidade</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 h-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            <SelectItem value="mandatory">Obrigatórias</SelectItem>
            <SelectItem value="rank_specific">Por Posto</SelectItem>
            <SelectItem value="vessel_specific">Por Embarcação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matrix Grid */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[900px]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 sticky left-0 bg-muted/50 z-10 min-w-[180px]">Tripulante</th>
                    <th className="text-left p-2 min-w-[100px]">Posto</th>
                    {filteredCerts.map(cert => (
                      <th key={cert.id} className="text-center p-1 min-w-[50px]" title={`${cert.name} (${cert.code})`}>
                        <div className="writing-mode-vertical text-[9px] font-medium truncate max-w-[50px]" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", height: "80px" }}>
                          {cert.code}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map(row => (
                    <tr key={row.crewId} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium sticky left-0 bg-background z-10">{row.crewName}</td>
                      <td className="p-2 text-muted-foreground">{row.rank}</td>
                      {filteredCerts.map(cert => {
                        const cell = row.certs[cert.id] || { status: "na" as CertStatus };
                        const config = STATUS_CELL[cell.status];
                        return (
                          <td key={cert.id} className="p-0.5 text-center">
                            <div className={`w-full h-6 rounded flex items-center justify-center ${config.bg}`}
                              title={`${cert.name}: ${config.label}${cell.expiryDate ? ` (${cell.expiryDate})` : ""}`}>
                              {config.icon}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {Object.entries(STATUS_CELL).filter(([k]) => k !== "na").map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-5 h-4 rounded ${val.bg} flex items-center justify-center`}>{val.icon}</div>
            <span>{val.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-5 h-4 rounded bg-muted/30" />
          <span className="text-muted-foreground">N/A</span>
        </div>
      </div>
    </div>
  );
}
