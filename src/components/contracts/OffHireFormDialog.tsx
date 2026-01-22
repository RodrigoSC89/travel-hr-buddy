/**
 * OffHireFormDialog - Formulário para registro de off-hire
 * PATCH: Substituição de toast placeholder por formulário funcional
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock } from "lucide-react";

interface OffHireFormData {
  start_date: string;
  end_date: string;
  reason: string;
  reason_type: string;
  vessel_name: string;
  charter_contract_id?: string;
  notes?: string;
}

interface OffHireFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OffHireFormData) => Promise<void>;
}

export function OffHireFormDialog({ open, onOpenChange, onSubmit }: OffHireFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OffHireFormData>({
    start_date: '',
    end_date: '',
    reason: '',
    reason_type: '',
    vessel_name: '',
  });

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.reason || !formData.reason_type) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        start_date: '',
        end_date: '',
        reason: '',
        reason_type: '',
        vessel_name: '',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registrar Período Off-Hire
          </DialogTitle>
          <DialogDescription>
            Registre períodos de off-hire conforme cláusulas do charter party
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Embarcação *</Label>
            <Input 
              placeholder="Nome da embarcação"
              value={formData.vessel_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vessel_name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início do Off-Hire *</Label>
              <Input 
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim do Off-Hire</Label>
              <Input 
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Off-Hire *</Label>
            <Select 
              value={formData.reason_type} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, reason_type: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakdown">Avaria Mecânica</SelectItem>
                <SelectItem value="drydock">Docagem</SelectItem>
                <SelectItem value="deviation">Desvio de Rota</SelectItem>
                <SelectItem value="bunkering">Bunker</SelectItem>
                <SelectItem value="detention">Detenção</SelectItem>
                <SelectItem value="weather">Força Maior (Clima)</SelectItem>
                <SelectItem value="strikes">Greves</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição/Justificativa *</Label>
            <Textarea 
              placeholder="Descreva o motivo do off-hire..." 
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações Adicionais</Label>
            <Textarea 
              placeholder="Notas adicionais (opcional)..." 
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={loading || !formData.start_date || !formData.reason || !formData.reason_type}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? 'Registrando...' : 'Registrar Off-Hire'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OffHireFormDialog;
