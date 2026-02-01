/**
 * Hook para Regulamentações - integração real com Supabase
 * CRUD completo para regulatory_requirements ou tabela equivalente
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

// Helper function to map database record to Regulation interface
function mapToRegulation(reg: Record<string, unknown>): Regulation {
  return {
    id: String(reg.id || ''),
    reg_code: String(reg.requirement_code || reg.id || '').slice(0, 8),
    title: String(reg.title || reg.description || 'Regulamentação'),
    description: reg.description ? String(reg.description) : undefined,
    authority: String(reg.authority || reg.issuing_body || 'IMO'),
    category: String(reg.category || 'safety'),
    subcategory: reg.subcategory ? String(reg.subcategory) : undefined,
    effective_date: reg.effective_date ? String(reg.effective_date) : undefined,
    revision_date: reg.updated_at ? String(reg.updated_at) : undefined,
    compliance_deadline: reg.compliance_deadline ? String(reg.compliance_deadline) : undefined,
    is_mandatory: reg.is_mandatory !== false,
    applies_to: reg.applies_to as Record<string, unknown> | undefined,
    requirements: reg.requirements as Record<string, unknown> | undefined,
    documentation_required: Array.isArray(reg.documentation_required) ? reg.documentation_required as string[] : undefined,
    penalties: reg.penalties ? String(reg.penalties) : undefined,
    related_regulations: Array.isArray(reg.related_regulations) ? reg.related_regulations as string[] : undefined,
    source_url: reg.source_url ? String(reg.source_url) : undefined,
    full_text: reg.full_text ? String(reg.full_text) : undefined,
    reg_status: String(reg.status || 'active'),
    ai_summary: reg.ai_summary as Record<string, unknown> | undefined,
    created_at: String(reg.created_at || new Date().toISOString()),
    updated_at: String(reg.updated_at || new Date().toISOString()),
  };
}

export function useRegulations(filters?: { category?: string; authority?: string; status?: string }) {
  return useQuery({
    queryKey: ['regulations', filters],
    queryFn: async (): Promise<Regulation[]> => {
      try {
        // Try to fetch from regulatory_requirements table using any cast
        let query = (supabase as any)
          .from('regulatory_requirements')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.authority) {
          query = query.eq('authority', filters.authority);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query.limit(100);

        if (error) {
          logger.error('Error fetching regulations:', error);
          // Return empty array - UI should show EmptyState
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        // Map database fields to Regulation interface
        return (data as Record<string, unknown>[]).map(mapToRegulation);
      } catch (err) {
        logger.error('Error in useRegulations:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegulation(id: string) {
  return useQuery({
    queryKey: ['regulation', id],
    queryFn: async (): Promise<Regulation | null> => {
      try {
        const { data, error } = await (supabase as any)
          .from('regulatory_requirements')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          logger.error('Error fetching regulation:', error);
          return null;
        }

        if (!data) return null;

        return mapToRegulation(data as Record<string, unknown>);
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
      const { data, error } = await (supabase as any)
        .from('regulatory_requirements')
        .insert({
          requirement_code: input.reg_code,
          title: input.title,
          description: input.description,
          authority: input.authority,
          category: input.category,
          subcategory: input.subcategory,
          effective_date: input.effective_date,
          compliance_deadline: input.compliance_deadline,
          is_mandatory: input.is_mandatory ?? true,
          applies_to: input.applies_to,
          requirements: input.requirements,
          documentation_required: input.documentation_required,
          penalties: input.penalties,
          related_regulations: input.related_regulations,
          source_url: input.source_url,
          full_text: input.full_text,
          status: input.reg_status || 'active',
          ai_summary: input.ai_summary,
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
      if (input.authority !== undefined) updateData.authority = input.authority;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.subcategory !== undefined) updateData.subcategory = input.subcategory;
      if (input.effective_date !== undefined) updateData.effective_date = input.effective_date;
      if (input.compliance_deadline !== undefined) updateData.compliance_deadline = input.compliance_deadline;
      if (input.is_mandatory !== undefined) updateData.is_mandatory = input.is_mandatory;
      if (input.applies_to !== undefined) updateData.applies_to = input.applies_to;
      if (input.requirements !== undefined) updateData.requirements = input.requirements;
      if (input.documentation_required !== undefined) updateData.documentation_required = input.documentation_required;
      if (input.penalties !== undefined) updateData.penalties = input.penalties;
      if (input.related_regulations !== undefined) updateData.related_regulations = input.related_regulations;
      if (input.source_url !== undefined) updateData.source_url = input.source_url;
      if (input.full_text !== undefined) updateData.full_text = input.full_text;
      if (input.reg_status !== undefined) updateData.status = input.reg_status;
      if (input.ai_summary !== undefined) updateData.ai_summary = input.ai_summary;

      const { data, error } = await (supabase as any)
        .from('regulatory_requirements')
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
      const { error } = await (supabase as any)
        .from('regulatory_requirements')
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
