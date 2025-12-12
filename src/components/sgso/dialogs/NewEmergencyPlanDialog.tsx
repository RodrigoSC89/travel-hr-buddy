/**
import { useState, useCallback } from "react";;
 * New Emergency Plan Dialog
 * Form to create a new emergency response plan
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import { AlertTriangle, Users, Phone, FileText, Save } from "lucide-react";

interface NewEmergencyPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanCreated?: (plan: unknown: unknown: unknown) => void;
}

const PLAN_TYPES = [
  { value: "fire", label: "Incêndio" },
  { value: "oil_spill", label: "Derramamento de Óleo" },
  { value: "man_overboard", label: "Homem ao Mar" },
  { value: "collision", label: "Colisão" },
  { value: "medical", label: "Emergência Médica" },
  { value: "abandon_ship", label: "Abandono de Embarcação" },
  { value: "flooding", label: "Alagamento" },
  { value: "grounding", label: "Encalhe" },
];

const DRILL_FREQUENCIES = [
  { value: "30", label: "Mensal (30 dias)" },
  { value: "60", label: "Bimestral (60 dias)" },
  { value: "90", label: "Trimestral (90 dias)" },
  { value: "180", label: "Semestral (180 dias)" },
  { value: "365", label: "Anual (365 dias)" },
];

export const NewEmergencyPlanDialog: React.FC<NewEmergencyPlanDialogProps> = ({
  open,
  onOpenChange,
  onPlanCreated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    responsible: "",
    alternateResponsible: "",
    drillFrequency: "90",
    procedures: "",
    equipmentRequired: "",
    contacts: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.responsible) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlan = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
        last_drill: null,
        next_drill: new Date(Date.now() + parseInt(formData.drillFrequency) * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };

      toast.success("Plano de emergência criado com sucesso!");
      onPlanCreated?.(newPlan);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: "",
        type: "",
        description: "",
        responsible: "",
        alternateResponsible: "",
        drillFrequency: "90",
        procedures: "",
        equipmentRequired: "",
        contacts: "",
      });
    } catch (error) {
      toast.error("Erro ao criar plano");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Novo Plano de Emergência
          </DialogTitle>
          <DialogDescription>
            Crie um novo plano de resposta a emergências conforme SGSO/ISM Code
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Plano *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Plano de Combate a Incêndio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Emergência *</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o objetivo e escopo do plano..."
              rows={3}
            />
          </div>

          {/* Responsibles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Responsável Principal *
              </Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={handleChange}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alternateResponsible">Responsável Suplente</Label>
              <Input
                id="alternateResponsible"
                value={formData.alternateResponsible}
                onChange={handleChange}
                placeholder="Nome do suplente"
              />
            </div>
          </div>

          {/* Drill Frequency */}
          <div className="space-y-2">
            <Label htmlFor="drillFrequency">Frequência de Simulados</Label>
            <Select value={formData.drillFrequency} onValueChange={(v) => handleChange("drillFrequency", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DRILL_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procedures */}
          <div className="space-y-2">
            <Label htmlFor="procedures" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Procedimentos
            </Label>
            <Textarea
              id="procedures"
              value={formData.procedures}
              onChange={handleChange}
              placeholder="Liste os procedimentos de resposta..."
              rows={4}
            />
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label htmlFor="equipmentRequired">Equipamentos Necessários</Label>
            <Textarea
              id="equipmentRequired"
              value={formData.equipmentRequired}
              onChange={handleChange}
              placeholder="Liste os equipamentos necessários..."
              rows={2}
            />
          </div>

          {/* Contacts */}
          <div className="space-y-2">
            <Label htmlFor="contacts" className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Contatos de Emergência
            </Label>
            <Textarea
              id="contacts"
              value={formData.contacts}
              onChange={handleChange}
              placeholder="Liste os contatos relevantes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Criar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
