/**
 * useVesselDigitalTwin Hook
 * Complete hook for Vessel Digital Twin module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface VesselPart {
  id: string;
  vessel_id: string | null;
  parent_id: string | null;
  part_number: string | null;
  name: string;
  description: string | null;
  part_type: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  location: string | null;
  specifications: Record<string, any> | null;
  criticality: string | null;
  status: string | null;
  children?: VesselPart[];
}

export interface VesselManual {
  id: string;
  vessel_id: string | null;
  title: string;
  description: string | null;
  manual_type: string;
  file_path: string;
  file_size: number | null;
  ocr_processed: boolean | null;
}

export interface VesselHistoryEvent {
  id: string;
  vessel_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  documents: any;
}

export interface VesselSensor {
  id: string;
  vessel_id: string | null;
  name: string;
  sensor_type: string | null;
  unit: string | null;
  location: string | null;
  current_value: number | null;
  status: string | null;
  is_active: boolean | null;
}

export function useVesselDigitalTwin(vesselId: string | null) {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch vessel parts
  const { data: parts = [], isLoading: loadingParts } = useQuery({
    queryKey: ['vessel-parts', vesselId],
    queryFn: async () => {
      if (!vesselId) return [];
      
      const { data, error } = await supabase
        .from('vessel_parts')
        .select('*')
        .eq('vessel_id', vesselId)
        .is('deleted_at', null)
        .order('name');
      
      if (error) throw error;
      return (data || []) as VesselPart[];
    },
    enabled: !!vesselId,
  });
  
  // Fetch manuals
  const { data: manuals = [], isLoading: loadingManuals } = useQuery({
    queryKey: ['vessel-manuals', vesselId],
    queryFn: async () => {
      if (!vesselId) return [];
      
      const { data, error } = await supabase
        .from('vessel_manuals')
        .select('*')
        .eq('vessel_id', vesselId)
        .is('deleted_at', null)
        .order('title');
      
      if (error) throw error;
      return (data || []) as VesselManual[];
    },
    enabled: !!vesselId,
  });
  
  // Fetch history
  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['vessel-history', vesselId],
    queryFn: async () => {
      if (!vesselId) return [];
      
      const { data, error } = await supabase
        .from('vessel_history')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as VesselHistoryEvent[];
    },
    enabled: !!vesselId,
  });
  
  // Fetch sensors
  const { data: sensors = [], isLoading: loadingSensors } = useQuery({
    queryKey: ['vessel-sensors', vesselId],
    queryFn: async () => {
      if (!vesselId) return [];
      
      const { data, error } = await supabase
        .from('vessel_sensors')
        .select('*')
        .eq('vessel_id', vesselId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return (data || []) as VesselSensor[];
    },
    enabled: !!vesselId,
  });
  
  // Statistics
  const stats = {
    totalParts: parts.length,
    criticalParts: parts.filter(p => p.criticality === 'critical').length,
    partsNeedingAttention: parts.filter(p => p.status === 'needs_attention').length,
    partsUnderRepair: parts.filter(p => p.status === 'under_repair').length,
    totalManuals: manuals.length,
    manualsWithOCR: manuals.filter(m => m.ocr_processed).length,
    totalSensors: sensors.length,
    sensorsOnline: sensors.filter(s => s.status === 'online').length,
    sensorsWarning: sensors.filter(s => s.status === 'warning').length,
    sensorsCritical: sensors.filter(s => s.status === 'critical').length,
  };
  
  return {
    parts,
    allParts: parts,
    manuals,
    history,
    sensors,
    stats,
    isLoading: loadingParts || loadingManuals || loadingHistory || loadingSensors,
    loadingParts,
    loadingManuals,
    loadingHistory,
    loadingSensors,
  };
}
