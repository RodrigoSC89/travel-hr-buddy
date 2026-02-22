/**
 * Generic CRUD Hook for Supabase
 * Provides reusable create/read/update/delete operations with React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface CRUDOptions {
  table: TableName;
  queryKey: string[];
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  pageSize?: number;
  enabled?: boolean;
}

export function useCRUD<T extends { id: string }>({
  table,
  queryKey,
  select = '*',
  filters = {},
  orderBy,
  pageSize = 50,
  enabled = true,
}: CRUDOptions) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<T[]>({
    queryKey: [...queryKey, filters],
    queryFn: async () => {
      let q = supabase.from(table).select(select).limit(pageSize) as unknown as {
        eq: (col: string, val: unknown) => unknown;
        order: (col: string, opts: { ascending: boolean }) => unknown;
      } & PromiseLike<{ data: unknown[] | null; error: Error | null }>;

      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          q = q.eq(k, v) as typeof q;
        }
      });
      if (orderBy) {
        q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false }) as typeof q;
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
    staleTime: 1000 * 60 * 2,
    enabled,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const tbl = fromUntyped(table);
      const { data, error } = await tbl.insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Criado com sucesso');
    },
    onError: (e: Error) => {
      logger.error(`CRUD create error [${table}]:`, { message: e.message });
      toast.error(`Erro ao criar: ${e.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Record<string, unknown> & { id: string }) => {
      const tbl = fromUntyped(table);
      const { data, error } = await tbl.update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Atualizado com sucesso');
    },
    onError: (e: Error) => {
      logger.error(`CRUD update error [${table}]:`, { message: e.message });
      toast.error(`Erro ao atualizar: ${e.message}`);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const tbl = fromUntyped(table);
      const { error } = await tbl.delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Excluído com sucesso');
    },
    onError: (e: Error) => {
      logger.error(`CRUD delete error [${table}]:`, { message: e.message });
      toast.error(`Erro ao excluir: ${e.message}`);
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const tbl = fromUntyped(table);
      const { data, error } = await tbl.upsert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Salvo com sucesso');
    },
    onError: (e: Error) => {
      logger.error(`CRUD upsert error [${table}]:`, { message: e.message });
      toast.error(`Erro ao salvar: ${e.message}`);
    },
  });

  return {
    data: data ?? [],
    isLoading,
    error,
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: removeMutation.mutate,
    upsert: upsertMutation.mutate,
    isPending: createMutation.isPending || updateMutation.isPending || removeMutation.isPending,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: removeMutation.isPending,
  };
}

// === Specific hooks ===

export const useMaintenanceJobs = (vesselId?: string) =>
  useCRUD({
    table: 'maintenance_tasks',
    queryKey: ['maintenance_tasks', vesselId ?? ''],
    filters: vesselId ? { vessel_id: vesselId } : {},
    orderBy: { column: 'created_at', ascending: false },
    pageSize: 100,
  });

export const useComplianceRecords = (vesselId?: string) =>
  useCRUD({
    table: 'compliance_items',
    queryKey: ['compliance_items', vesselId ?? ''],
    filters: vesselId ? { vessel_id: vesselId } : {},
    orderBy: { column: 'created_at', ascending: false },
  });
