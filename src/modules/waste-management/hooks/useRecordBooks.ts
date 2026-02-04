/**
 * Hooks for Oil Record Book & Garbage Record Book - MARPOL Compliance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================
// Oil Record Book Types & Hook
// ============================================

export interface OilRecordEntry {
  id: string;
  vessel_id?: string;
  vessel_name: string;
  entry_date: string;
  entry_time?: string;
  operation_code: string;
  operation_description: string;
  tank_involved?: string;
  quantity?: number;
  unit: string;
  position_lat?: string;
  position_lon?: string;
  ppm_reading?: number;
  officer_name: string;
  officer_rank?: string;
  master_signature: boolean;
  master_name?: string;
  remarks?: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export const oilOperationTypes = [
  { code: 'A', label: 'Lastro ou lavagem de tanques de carga' },
  { code: 'B', label: 'Descarga de lastro sujo ou água de lavagem' },
  { code: 'C', label: 'Coleta e descarte de resíduos oleosos' },
  { code: 'D', label: 'Descarga de água de porão (bilge)' },
  { code: 'E', label: 'Descarga de água oleosa por equipamento' },
  { code: 'F', label: 'Condição do sistema de monitoramento' },
  { code: 'G', label: 'Descarga acidental/excepcional' },
  { code: 'H', label: 'Bunkering de combustível ou óleo lubrificante' },
  { code: 'I', label: 'Operações adicionais/observações' },
];

export function useOilRecordBook(vesselId?: string) {
  return useQuery({
    queryKey: ['oil-record-book', vesselId],
    queryFn: async (): Promise<OilRecordEntry[]> => {
      let query = supabase
        .from('oil_record_book')
        .select('*')
        .order('entry_date', { ascending: false })
        .limit(200);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        vessel_id: row.vessel_id || undefined,
        vessel_name: row.vessel_name,
        entry_date: row.entry_date,
        entry_time: row.entry_time || undefined,
        operation_code: row.operation_code,
        operation_description: row.operation_description,
        tank_involved: row.tank_involved || undefined,
        quantity: row.quantity || undefined,
        unit: row.unit || 'm³',
        position_lat: row.position_lat || undefined,
        position_lon: row.position_lon || undefined,
        ppm_reading: row.ppm_reading || undefined,
        officer_name: row.officer_name,
        officer_rank: row.officer_rank || undefined,
        master_signature: row.master_signature || false,
        master_name: row.master_name || undefined,
        remarks: row.remarks || undefined,
        verified: row.verified || false,
        verified_by: row.verified_by || undefined,
        verified_at: row.verified_at || undefined,
        created_at: row.created_at || new Date().toISOString()
      }));
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useCreateOilRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<OilRecordEntry, 'id' | 'created_at' | 'verified' | 'verified_by' | 'verified_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('oil_record_book')
        .insert({
          ...entry,
          verified: false,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oil-record-book'] });
      toast.success('Entrada adicionada ao Oil Record Book');
    },
    onError: () => toast.error('Erro ao adicionar entrada')
  });
}

export function useVerifyOilRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, masterName }: { id: string; masterName?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('oil_record_book')
        .update({
          verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          master_signature: true,
          master_name: masterName
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oil-record-book'] });
      toast.success('Entrada verificada pelo Comandante');
    },
    onError: () => toast.error('Erro ao verificar entrada')
  });
}

// ============================================
// Garbage Record Book Types & Hook
// ============================================

export interface GarbageRecordEntry {
  id: string;
  vessel_id?: string;
  vessel_name: string;
  entry_date: string;
  entry_time?: string;
  category_code: string;
  category_description: string;
  estimated_quantity: number;
  unit: string;
  disposal_method: string;
  start_position_lat?: string;
  start_position_lon?: string;
  end_position_lat?: string;
  end_position_lon?: string;
  port_facility?: string;
  reception_certificate?: string;
  officer_name: string;
  officer_rank?: string;
  master_signature: boolean;
  master_name?: string;
  remarks?: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  special_area: boolean;
  created_at: string;
}

export const garbageCategories = [
  { code: 'A', label: 'Plásticos', canDischargeAtSea: false },
  { code: 'B', label: 'Resíduos alimentares', canDischargeAtSea: true, minDistance: 12 },
  { code: 'C', label: 'Resíduos domésticos', canDischargeAtSea: false },
  { code: 'D', label: 'Óleo de cozinha', canDischargeAtSea: false },
  { code: 'E', label: 'Cinzas de incinerador', canDischargeAtSea: true, minDistance: 12 },
  { code: 'F', label: 'Resíduos operacionais', canDischargeAtSea: false },
  { code: 'G', label: 'Carcaça de animais', canDischargeAtSea: true, minDistance: 100 },
  { code: 'H', label: 'Material de pesca', canDischargeAtSea: false },
  { code: 'I', label: 'E-waste', canDischargeAtSea: false },
];

export function useGarbageRecordBook(vesselId?: string) {
  return useQuery({
    queryKey: ['garbage-record-book', vesselId],
    queryFn: async (): Promise<GarbageRecordEntry[]> => {
      let query = supabase
        .from('garbage_record_book')
        .select('*')
        .order('entry_date', { ascending: false })
        .limit(200);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        vessel_id: row.vessel_id || undefined,
        vessel_name: row.vessel_name,
        entry_date: row.entry_date,
        entry_time: row.entry_time || undefined,
        category_code: row.category_code,
        category_description: row.category_description,
        estimated_quantity: row.estimated_quantity,
        unit: row.unit || 'kg',
        disposal_method: row.disposal_method,
        start_position_lat: row.start_position_lat || undefined,
        start_position_lon: row.start_position_lon || undefined,
        end_position_lat: row.end_position_lat || undefined,
        end_position_lon: row.end_position_lon || undefined,
        port_facility: row.port_facility || undefined,
        reception_certificate: row.reception_certificate || undefined,
        officer_name: row.officer_name,
        officer_rank: row.officer_rank || undefined,
        master_signature: row.master_signature || false,
        master_name: row.master_name || undefined,
        remarks: row.remarks || undefined,
        verified: row.verified || false,
        verified_by: row.verified_by || undefined,
        verified_at: row.verified_at || undefined,
        special_area: row.special_area || false,
        created_at: row.created_at || new Date().toISOString()
      }));
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useCreateGarbageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<GarbageRecordEntry, 'id' | 'created_at' | 'verified' | 'verified_by' | 'verified_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('garbage_record_book')
        .insert({
          ...entry,
          verified: false,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garbage-record-book'] });
      toast.success('Entrada adicionada ao Garbage Record Book');
    },
    onError: () => toast.error('Erro ao adicionar entrada')
  });
}

export function useVerifyGarbageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, masterName }: { id: string; masterName?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('garbage_record_book')
        .update({
          verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          master_signature: true,
          master_name: masterName
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garbage-record-book'] });
      toast.success('Entrada verificada pelo Comandante');
    },
    onError: () => toast.error('Erro ao verificar entrada')
  });
}

// ============================================
// Waste Tanks Hook
// ============================================

export interface WasteTank {
  id: string;
  vessel_id?: string;
  vessel_name: string;
  tank_name: string;
  tank_type: 'oily_water' | 'sewage' | 'bilge' | 'sludge' | 'garbage';
  capacity: number;
  current_level: number;
  unit: string;
  level_percentage: number;
  status: 'ok' | 'warning' | 'critical';
  sensor_id?: string;
  last_reading_at?: string;
  last_discharge_date?: string;
  last_discharge_quantity?: number;
  last_discharge_location?: string;
  alert_threshold_percent: number;
  created_at: string;
  updated_at: string;
}

export function useWasteTanks(vesselId?: string) {
  return useQuery({
    queryKey: ['waste-tanks', vesselId],
    queryFn: async (): Promise<WasteTank[]> => {
      let query = supabase
        .from('waste_tanks')
        .select('*')
        .order('tank_name');

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        vessel_id: row.vessel_id || undefined,
        vessel_name: row.vessel_name,
        tank_name: row.tank_name,
        tank_type: row.tank_type as WasteTank['tank_type'],
        capacity: row.capacity,
        current_level: row.current_level || 0,
        unit: row.unit || 'L',
        level_percentage: row.level_percentage || 0,
        status: (row.status as WasteTank['status']) || 'ok',
        sensor_id: row.sensor_id || undefined,
        last_reading_at: row.last_reading_at || undefined,
        last_discharge_date: row.last_discharge_date || undefined,
        last_discharge_quantity: row.last_discharge_quantity || undefined,
        last_discharge_location: row.last_discharge_location || undefined,
        alert_threshold_percent: row.alert_threshold_percent || 80,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString()
      }));
    },
    staleTime: 1 * 60 * 1000 // 1 min for real-time sensor data
  });
}

export function useUpdateTankLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentLevel }: { id: string; currentLevel: number }) => {
      const { data: tank } = await supabase
        .from('waste_tanks')
        .select('capacity, alert_threshold_percent')
        .eq('id', id)
        .single();

      const percentage = tank ? (currentLevel / tank.capacity) * 100 : 0;
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      
      if (percentage >= 90) status = 'critical';
      else if (percentage >= (tank?.alert_threshold_percent || 80)) status = 'warning';

      const { data, error } = await supabase
        .from('waste_tanks')
        .update({
          current_level: currentLevel,
          status,
          last_reading_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-tanks'] });
    }
  });
}

export function useRecordTankDischarge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity, location }: { id: string; quantity: number; location: string }) => {
      const { data: tank } = await supabase
        .from('waste_tanks')
        .select('current_level')
        .eq('id', id)
        .single();

      const newLevel = Math.max(0, (tank?.current_level || 0) - quantity);

      const { data, error } = await supabase
        .from('waste_tanks')
        .update({
          current_level: newLevel,
          status: 'ok',
          last_discharge_date: new Date().toISOString().split('T')[0],
          last_discharge_quantity: quantity,
          last_discharge_location: location
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-tanks'] });
      toast.success('Descarte registrado com sucesso');
    },
    onError: () => toast.error('Erro ao registrar descarte')
  });
}

// ============================================
// Statistics Hook
// ============================================

export function useRecordBookStats() {
  const { data: oilRecords } = useOilRecordBook();
  const { data: garbageRecords } = useGarbageRecordBook();
  const { data: tanks } = useWasteTanks();

  return {
    oilRecords: {
      total: oilRecords?.length || 0,
      verified: oilRecords?.filter(r => r.verified).length || 0,
      pending: oilRecords?.filter(r => !r.verified).length || 0,
      thisMonth: oilRecords?.filter(r => {
        const date = new Date(r.entry_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length || 0
    },
    garbageRecords: {
      total: garbageRecords?.length || 0,
      verified: garbageRecords?.filter(r => r.verified).length || 0,
      pending: garbageRecords?.filter(r => !r.verified).length || 0,
      thisMonth: garbageRecords?.filter(r => {
        const date = new Date(r.entry_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length || 0,
      byCategory: garbageCategories.reduce((acc, cat) => {
        acc[cat.code] = garbageRecords?.filter(r => r.category_code === cat.code).reduce((sum, r) => sum + r.estimated_quantity, 0) || 0;
        return acc;
      }, {} as Record<string, number>)
    },
    tanks: {
      total: tanks?.length || 0,
      critical: tanks?.filter(t => t.status === 'critical').length || 0,
      warning: tanks?.filter(t => t.status === 'warning').length || 0,
      ok: tanks?.filter(t => t.status === 'ok').length || 0
    }
  };
}
