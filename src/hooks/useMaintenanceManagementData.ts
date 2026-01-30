/**
 * Hook for Fleet Maintenance Management - Real-time Supabase data
 * Replaces mock maintenance records with database integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MaintenanceRecord {
  id: string;
  vessel_name: string;
  vessel_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  title: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  estimated_duration: number;
  actual_duration?: number;
  cost_estimate: number;
  actual_cost?: number;
  assigned_technician: string;
  location: string;
  parts_required: string[];
  created_at: string;
  next_maintenance?: string;
}

export interface CreateMaintenanceInput {
  vessel_id: string;
  vessel_name: string;
  maintenance_type: string;
  priority: string;
  title: string;
  description: string;
  scheduled_date: string;
  estimated_duration: number;
  cost_estimate: number;
  assigned_technician: string;
  location: string;
  parts_required: string[];
}

export function useMaintenanceManagementData() {
  const queryClient = useQueryClient();

  // Fetch maintenance records from database
  const query = useQuery({
    queryKey: ['maintenance-management'],
    queryFn: async (): Promise<MaintenanceRecord[]> => {
      // First get maintenance records with correct column names
      const { data: records, error } = await supabase
        .from('maintenance_records')
        .select(`
          id,
          vessel_id,
          maintenance_type,
          title,
          description,
          status,
          priority,
          scheduled_date,
          completed_date,
          estimated_duration,
          actual_duration,
          cost_estimate,
          actual_cost,
          assigned_technician,
          location,
          parts_required,
          next_maintenance_date,
          created_at
        `)
        .order('scheduled_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get vessels for names
      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, name');

      const vesselMap = new Map(vessels?.map(v => [v.id, v.name]) || []);

      // Map to our interface
      return (records || []).map(record => ({
        id: record.id,
        vessel_id: record.vessel_id || '',
        vessel_name: vesselMap.get(record.vessel_id || '') || 'Embarcação não especificada',
        maintenance_type: mapMaintenanceType(record.maintenance_type),
        priority: (record.priority || 'medium') as MaintenanceRecord['priority'],
        status: mapStatus(record.status),
        title: record.title || 'Manutenção',
        description: record.description || '',
        scheduled_date: record.scheduled_date || new Date().toISOString(),
        completed_date: record.completed_date || undefined,
        estimated_duration: record.estimated_duration || 8,
        actual_duration: record.actual_duration || undefined,
        cost_estimate: record.cost_estimate || 0,
        actual_cost: record.actual_cost || undefined,
        assigned_technician: record.assigned_technician || 'Técnico Responsável',
        location: record.location || 'Local de Manutenção',
        parts_required: record.parts_required || [],
        created_at: record.created_at || new Date().toISOString(),
        next_maintenance: record.next_maintenance_date || undefined
      }));
    },
    staleTime: 2 * 60 * 1000
  });

  // Create maintenance record
  const createMutation = useMutation({
    mutationFn: async (input: CreateMaintenanceInput) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert({
          vessel_id: input.vessel_id,
          maintenance_type: input.maintenance_type,
          title: input.title,
          description: input.description,
          status: 'pending',
          priority: input.priority,
          scheduled_date: input.scheduled_date,
          estimated_duration: input.estimated_duration,
          cost_estimate: input.cost_estimate,
          assigned_technician: input.assigned_technician,
          location: input.location,
          parts_required: input.parts_required
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-management'] });
      toast.success('Manutenção agendada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao agendar manutenção', { description: error.message });
    }
  });

  // Update maintenance status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === 'completed') {
        updates.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('maintenance_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-management'] });
      toast.success('Status atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status', { description: error.message });
    }
  });

  // Computed stats
  const stats = {
    total: query.data?.length || 0,
    scheduled: query.data?.filter(r => r.status === 'scheduled').length || 0,
    inProgress: query.data?.filter(r => r.status === 'in_progress').length || 0,
    overdue: query.data?.filter(r => r.status === 'overdue').length || 0,
    completed: query.data?.filter(r => r.status === 'completed').length || 0,
    totalCost: query.data?.reduce((sum, r) => sum + (r.actual_cost || r.cost_estimate), 0) || 0
  };

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    stats,
    createMaintenance: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    refetch: query.refetch
  };
}

// Helper functions
function mapMaintenanceType(type?: string | null): MaintenanceRecord['maintenance_type'] {
  if (!type) return 'preventive';
  const lower = type.toLowerCase();
  if (lower.includes('emergên') || lower.includes('urgen') || lower === 'emergency') return 'emergency';
  if (lower.includes('corret') || lower.includes('reparo') || lower === 'corrective') return 'corrective';
  if (lower.includes('inspeç') || lower.includes('verific') || lower === 'inspection') return 'inspection';
  return 'preventive';
}

function mapStatus(status?: string | null): MaintenanceRecord['status'] {
  if (!status) return 'scheduled';
  const lower = status.toLowerCase();
  if (lower === 'completed' || lower === 'done') return 'completed';
  if (lower === 'in_progress' || lower === 'ongoing') return 'in_progress';
  if (lower === 'overdue' || lower === 'delayed') return 'overdue';
  if (lower === 'cancelled') return 'cancelled';
  return 'scheduled';
}
