/**
 * Telemedicine Tab — Connected to Supabase medical_records
 * Remote medical consultation logging and TMAS integration
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Phone, Video, Stethoscope, AlertTriangle,
  CheckCircle2, Clock, Users, Search,
  FileText, Plus, Heart, Pill, Calendar, Loader2
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

function mapStatusToConsultation(status: string | null): TelemedicineConsultation["status"] {
  if (status === "completed" || status === "active") return "completed";
  if (status === "critical") return "medevac_recommended";
  if (status === "follow_up" || status === "pending") return "pending_followup";
  return "ongoing";
}

function deriveUrgency(conditions: string[] | null, status: string | null): TelemedicineConsultation["urgency"] {
  if (status === "critical") return "emergency";
  if (conditions && conditions.length > 2) return "urgent";
  return "routine";
}

export function TelemedicineTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["telemedicine-consultations"],
    queryFn: async () => {
      const [{ data: records }, { data: crewMembers }, { data: vessels }] = await Promise.all([
        supabase.from("medical_records").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("crew_members").select("id, full_name, rank, vessel_id"),
        supabase.from("vessels").select("id, name"),
      ]);

      const crewMap = new Map((crewMembers || []).map(c => [c.id, c]));
      const vesselMap = new Map((vessels || []).map(v => [v.id, v]));

      return (records || []).map((r): TelemedicineConsultation => {
        const crew = r.crew_member_id ? crewMap.get(r.crew_member_id) : null;
        const vessel = r.vessel_id ? vesselMap.get(r.vessel_id) : null;
        const conditions = r.conditions as string[] | null;
        const allergies = r.allergies as string[] | null;
        const history = r.medical_history as Record<string, unknown> | null;

        return {
          id: r.id,
          date: r.created_at || new Date().toISOString(),
          crewName: r.crew_member_name || crew?.full_name || "Tripulante",
          rank: crew?.rank || "N/A",
          vesselName: vessel?.name || "N/A",
          consultationType: history?.type as any || "tmas",
          method: history?.method as any || "satellite_phone",
          provider: (history?.provider as string) || "TMAS Brazil",
          chiefComplaint: conditions?.join(", ") || r.notes || "Consulta médica",
          diagnosis: (history?.diagnosis as string) || undefined,
          treatment: (history?.treatment as string) || r.notes || "Tratamento prescrito",
          status: mapStatusToConsultation(r.status),
          urgency: deriveUrgency(conditions, r.status),
          followUpDate: r.next_checkup || undefined,
          medications: allergies || undefined,
          notes: r.notes || undefined,
        };
      });
    },
    staleTime: 30000,
  });

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

  if (isLoading) {
    return (
      <Card><CardContent className="py-12 text-center">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando registros médicos...</p>
      </CardContent></Card>
    );
  }

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

      {filtered.length === 0 && !isLoading && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma consulta encontrada</p>
        </CardContent></Card>
      )}
    </div>
  );
}
