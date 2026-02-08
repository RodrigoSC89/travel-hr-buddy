/**
 * Hook para dados reais do PMS Engine (Planned Maintenance System)
 * PATCH v3.0 - Integrado com tabela maintenance_orders
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PMSJob {
  id: string;
  jobCode: string;
  title: string;
  component: string;
  system: string;
  interval: {
    type: "hours" | "calendar" | "both";
    hours?: number;
    days?: number;
  };
  status: "due" | "overdue" | "upcoming" | "completed" | "in_progress";
  priority: "critical" | "high" | "medium" | "low";
  lastDone?: Date;
  nextDue: Date;
  currentHours?: number;
  dueHours?: number;
  classRequired: boolean;
  estimatedTime: number;
  spareParts: string[];
  assignedTo?: string;
}

export interface PMSStats {
  totalJobs: number;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  completed: number;
  complianceRate: number;
  classJobs: number;
  avgCompletionTime: number;
}

// Fetch all PMS jobs from maintenance_orders
export function usePMSJobs(vesselId?: string) {
  return useQuery({
    queryKey: ['pms-jobs', vesselId],
    queryFn: async (): Promise<PMSJob[]> => {
      let query = supabase
        .from('maintenance_orders')
        .select('id, order_number, title, description, priority, status, category, equipment_name, assigned_to_name, due_date, completed_at, estimated_hours, actual_hours, parts_required, created_at')
        .order('due_date', { ascending: true })
        .limit(200);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) return [];

      const now = new Date();
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      return data.map((order: any) => {
        const dueDate = order.due_date ? new Date(order.due_date) : new Date();
        let status: PMSJob['status'] = 'upcoming';
        
        if (order.status === 'completed' || order.completed_at) {
          status = 'completed';
        } else if (order.status === 'in_progress') {
          status = 'in_progress';
        } else if (dueDate < now) {
          status = 'overdue';
        } else if (dueDate <= oneWeek) {
          status = 'due';
        }

        const parts = Array.isArray(order.parts_required) 
          ? order.parts_required.map((p: any) => typeof p === 'string' ? p : p?.name || 'Part')
          : [];

        return {
          id: order.id,
          jobCode: order.order_number || `MO-${order.id.slice(0, 6).toUpperCase()}`,
          title: order.title || 'Maintenance Order',
          component: order.equipment_name || 'General',
          system: order.category || 'General',
          interval: { type: 'calendar' as const, days: 90 },
          status,
          priority: (order.priority as PMSJob['priority']) || 'medium',
          lastDone: order.completed_at ? new Date(order.completed_at) : undefined,
          nextDue: dueDate,
          classRequired: order.priority === 'critical',
          estimatedTime: Number(order.estimated_hours) || 2,
          spareParts: parts,
          assignedTo: order.assigned_to_name || undefined,
        };
      });
    },
    staleTime: 15000,
  });
}

// Fetch PMS statistics
export function usePMSStats(vesselId?: string) {
  const { data: jobs } = usePMSJobs(vesselId);

  return useQuery({
    queryKey: ['pms-stats', vesselId, jobs?.length],
    queryFn: async (): Promise<PMSStats> => {
      if (!jobs?.length) {
        return {
          totalJobs: 0,
          overdue: 0,
          dueThisWeek: 0,
          dueThisMonth: 0,
          completed: 0,
          complianceRate: 100,
          classJobs: 0,
          avgCompletionTime: 0,
        };
      }

      const now = new Date();
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const overdue = jobs.filter(j => j.status === 'overdue').length;
      const dueThisWeek = jobs.filter(j => j.nextDue <= oneWeek && j.status !== 'completed').length;
      const dueThisMonth = jobs.filter(j => j.nextDue <= oneMonth && j.status !== 'completed').length;
      const completed = jobs.filter(j => j.status === 'completed').length;
      const classJobs = jobs.filter(j => j.classRequired).length;
      const completedJobs = jobs.filter(j => j.status === 'completed' && j.estimatedTime > 0);
      const avgCompletionTime = completedJobs.length > 0
        ? Math.round(completedJobs.reduce((s, j) => s + j.estimatedTime, 0) / completedJobs.length)
        : 0;

      return {
        totalJobs: jobs.length,
        overdue,
        dueThisWeek,
        dueThisMonth,
        completed,
        complianceRate: jobs.length > 0 ? Math.round(((jobs.length - overdue) / jobs.length) * 100) : 100,
        classJobs,
        avgCompletionTime,
      };
    },
    enabled: jobs !== undefined,
    staleTime: 15000,
  });
}

// Create maintenance order
export function useCreateMaintenanceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title: string; equipment_name?: string; priority?: string; due_date?: string; vessel_id?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('maintenance_orders')
        .insert({
          title: input.title,
          equipment_name: input.equipment_name,
          priority: input.priority || 'medium',
          due_date: input.due_date,
          vessel_id: input.vessel_id,
          description: input.description,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pms-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['pms-stats'] });
      toast.success('Ordem de manutenção criada');
    },
    onError: (error) => {
      toast.error(`Erro ao criar ordem: ${error.message}`);
    },
  });
}
