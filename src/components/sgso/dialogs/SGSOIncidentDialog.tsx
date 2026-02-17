/**
 * SGSOIncidentDialog - Extracted from SgsoDashboard
 * Dialog for registering SGSO incidents
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IncidentForm {
  title: string;
  type: string;
  severity: string;
  description: string;
  vessel: string;
  location: string;
}

interface SGSOIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}

const initialForm: IncidentForm = {
  title: "",
  type: "",
  severity: "",
  description: "",
  vessel: "",
  location: ""
};

export function SGSOIncidentDialog({ open, onOpenChange, triggerClassName }: SGSOIncidentDialogProps) {
  const [form, setForm] = useState<IncidentForm>(initialForm);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.title || !form.type || !form.severity) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "✅ Incidente Registrado",
      description: `Incidente "${form.title}" foi registrado com sucesso.`
    });
    onOpenChange(false);
    setForm(initialForm);
  };

  const updateField = (field: keyof IncidentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className={triggerClassName || "bg-destructive hover:bg-destructive/90 text-destructive-foreground h-auto py-6 flex-col gap-2"}>
          <Bell className="h-6 w-6" />
          <span className="font-semibold">Reportar Incidente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-destructive" />
            Registrar Novo Incidente
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do incidente para registro no SGSO
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="incident-title">Título do Incidente *</Label>
            <Input
              id="incident-title"
              placeholder="Descreva brevemente o incidente"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Acidente</SelectItem>
                  <SelectItem value="near_miss">Quase Acidente</SelectItem>
                  <SelectItem value="environmental">Ambiental</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="security">Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severidade *</Label>
              <Select value={form.severity} onValueChange={(v) => updateField('severity', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incident-vessel">Embarcação</Label>
              <Input
                id="incident-vessel"
                placeholder="Nome da embarcação"
                value={form.vessel}
                onChange={(e) => updateField('vessel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incident-location">Local</Label>
              <Input
                id="incident-location"
                placeholder="Local do incidente"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-description">Descrição Detalhada</Label>
            <Textarea
              id="incident-description"
              placeholder="Descreva o incidente em detalhes..."
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <Button className="w-full bg-destructive hover:bg-destructive/90" onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Registrar Incidente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
