import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Plus, FileText, Send, Clock, TrendingUp } from "lucide-react";

interface Incident {
  id: string;
  date: string;
  type: string;
  severity: string;
  description: string;
  root_cause: string;
  corrective_action: string;
  ciras_reported: boolean;
  ciras_ref: string;
  status: string;
}

const MOCK_INCIDENTS: Incident[] = [
  { id: "1", date: "2026-01-15", type: "loss_of_position", severity: "major", description: "Loss of position during crane ops — 15m excursion due to DGPS dropout", root_cause: "Ionospheric interference affecting all GNSS references simultaneously", corrective_action: "Added Fanbeam as additional backup reference. Updated ASOG for GNSS degradation scenario.", ciras_reported: true, ciras_ref: "CIRAS-2026-0042", status: "closed" },
  { id: "2", date: "2026-02-03", type: "near_miss", severity: "minor", description: "Near-miss: unexpected thruster response during manual override test", root_cause: "Incorrect joystick calibration after software update", corrective_action: "Joystick recalibrated. Added post-update verification checklist.", ciras_reported: true, ciras_ref: "CIRAS-2026-0078", status: "closed" },
  { id: "3", date: "2026-02-10", type: "equipment_failure", severity: "moderate", description: "UPS failure on DP console #2 — 30-second power loss", root_cause: "Battery degradation beyond service life", corrective_action: "UPS batteries replaced. Added quarterly UPS load test to maintenance plan.", ciras_reported: false, ciras_ref: "", status: "open" },
];

const INCIDENT_TYPES = [
  { value: "loss_of_position", label: "Loss of Position" },
  { value: "near_miss", label: "Near Miss" },
  { value: "equipment_failure", label: "Equipment Failure" },
  { value: "drift_off", label: "Drift Off" },
  { value: "drive_off", label: "Drive Off" },
  { value: "blackout", label: "Blackout" },
  { value: "reference_loss", label: "Reference System Loss" },
  { value: "software_error", label: "Software Error" },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  minor: { label: "Menor", color: "bg-blue-500" },
  moderate: { label: "Moderado", color: "bg-amber-500" },
  major: { label: "Maior", color: "bg-orange-500" },
  critical: { label: "Crítico", color: "bg-red-500" },
};

export function DPIncidentsCIRAS() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [addOpen, setAddOpen] = useState(false);

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === "open").length,
    reported: incidents.filter(i => i.ciras_reported).length,
    unreported: incidents.filter(i => !i.ciras_reported).length,
  };

  const reportToCIRAS = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ciras_reported: true, ciras_ref: `CIRAS-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`, status: "closed" } : i));
    toast.success("Incidente reportado ao IMCA CIRAS com sucesso!");
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Incidentes</p>
          </CardContent>
        </Card>
        <Card className={stats.open > 0 ? "border-warning/50 bg-warning/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-warning">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Em Aberto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.reported}</p>
            <p className="text-xs text-muted-foreground">Reportados CIRAS</p>
          </CardContent>
        </Card>
        <Card className={stats.unreported > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.unreported}</p>
            <p className="text-xs text-muted-foreground">⚠️ Pendente CIRAS</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" /> Registro de Incidentes DP
        </h3>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Registrar Incidente
        </Button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.map(incident => {
          const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.minor;
          const typeLabel = INCIDENT_TYPES.find(t => t.value === incident.type)?.label || incident.type;

          return (
            <Card key={incident.id} className={!incident.ciras_reported ? "border-destructive/30" : ""}>
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
                      <Badge className={`text-xs text-white ${sev.color}`}>{sev.label}</Badge>
                      <Badge variant={incident.status === "open" ? "destructive" : "secondary"} className="text-xs">
                        {incident.status === "open" ? "Em Aberto" : "Fechado"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{incident.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(incident.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Causa Raiz:</p>
                    <p>{incident.root_cause}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Ação Corretiva:</p>
                    <p>{incident.corrective_action}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {incident.ciras_reported ? (
                    <Badge variant="outline" className="gap-1 text-xs border-green-500 text-green-600">
                      <FileText className="h-3 w-3" /> {incident.ciras_ref}
                    </Badge>
                  ) : (
                    <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => reportToCIRAS(incident.id)}>
                      <Send className="h-3 w-3" /> Reportar ao IMCA CIRAS
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
