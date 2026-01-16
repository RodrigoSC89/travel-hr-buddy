/**
 * Checklist Persistence Hook
 * PATCH: Implements save/submit to Supabase for maritime checklists
 * 
 * Note: Uses 'any' type assertions as the 'checklists' table was just created
 * and types haven't been regenerated yet
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Checklist } from '@/components/maritime-checklists/checklist-types';

interface UseChecklistPersistenceReturn {
  saveChecklist: (checklist: Checklist) => Promise<boolean>;
  submitChecklist: (checklist: Checklist) => Promise<boolean>;
  loadChecklists: (vesselId?: string) => Promise<Checklist[]>;
  deleteChecklist: (id: string) => Promise<boolean>;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useChecklistPersistence(): UseChecklistPersistenceReturn {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveChecklist = useCallback(async (checklist: Checklist): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const checklistData = {
        id: checklist.id,
        title: checklist.title,
        type: checklist.type,
        version: checklist.version,
        description: checklist.description,
        vessel_id: checklist.vessel?.id || null,
        vessel_name: checklist.vessel?.name || null,
        inspector_id: user.id,
        inspector_name: checklist.inspector?.name || user.email,
        status: checklist.status,
        items: checklist.items,
        priority: checklist.priority,
        scheduled_for: checklist.scheduledFor || null,
        due_date: checklist.dueDate || null,
        estimated_duration: checklist.estimatedDuration,
        actual_duration: checklist.actualDuration || null,
        compliance_score: checklist.complianceScore || null,
        ai_analysis: checklist.aiAnalysis || null,
        workflow: checklist.workflow,
        tags: checklist.tags,
        location: checklist.location || null,
        weather: checklist.weather || null,
        template: checklist.template,
        parent_checklist_id: checklist.parentChecklistId || null,
        offline_data: checklist.offlineData || false,
        sync_status: 'synced',
        updated_at: new Date().toISOString(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (supabase as any)
        .from('checklists')
        .upsert(checklistData, { onConflict: 'id' });

      if (upsertError) {
        throw upsertError;
      }

      toast.success('Checklist salvo com sucesso');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar checklist';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const submitChecklist = useCallback(async (checklist: Checklist): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('checklists')
        .update({
          status: 'pending_review',
          completed_at: new Date().toISOString(),
          sync_status: 'synced',
        })
        .eq('id', checklist.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Checklist submetido para revisão');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao submeter checklist';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const loadChecklists = useCallback(async (vesselId?: string): Promise<Checklist[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('checklists')
        .select('*')
        .order('updated_at', { ascending: false });

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform database format to Checklist type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.type as Checklist['type'],
        version: row.version || '1.0',
        description: row.description || '',
        vessel: row.vessel_id ? {
          id: row.vessel_id,
          name: row.vessel_name || '',
          type: '',
          imo: '',
          flag: '',
          classification: '',
          operator: '',
        } : { id: '', name: '', type: '', imo: '', flag: '', classification: '', operator: '' },
        inspector: {
          id: row.inspector_id || '',
          name: row.inspector_name || '',
          license: '',
          company: '',
          email: '',
          phone: '',
          certifications: [],
        },
        status: row.status as Checklist['status'],
        items: row.items || [],
        priority: row.priority as Checklist['priority'],
        scheduledFor: row.scheduled_for,
        dueDate: row.due_date,
        estimatedDuration: row.estimated_duration || 0,
        actualDuration: row.actual_duration,
        complianceScore: row.compliance_score,
        aiAnalysis: row.ai_analysis,
        workflow: row.workflow || [],
        tags: row.tags || [],
        location: row.location,
        weather: row.weather,
        template: row.template || false,
        parentChecklistId: row.parent_checklist_id,
        offlineData: row.offline_data || false,
        syncStatus: row.sync_status as Checklist['syncStatus'],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
        approvedAt: row.approved_at,
        approvedBy: row.approved_by,
        rejectionReason: row.rejection_reason,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar checklists';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChecklist = useCallback(async (id: string): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('checklists')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Checklist excluído');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir checklist';
      setError(message);
      toast.error(message);
      return false;
    }
  }, []);

  return {
    saveChecklist,
    submitChecklist,
    loadChecklists,
    deleteChecklist,
    isSaving,
    isLoading,
    error,
  };
}
