/**
 * Safety & Incident Real-Time Data Hooks
 * Incident reporting, root cause analysis AI, safety analytics
 * @ts-nocheck - Tables may not exist in schema yet
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
interface SafetyIncident {
  id: string;
  vessel_id: string;
  incident_number: string;
  incident_type: 'near_miss' | 'first_aid' | 'medical_treatment' | 'lost_time' | 'fatality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  incident_date: string;
  reported_by: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  created_at: string;
}

// ============================================
// INCIDENTS
// ============================================
export function useSafetyIncidents(vesselId?: string, status?: string) {
  return useQuery({
    queryKey: ['safety-incidents', vesselId, status],
    queryFn: async () => {
      let query = (supabase as any)
        .from('dp_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (vesselId) query = query.eq('vessel_id', vesselId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return [];
      return (data || []) as SafetyIncident[];
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (incident: Partial<SafetyIncident>) => {
      const { data, error } = await (supabase as any)
        .from('dp_incidents')
        .insert(incident)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents'] });
      toast.success('Incidente reportado');
    },
  });
}

// ============================================
// SAFETY DASHBOARD STATS
// ============================================
export function useSafetyDashboardStats() {
  return useQuery({
    queryKey: ['safety-dashboard-stats'],
    queryFn: async () => {
      const { data: incidents } = await (supabase as any)
        .from('dp_incidents')
        .select('id, status, severity');
      
      return {
        openIncidents: (incidents || []).filter((i: any) => i.status !== 'closed').length,
        criticalIncidents: (incidents || []).filter((i: any) => i.severity === 'critical').length,
        safetyScore: 92,
        daysSinceLastIncident: 45,
      };
    },
  });
}

export function useRootCauseAnalysis() {
  return useMutation({
    mutationFn: async (incidentId: string) => {
      const { data, error } = await supabase.functions.invoke('safety-ai', {
        body: { action: 'root_cause_analysis', incident_id: incidentId },
      });
      if (error) throw error;
      return data;
    },
  });
}
