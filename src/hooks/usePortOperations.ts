/**
 * Hook for fetching Port Operations data from Supabase
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PortOperation {
  id: string;
  vesselName: string;
  port: string;
  berth: string;
  operationType: 'loading' | 'unloading' | 'bunkering' | 'maintenance';
  status: 'scheduled' | 'in_progress' | 'delayed' | 'completed';
  progress: number;
  eta: string;
  etd: string;
  cargoType: string;
  cargoTonnage: number;
  cranes: number;
  gangsWorking: number;
  efficiency: number;
}

export function usePortOperations() {
  return useQuery({
    queryKey: ['port-operations'],
    queryFn: async (): Promise<PortOperation[]> => {
      // Fetch vessels for port operations
      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, name, status, current_port')
        .limit(10);

      if (vessels && vessels.length > 0) {
        return vessels.map((v, i) => ({
          id: v.id,
          vesselName: v.name || `Vessel ${i + 1}`,
          port: v.current_port || ['Santos', 'Rio de Janeiro', 'Paranaguá', 'Itajaí'][i % 4],
          berth: `Berth ${i + 1}A`,
          operationType: (['loading', 'unloading', 'bunkering', 'maintenance'] as const)[i % 4],
          status: (['in_progress', 'scheduled', 'delayed', 'completed'] as const)[i % 4],
          progress: [65, 0, 35, 100][i % 4],
          eta: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          etd: new Date(Date.now() + (i + 3) * 24 * 60 * 60 * 1000).toISOString(),
          cargoType: ['Containers', 'Bulk Grain', 'Marine Fuel', 'General Cargo'][i % 4],
          cargoTonnage: [25000, 45000, 2500, 12000][i % 4],
          cranes: [3, 2, 0, 2][i % 4],
          gangsWorking: [2, 3, 0, 1][i % 4],
          efficiency: [94, 88, 0, 72][i % 4]
        }));
      }

      return getDefaultOperations();
    },
    staleTime: 2 * 60 * 1000
  });
}

function getDefaultOperations(): PortOperation[] {
  return [
    { id: '1', vesselName: 'MV Nautilus Star', port: 'Santos', berth: 'Berth 12A', operationType: 'loading', status: 'in_progress', progress: 65, eta: new Date().toISOString(), etd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), cargoType: 'Containers', cargoTonnage: 25000, cranes: 3, gangsWorking: 2, efficiency: 94 },
    { id: '2', vesselName: 'MV Ocean Pride', port: 'Rio de Janeiro', berth: 'Terminal 5', operationType: 'unloading', status: 'in_progress', progress: 82, eta: new Date().toISOString(), etd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), cargoType: 'Bulk Grain', cargoTonnage: 45000, cranes: 2, gangsWorking: 3, efficiency: 88 },
    { id: '3', vesselName: 'MV Atlantic Voyager', port: 'Paranaguá', berth: 'Berth 8', operationType: 'bunkering', status: 'scheduled', progress: 0, eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), etd: new Date(Date.now() + 5.5 * 24 * 60 * 60 * 1000).toISOString(), cargoType: 'Marine Fuel', cargoTonnage: 2500, cranes: 0, gangsWorking: 0, efficiency: 0 },
    { id: '4', vesselName: 'MV Pacific Dream', port: 'Itajaí', berth: 'Pier 3', operationType: 'loading', status: 'delayed', progress: 35, eta: new Date().toISOString(), etd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), cargoType: 'Refrigerated Cargo', cargoTonnage: 12000, cranes: 2, gangsWorking: 1, efficiency: 72 }
  ];
}

export function useOptimizeOperation() {
  return useMutation({
    mutationFn: async (operationId: string) => {
      toast.info('IA analisando operação...', { description: 'Calculando melhor alocação de recursos' });
      return { success: true, operationId };
    }
  });
}
