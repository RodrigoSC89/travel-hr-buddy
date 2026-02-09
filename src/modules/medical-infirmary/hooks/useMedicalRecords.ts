/**
 * Hook for Medical Records - uses Supabase for persistence
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MedicalRecord } from '../types';
import { useMedicalRecords as useBaseMedicalRecords } from './useMedicalData';
import { supabase } from '@/integrations/supabase/client';

export function useMedicalRecordsDB() {
  const queryClient = useQueryClient();
  const baseQuery = useBaseMedicalRecords();

  const createRecord = useMutation({
    mutationFn: async (record: Omit<MedicalRecord, 'id'>) => {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          crew_member_id: record.crewMemberId,
          crew_member_name: record.crewMemberName,
          notes: record.notes || '',
          status: record.status || 'monitoring',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Registro médico criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar registro médico')
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalRecord> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.crewMemberName !== undefined) updateData.crew_member_name = updates.crewMemberName;
      
      const { data, error } = await supabase
        .from('medical_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Registro médico atualizado');
    },
    onError: () => toast.error('Erro ao atualizar registro')
  });

  return {
    records: baseQuery.data || [],
    isLoading: baseQuery.isLoading,
    error: baseQuery.error,
    refetch: baseQuery.refetch,
    createRecord,
    updateRecord
  };
}
