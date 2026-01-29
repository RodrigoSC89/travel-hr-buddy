/**
 * Vessel Digital Twin Hook
 * Provides comprehensive vessel data for the Digital Twin module
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VesselSpecifications {
  id: string;
  vessel_id: string;
  gross_tonnage: number | null;
  net_tonnage: number | null;
  deadweight: number | null;
  length_overall: number | null;
  beam: number | null;
  draft: number | null;
  depth: number | null;
  build_year: number | null;
  builder: string | null;
  classification_society: string | null;
  class_notation: string | null;
  hull_material: string | null;
  propulsion_type: string | null;
  main_engine_type: string | null;
  main_engine_power: string | null;
  auxiliary_engines: unknown[];
  fuel_capacity: number | null;
  fresh_water_capacity: number | null;
  ballast_capacity: number | null;
  cargo_capacity: number | null;
  passenger_capacity: number | null;
  crew_capacity: number | null;
  speed_max: number | null;
  speed_service: number | null;
  speed_economic: number | null;
  range_nautical_miles: number | null;
  communication_equipment: unknown[];
  navigation_equipment: unknown[];
  safety_equipment: unknown[];
  special_features: unknown[];
  certifications: unknown[];
  last_dry_dock: string | null;
  next_dry_dock: string | null;
}

export interface VesselPart {
  id: string;
  vessel_id: string;
  parent_id: string | null;
  part_number: string;
  name: string;
  name_pt: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  location_deck: string | null;
  location_compartment: string | null;
  location_coordinates: { x: number; y: number; z: number } | null;
  installation_date: string | null;
  warranty_expires: string | null;
  lifespan_years: number | null;
  replacement_cost: number | null;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  status: 'operational' | 'degraded' | 'failed' | 'replaced';
  maintenance_interval_hours: number | null;
  maintenance_interval_days: number | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  operating_hours: number;
  specifications: Record<string, unknown>;
  spare_parts: unknown[];
  related_manuals: string[];
  qr_code: string | null;
  image_url: string | null;
  model_3d_url: string | null;
  children?: VesselPart[];
}

export interface VesselManual {
  id: string;
  vessel_id: string;
  title: string;
  document_type: string;
  category: string | null;
  manufacturer: string | null;
  part_numbers: string[] | null;
  file_url: string;
  file_size_bytes: number | null;
  file_type: string | null;
  language: string;
  version: string | null;
  revision_date: string | null;
  expiry_date: string | null;
  ocr_status: string;
  ocr_text: string | null;
  ai_summary: string | null;
  ai_keywords: string[] | null;
  page_count: number | null;
  chapters: unknown[];
}

export interface VesselSensor {
  id: string;
  vessel_id: string;
  part_id: string | null;
  sensor_type: string;
  name: string;
  unit: string;
  location: string | null;
  manufacturer: string | null;
  model: string | null;
  min_value: number | null;
  max_value: number | null;
  warning_threshold_low: number | null;
  warning_threshold_high: number | null;
  critical_threshold_low: number | null;
  critical_threshold_high: number | null;
  is_active: boolean;
  latest_reading?: {
    value: number;
    status: string;
    recorded_at: string;
  };
}

export interface VesselHistoryEvent {
  id: string;
  vessel_id: string;
  event_type: string;
  event_date: string;
  title: string;
  description: string | null;
  location: string | null;
  performed_by: string | null;
  cost: number | null;
  currency: string;
  duration_days: number | null;
  verified: boolean;
}

export function useVesselDigitalTwin(vesselId: string | undefined) {
  // Fetch vessel basic info
  const { data: vessel, isLoading: vesselLoading } = useQuery({
    queryKey: ['vessel', vesselId],
    queryFn: async () => {
      if (!vesselId) return null;
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', vesselId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });

  // Fetch specifications
  const { data: specifications } = useQuery({
    queryKey: ['vessel-specifications', vesselId],
    queryFn: async () => {
      if (!vesselId) return null;
      const { data, error } = await supabase
        .from('vessel_specifications')
        .select('*')
        .eq('vessel_id', vesselId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as VesselSpecifications | null;
    },
    enabled: !!vesselId,
    staleTime: 5 * 60 * 1000,
  });

  // Count parts
  const { data: partsCount = 0 } = useQuery({
    queryKey: ['vessel-parts-count', vesselId],
    queryFn: async () => {
      if (!vesselId) return 0;
      const { count, error } = await supabase
        .from('vessel_parts')
        .select('*', { count: 'exact', head: true })
        .eq('vessel_id', vesselId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });

  // Count manuals
  const { data: manualsCount = 0 } = useQuery({
    queryKey: ['vessel-manuals-count', vesselId],
    queryFn: async () => {
      if (!vesselId) return 0;
      const { count, error } = await supabase
        .from('vessel_manuals')
        .select('*', { count: 'exact', head: true })
        .eq('vessel_id', vesselId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });

  // Count sensors
  const { data: sensorsCount = 0 } = useQuery({
    queryKey: ['vessel-sensors-count', vesselId],
    queryFn: async () => {
      if (!vesselId) return 0;
      const { count, error } = await supabase
        .from('vessel_sensors')
        .select('*', { count: 'exact', head: true })
        .eq('vessel_id', vesselId)
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });

  // Count alerts (parts needing maintenance)
  const { data: alertsCount = 0 } = useQuery({
    queryKey: ['vessel-alerts-count', vesselId],
    queryFn: async () => {
      if (!vesselId) return 0;
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('vessel_parts')
        .select('*', { count: 'exact', head: true })
        .eq('vessel_id', vesselId)
        .or(`next_maintenance.lte.${today},status.eq.degraded,status.eq.failed`);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });

  return {
    vessel,
    specifications,
    partsCount,
    manualsCount,
    sensorsCount,
    alertsCount,
    isLoading: vesselLoading,
  };
}

// Parts hierarchy hook
export function useVesselParts(vesselId: string) {
  return useQuery({
    queryKey: ['vessel-parts', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessel_parts')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('category')
        .order('name');
      
      if (error) throw error;
      
      // Build hierarchy
      const parts = data as unknown as VesselPart[];
      const rootParts = parts.filter(p => !p.parent_id);
      
      const buildTree = (parentId: string | null): VesselPart[] => {
        return parts
          .filter(p => p.parent_id === parentId)
          .map(p => ({
            ...p,
            children: buildTree(p.id)
          }));
      };
      
      return rootParts.map(p => ({
        ...p,
        children: buildTree(p.id)
      }));
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });
}

// Manuals hook
export function useVesselManuals(vesselId: string, search?: string) {
  return useQuery({
    queryKey: ['vessel-manuals', vesselId, search],
    queryFn: async () => {
      let query = supabase
        .from('vessel_manuals')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('title');
      
      if (search) {
        query = query.textSearch('search_vector', search);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VesselManual[];
    },
    enabled: !!vesselId,
    staleTime: 60 * 1000,
  });
}

// Sensors hook with real-time readings
export function useVesselSensors(vesselId: string) {
  return useQuery({
    queryKey: ['vessel-sensors', vesselId],
    queryFn: async () => {
      const { data: sensors, error } = await supabase
        .from('vessel_sensors')
        .select('*')
        .eq('vessel_id', vesselId)
        .eq('is_active', true)
        .order('sensor_type');
      
      if (error) throw error;
      
      // Get latest reading for each sensor
      const sensorIds = sensors?.map(s => s.id) || [];
      if (sensorIds.length === 0) return [];
      
      const { data: readings } = await supabase
        .from('vessel_sensor_readings')
        .select('*')
        .in('sensor_id', sensorIds)
        .order('recorded_at', { ascending: false })
        .limit(sensorIds.length);
      
      const latestByaSensor = new Map<string, any>();
      readings?.forEach(r => {
        if (!latestByaSensor.has(r.sensor_id)) {
          latestByaSensor.set(r.sensor_id, r);
        }
      });
      
      return sensors?.map(s => ({
        ...s,
        latest_reading: latestByaSensor.get(s.id)
      })) as VesselSensor[];
    },
    enabled: !!vesselId,
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// History timeline hook
export function useVesselHistory(vesselId: string) {
  return useQuery({
    queryKey: ['vessel-history', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessel_history')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return data as unknown as VesselHistoryEvent[];
    },
    enabled: !!vesselId,
    staleTime: 5 * 60 * 1000,
  });
}
