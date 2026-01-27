/**
 * NewContractDialog - Extracted from VesselContractsV2
 * Dialog for creating new vessel contracts
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, CheckCircle } from "lucide-react";
import type { NewContractForm } from "../hooks/useContractsData";

interface NewContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contract: NewContractForm) => Promise<boolean>;
}

const initialForm: NewContractForm = {
  contract_number: '',
  client_name: '',
  start_date: '',
  end_date: '',
  sla_downtime_percent: '',
  penalty_per_hour: '',
  terms: ''
};

export function NewContractDialog({ open, onOpenChange, onSubmit }: NewContractDialogProps) {
  const [form, setForm] = useState<NewContractForm>(initialForm);

  const handleSubmit = async () => {
    const success = await onSubmit(form);
    if (success) {
      setForm(initialForm);
      onOpenChange(false);
    }
  };

  const updateField = (field: keyof NewContractForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Contrato de Embarcação</DialogTitle>
          <DialogDescription>Registre os termos do contrato e SLA</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número do Contrato *</Label>
              <Input 
                placeholder="CNT-2024-001" 
                value={form.contract_number}
                onChange={(e) => updateField('contract_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente/Operador *</Label>
              <Input 
                placeholder="Nome do cliente"
                value={form.client_name}
                onChange={(e) => updateField('client_name', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input 
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input 
                type="date"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SLA Downtime Permitido (%)</Label>
              <Input 
                type="number" 
                placeholder="5.0" 
                step="0.1"
                value={form.sla_downtime_percent}
                onChange={(e) => updateField('sla_downtime_percent', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Penalidade por Hora (USD)</Label>
              <Input 
                type="number" 
                placeholder="1000"
                value={form.penalty_per_hour}
                onChange={(e) => updateField('penalty_per_hour', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Termos e Condições</Label>
            <Textarea 
              placeholder="Descreva os termos principais do contrato..." 
              rows={4}
              value={form.terms}
              onChange={(e) => updateField('terms', e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Registrar Contrato
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
