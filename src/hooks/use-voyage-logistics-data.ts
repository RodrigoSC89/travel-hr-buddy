/**
 * Voyage & Logistics Real-Time Data Hooks
 * Route optimization, port calls, cargo tracking
 * Typed against voyages table schema
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voyage {
  id: string;
  vessel_id: string | null;
  voyage_number: string;
  route_id: string | null;
  status: string | null;
  planned_departure: string | null;
  planned_arrival: string | null;
  actual_departure: string | null;
  actual_arrival: string | null;
  cargo_manifest: Record<string, unknown> | null;
  fuel_consumption: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useVoyages(vesselId?: string) {
  return useQuery({
    queryKey: ['voyages', vesselId],
    queryFn: async () => {
      let query = supabase
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
    mutationFn: async (voyage: { voyage_number: string; vessel_id?: string; status?: string }) => {
      const { data, error } = await supabase
        .from('voyages')
        .insert({
          voyage_number: voyage.voyage_number,
          vessel_id: voyage.vessel_id,
          status: voyage.status || 'planned',
        })
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
      const { data: voyages } = await supabase
        .from('voyages')
        .select('id, status');
      return {
        activeVoyages: (voyages || []).filter((v) => v.status === 'in_progress').length,
        plannedVoyages: (voyages || []).filter((v) => v.status === 'planned').length,
        completedVoyages: (voyages || []).filter((v) => v.status === 'completed').length,
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
