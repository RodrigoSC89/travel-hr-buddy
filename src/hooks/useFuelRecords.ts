/**
 * useFuelRecords - Hook CRUD para tabela fuel_records
 * Substitui mock data no FuelManagementPage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FuelRecord {
  id: string;
  vessel_id: string | null;
  voyage_id: string | null;
  record_date: string;
  fuel_type: string;
  quantity_mt: number;
  quantity_liters: number | null;
  price_per_mt: number | null;
  total_cost: number | null;
  bunkering_port: string | null;
  supplier: string | null;
  bunker_delivery_note: string | null;
  sulfur_content: number | null;
  density: number | null;
  viscosity: number | null;
  rob_before: number | null;
  rob_after: number | null;
  consumption_type: string;
  notes: string | null;
  created_at: string;
}

const QUERY_KEY = 'fuel-records';

export function useFuelRecords() {
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<FuelRecord[]> => {
      const { data, error } = await supabase
        .from('fuel_records')
        .select('*')
        .order('record_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as FuelRecord[];
    },
    staleTime: 30000,
  });

  const records = recordsQuery.data || [];

  // Bunker records (purchases)
  const bunkerRecords = records.filter(r => r.consumption_type === 'bunkering');
  
  // Consumption records
  const consumptionRecords = records.filter(r => r.consumption_type !== 'bunkering');

  // Fuel type grouping for tank simulation
  const fuelByType = records.reduce((acc, r) => {
    if (!acc[r.fuel_type]) {
      acc[r.fuel_type] = { purchased: 0, consumed: 0 };
    }
    if (r.consumption_type === 'bunkering') {
      acc[r.fuel_type].purchased += Number(r.quantity_mt) || 0;
    } else {
      acc[r.fuel_type].consumed += Number(r.quantity_mt) || 0;
    }
    return acc;
  }, {} as Record<string, { purchased: number; consumed: number }>);

  // Stats
  const stats = {
    totalBunkered: bunkerRecords.reduce((s, r) => s + (Number(r.quantity_mt) || 0), 0),
    totalConsumed: consumptionRecords.reduce((s, r) => s + (Number(r.quantity_mt) || 0), 0),
    totalCost: records.reduce((s, r) => s + (Number(r.total_cost) || 0), 0),
    avgPrice: bunkerRecords.length > 0
      ? bunkerRecords.reduce((s, r) => s + (Number(r.price_per_mt) || 0), 0) / bunkerRecords.length
      : 0,
    fuelTypes: Object.keys(fuelByType).length,
    suppliers: new Set(bunkerRecords.map(r => r.supplier).filter(Boolean)).size,
  };

  // Simulated tank levels from bunker - consumption
  const tankLevels = Object.entries(fuelByType).map(([type, data]) => ({
    name: `${type} Tank`,
    type,
    capacity: Math.max(data.purchased, 1000),
    current: Math.max(0, data.purchased - data.consumed),
    unit: "MT",
  }));

  const createRecord = useMutation({
    mutationFn: async (input: Partial<FuelRecord>) => {
      const { data, error } = await supabase
        .from('fuel_records')
        .insert({
          fuel_type: input.fuel_type || 'VLSFO',
          quantity_mt: input.quantity_mt || 0,
          price_per_mt: input.price_per_mt || 0,
          total_cost: (input.quantity_mt || 0) * (input.price_per_mt || 0),
          bunkering_port: input.bunkering_port,
          supplier: input.supplier,
          consumption_type: input.consumption_type || 'bunkering',
          record_date: input.record_date || new Date().toISOString().split('T')[0],
          vessel_id: input.vessel_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Registro de combustível criado');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    records,
    bunkerRecords,
    consumptionRecords,
    tankLevels,
    stats,
    isLoading: recordsQuery.isLoading,
    error: recordsQuery.error,
    createRecord,
    refetch: recordsQuery.refetch,
  };
}
