/**
 * DowntimeFormDialog - Formulário para registro de downtime
 * Integração com vessel_downtimes e validação IA
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Ship } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DowntimeCategory = 'mechanical' | 'weather' | 'operational' | 'administrative' | 'regulatory' | 'emergency';

interface DowntimeFormData {
  start_time: string;
  end_time: string;
  reported_reason: string;
  category: DowntimeCategory;
  vessel_id?: string;
  contract_id?: string;
  notes?: string;
}

interface Vessel {
  id: string;
  name: string;
}

interface DowntimeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DowntimeFormData) => Promise<void>;
  contractId?: string;
}

const categoryOptions: { value: DowntimeCategory; label: string }[] = [
  { value: 'mechanical', label: 'Mecânico' },
  { value: 'weather', label: 'Clima/Meteorologia' },
  { value: 'operational', label: 'Operacional' },
  { value: 'administrative', label: 'Administrativo' },
  { value: 'regulatory', label: 'Regulatório' },
  { value: 'emergency', label: 'Emergência' },
];

export function DowntimeFormDialog({ open, onOpenChange, onSubmit, contractId }: DowntimeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [formData, setFormData] = useState<DowntimeFormData>({
    start_time: '',
    end_time: '',
    reported_reason: '',
    category: 'operational',
    contract_id: contractId,
  });

  useEffect(() => {
    const fetchVessels = async () => {
      const { data } = await supabase
        .from('vessels')
        .select('id, name')
        .order('name');
      if (data) setVessels(data);
    };
    if (open) fetchVessels();
  }, [open]);

  useEffect(() => {
    if (contractId) {
      setFormData(prev => ({ ...prev, contract_id: contractId }));
    }
  }, [contractId]);

  const handleSubmit = async () => {
    if (!formData.start_time || !formData.reported_reason || !formData.category) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        start_time: '',
        end_time: '',
        reported_reason: '',
        category: 'operational',
        contract_id: contractId,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.start_time && formData.reported_reason && formData.category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registrar Evento de Downtime
          </DialogTitle>
          <DialogDescription>
            Registre paradas e indisponibilidades para validação BROA com IA
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Vessel Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ship className="h-4 w-4" /> Embarcação
            </Label>
            <Select 
              value={formData.vessel_id || ''} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, vessel_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a embarcação..." />
              </SelectTrigger>
              <SelectContent>
                {vessels.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Period */}
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
              <p className="text-xs text-muted-foreground">Deixe vazio se ainda em andamento</p>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v: DowntimeCategory) => setFormData(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Motivo/Justificativa *</Label>
            <Textarea 
              placeholder="Descreva detalhadamente o motivo do downtime para análise BROA..." 
              rows={4}
              value={formData.reported_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reported_reason: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Quanto mais detalhado, melhor a validação da IA
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações Adicionais</Label>
            <Textarea 
              placeholder="Informações complementares (opcional)..." 
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={loading || !isValid}
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
