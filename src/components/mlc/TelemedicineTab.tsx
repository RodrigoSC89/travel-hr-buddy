/**
 * Telemedicine Tab — MLC Medical Care Enhancement
 * Remote medical consultation logging and TMAS integration
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Phone, Video, Stethoscope, AlertTriangle,
  CheckCircle2, Clock, Users, Search,
  FileText, Plus, Heart, Activity, Pill, Calendar
} from "lucide-react";

interface TelemedicineConsultation {
  id: string;
  date: string;
  crewName: string;
  rank: string;
  vesselName: string;
  consultationType: "tmas" | "specialist" | "follow_up" | "emergency";
  method: "radio" | "satellite_phone" | "video" | "email";
  provider: string;
  chiefComplaint: string;
  diagnosis?: string;
  treatment: string;
  status: "completed" | "pending_followup" | "medevac_recommended" | "ongoing";
  urgency: "routine" | "urgent" | "emergency";
  followUpDate?: string;
  medications?: string[];
  notes?: string;
}

const MOCK_CONSULTATIONS: TelemedicineConsultation[] = [
  {
    id: "tm-1", date: "2026-02-18T14:30:00", crewName: "José Ferreira", rank: "AB Seaman",
    vesselName: "MV Atlântico Sul", consultationType: "tmas", method: "satellite_phone",
    provider: "TMAS Brazil - Rio de Janeiro", chiefComplaint: "Dor abdominal intensa, náusea e vômito há 12h",
    diagnosis: "Suspeita de apendicite aguda", treatment: "Antibióticos IV iniciados. Medevac recomendado.",
    status: "medevac_recommended", urgency: "emergency",
    medications: ["Ceftriaxona 1g IV 12/12h", "Metronidazol 500mg IV 8/8h", "Tramadol 50mg IV SOS"],
    notes: "Paciente estável. ETA porto mais próximo: 18h. Helicóptero SAR em standby.",
  },
  {
    id: "tm-2", date: "2026-02-17T09:00:00", crewName: "Carlos Mendes", rank: "Oiler",
    vesselName: "MV Santos Express", consultationType: "specialist", method: "video",
    provider: "Dr. Maria Costa - Dermatologista", chiefComplaint: "Erupção cutânea generalizada com prurido",
    diagnosis: "Dermatite de contato ocupacional", treatment: "Creme de hidrocortisona + anti-histamínico oral",
    status: "pending_followup", urgency: "routine", followUpDate: "2026-02-24",
    medications: ["Hidrocortisona 1% creme 2x/dia", "Loratadina 10mg 1x/dia"],
  },
  {
    id: "tm-3", date: "2026-02-16T16:45:00", crewName: "Marcos Lima", rank: "Cook",
    vesselName: "MV Rio Grande", consultationType: "tmas", method: "radio",
    provider: "TMAS Italy - CIRM Roma", chiefComplaint: "Corte profundo na mão durante preparo de alimentos",
    diagnosis: "Laceração 4cm no dorso da mão esquerda", treatment: "Sutura com 5 pontos. Curativo estéril. Antibiótico oral.",
    status: "completed", urgency: "urgent",
    medications: ["Amoxicilina 500mg 8/8h por 7 dias", "Paracetamol 1g SOS"],
  },
  {
    id: "tm-4", date: "2026-02-15T11:00:00", crewName: "Paulo Santos", rank: "Chief Officer",
    vesselName: "MV Atlântico Sul", consultationType: "follow_up", method: "video",
    provider: "Dr. André Ribeiro - Cardiologista", chiefComplaint: "Follow-up hipertensão arterial",
    diagnosis: "HAS controlada", treatment: "Manter medicação atual. Próximo follow-up em 30 dias.",
    status: "completed", urgency: "routine", followUpDate: "2026-03-15",
    medications: ["Losartana 50mg 1x/dia", "HCTZ 25mg 1x/dia"],
  },
  {
    id: "tm-5", date: "2026-02-14T08:30:00", crewName: "Roberto Alves", rank: "3rd Engineer",
    vesselName: "MV Santos Express", consultationType: "tmas", method: "email",
    provider: "TMAS Norway - Radio Medico", chiefComplaint: "Dor dental severa, inchaço na gengiva",
    diagnosis: "Abscesso periapical", treatment: "Antibióticos + analgésicos. Encaminhamento dentista no próximo porto.",
    status: "pending_followup", urgency: "urgent",
    medications: ["Amoxicilina+Clavulanato 875mg 12/12h", "Ibuprofeno 600mg 8/8h"],
  },
];

export function TelemedicineTab() {
  const [consultations] = useState(MOCK_CONSULTATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");

  const filtered = useMemo(() => {
    let result = consultations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.crewName.toLowerCase().includes(q) || c.chiefComplaint.toLowerCase().includes(q));
    }
    if (filterUrgency !== "all") result = result.filter(c => c.urgency === filterUrgency);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [consultations, searchQuery, filterUrgency]);

  const stats = useMemo(() => ({
    total: consultations.length,
    completed: consultations.filter(c => c.status === "completed").length,
    pending: consultations.filter(c => c.status === "pending_followup").length,
    medevac: consultations.filter(c => c.status === "medevac_recommended").length,
    emergency: consultations.filter(c => c.urgency === "emergency").length,
  }), [consultations]);

  const getUrgencyBg = (u: string) => {
    if (u === "routine") return "bg-success/20 text-success";
    if (u === "urgent") return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const getStatusBg = (s: string) => {
    if (s === "completed") return "bg-success/20 text-success";
    if (s === "pending_followup") return "bg-primary/20 text-primary";
    if (s === "medevac_recommended") return "bg-destructive/20 text-destructive";
    return "bg-warning/20 text-warning";
  };

  const getStatusLabel = (s: string) => {
    if (s === "completed") return "Concluída";
    if (s === "pending_followup") return "Follow-up";
    if (s === "medevac_recommended") return "MEDEVAC";
    return "Em andamento";
  };

  const getMethodIcon = (m: string) => {
    if (m === "video") return Video;
    if (m === "satellite_phone" || m === "radio") return Phone;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Consultas", value: stats.total, icon: Stethoscope, color: "text-primary" },
          { label: "Concluídas", value: stats.completed, icon: CheckCircle2, color: "text-success" },
          { label: "Follow-up", value: stats.pending, icon: Clock, color: "text-primary" },
          { label: "MEDEVAC", value: stats.medevac, icon: AlertTriangle, color: "text-destructive" },
          { label: "Emergências", value: stats.emergency, icon: Heart, color: "text-destructive" },
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
          <Input placeholder="Buscar tripulante ou queixa..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterUrgency} onValueChange={setFilterUrgency}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Urgência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="routine">Rotina</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="emergency">Emergência</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => toast.info("Registro de consulta em desenvolvimento")}>
          <Plus className="h-4 w-4 mr-2" /> Nova Consulta
        </Button>
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        {filtered.map(c => {
          const MethodIcon = getMethodIcon(c.method);
          return (
            <Card key={c.id} className={c.status === "medevac_recommended" ? "border-destructive/40" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getUrgencyBg(c.urgency)}`}>
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{c.crewName}</h4>
                        <Badge variant="outline" className="text-[10px]">{c.rank}</Badge>
                        <Badge variant="outline" className="text-[10px]">{c.vesselName}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <Clock className="h-3 w-3" />{new Date(c.date).toLocaleString("pt-BR")}
                        <MethodIcon className="h-3 w-3" />{c.method === "video" ? "Vídeo" : c.method === "satellite_phone" ? "Sat Phone" : c.method === "radio" ? "Rádio" : "Email"}
                        <span>• {c.provider}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getUrgencyBg(c.urgency)}>
                      {c.urgency === "routine" ? "Rotina" : c.urgency === "urgent" ? "Urgente" : "EMERGÊNCIA"}
                    </Badge>
                    <Badge className={getStatusBg(c.status)}>{getStatusLabel(c.status)}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Queixa Principal</p>
                    <p>{c.chiefComplaint}</p>
                  </div>
                  {c.diagnosis && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Diagnóstico</p>
                      <p>{c.diagnosis}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Tratamento</p>
                    <p>{c.treatment}</p>
                  </div>
                </div>

                {c.medications && c.medications.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    <Pill className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    {c.medications.map(med => (
                      <Badge key={med} variant="secondary" className="text-[10px]">{med}</Badge>
                    ))}
                  </div>
                )}

                {c.notes && (
                  <p className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-3">{c.notes}</p>
                )}

                {c.followUpDate && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Follow-up: {c.followUpDate}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma consulta encontrada</p>
        </CardContent></Card>
      )}
    </div>
  );
}
