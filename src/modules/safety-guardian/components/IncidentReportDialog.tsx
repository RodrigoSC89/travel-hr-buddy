/**
import { useState, useCallback } from "react";;
 * Incident Report Dialog Component
 * Formulário completo para reportar ocorrências
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Upload,
  AlertTriangle,
  AlertCircle,
  Shield,
  Loader2,
  MapPin,
  Ship,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SafetyIncident } from "../types";

interface IncidentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (incident: Partial<SafetyIncident>) => Promise<void>;
}

const incidentTypes = [
  { value: "incident", label: "Incidente", icon: AlertCircle, color: "text-destructive" },
  { value: "near_miss", label: "Near Miss", icon: AlertTriangle, color: "text-warning" },
  { value: "unsafe_condition", label: "Condição Insegura", icon: Shield, color: "text-blue-500" },
  { value: "unsafe_act", label: "Ato Inseguro", icon: AlertTriangle, color: "text-orange-500" },
];

const severityLevels = [
  { value: "low", label: "Baixa", color: "bg-success/10 text-success border-success/20" },
  { value: "medium", label: "Média", color: "bg-warning/10 text-warning border-warning/20" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
  { value: "critical", label: "Crítica", color: "bg-destructive/10 text-destructive border-destructive/20" },
];

const vessels = [
  "PSV Atlantic Explorer",
  "AHTS Pacific Star",
  "OSV Ocean Pioneer",
  "PLSV Nautilus One",
  "FPSO Petrobras P-70",
];

export const IncidentReportDialog: React.FC<IncidentReportDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    vessel_name: "",
    location: "",
    severity: "",
    witnesses: "",
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.description || !formData.severity) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        type: formData.type as SafetyIncident["type"],
        severity: formData.severity as SafetyIncident["severity"],
        incident_date: format(date, "yyyy-MM-dd"),
        witnesses: formData.witnesses ? formData.witnesses.split(",").map(w => w.trim()) : [],
      });
      
      // Reset form
      setFormData({
        type: "",
        title: "",
        description: "",
        vessel_name: "",
        location: "",
        severity: "",
        witnesses: "",
      });
      setDate(new Date());
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = incidentTypes.find(t => t.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            Reportar Nova Ocorrência de Segurança
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da ocorrência. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Ocorrência *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {incidentTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.type === type.value ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 flex flex-col gap-1",
                    formData.type === type.value && "ring-2 ring-primary"
                  )}
                  onClick={handleSetFormData}
                >
                  <type.icon className={cn("h-5 w-5", formData.type !== type.value && type.color)} />
                  <span className="text-xs">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Descreva brevemente a ocorrência..."
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              placeholder="Descreva em detalhes o que aconteceu, quando, onde e como..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>Data da Ocorrência *</Label>
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
                    {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severidade *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a severidade" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={level.color}>
                          {level.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vessel */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Embarcação
              </Label>
              <Select
                value={formData.vessel_name}
                onValueChange={(value) => setFormData({ ...formData, vessel_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel} value={vessel}>
                      {vessel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local
              </Label>
              <Input
                id="location"
                placeholder="Ex: Convés principal, Sala de máquinas..."
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Witnesses */}
          <div className="space-y-2">
            <Label htmlFor="witnesses" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Testemunhas (opcional)
            </Label>
            <Input
              id="witnesses"
              placeholder="Nomes separados por vírgula..."
              value={formData.witnesses}
              onChange={handleChange}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Anexos (opcional)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste arquivos ou clique para anexar fotos, documentos ou evidências
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleonOpenChange}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-destructive hover:bg-destructive/90"
              disabled={loading || !formData.type || !formData.title || !formData.severity}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Reportar Ocorrência
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
