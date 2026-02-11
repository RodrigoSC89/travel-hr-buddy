/**
 * Hook for Medication Dispensation - Sistema de Retirada de Medicamentos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface MedicationDispensation {
  id: string;
  supply_id: string;
  crew_member_id?: string;
  medical_record_id?: string;
  medication_name: string;
  quantity_dispensed: number;
  unit: string;
  batch_number?: string;
  reason?: string;
  dispensed_by?: string;
  dispensed_by_name?: string;
  dispensed_at: string;
  notes?: string;
}

export function useMedicationDispensations(supplyId?: string) {
  return useQuery({
    queryKey: ['medication-dispensations', supplyId],
    queryFn: async (): Promise<MedicationDispensation[]> => {
      let query = supabase
        .from('medication_dispensations')
        .select('*')
        .order('dispensed_at', { ascending: false })
        .limit(100);

      if (supplyId) {
        query = query.eq('supply_id', supplyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        supply_id: row.supply_id || '',
        crew_member_id: row.crew_member_id || undefined,
        medical_record_id: row.medical_record_id || undefined,
        medication_name: row.medication_name,
        quantity_dispensed: row.quantity_dispensed,
        unit: row.unit,
        batch_number: row.batch_number || undefined,
        reason: row.reason || undefined,
        dispensed_by: row.dispensed_by || undefined,
        dispensed_by_name: row.dispensed_by_name || undefined,
        dispensed_at: row.dispensed_at || new Date().toISOString(),
        notes: row.notes || undefined
      }));
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useDispenseMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispensation: Omit<MedicationDispensation, 'id' | 'dispensed_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Create dispensation record
      const { data, error } = await supabase
        .from('medication_dispensations')
        .insert({
          supply_id: dispensation.supply_id,
          crew_member_id: dispensation.crew_member_id,
          medication_name: dispensation.medication_name,
          quantity_dispensed: dispensation.quantity_dispensed,
          unit: dispensation.unit,
          batch_number: dispensation.batch_number,
          reason: dispensation.reason,
          dispensed_by: user?.id,
          dispensed_by_name: dispensation.dispensed_by_name,
          notes: dispensation.notes
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Update supply quantity (subtract dispensed amount)
      const { data: currentSupply } = await supabase
        .from('medical_supplies')
        .select('quantity')
        .eq('id', dispensation.supply_id)
        .single();

      if (currentSupply) {
        const newQuantity = Math.max(0, (currentSupply.quantity || 0) - dispensation.quantity_dispensed);
        await supabase
          .from('medical_supplies')
          .update({ quantity: newQuantity })
          .eq('id', dispensation.supply_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-dispensations'] });
      queryClient.invalidateQueries({ queryKey: ['medical-supplies'] });
      toast.success('Medicamento dispensado com sucesso');
    },
    onError: (error) => {
      logger.error('Dispensation error:', error);
      toast.error('Erro ao dispensar medicamento');
    }
  });
}

export function useRestockMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplyId, quantity, batchNumber, expiryDate }: { 
      supplyId: string; 
      quantity: number;
      batchNumber?: string;
      expiryDate?: string;
    }) => {
      const { data: currentSupply } = await supabase
        .from('medical_supplies')
        .select('quantity')
        .eq('id', supplyId)
        .single();

      const newQuantity = (currentSupply?.quantity || 0) + quantity;

      const updateData: Record<string, unknown> = { 
        quantity: newQuantity,
        last_restock: new Date().toISOString().split('T')[0]
      };

      if (batchNumber) updateData.batch_number = batchNumber;
      if (expiryDate) updateData.expiry_date = expiryDate;

      const { data, error } = await supabase
        .from('medical_supplies')
        .update(updateData)
        .eq('id', supplyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-supplies'] });
      toast.success('Estoque reabastecido com sucesso');
    },
    onError: () => toast.error('Erro ao reabastecer estoque')
  });
}
