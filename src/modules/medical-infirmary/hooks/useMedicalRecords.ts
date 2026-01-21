/**
 * Hook for Medical Records - uses existing useMedicalData with enhancements
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MedicalRecord } from '../types';
import { useMedicalRecords as useBaseMedicalRecords } from './useMedicalData';

export function useMedicalRecordsDB() {
  const queryClient = useQueryClient();
  const baseQuery = useBaseMedicalRecords();

  const createRecord = useMutation({
    mutationFn: async (record: Omit<MedicalRecord, 'id'>) => {
      // Store locally for now - full DB integration pending table schema update
      const newRecord = { ...record, id: crypto.randomUUID() };
      const existing = JSON.parse(localStorage.getItem('medical_records') || '[]');
      localStorage.setItem('medical_records', JSON.stringify([...existing, newRecord]));
      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Registro médico criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar registro médico')
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalRecord> & { id: string }) => {
      const existing = JSON.parse(localStorage.getItem('medical_records') || '[]');
      const updated = existing.map((r: MedicalRecord) => r.id === id ? { ...r, ...updates } : r);
      localStorage.setItem('medical_records', JSON.stringify(updated));
      return { id, ...updates };
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
