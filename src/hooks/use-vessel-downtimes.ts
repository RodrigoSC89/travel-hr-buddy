/**
 * Hook para gerenciar vessel_downtimes (nova tabela com validação IA)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface VesselDowntime {
  id: string;
  vessel_id: string | null;
  organization_id: string | null;
  start_time: string;
  end_time: string | null;
  duration_hours: number | null;
  reported_reason: string;
  category: 'mechanical' | 'weather' | 'operational' | 'administrative' | 'regulatory' | 'emergency';
  reported_by: string | null;
  evidence_urls: string[];
  ai_validation: object | null;
  broa_evidence: object | null;
  validation_status: 'pending' | 'approved' | 'requires_review' | 'rejected';
  validated_at: string | null;
  validated_by: string | null;
  contract_id: string | null;
  notes: string | null;
  metadata: object;
  created_at: string;
  updated_at: string;
}

export interface CreateDowntimeData {
  vessel_id?: string;
  start_time: string;
  end_time?: string;
  reported_reason: string;
  category: VesselDowntime['category'];
  evidence_urls?: string[];
  contract_id?: string;
  notes?: string;
}

export function useVesselDowntimes(vesselId?: string) {
  const [downtimes, setDowntimes] = useState<VesselDowntime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDowntimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('vessel_downtimes')
        .select('*')
        .order('start_time', { ascending: false });

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Type assertion since we know the structure matches
      setDowntimes((data || []) as unknown as VesselDowntime[]);
    } catch (err) {
      logger.error('Error fetching downtimes:', err);
      setError('Erro ao carregar downtimes');
    } finally {
      setLoading(false);
    }
  }, [vesselId]);

  const createDowntime = async (data: CreateDowntimeData): Promise<VesselDowntime | null> => {
    try {
      // Get current user info
      const { data: userData } = await supabase.auth.getUser();
      
      // Get organization from organization_users table
      const { data: orgUser } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', userData.user?.id || '')
        .eq('status', 'active')
        .single();

      const insertData = {
        ...data,
        organization_id: orgUser?.organization_id,
        reported_by: userData.user?.id,
        validation_status: 'pending' as const,
        evidence_urls: data.evidence_urls || [],
        metadata: {}
      };

      const { data: newDowntime, error } = await supabase
        .from('vessel_downtimes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Downtime registrado com sucesso!');
      await fetchDowntimes();
      return newDowntime as unknown as VesselDowntime;
    } catch (err) {
      logger.error('Error creating downtime:', err);
      toast.error('Erro ao registrar downtime');
      return null;
    }
  };

  const updateDowntime = async (id: string, updates: Partial<CreateDowntimeData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vessel_downtimes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Downtime atualizado!');
      await fetchDowntimes();
      return true;
    } catch (err) {
      logger.error('Error updating downtime:', err);
      toast.error('Erro ao atualizar downtime');
      return false;
    }
  };

  const deleteDowntime = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vessel_downtimes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Downtime removido!');
      await fetchDowntimes();
      return true;
    } catch (err) {
      logger.error('Error deleting downtime:', err);
      toast.error('Erro ao remover downtime');
      return false;
    }
  };

  // Get statistics
  const getStats = useCallback(() => {
    const total = downtimes.length;
    const pending = downtimes.filter(d => d.validation_status === 'pending').length;
    const approved = downtimes.filter(d => d.validation_status === 'approved').length;
    const requiresReview = downtimes.filter(d => d.validation_status === 'requires_review').length;
    const totalHours = downtimes.reduce((sum, d) => sum + (d.duration_hours || 0), 0);

    const byCategory = downtimes.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, pending, approved, requiresReview, totalHours, byCategory };
  }, [downtimes]);

  useEffect(() => {
    fetchDowntimes();
  }, [fetchDowntimes]);

  return {
    downtimes,
    loading,
    error,
    createDowntime,
    updateDowntime,
    deleteDowntime,
    refresh: fetchDowntimes,
    stats: getStats()
  };
}
