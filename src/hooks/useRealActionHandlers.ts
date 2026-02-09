/**
 * Real Action Handlers Hook - P0 Fix
 * Substitui handlers placeholder por ações reais com Supabase
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

/**
 * Hook providing real action handlers for common operations
 */
export function useRealActionHandlers() {
  const queryClient = useQueryClient();
  const { toast: shadcnToast } = useToast();
  const navigate = useNavigate();

  // ==================== VOYAGE ACTIONS ====================

  const createVoyage = useMutation({
    mutationFn: async (voyageData: {
      vessel_id?: string;
      departure_date?: string;
      arrival_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('voyages')
        .insert([{
          voyage_number: `VYG-${Date.now()}`,
          vessel_id: voyageData.vessel_id || null,
          planned_departure: voyageData.departure_date || new Date().toISOString(),
          planned_arrival: voyageData.arrival_date || null,
          status: 'planned',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-voyages'] });
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
      shadcnToast({
        title: '✅ Viagem Criada',
        description: `Viagem ${data.voyage_number} criada com sucesso.`,
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar viagem: ${error.message}`);
    },
  });

  // ==================== MAINTENANCE ACTIONS ====================

  const createMaintenanceOrder = useMutation({
    mutationFn: async (orderData: {
      vessel_id?: string;
      title: string;
      description?: string;
      priority?: string;
      scheduled_date?: string;
    }) => {
      const insertData = {
          title: orderData.title,
          description: orderData.description || null,
          priority: orderData.priority || 'medium',
          scheduled_date: orderData.scheduled_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          maintenance_type: 'corrective' as const,
          vessel_id: orderData.vessel_id || '',
        };
      
      const { data, error } = await (supabase.from as Function)('maintenance_records')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      shadcnToast({
        title: '✅ Ordem de Serviço Criada',
        description: 'Ordem de manutenção registrada com sucesso.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar ordem: ${error.message}`);
    },
  });

  // ==================== CREW ACTIONS ====================

  const scheduleCrewRotation = useMutation({
    mutationFn: async (rotationData: {
      crew_member_id: string;
      vessel_id?: string;
      start_date: string;
      end_date: string;
    }) => {
      const { data, error } = await supabase
        .from('crew_members')
        .update({
          vessel_id: rotationData.vessel_id || null,
          join_date: rotationData.start_date,
          leave_date: rotationData.end_date,
        })
        .eq('id', rotationData.crew_member_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
      queryClient.invalidateQueries({ queryKey: ['crew-members'] });
      shadcnToast({
        title: '✅ Rotação Agendada',
        description: 'Rotação de tripulação registrada.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao agendar rotação: ${error.message}`);
    },
  });

  // ==================== EXPORT ACTIONS ====================

  const exportToCSV = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const value = row[h];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação concluída');
  }, []);

  const exportToJSON = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação JSON concluída');
  }, []);

  // ==================== NOTIFICATION ACTIONS ====================

  const sendNotification = useMutation({
    mutationFn: async (notifData: {
      user_id: string;
      title: string;
      message: string;
      type?: string;
      priority?: string;
    }) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notifData.user_id,
          title: notifData.title,
          message: notifData.message,
          type: notifData.type || 'info',
          priority: notifData.priority || 'medium',
          read: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificação enviada');
    },
    onError: (error) => {
      toast.error(`Erro ao enviar notificação: ${error.message}`);
    },
  });

  // ==================== QUICK ACTIONS ====================

  const quickActions = {
    newVoyage: () => {
      navigate('/ops?tab=voyage');
      shadcnToast({
        title: '🗺️ Nova Viagem',
        description: 'Abrindo formulário de criação de viagem...',
      });
    },

    crewSchedule: () => {
      navigate('/workbench?section=people');
      shadcnToast({
        title: '👥 Escalar Tripulação',
        description: 'Abrindo painel de escalas...',
      });
    },

    maintenanceOrder: () => {
      navigate('/maintenance?tab=surveys');
      shadcnToast({
        title: '🔧 Ordem de Serviço',
        description: 'Abrindo painel de manutenção...',
      });
    },

    fuelReport: async () => {
      const { data: vessels } = await supabase
        .from('vessels')
        .select('name, current_fuel_level, fuel_capacity')
        .not('current_fuel_level', 'is', null);

      if (vessels && vessels.length > 0) {
        exportToCSV(vessels, 'fuel-report');
      } else {
        shadcnToast({
          title: '⛽ Relatório de Combustível',
          description: 'Nenhum dado de combustível disponível.',
          variant: 'destructive',
        });
      }
    },

    openChecklist: () => {
      navigate('/compliance?tab=ncs-capas');
      shadcnToast({
        title: '✅ Checklists',
        description: 'Abrindo checklists pendentes...',
      });
    },

    syncData: async () => {
      toast.loading('Sincronizando dados...');
      await queryClient.invalidateQueries();
      toast.dismiss();
      toast.success('Dados sincronizados');
    },

    viewAlerts: () => {
      navigate('/command?tab=alerts');
    },

    exportDashboard: async () => {
      const { data: vessels } = await supabase.from('vessels').select('*');
      const { data: voyages } = await supabase.from('voyages').select('*').limit(50);
      
      const dashboardData = {
        exported_at: new Date().toISOString(),
        vessels: vessels || [],
        voyages: voyages || [],
      };

      const json = JSON.stringify(dashboardData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Dashboard exportado');
    },
  };

  return {
    // Mutations
    createVoyage,
    createMaintenanceOrder,
    scheduleCrewRotation,
    sendNotification,

    // Export utilities
    exportToCSV,
    exportToJSON,

    // Quick actions
    quickActions,

    // States
    isCreatingVoyage: createVoyage.isPending,
    isCreatingMaintenance: createMaintenanceOrder.isPending,
    isSchedulingRotation: scheduleCrewRotation.isPending,
  };
}

export default useRealActionHandlers;
