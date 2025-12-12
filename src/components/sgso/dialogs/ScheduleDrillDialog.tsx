/**
import { useState, useCallback } from "react";;
 * Schedule Drill Dialog
 * Dialog to schedule emergency drills
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Clock, CalendarIcon, Users, MapPin, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ScheduleDrillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrillScheduled?: (drill: unknown: unknown: unknown) => void;
}

const DRILL_TYPES = [
  { value: "fire", label: "Combate a Incêndio" },
  { value: "abandon_ship", label: "Abandono de Embarcação" },
  { value: "man_overboard", label: "Homem ao Mar" },
  { value: "oil_spill", label: "Derramamento de Óleo" },
  { value: "medical", label: "Emergência Médica" },
  { value: "collision", label: "Colisão" },
  { value: "general", label: "Simulado Geral" },
];

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export const ScheduleDrillDialog: React.FC<ScheduleDrillDialogProps> = ({
  open,
  onOpenChange,
  onDrillScheduled,
}) => {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    type: "",
    time: "10:00",
    duration: "60",
    location: "",
    coordinator: "",
    participants: "",
    objectives: "",
    notes: "",
};
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  });

  const handleSubmit = async () => {
    if (!date || !formData.type || !formData.coordinator) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDrill = {
        id: Date.now().toString(),
        ...formData,
        date: date.toISOString(),
        status: "scheduled",
        created_at: new Date().toISOString(),
      };

      toast.success(`Simulado agendado para ${format(date, "dd/MM/yyyy", { locale: ptBR })} às ${formData.time}`);
      onDrillScheduled?.(newDrill);
      onOpenChange(false);
      
      // Reset form
      setDate(undefined);
      setFormData({
        type: "",
        time: "10:00",
        duration: "60",
        location: "",
        coordinator: "",
        participants: "",
        objectives: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Erro ao agendar simulado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Agendar Simulado de Emergência
          </DialogTitle>
          <DialogDescription>
            Programe um simulado de emergência conforme requisitos SGSO/ISM Code
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Simulado *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Select value={formData.time} onValueChange={(v) => handleChange("time", v}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Simulado *</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange("type", v}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DRILL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select value={formData.duration} onValueChange={(v) => handleChange("duration", v}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="180">3 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Local / Área
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Convés principal, Praça de máquinas, etc."
            />
          </div>

          {/* Coordinator */}
          <div className="space-y-2">
            <Label htmlFor="coordinator" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Coordenador do Simulado *
            </Label>
            <Input
              id="coordinator"
              value={formData.coordinator}
              onChange={handleChange}
              placeholder="Nome do responsável pela condução"
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label htmlFor="participants">Participantes</Label>
            <Textarea
              id="participants"
              value={formData.participants}
              onChange={handleChange}
              placeholder="Liste os participantes ou equipes envolvidas..."
              rows={2}
            />
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <Label htmlFor="objectives">Objetivos do Simulado</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="Descreva os objetivos a serem alcançados..."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notas adicionais..."
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
            {isSubmitting ? "Agendando..." : "Agendar Simulado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
