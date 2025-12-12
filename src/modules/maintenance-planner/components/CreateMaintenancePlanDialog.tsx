import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Wrench, AlertTriangle, Clock, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateMaintenancePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const equipmentList = [
  { id: "1", name: "Thruster STBD", code: "THR-001" },
  { id: "2", name: "Thruster PORT", code: "THR-002" },
  { id: "3", name: "Gerador Principal 1", code: "GEN-001" },
  { id: "4", name: "Gerador Principal 2", code: "GEN-002" },
  { id: "5", name: "Bomba Hidráulica", code: "HYD-001" },
  { id: "6", name: "Compressor de Ar", code: "CMP-001" },
  { id: "7", name: "Sistema DP", code: "DP-001" },
  { id: "8", name: "Sistema de Navegação", code: "NAV-001" },
];

const maintenanceTypes = [
  { value: "preventive", label: "Preventiva", color: "bg-blue-500" },
  { value: "corrective", label: "Corretiva", color: "bg-orange-500" },
  { value: "predictive", label: "Preditiva", color: "bg-purple-500" },
  { value: "inspection", label: "Inspeção", color: "bg-green-500" },
];

const priorityLevels = [
  { value: "low", label: "Baixa", color: "text-muted-foreground" },
  { value: "medium", label: "Média", color: "text-warning" },
  { value: "high", label: "Alta", color: "text-orange-500" },
  { value: "critical", label: "Crítica", color: "text-destructive" },
];

export const CreateMaintenancePlanDialog: React.FC<CreateMaintenancePlanDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    equipmentId: "",
    type: "",
    priority: "medium",
    scheduledDate: undefined as Date | undefined,
    estimatedHours: "",
    assignee: "",
    notes: "",
});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.equipmentId || !formData.type || !formData.scheduledDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      };
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - in production, save to database
      await new Promise(resolve => setTimeout(resolve, 1000));

      const equipment = equipmentList.find(e => e.id === formData.equipmentId);
      
      toast({
        title: "Plano de Manutenção Criado",
        description: `${formData.title} - ${equipment?.name} agendado para ${format(formData.scheduledDate, "dd/MM/yyyy", { locale: ptBR })}`,
      };

      // Reset form
      setFormData({
        title: "",
        description: "",
        equipmentId: "",
        type: "",
        priority: "medium",
        scheduledDate: undefined,
        estimatedHours: "",
        assignee: "",
        notes: "",
      };

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar plano de manutenção",
        variant: "destructive",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Novo Plano de Manutenção
          </DialogTitle>
          <DialogDescription>
            Crie um novo plano de manutenção para equipamentos da embarcação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Manutenção preventiva do Thruster"
                value={formData.title}
                onChange={handleChange})}
              />
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <Label>Equipamento *</Label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map((equip) => (
                    <SelectItem key={equip.id} value={equip.id}>
                      <span className="flex items-center gap-2">
                        {equip.name}
                        <Badge variant="outline" className="text-xs">
                          {equip.code}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Maintenance Type */}
            <div className="space-y-2">
              <Label>Tipo de Manutenção *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${type.color}`} />
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <span className={`flex items-center gap-2 ${level.color}`}>
                        {level.value === "critical" && <AlertTriangle className="h-3 w-3" />}
                        {level.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label>Data Programada *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? (
                      format(formData.scheduledDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="hours">Horas Estimadas</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hours"
                  type="number"
                  placeholder="Ex: 4"
                  className="pl-10"
                  value={formData.estimatedHours}
                  onChange={handleChange})}
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label htmlFor="assignee">Responsável</Label>
              <Input
                id="assignee"
                placeholder="Nome do técnico responsável"
                value={formData.assignee}
                onChange={handleChange})}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes do plano de manutenção..."
                rows={3}
                value={formData.description}
                onChange={handleChange})}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais, peças necessárias, etc..."
                rows={2}
                value={formData.notes}
                onChange={handleChange})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => handleonOpenChange}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Plano
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
