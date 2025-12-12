/**
import { useState, useCallback } from "react";;
 * Create Audit Dialog Component
 * Dialog para criar nova auditoria com formulário completo
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAudit: (audit: AuditFormData) => Promise<void>;
  vessels: { id: string; name: string }[];
}

interface AuditFormData {
  auditType: "internal" | "external" | "flag-state" | "class" | "psc";
  vesselId: string;
  vesselName: string;
  auditorName: string;
  scheduledDate: string;
  scope: string;
  objectives: string;
}

export const CreateAuditDialog = memo(function({
  open,
  onOpenChange,
  onCreateAudit,
  vessels,
}: CreateAuditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AuditFormData>>({
    auditType: "internal",
  });
  const [scheduledDate, setScheduledDate] = useState<Date>();

  const auditTypes = [
    { value: "internal", label: "Auditoria Interna" },
    { value: "external", label: "Auditoria Externa" },
    { value: "flag-state", label: "Auditoria de Bandeira" },
    { value: "class", label: "Auditoria de Classificadora" },
    { value: "psc", label: "Port State Control (PSC)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.auditType || !formData.vesselId || !formData.auditorName || !scheduledDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    try {
      const selectedVessel = vessels.find(v => v.id === formData.vesselId);
      
      await onCreateAudit({
        auditType: formData.auditType as AuditFormData["auditType"],
        vesselId: formData.vesselId,
        vesselName: selectedVessel?.name || "",
        auditorName: formData.auditorName,
        scheduledDate: format(scheduledDate, "yyyy-MM-dd"),
        scope: formData.scope || "",
        objectives: formData.objectives || "",
      };
      
      toast.success("Auditoria criada com sucesso");
      onOpenChange(false);
      setFormData({ auditType: "internal" });
      setScheduledDate(undefined);
    } catch (error) {
      console.error("Error creating audit:", error);
      toast.error("Erro ao criar auditoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Nova Auditoria
          </DialogTitle>
          <DialogDescription>
            Agende uma nova auditoria para verificação de conformidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditType">Tipo de Auditoria *</Label>
              <Select
                value={formData.auditType}
                onValueChange={(value) => setFormData({ ...formData, auditType: value as AuditFormData["auditType"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {auditTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vessel">Embarcação *</Label>
              <Select
                value={formData.vesselId}
                onValueChange={(value) => setFormData({ ...formData, vesselId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditor">Auditor Responsável *</Label>
              <Input
                id="auditor"
                placeholder="Nome do auditor"
                value={formData.auditorName || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Agendada *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Escopo da Auditoria</Label>
            <Textarea
              id="scope"
              placeholder="Descreva o escopo da auditoria..."
              value={formData.scope || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Objetivos</Label>
            <Textarea
              id="objectives"
              placeholder="Liste os objetivos principais..."
              value={formData.objectives || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleonOpenChange}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Auditoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
