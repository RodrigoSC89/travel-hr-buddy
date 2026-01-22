/**
 * DowntimeFormDialog - Formulário para registro de downtime
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

interface DowntimeFormData {
  start_time: string;
  end_time: string;
  reason: string;
  reason_category: string;
  impact_level: string;
  vessel_id?: string;
  notes?: string;
}

interface DowntimeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DowntimeFormData) => Promise<void>;
}

export function DowntimeFormDialog({ open, onOpenChange, onSubmit }: DowntimeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DowntimeFormData>({
    start_time: '',
    end_time: '',
    reason: '',
    reason_category: '',
    impact_level: 'medium',
  });

  const handleSubmit = async () => {
    if (!formData.start_time || !formData.reason || !formData.reason_category) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        start_time: '',
        end_time: '',
        reason: '',
        reason_category: '',
        impact_level: 'medium',
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
            Registrar Evento de Downtime
          </DialogTitle>
          <DialogDescription>
            Registre paradas e indisponibilidades operacionais
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início do Downtime *</Label>
              <Input 
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim do Downtime</Label>
              <Input 
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select 
                value={formData.reason_category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, reason_category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mechanical">Mecânico</SelectItem>
                  <SelectItem value="electrical">Elétrico</SelectItem>
                  <SelectItem value="weather">Clima</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="regulatory">Regulatório</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível de Impacto</Label>
              <Select 
                value={formData.impact_level} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, impact_level: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motivo/Descrição *</Label>
            <Textarea 
              placeholder="Descreva o motivo do downtime..." 
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
            disabled={loading || !formData.start_time || !formData.reason || !formData.reason_category}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? 'Registrando...' : 'Registrar Downtime'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DowntimeFormDialog;
