/**
 * HR Admissions Hook - React Query + Supabase
 * Pipeline de admissão digital
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface HRAdmission {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  position: string;
  department: string | null;
  proposed_salary: number | null;
  proposed_start_date: string | null;
  status: string | null;
  documents_requested: Json | null;
  documents_received: Json | null;
  documents_validated: Json | null;
  onboarding_progress: number | null;
  ai_validation_score: number | null;
  ai_flags: Json | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface CreateAdmissionInput {
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  position: string;
  department?: string;
  proposed_salary?: number;
  proposed_start_date?: string;
}

// GET - List all admissions
export function useHRAdmissions(filters?: { status?: string }) {
  return useQuery<HRAdmission[]>({
    queryKey: ['hr-admissions', filters],
    queryFn: async () => {
      let query = supabase
        .from('hr_admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as HRAdmission[];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// POST - Create admission
export function useCreateHRAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAdmissionInput) => {
      const { data, error } = await supabase
        .from('hr_admissions')
        .insert([{
          candidate_name: input.candidate_name,
          candidate_email: input.candidate_email,
          candidate_phone: input.candidate_phone || null,
          position: input.position,
          department: input.department || null,
          proposed_salary: input.proposed_salary || null,
          proposed_start_date: input.proposed_start_date || null,
          status: 'pending',
          onboarding_progress: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-admissions'] });
      toast.success('Admissão criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar admissão', { description: error.message });
    },
  });
}

// PUT - Update admission status
export function useUpdateHRAdmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const progressMap: Record<string, number> = {
        pending: 0,
        documents_sent: 15,
        documents_received: 40,
        validating: 60,
        approved: 80,
        contract_signed: 95,
        completed: 100,
        cancelled: 0,
      };

      const { data, error } = await supabase
        .from('hr_admissions')
        .update({ 
          status, 
          onboarding_progress: progressMap[status] || 0,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-admissions'] });
      toast.success('Status atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status', { description: error.message });
    },
  });
}

// DELETE - Cancel admission
export function useCancelHRAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hr_admissions')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-admissions'] });
      toast.success('Admissão cancelada');
    },
    onError: (error: Error) => {
      toast.error('Erro ao cancelar admissão', { description: error.message });
    },
  });
}

// Helper to count documents
export function countDocuments(docs: Json | null): number {
  if (!docs) return 0;
  if (Array.isArray(docs)) return docs.length;
  if (typeof docs === 'object') return Object.keys(docs).length;
  return 0;
}

// Helper to get progress
export function getAdmissionProgress(admission: HRAdmission): number {
  return admission.onboarding_progress || 0;
}
