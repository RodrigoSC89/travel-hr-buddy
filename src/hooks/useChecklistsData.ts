/**
 * Checklists Real Data Hook
 * Fetches checklists from Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Json } from '@/integrations/supabase/types';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  type: string;
  items: ChecklistItem[];
  created_at: string;
  created_by: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  source: 'manual' | 'ai' | 'template';
  vessel?: string;
  dueDate?: string;
  assignedTo?: string;
  completedAt?: string;
  aiSummary?: string;
}

function parseItems(items: Json | null): ChecklistItem[] {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map((item: unknown, idx: number) => {
    const i = item as Record<string, unknown>;
    return {
      id: (i.id as string) || `item-${idx}`,
      title: (i.title as string) || '',
      completed: Boolean(i.completed),
      criticality: ((i.criticality as string) || 'medium') as ChecklistItem['criticality'],
      notes: i.notes as string | undefined
    };
  });
}

export function useChecklists() {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: async (): Promise<Checklist[]> => {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[useChecklists] Error', error as Error);
        throw error;
      }

      return (data || []).map(db => ({
        id: db.id,
        title: db.title,
        description: db.description || undefined,
        type: 'custom',
        items: parseItems(db.items),
        created_at: db.created_at || new Date().toISOString(),
        created_by: db.inspector_name || 'Sistema',
        status: (db.status as Checklist['status']) || 'draft',
        source: 'manual' as const,
        vessel: db.vessel_id || undefined,
        dueDate: db.due_date || undefined,
        assignedTo: db.inspector_id || undefined,
        completedAt: db.completed_at || undefined,
        aiSummary: db.ai_analysis ? String(db.ai_analysis) : undefined
      }));
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklist: Omit<Checklist, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert([{
          title: checklist.title,
          description: checklist.description,
          items: checklist.items as unknown as Json,
          inspector_name: checklist.created_by,
          status: checklist.status,
          vessel_id: checklist.vessel,
          due_date: checklist.dueDate,
          inspector_id: checklist.assignedTo,
          type: checklist.type || 'inspection'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar checklist: ' + error.message);
    }
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Checklist> }) => {
      const { error } = await supabase
        .from('checklists')
        .update({
          title: updates.title,
          description: updates.description,
          items: updates.items as unknown as Json,
          status: updates.status,
          completed_at: updates.completedAt
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist excluído');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    }
  });
}
