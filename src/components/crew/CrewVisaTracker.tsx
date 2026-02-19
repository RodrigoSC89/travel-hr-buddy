/**
 * Crew Visa & Immigration Tracker
 * Connected to crew_certifications + crew_members for real data
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Stamp, AlertTriangle, CheckCircle2, Clock,
  Search, Globe, Users, FileText, MapPin, Loader2
} from "lucide-react";

interface CrewVisa {
  id: string;
  crewName: string;
  rank: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired" | "pending";
  daysRemaining: number;
  notes?: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: "Passaporte",
  seaman_book: "Caderneta Marítimo",
  visa: "Visto",
  work_permit: "Work Permit",
  yellow_fever: "Febre Amarela",
  c1d_visa: "Visto C1/D (EUA)",
  coc: "CoC",
  cop: "CoP",
  stcw: "STCW",
  medical: "Médico",
  goc: "GOC",
};

function computeDocStatus(expiryDate: string): { status: CrewVisa["status"]; daysRemaining: number } {
  if (!expiryDate) return { status: "pending", daysRemaining: 0 };
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffMs / 86400000);
  if (daysRemaining < 0) return { status: "expired", daysRemaining };
  if (daysRemaining <= 90) return { status: "expiring", daysRemaining };
  return { status: "valid", daysRemaining };
}

export function CrewVisaTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDocType, setFilterDocType] = useState("all");

  // Fetch crew certifications (passports, visas, etc.)
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["crew-visa-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("id, crew_member_id, certification_name, certification_type, certification_number, issuing_authority, issue_date, expiry_date, status")
        .order("expiry_date", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch crew members for names/ranks/nationality
  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-members-visa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, nationality, passport_number, passport_expiry")
        .limit(200);
      if (error) return [];
      return data || [];
    },
    staleTime: 120000,
  });

  const crewMap = useMemo(() => {
    const map = new Map<string, any>();
    crewMembers.forEach((c: any) => map.set(c.id, c));
    return map;
  }, [crewMembers]);

  // Map certifications to visa tracker format
  const visas: CrewVisa[] = useMemo(() => {
    const results: CrewVisa[] = [];

    // Add from crew_certifications
    certifications.forEach((cert: any) => {
      const crew = crewMap.get(cert.crew_member_id);
      const { status, daysRemaining } = computeDocStatus(cert.expiry_date);

      results.push({
        id: cert.id,
        crewName: crew?.full_name || "N/A",
        rank: crew?.rank || "N/A",
        nationality: crew?.nationality || "N/A",
        documentType: cert.certification_type || cert.certification_name || "certificate",
        documentNumber: cert.certification_number || "N/A",
        issuingCountry: cert.issuing_authority || "N/A",
        issueDate: cert.issue_date || "",
        expiryDate: cert.expiry_date || "",
        status,
        daysRemaining,
      });
    });

    // Add passport data from crew_members (if they have passport info)
    crewMembers.forEach((crew: any) => {
      if (crew.passport_number && crew.passport_expiry) {
        const { status, daysRemaining } = computeDocStatus(crew.passport_expiry);
        results.push({
          id: `passport-${crew.id}`,
          crewName: crew.full_name || "N/A",
          rank: crew.rank || "N/A",
          nationality: crew.nationality || "N/A",
          documentType: "passport",
          documentNumber: crew.passport_number,
          issuingCountry: crew.nationality || "N/A",
          issueDate: "",
          expiryDate: crew.passport_expiry,
          status,
          daysRemaining,
        });
      }
    });

    return results;
  }, [certifications, crewMembers, crewMap]);

  const filtered = useMemo(() => {
    let result = visas;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.crewName.toLowerCase().includes(q) || v.nationality.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") result = result.filter(v => v.status === filterStatus);
    if (filterDocType !== "all") result = result.filter(v => v.documentType.toLowerCase().includes(filterDocType.toLowerCase()));
    return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [visas, searchQuery, filterStatus, filterDocType]);

  const stats = useMemo(() => ({
    total: visas.length,
    valid: visas.filter(v => v.status === "valid").length,
    expiring: visas.filter(v => v.status === "expiring").length,
    expired: visas.filter(v => v.status === "expired").length,
    crewMembers: new Set(visas.map(v => v.crewName)).size,
  }), [visas]);

  const getStatusBg = (s: string) => {
    if (s === "valid") return "bg-success/20 text-success";
    if (s === "expiring") return "bg-warning/20 text-warning";
    if (s === "expired") return "bg-destructive/20 text-destructive";
    return "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Documentos", value: stats.total, icon: FileText, color: "text-primary" },
          { label: "Válidos", value: stats.valid, icon: CheckCircle2, color: "text-success" },
          { label: "Expirando", value: stats.expiring, icon: Clock, color: "text-warning" },
          { label: "Expirados", value: stats.expired, icon: AlertTriangle, color: "text-destructive" },
          { label: "Tripulantes", value: stats.crewMembers, icon: Users, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tripulante ou nacionalidade..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="valid">Válidos</SelectItem>
            <SelectItem value="expiring">Expirando</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDocType} onValueChange={setFilterDocType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo Doc" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {visas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Stamp className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum documento encontrado</p>
            <p className="text-sm mt-1">Cadastre tripulantes com passaportes e certificações em <code>crew_members</code> e <code>crew_certifications</code></p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.map(visa => (
          <Card key={visa.id} className={`transition-colors ${visa.status === "expired" ? "border-destructive/40" : visa.status === "expiring" && visa.daysRemaining <= 30 ? "border-warning/40" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${getStatusBg(visa.status)}`}>
                    <Stamp className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{visa.crewName}</h4>
                      <Badge variant="outline" className="text-[10px]">{visa.rank}</Badge>
                      <Badge variant="outline" className="text-[10px]"><Globe className="h-3 w-3 mr-1" />{visa.nationality}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="font-medium">{DOC_TYPE_LABELS[visa.documentType] || visa.documentType}</span>
                      <span>{visa.documentNumber}</span>
                      <span>Emissão: {visa.issuingCountry}</span>
                      {visa.expiryDate && <span>Validade: {visa.expiryDate}</span>}
                    </div>
                    {visa.notes && <p className="text-xs text-warning mt-1 italic">{visa.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusBg(visa.status)}>
                    {visa.status === "valid" ? "Válido" : visa.status === "expiring" ? "Expirando" : visa.status === "expired" ? "Expirado" : "Pendente"}
                  </Badge>
                  <p className={`text-sm font-bold mt-1 ${visa.daysRemaining <= 0 ? "text-destructive" : visa.daysRemaining <= 30 ? "text-warning" : "text-success"}`}>
                    {visa.daysRemaining <= 0 ? `${Math.abs(visa.daysRemaining)}d expirado` : `${visa.daysRemaining}d restantes`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visas.length > 0 && filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Stamp className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum documento encontrado para este filtro</p>
        </CardContent></Card>
      )}
    </div>
  );
}
