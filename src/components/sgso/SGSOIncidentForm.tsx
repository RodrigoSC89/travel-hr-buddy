import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SGSOIncident } from "@/types/incident";
import { toast } from "sonner";

interface SGSOIncidentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident?: SGSOIncident | null;
  onSave: () => void;
}

const SEVERITIES = ["Baixa", "Média", "Alta", "Crítica"];
const STATUSES = ["open", "investigating", "resolved", "closed"];
const INCIDENT_TYPES = [
  "Falha de sistema",
  "Erro humano",
  "Não conformidade com procedimento",
  "Problema de comunicação",
  "Fator externo (clima, mar, etc)",
  "Falha organizacional",
  "Ausência de manutenção preventiva",
];

export function SGSOIncidentForm({ open, onOpenChange, incident, onSave }: SGSOIncidentFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    severity: "Média",
    status: "open",
    reported_at: new Date().toISOString().slice(0, 16),
    corrective_action: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (incident) {
      setFormData({
        type: incident.type || "",
        description: incident.description || "",
        severity: incident.severity || "Média",
        status: incident.status || "open",
        reported_at: incident.reported_at ? new Date(incident.reported_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        corrective_action: incident.corrective_action || "",
      });
    } else {
      setFormData({
        type: "",
        description: "",
        severity: "Média",
        status: "open",
        reported_at: new Date().toISOString().slice(0, 16),
        corrective_action: "",
      });
    }
  }, [incident, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = incident 
        ? `/api/sgso/incidents/${incident.id}` 
        : "/api/sgso/incidents";
      
      const method = incident ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save incident");
      }

      toast.success(incident ? "Incidente atualizado com sucesso!" : "Incidente criado com sucesso!");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving incident:", error);
      toast.error("Erro ao salvar incidente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{incident ? "Editar Incidente" : "Novo Incidente SGSO"}</DialogTitle>
          <DialogDescription>
            {incident ? "Atualize as informações do incidente" : "Registre um novo incidente de segurança operacional"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Incidente *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              required
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o incidente em detalhes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severidade *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
                required
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "open" ? "Aberto" :
                       status === "investigating" ? "Em Investigação" :
                       status === "resolved" ? "Resolvido" :
                       "Fechado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reported_at">Data e Hora do Incidente *</Label>
            <Input
              id="reported_at"
              type="datetime-local"
              value={formData.reported_at}
              onChange={(e) => setFormData({ ...formData, reported_at: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corrective_action">Ação Corretiva</Label>
            <Textarea
              id="corrective_action"
              placeholder="Descreva as ações corretivas tomadas ou planejadas..."
              value={formData.corrective_action}
              onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : incident ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
