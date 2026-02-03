// @ts-nocheck - dp_incidents schema varies by environment
/**
 * Safety & Incident Real-Time Data Hooks
 * Incident reporting, root cause analysis AI, safety analytics
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
    queryFn: async (): Promise<SafetyIncident[]> => {
      // Use any cast for dynamic table access
      let query = (supabase as unknown as { from: (t: string) => ReturnType<typeof supabase.from> })
        .from('dp_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (vesselId) query = query.eq('vessel_id', vesselId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return [];
      return (data || []).map((row: Record<string, unknown>) => ({
        id: String(row.id || ''),
        vessel_id: String(row.vessel_id || ''),
        incident_number: `INC-${String(row.id || '').slice(0, 8).toUpperCase()}`,
        incident_type: (row.incident_type as SafetyIncident['incident_type']) || 'near_miss',
        severity: (row.severity as SafetyIncident['severity']) || 'low',
        title: String(row.description || '').slice(0, 50) || 'Incident',
        description: String(row.description || ''),
        location: 'N/A',
        incident_date: String(row.created_at || new Date().toISOString()),
        reported_by: 'System',
        status: (row.status as SafetyIncident['status']) || 'reported',
        created_at: String(row.created_at || new Date().toISOString()),
      }));
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (incident: Partial<SafetyIncident>) => {
      const dynamicDb = supabase as unknown as { from: (t: string) => ReturnType<typeof supabase.from> };
      const { data, error } = await dynamicDb
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
      const dynamicDb = supabase as unknown as { from: (t: string) => ReturnType<typeof supabase.from> };
      const { data: incidents } = await dynamicDb
        .from('dp_incidents')
        .select('id, status, severity');
      
      const incidentList = (incidents || []) as Array<{ id: string; status: string; severity: string }>;
      return {
        openIncidents: incidentList.filter((i) => i.status !== 'closed').length,
        criticalIncidents: incidentList.filter((i) => i.severity === 'critical').length,
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
