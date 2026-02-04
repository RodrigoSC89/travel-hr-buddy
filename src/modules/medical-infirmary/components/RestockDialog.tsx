/**
 * Dialog for Restocking Medications
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Loader2, Calendar, Hash } from 'lucide-react';
import { useRestockMedication } from '../hooks/useMedicationDispensation';
import { MedicalSupply } from '../types';

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply: MedicalSupply | null;
}

export function RestockDialog({ open, onOpenChange, supply }: RestockDialogProps) {
  const restockMutation = useRestockMedication();
  
  const [formData, setFormData] = useState({
    quantity: 0,
    batchNumber: '',
    expiryDate: ''
  });

  const handleRestock = async () => {
    if (!supply || formData.quantity <= 0) return;

    await restockMutation.mutateAsync({
      supplyId: supply.id,
      quantity: formData.quantity,
      batchNumber: formData.batchNumber || undefined,
      expiryDate: formData.expiryDate || undefined
    });

    setFormData({ quantity: 0, batchNumber: '', expiryDate: '' });
    onOpenChange(false);
  };

  const newTotal = (supply?.quantity || 0) + formData.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Reabastecer Estoque
          </DialogTitle>
          <DialogDescription>
            Adicione mais unidades ao estoque do medicamento
          </DialogDescription>
        </DialogHeader>

        {supply && (
          <div className="space-y-4 py-4">
            {/* Current Stock Info */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{supply.name}</span>
                <Badge variant="outline">{supply.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Estoque atual:</span>
                  <span className="ml-2 font-medium">{supply.quantity} {supply.unit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mínimo:</span>
                  <span className="ml-2 font-medium">{supply.minStock} {supply.unit}</span>
                </div>
              </div>
              {supply.batchNumber && (
                <div className="text-sm text-muted-foreground">
                  Lote atual: {supply.batchNumber}
                </div>
              )}
            </div>

            {/* Quantity to Add */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantidade a adicionar
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="Ex: 100"
                />
                <Input value={supply.unit} disabled className="w-24" />
              </div>
            </div>

            {/* New Total Preview */}
            {formData.quantity > 0 && (
              <div className="p-2 bg-success/10 rounded-lg text-center">
                <span className="text-sm text-muted-foreground">Novo total: </span>
                <span className="font-bold text-success">{newTotal} {supply.unit}</span>
              </div>
            )}

            {/* Batch Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Número do Lote (novo lote)
              </Label>
              <Input
                value={formData.batchNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                placeholder="Ex: LOT2024-001"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Validade (novo lote)
              </Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRestock} 
            disabled={restockMutation.isPending || formData.quantity <= 0}
            className="bg-success hover:bg-success/90"
          >
            {restockMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Reabastecimento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
