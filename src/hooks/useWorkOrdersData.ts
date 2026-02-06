/**
 * Hook: Work Orders Real Data
 * Substitui mocks do WorkOrderManager com dados reais de maintenance_records
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  linkedJobId?: string;
  linkedJobTitle?: string;
  equipment: string;
  equipmentCode: string;
  requestedParts: { name: string; quantity: number; available: boolean }[];
  assignedTo?: string;
  createdAt: string;
  dueDate?: string;
}

export function useWorkOrdersData() {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*, vessels(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const statusMap: Record<string, WorkOrder['status']> = {
    pending: 'pending',
    scheduled: 'approved',
    in_progress: 'in_progress',
    completed: 'completed',
    overdue: 'pending',
    cancelled: 'cancelled',
  };

  const priorityMap: Record<string, WorkOrder['priority']> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    routine: 'low',
    emergency: 'critical',
  };

  const workOrders: WorkOrder[] = records.map((r: any, i: number) => ({
    id: r.id,
    number: `OS-${String(24800 + i).padStart(5, '0')}`,
    title: r.description || r.title || 'Ordem de Serviço',
    description: r.notes || r.description || '',
    status: statusMap[r.status] || 'pending',
    priority: priorityMap[r.priority] || 'medium',
    equipment: r.equipment_name || r.location || 'Equipamento',
    equipmentCode: r.equipment_code || `EQ-${String(i + 1).padStart(4, '0')}`,
    requestedParts: [],
    assignedTo: r.assigned_to || undefined,
    createdAt: r.created_at?.split('T')[0] || '',
    dueDate: r.scheduled_date?.split('T')[0] || r.due_date?.split('T')[0] || undefined,
    linkedJobTitle: r.vessels?.name ? `${r.vessels.name}` : undefined,
  }));

  // Create work order
  const createWorkOrder = useMutation({
    mutationFn: async (data: { title: string; description?: string; priority?: string; vessel_id: string; scheduled_date: string }) => {
      const { data: result, error } = await supabase
        .from('maintenance_records')
        .insert({
          title: data.title,
          description: data.description || null,
          priority: data.priority || 'medium',
          vessel_id: data.vessel_id,
          scheduled_date: data.scheduled_date,
          status: 'pending',
          maintenance_type: 'corrective',
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Ordem de serviço criada');
    },
    onError: () => toast.error('Erro ao criar ordem de serviço'),
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('maintenance_records')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Status atualizado');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  return {
    workOrders,
    isLoading,
    refetch,
    createWorkOrder,
    updateStatus,
  };
}
