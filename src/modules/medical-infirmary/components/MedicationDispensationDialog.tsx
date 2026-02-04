/**
 * Dialog for Dispensing Medications
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pill, AlertTriangle, User, Package, Loader2 } from 'lucide-react';
import { useCrewMembers } from '../hooks/useMedicalData';
import { useDispenseMedication } from '../hooks/useMedicationDispensation';
import { MedicalSupply } from '../types';

interface MedicationDispensationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply: MedicalSupply | null;
}

export function MedicationDispensationDialog({ open, onOpenChange, supply }: MedicationDispensationDialogProps) {
  const { data: crewMembers = [] } = useCrewMembers();
  const dispenseMutation = useDispenseMedication();
  
  const [formData, setFormData] = useState({
    crewMemberId: '',
    quantity: 1,
    reason: '',
    notes: ''
  });

  const handleDispense = async () => {
    if (!supply) return;

    await dispenseMutation.mutateAsync({
      supply_id: supply.id,
      crew_member_id: formData.crewMemberId || undefined,
      medication_name: supply.name,
      quantity_dispensed: formData.quantity,
      unit: supply.unit,
      batch_number: supply.batchNumber,
      reason: formData.reason,
      dispensed_by_name: 'Oficial Médico',
      notes: formData.notes
    });

    setFormData({ crewMemberId: '', quantity: 1, reason: '', notes: '' });
    onOpenChange(false);
  };

  const isLowStock = supply && formData.quantity > supply.quantity;
  const isEmptyingStock = supply && formData.quantity === supply.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Dispensar Medicamento
          </DialogTitle>
          <DialogDescription>
            Registre a retirada de medicamento do estoque
          </DialogDescription>
        </DialogHeader>

        {supply && (
          <div className="space-y-4 py-4">
            {/* Medication Info */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{supply.name}</span>
                <Badge variant="outline">{supply.category}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Estoque: {supply.quantity} {supply.unit}
                </span>
                <span>Lote: {supply.batchNumber || 'N/A'}</span>
              </div>
              {supply.expiryDate && (
                <div className="text-xs text-muted-foreground">
                  Validade: {new Date(supply.expiryDate).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>

            {/* Crew Member Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Tripulante (opcional)
              </Label>
              <Select 
                value={formData.crewMemberId} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, crewMemberId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tripulante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Uso geral / Não especificado</SelectItem>
                  {crewMembers.map(crew => (
                    <SelectItem key={crew.id} value={crew.id}>
                      {crew.name} - {crew.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  max={supply.quantity}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input value={supply.unit} disabled />
              </div>
            </div>

            {/* Warnings */}
            {isLowStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Quantidade maior que o estoque disponível!
                </AlertDescription>
              </Alert>
            )}

            {isEmptyingStock && !isLowStock && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Atenção: Esta dispensação irá zerar o estoque deste medicamento.
                </AlertDescription>
              </Alert>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, reason: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta médica</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                  <SelectItem value="rotina">Tratamento de rotina</SelectItem>
                  <SelectItem value="primeiros_socorros">Primeiros socorros</SelectItem>
                  <SelectItem value="preventivo">Uso preventivo</SelectItem>
                  <SelectItem value="reposicao_kit">Reposição de kit de emergência</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Instruções de uso, observações relevantes..."
                rows={2}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDispense} 
            disabled={dispenseMutation.isPending || isLowStock || !supply}
          >
            {dispenseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Dispensação'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
