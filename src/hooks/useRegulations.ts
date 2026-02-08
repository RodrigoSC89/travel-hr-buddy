/**
 * Hook para Regulamentações - integração real com Supabase
 * CRUD usando maritime_regulations (tabela canônica no schema)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface Regulation {
  id: string;
  reg_code: string;
  title: string;
  description?: string;
  authority: string;
  category: string;
  subcategory?: string;
  effective_date?: string;
  revision_date?: string;
  compliance_deadline?: string;
  is_mandatory: boolean;
  applies_to?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  documentation_required?: string[];
  penalties?: string;
  related_regulations?: string[];
  source_url?: string;
  full_text?: string;
  reg_status: string;
  ai_summary?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateRegulationInput {
  reg_code: string;
  title: string;
  description?: string;
  authority: string;
  category: string;
  subcategory?: string;
  effective_date?: string;
  revision_date?: string;
  compliance_deadline?: string;
  is_mandatory?: boolean;
  applies_to?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  documentation_required?: string[];
  penalties?: string;
  related_regulations?: string[];
  source_url?: string;
  full_text?: string;
  reg_status?: string;
  ai_summary?: Record<string, unknown>;
}

// Map maritime_regulations row to Regulation interface
function mapToRegulation(reg: {
  id: string;
  title: string;
  description: string | null;
  requirement_code: string | null;
  regulation_type: string | null;
  status: string | null;
  due_date: string | null;
  ai_score: number | null;
  created_at: string | null;
  updated_at: string | null;
}): Regulation {
  return {
    id: reg.id,
    reg_code: reg.requirement_code || reg.id.slice(0, 8),
    title: reg.title,
    description: reg.description || undefined,
    authority: 'IMO',
    category: reg.regulation_type || 'safety',
    is_mandatory: true,
    reg_status: reg.status || 'active',
    compliance_deadline: reg.due_date || undefined,
    created_at: reg.created_at || new Date().toISOString(),
    updated_at: reg.updated_at || new Date().toISOString(),
  };
}

export function useRegulations(filters?: { category?: string; authority?: string; status?: string }) {
  return useQuery({
    queryKey: ['regulations', filters],
    queryFn: async (): Promise<Regulation[]> => {
      try {
        let query = supabase
          .from('maritime_regulations')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.category) {
          query = query.eq('regulation_type', filters.category);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query.limit(100);

        if (error) {
          logger.error('Error fetching regulations:', error);
          return [];
        }

        return (data || []).map(mapToRegulation);
      } catch (err) {
        logger.error('Error in useRegulations:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegulation(id: string) {
  return useQuery({
    queryKey: ['regulation', id],
    queryFn: async (): Promise<Regulation | null> => {
      try {
        const { data, error } = await supabase
          .from('maritime_regulations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          logger.error('Error fetching regulation:', error);
          return null;
        }

        if (!data) return null;
        return mapToRegulation(data);
      } catch (err) {
        logger.error('Error in useRegulation:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useCreateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRegulationInput) => {
      const { data, error } = await supabase
        .from('maritime_regulations')
        .insert({
          requirement_code: input.reg_code,
          title: input.title,
          description: input.description,
          regulation_type: input.category,
          due_date: input.compliance_deadline,
          status: input.reg_status || 'active',
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating regulation:', error);
        throw new Error(`Erro ao criar regulamentação: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      toast.success('Regulamentação criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateRegulationInput> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (input.reg_code !== undefined) updateData.requirement_code = input.reg_code;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.category !== undefined) updateData.regulation_type = input.category;
      if (input.compliance_deadline !== undefined) updateData.due_date = input.compliance_deadline;
      if (input.reg_status !== undefined) updateData.status = input.reg_status;

      const { data, error } = await supabase
        .from('maritime_regulations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating regulation:', error);
        throw new Error(`Erro ao atualizar regulamentação: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      queryClient.invalidateQueries({ queryKey: ['regulation', variables.id] });
      toast.success('Regulamentação atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maritime_regulations')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting regulation:', error);
        throw new Error(`Erro ao excluir regulamentação: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      toast.success('Regulamentação excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
