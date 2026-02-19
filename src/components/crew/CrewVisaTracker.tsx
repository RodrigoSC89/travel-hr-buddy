/**
 * Crew Visa & Immigration Tracker
 * Digital visa/immigration tracking for crew changes
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Stamp, AlertTriangle, CheckCircle2, Clock,
  Search, Globe, Users, Plane, FileText,
  Calendar, MapPin, Download, Plus
} from "lucide-react";

interface CrewVisa {
  id: string;
  crewName: string;
  rank: string;
  nationality: string;
  documentType: "passport" | "seaman_book" | "visa" | "work_permit" | "yellow_fever" | "c1d_visa";
  documentNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired" | "pending";
  daysRemaining: number;
  nextPort?: string;
  notes?: string;
}

const MOCK_VISAS: CrewVisa[] = [
  { id: "v1", crewName: "João Silva", rank: "Master", nationality: "Brazilian", documentType: "passport", documentNumber: "FX****321", issuingCountry: "Brazil", issueDate: "2024-03-15", expiryDate: "2034-03-14", status: "valid", daysRemaining: 2945 },
  { id: "v2", crewName: "João Silva", rank: "Master", nationality: "Brazilian", documentType: "c1d_visa", documentNumber: "US****789", issuingCountry: "USA", issueDate: "2024-06-01", expiryDate: "2026-06-01", status: "expiring", daysRemaining: 102, nextPort: "Houston" },
  { id: "v3", crewName: "Raj Patel", rank: "Chief Engineer", nationality: "Indian", documentType: "seaman_book", documentNumber: "IN****456", issuingCountry: "India", issueDate: "2023-01-10", expiryDate: "2026-01-09", status: "expired", daysRemaining: -41 },
  { id: "v4", crewName: "Raj Patel", rank: "Chief Engineer", nationality: "Indian", documentType: "visa", documentNumber: "SG****111", issuingCountry: "Singapore", issueDate: "2025-12-01", expiryDate: "2026-12-01", status: "valid", daysRemaining: 285, nextPort: "Singapore" },
  { id: "v5", crewName: "Miguel Santos", rank: "2nd Officer", nationality: "Filipino", documentType: "passport", documentNumber: "PH****222", issuingCountry: "Philippines", issueDate: "2022-05-20", expiryDate: "2027-05-19", status: "valid", daysRemaining: 454 },
  { id: "v6", crewName: "Miguel Santos", rank: "2nd Officer", nationality: "Filipino", documentType: "yellow_fever", documentNumber: "YF****333", issuingCountry: "WHO", issueDate: "2024-08-01", expiryDate: "2026-08-01", status: "expiring", daysRemaining: 163, nextPort: "Lagos" },
  { id: "v7", crewName: "Andrei Volkov", rank: "AB Seaman", nationality: "Ukrainian", documentType: "seaman_book", documentNumber: "UA****444", issuingCountry: "Ukraine", issueDate: "2023-11-01", expiryDate: "2028-10-31", status: "valid", daysRemaining: 985 },
  { id: "v8", crewName: "Andrei Volkov", rank: "AB Seaman", nationality: "Ukrainian", documentType: "work_permit", documentNumber: "NL****555", issuingCountry: "Netherlands", issueDate: "2025-06-01", expiryDate: "2026-03-01", status: "expiring", daysRemaining: 10, nextPort: "Rotterdam", notes: "Renovação urgente - contatar agente em Rotterdam" },
  { id: "v9", crewName: "Chen Wei", rank: "Bosun", nationality: "Chinese", documentType: "passport", documentNumber: "CN****666", issuingCountry: "China", issueDate: "2021-04-15", expiryDate: "2031-04-14", status: "valid", daysRemaining: 1880 },
  { id: "v10", crewName: "Pedro Lima", rank: "3rd Engineer", nationality: "Brazilian", documentType: "visa", documentNumber: "AE****777", issuingCountry: "UAE", issueDate: "2025-10-01", expiryDate: "2026-04-01", status: "expiring", daysRemaining: 41, nextPort: "Dubai" },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: "Passaporte",
  seaman_book: "Caderneta Marítimo",
  visa: "Visto",
  work_permit: "Work Permit",
  yellow_fever: "Febre Amarela",
  c1d_visa: "Visto C1/D (EUA)",
};

export function CrewVisaTracker() {
  const [visas] = useState<CrewVisa[]>(MOCK_VISAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDocType, setFilterDocType] = useState("all");

  const filtered = useMemo(() => {
    let result = visas;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.crewName.toLowerCase().includes(q) || v.nationality.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") result = result.filter(v => v.status === filterStatus);
    if (filterDocType !== "all") result = result.filter(v => v.documentType === filterDocType);
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
                      <span className="font-medium">{DOC_TYPE_LABELS[visa.documentType]}</span>
                      <span>{visa.documentNumber}</span>
                      <span>Emissão: {visa.issuingCountry}</span>
                      <span>Validade: {visa.expiryDate}</span>
                      {visa.nextPort && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{visa.nextPort}</span>}
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

      {filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Stamp className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum documento encontrado</p>
        </CardContent></Card>
      )}
    </div>
  );
}
