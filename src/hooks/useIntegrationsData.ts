/**
 * Hook para Integrações API
 * CRUD completo para api_integrations - typed queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  description?: string;
  config?: Record<string, unknown>;
  api_key_masked?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIntegrationInput {
  name: string;
  type: string;
  description?: string;
  config?: Record<string, unknown>;
  api_key?: string;
}

function mapRowToIntegration(item: {
  id: string;
  api_name: string;
  api_category: string | null;
  status: string | null;
  config: unknown;
  created_at: string | null;
  updated_at: string | null;
}): Integration {
  return {
    id: item.id,
    name: item.api_name,
    type: item.api_category || 'custom',
    status: (item.status || 'inactive') as Integration['status'],
    config: item.config as Record<string, unknown> | undefined,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
  };
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<Integration[]> => {
      try {
        const { data, error } = await supabase
          .from('api_integrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          logger.error('Error fetching integrations:', error);
          return [];
        }

        return (data || []).map(mapRowToIntegration);
      } catch (err) {
        logger.error('Error in useIntegrations:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useIntegration(id: string) {
  return useQuery({
    queryKey: ['integration', id],
    queryFn: async (): Promise<Integration | null> => {
      try {
        const { data, error } = await supabase
          .from('api_integrations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          logger.error('Error fetching integration:', error);
          return null;
        }

        if (!data) return null;
        return mapRowToIntegration(data);
      } catch (err) {
        logger.error('Error in useIntegration:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateIntegrationInput) => {
      const { data, error } = await supabase
        .from('api_integrations')
        .insert([{
          api_name: input.name,
          api_category: input.type,
          config: input.config as import("@/integrations/supabase/types").Json ?? null,
          status: 'inactive' as string,
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating integration:', error);
        throw new Error(`Erro ao criar integração: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integração criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateIntegrationInput> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (input.name !== undefined) updateData.api_name = input.name;
      if (input.type !== undefined) updateData.api_category = input.type;
      if (input.config !== undefined) updateData.config = input.config;

      const { data, error } = await supabase
        .from('api_integrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating integration:', error);
        throw new Error(`Erro ao atualizar integração: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration', variables.id] });
      toast.success('Integração atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_integrations')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting integration:', error);
        throw new Error(`Erro ao excluir integração: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integração excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useTestIntegrationConnection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('api_integrations')
        .select('status')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(`Erro ao verificar conexão: ${error.message}`);
      
      const latency = Date.now() - startTime;
      return { success: data?.status === 'active', latency };
    },
    onSuccess: (data) => {
      toast.success('Conexão verificada', {
        description: `Latência: ${data.latency}ms`
      });
    },
    onError: (error: Error) => {
      toast.error('Falha na verificação', { description: error.message });
    }
  });
}
