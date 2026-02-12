import { useState, type FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Loader2, MapPin, Ship } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logger } from '@/lib/logger';

interface CreateSGSOIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const INCIDENT_TYPES = [
  { value: "near_miss", label: "Quase Acidente (Near Miss)" },
  { value: "minor", label: "Incidente Menor" },
  { value: "major", label: "Incidente Maior" },
  { value: "environmental", label: "Ambiental" },
  { value: "operational", label: "Operacional" },
  { value: "safety", label: "Segurança" },
  { value: "equipment", label: "Equipamento" },
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Baixa", color: "text-success" },
  { value: "medium", label: "Média", color: "text-warning" },
  { value: "high", label: "Alta", color: "text-warning" },
  { value: "critical", label: "Crítica", color: "text-destructive" },
];

export const CreateSGSOIncidentDialog: FC<CreateSGSOIncidentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vessel_id: "",
    type: "operational",
    description: "",
    severity: "medium",
    corrective_action: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Fetch vessels for dropdown
  const { data: vessels } = useQuery({
    queryKey: ["vessels-for-sgso"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS não disponível no navegador");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setFormData((prev) => ({ ...prev, location: coords }));
        setGpsLoading(false);
        toast.success("Localização capturada", { description: coords });
      },
      () => {
        setGpsLoading(false);
        toast.error("Erro ao capturar GPS");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("soc_alerts")
        .insert({
          title: `Incidente SGSO: ${INCIDENT_TYPES.find(t => t.value === formData.type)?.label || formData.type}`,
          message: formData.description,
          severity: formData.severity,
          alert_type: formData.type,
          source_module: "sgso-incident",
          user_id: user?.id || null,
          metadata: {
            vessel_id: formData.vessel_id || null,
            location: formData.location || null,
            corrective_action: formData.corrective_action || null,
          },
        });

      if (error) throw error;

      toast.success("Incidente registrado com sucesso", {
        description: `Tipo: ${INCIDENT_TYPES.find(t => t.value === formData.type)?.label || formData.type}`,
      });
      
      // Invalidate incident queries
      queryClient.invalidateQueries({ queryKey: ["sgso-incidents-list"] });
      queryClient.invalidateQueries({ queryKey: ["sgso-incidents"] });

      // Reset form
      setFormData({
        vessel_id: "",
        type: "operational",
        description: "",
        severity: "medium",
        corrective_action: "",
        location: "",
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      logger.error("Error creating SGSO incident:", error);
      toast.error("Erro ao registrar incidente", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Novo Incidente SGSO
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vessel Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Embarcação
            </Label>
            <Select
              value={formData.vessel_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, vessel_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a embarcação (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {vessels?.map((vessel) => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name} {vessel.imo_number ? `(IMO: ${vessel.imo_number})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Incident Type */}
          <div className="space-y-2">
            <Label>Tipo de Incidente *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Gravidade *</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <span className={level.color}>{level.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição do Incidente *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o incidente em detalhes..."
              rows={4}
              required
            />
          </div>

          {/* Location with GPS */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localização
            </Label>
            <div className="flex gap-2">
              <Input
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Coordenadas ou descrição do local"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={captureGPS}
                disabled={gpsLoading}
              >
                {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Corrective Action */}
          <div className="space-y-2">
            <Label>Ação Corretiva Imediata</Label>
            <Textarea
              value={formData.corrective_action}
              onChange={(e) => setFormData((prev) => ({ ...prev, corrective_action: e.target.value }))}
              placeholder="Descreva as ações corretivas tomadas..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar Incidente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
