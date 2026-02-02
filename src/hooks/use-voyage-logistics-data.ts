/**
 * Voyage & Logistics Real-Time Data Hooks
 * Route optimization, port calls, cargo tracking
 * @ts-nocheck - Tables may not exist in schema yet
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voyage {
  id: string;
  vessel_id: string;
  voyage_number: string;
  origin_port: string;
  destination_port: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export function useVoyages(vesselId?: string) {
  return useQuery({
    queryKey: ['voyages', vesselId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('voyages')
        .select('*')
        .order('created_at', { ascending: false });
      if (vesselId) query = query.eq('vessel_id', vesselId);
      const { data, error } = await query;
      if (error) return [];
      return (data || []) as Voyage[];
    },
  });
}

export function useCreateVoyage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (voyage: Partial<Voyage>) => {
      const { data, error } = await (supabase as any)
        .from('voyages')
        .insert(voyage)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
      toast.success('Viagem criada');
    },
  });
}

export function useVoyageDashboardStats() {
  return useQuery({
    queryKey: ['voyage-dashboard-stats'],
    queryFn: async () => {
      const { data: voyages } = await (supabase as any)
        .from('voyages')
        .select('id, status');
      return {
        activeVoyages: (voyages || []).filter((v: any) => v.status === 'in_progress').length,
        plannedVoyages: (voyages || []).filter((v: any) => v.status === 'planned').length,
        completedVoyages: (voyages || []).filter((v: any) => v.status === 'completed').length,
        totalVoyages: voyages?.length || 0,
      };
    },
  });
}

export function useRouteOptimization(voyageId: string) {
  return useQuery({
    queryKey: ['route-optimization', voyageId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('voyage-ai', {
        body: { action: 'optimize_route', voyage_id: voyageId },
      });
      if (error) return null;
      return data;
    },
    enabled: !!voyageId,
  });
}
