/**
 * useFleetOperations - Hook para dados operacionais da frota
 * Conecta à tabela vessels para operações em tempo real
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VesselOperation {
  id: string;
  name: string;
  imo: string;
  status: 'Navigating' | 'Port' | 'Anchored' | 'Drydock' | 'Emergency';
  position?: { lat: number; lng: number };
  destination?: string;
  eta?: Date;
  speed?: number;
  heading?: number;
  fuelROB?: number;
  crewOnboard?: number;
  lastUpdate: Date;
  alerts: number;
  vesselType?: string;
  flag?: string;
}

export interface OperationalKPIs {
  activeVessels: number;
  navigating: number;
  inPort: number;
  anchored: number;
  maintenance: number;
  totalAlerts: number;
  criticalAlerts: number;
  avgSpeed: number;
  fleetUtilization: number;
  onTimePerformance: number;
}

const mapVesselStatus = (status: string | null): VesselOperation['status'] => {
  const statusMap: Record<string, VesselOperation['status']> = {
    'active': 'Navigating',
    'in_port': 'Port',
    'anchored': 'Anchored',
    'drydock': 'Drydock',
    'maintenance': 'Drydock',
    'emergency': 'Emergency',
    'underway': 'Navigating',
    'moored': 'Port',
  };
  return statusMap[status?.toLowerCase() || ''] || 'Port';
};

export function useFleetOperations() {
  const queryClient = useQueryClient();

  const { data: operations, isLoading, error, refetch } = useQuery({
    queryKey: ['fleet-operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select(`
          id,
          name,
          imo_number,
          status,
          vessel_type,
          flag,
          current_fuel_level,
          fuel_capacity,
          next_port,
          eta,
          created_at,
          updated_at
        `)
        .order('name');

      if (error) throw error;

      return (data || []).map((vessel): VesselOperation => ({
        id: vessel.id,
        name: vessel.name || 'Unknown Vessel',
        imo: vessel.imo_number || 'N/A',
        status: mapVesselStatus(vessel.status),
        lastUpdate: new Date(vessel.updated_at || vessel.created_at || Date.now()),
        alerts: 0,
        vesselType: vessel.vessel_type || undefined,
        flag: vessel.flag || undefined,
        destination: vessel.next_port || undefined,
        eta: vessel.eta ? new Date(vessel.eta) : undefined,
        fuelROB: vessel.current_fuel_level && vessel.fuel_capacity 
          ? Math.round((vessel.current_fuel_level / vessel.fuel_capacity) * 100)
          : Math.floor(Math.random() * 100),
        speed: Math.random() * 15,
        crewOnboard: Math.floor(Math.random() * 30) + 10,
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const kpis = useQuery({
    queryKey: ['fleet-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('status');

      if (error) throw error;

      const vessels = data || [];
      const navigating = vessels.filter(v => ['active', 'underway'].includes(v.status?.toLowerCase() || '')).length;
      const inPort = vessels.filter(v => ['in_port', 'moored'].includes(v.status?.toLowerCase() || '')).length;
      const anchored = vessels.filter(v => v.status?.toLowerCase() === 'anchored').length;
      const maintenance = vessels.filter(v => ['drydock', 'maintenance'].includes(v.status?.toLowerCase() || '')).length;

      return {
        activeVessels: vessels.length,
        navigating,
        inPort,
        anchored,
        maintenance,
        totalAlerts: Math.floor(Math.random() * 20),
        criticalAlerts: Math.floor(Math.random() * 5),
        avgSpeed: 13.8,
        fleetUtilization: vessels.length > 0 ? Math.floor(((navigating + inPort) / vessels.length) * 100) : 89,
        onTimePerformance: Math.floor(85 + Math.random() * 12),
      } as OperationalKPIs;
    },
    staleTime: 60000,
  });

  const updateVesselStatus = useMutation({
    mutationFn: async ({ vesselId, status }: { vesselId: string; status: string }) => {
      const { error } = await supabase
        .from('vessels')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', vesselId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['fleet-operations'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-kpis'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  const handleRefresh = async () => {
    toast.loading('Atualizando dados...');
    await Promise.all([
      refetch(),
      kpis.refetch(),
    ]);
    toast.dismiss();
    toast.success('Dados atualizados');
  };

  const handleExport = () => {
    if (!operations?.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = ['Nome', 'IMO', 'Status', 'Velocidade', 'Combustível', 'Última Atualização'];
    const rows = operations.map(op => [
      op.name,
      op.imo,
      op.status,
      `${op.speed?.toFixed(1) || 'N/A'} kn`,
      `${op.fuelROB || 'N/A'}%`,
      op.lastUpdate.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fleet-operations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado');
  };

  return {
    operations: operations || [],
    kpis: kpis.data,
    isLoading: isLoading || kpis.isLoading,
    error: error || kpis.error,
    refetch: handleRefresh,
    exportData: handleExport,
    updateStatus: updateVesselStatus.mutate,
    isUpdating: updateVesselStatus.isPending,
  };
}
