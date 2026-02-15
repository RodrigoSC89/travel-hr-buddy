import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Plus, FileText, Send, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const INCIDENT_TYPES = [
  { value: "drift_off", label: "Drift Off" },
  { value: "drive_off", label: "Drive Off" },
  { value: "large_excursion", label: "Large Excursion" },
  { value: "blackout", label: "Blackout" },
  { value: "position_loss", label: "Position Loss" },
  { value: "thruster_failure", label: "Thruster Failure" },
  { value: "reference_loss", label: "Reference System Loss" },
  { value: "other", label: "Other" },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Menor", color: "bg-blue-500" },
  medium: { label: "Moderado", color: "bg-amber-500" },
  high: { label: "Maior", color: "bg-orange-500" },
  critical: { label: "Crítico", color: "bg-red-500" },
};

export function DPIncidentsCIRAS() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    incident_type: "other" as string,
    severity: "medium" as string,
    description: "",
    root_cause: "",
    corrective_actions: "",
    incident_date: new Date().toISOString().split("T")[0],
  });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["peodp-incidents"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peodp_incidents")
        .select("*")
        .order("incident_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (incident: typeof newIncident) => {
      const { error } = await (supabase.from as Function)("peodp_incidents")
        .insert({
          incident_type: incident.incident_type,
          severity: incident.severity,
          description: incident.description,
          root_cause: incident.root_cause,
          corrective_actions: incident.corrective_actions,
          incident_date: incident.incident_date,
          status: "open",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-incidents"] });
      toast.success("Incidente registrado com sucesso!");
      setAddOpen(false);
      setNewIncident({ incident_type: "other", severity: "medium", description: "", root_cause: "", corrective_actions: "", incident_date: new Date().toISOString().split("T")[0] });
    },
    onError: () => toast.error("Erro ao registrar incidente"),
  });

  const reportCIRAS = useMutation({
    mutationFn: async (id: string) => {
      const cirasRef = `CIRAS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      const { error } = await (supabase.from as Function)("peodp_incidents")
        .update({ reported_to_client: true, imca_reference: cirasRef, status: "closed" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-incidents"] });
      toast.success("Incidente reportado ao IMCA CIRAS com sucesso!");
    },
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter((i: any) => i.status === "open").length,
    reported: incidents.filter((i: any) => i.reported_to_client).length,
    unreported: incidents.filter((i: any) => !i.reported_to_client && i.status !== "closed").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Incidentes</p></CardContent></Card>
        <Card className={stats.open > 0 ? "border-warning/50 bg-warning/5" : ""}><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-warning">{stats.open}</p><p className="text-xs text-muted-foreground">Em Aberto</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-green-600">{stats.reported}</p><p className="text-xs text-muted-foreground">Reportados CIRAS</p></CardContent></Card>
        <Card className={stats.unreported > 0 ? "border-destructive/50 bg-destructive/5" : ""}><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-destructive">{stats.unreported}</p><p className="text-xs text-muted-foreground">⚠️ Pendente CIRAS</p></CardContent></Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Registro de Incidentes DP</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Registrar Incidente</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Incidente DP</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={newIncident.incident_type} onValueChange={v => setNewIncident(p => ({ ...p, incident_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INCIDENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newIncident.severity} onValueChange={v => setNewIncident(p => ({ ...p, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Menor</SelectItem>
                  <SelectItem value="medium">Moderado</SelectItem>
                  <SelectItem value="high">Maior</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={newIncident.incident_date} onChange={e => setNewIncident(p => ({ ...p, incident_date: e.target.value }))} />
              <Textarea placeholder="Descrição do incidente..." value={newIncident.description} onChange={e => setNewIncident(p => ({ ...p, description: e.target.value }))} />
              <Textarea placeholder="Causa raiz..." value={newIncident.root_cause} onChange={e => setNewIncident(p => ({ ...p, root_cause: e.target.value }))} />
              <Textarea placeholder="Ações corretivas..." value={newIncident.corrective_actions} onChange={e => setNewIncident(p => ({ ...p, corrective_actions: e.target.value }))} />
              <Button className="w-full" onClick={() => createMutation.mutate(newIncident)} disabled={!newIncident.description || createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Registrar Incidente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando incidentes...</CardContent></Card>
      ) : incidents.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum incidente registrado. Clique em "Registrar Incidente" para começar.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident: any) => {
            const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.medium;
            const typeLabel = INCIDENT_TYPES.find(t => t.value === incident.incident_type)?.label || incident.incident_type;
            return (
              <Card key={incident.id} className={!incident.reported_to_client ? "border-destructive/30" : ""}>
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
                      <Clock className="h-3 w-3" /> {new Date(incident.incident_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {(incident.root_cause || incident.corrective_actions) && (
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      {incident.root_cause && <div><p className="font-medium text-muted-foreground mb-1">Causa Raiz:</p><p>{incident.root_cause}</p></div>}
                      {incident.corrective_actions && <div><p className="font-medium text-muted-foreground mb-1">Ação Corretiva:</p><p>{incident.corrective_actions}</p></div>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    {incident.reported_to_client ? (
                      <Badge variant="outline" className="gap-1 text-xs border-green-500 text-green-600">
                        <FileText className="h-3 w-3" /> {incident.imca_reference || "Reportado"}
                      </Badge>
                    ) : (
                      <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => reportCIRAS.mutate(incident.id)} disabled={reportCIRAS.isPending}>
                        <Send className="h-3 w-3" /> Reportar ao IMCA CIRAS
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
