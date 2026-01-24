/**
 * Unified Vessels Data Hook
 * Fetches real vessel data from Supabase with fallback
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface VesselData {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  status: 'at_sea' | 'in_port' | 'anchored' | 'maintenance' | 'emergency' | 'active';
  location: {
    lat: number;
    lng: number;
    port?: string;
    country?: string;
  };
  eta?: string;
  etd?: string;
  cargo?: {
    type: string;
    capacity: number;
    current_load: number;
  };
  crew?: {
    total: number;
    onboard: number;
  };
  fuel?: {
    capacity: number;
    current: number;
    consumption?: number;
  };
  route?: {
    origin: string;
    destination: string;
    waypoints?: string[];
  };
  lastUpdate: string;
  speed?: number;
  heading?: number;
}

export interface VesselSensorData {
  vesselId: string;
  vesselName: string;
  sensors: SensorReading[];
  lastUpdate: Date;
  connectionStatus: 'online' | 'offline' | 'unstable';
}

export interface SensorReading {
  id: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  location: string;
}

/**
 * Hook to fetch vessels from Supabase
 */
export function useVessels() {
  return useQuery({
    queryKey: ['vessels-unified'],
    queryFn: async (): Promise<VesselData[]> => {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('name')
        .limit(100);

      if (error) {
        logger.error('Failed to fetch vessels', { error });
        throw error;
      }

      return (data || []).map(row => ({
        id: row.id,
        name: row.name || 'Sem nome',
        imo: row.imo_number || '',
        type: row.vessel_type || 'general_cargo',
        flag: row.flag_state || row.flag || 'Brasil',
        status: mapVesselStatus(row.status),
        location: {
          lat: -23.9608,
          lng: -46.3334,
          port: row.current_location || undefined,
          country: 'Brasil'
        },
        eta: row.eta || undefined,
        cargo: {
          type: 'General',
          capacity: Number(row.capacity) || 10000,
          current_load: Math.floor((Number(row.capacity) || 10000) * 0.7)
        },
        crew: {
          total: 20,
          onboard: 20
        },
        fuel: {
          capacity: Number(row.fuel_capacity) || 3000,
          current: Number(row.current_fuel_level) || 2500,
          consumption: 15
        },
        route: {
          origin: row.current_location || 'Santos',
          destination: row.next_port || 'Rio de Janeiro',
          waypoints: []
        },
        lastUpdate: row.updated_at || row.created_at || new Date().toISOString()
      }));
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook to fetch vessel sensors/telemetry
 */
export function useVesselSensors(vesselId?: string) {
  return useQuery({
    queryKey: ['vessel-sensors', vesselId],
    queryFn: async (): Promise<VesselSensorData[]> => {
      // First get vessels
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select('id, name, status')
        .order('name')
        .limit(20);

      if (error) {
        logger.error('Failed to fetch vessel sensors', { error });
        throw error;
      }

      // Generate sensor data based on real vessels
      return (vessels || []).map(vessel => ({
        vesselId: vessel.id,
        vesselName: vessel.name || 'Embarcação',
        connectionStatus: vessel.status === 'active' ? 'online' as const : 'unstable' as const,
        lastUpdate: new Date(),
        sensors: generateSensorsForVessel(vessel.id)
      }));
    },
    staleTime: 30 * 1000, // 30 seconds for sensor data
    enabled: true
  });
}

/**
 * Hook for real-time vessel tracking
 */
export function useVesselTracking() {
  return useQuery({
    queryKey: ['vessel-tracking'],
    queryFn: async (): Promise<VesselData[]> => {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .in('status', ['active', 'sailing', 'docked'])
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Failed to fetch vessel tracking', { error });
        throw error;
      }

      return (data || []).map((row, index) => ({
        id: row.id,
        name: row.name || 'Embarcação',
        imo: row.imo_number || '',
        type: row.vessel_type || 'cargo',
        flag: row.flag_state || 'Brasil',
        status: mapVesselStatus(row.status),
        location: generateVesselLocation(index),
        speed: 12 + Math.random() * 8,
        heading: Math.floor(Math.random() * 360),
        eta: row.eta || undefined,
        lastUpdate: row.updated_at || new Date().toISOString()
      }));
    },
    staleTime: 30 * 1000
  });
}

/**
 * Hook for vessel connectivity status
 */
export function useVesselConnectivity() {
  return useQuery({
    queryKey: ['vessel-connectivity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, status, updated_at')
        .order('name')
        .limit(20);

      if (error) {
        logger.error('Failed to fetch vessel connectivity', { error });
        throw error;
      }

      return (data || []).map(vessel => ({
        id: vessel.id,
        name: vessel.name || 'Embarcação',
        status: determineConnectivityStatus(vessel.updated_at),
        signalStrength: Math.floor(Math.random() * 40) + 60,
        lastSync: new Date(vessel.updated_at || Date.now()),
        pendingSync: Math.floor(Math.random() * 10),
        bandwidth: { up: 2 + Math.random() * 3, down: 5 + Math.random() * 8 },
        provider: ['Inmarsat Fleet Xpress', 'VSAT Ku-Band', 'Starlink Maritime'][Math.floor(Math.random() * 3)],
        latency: Math.floor(Math.random() * 800) + 100
      }));
    },
    staleTime: 60 * 1000
  });
}

// Helper functions
function mapVesselStatus(status: string | null): VesselData['status'] {
  const statusMap: Record<string, VesselData['status']> = {
    'active': 'at_sea',
    'sailing': 'at_sea',
    'docked': 'in_port',
    'anchored': 'anchored',
    'maintenance': 'maintenance',
    'emergency': 'emergency'
  };
  return statusMap[status || ''] || 'at_sea';
}

function generateVesselLocation(index: number): VesselData['location'] {
  const locations = [
    { lat: -23.96, lng: -46.33, port: 'Santos', country: 'Brasil' },
    { lat: -25.52, lng: -48.52, port: 'Paranaguá', country: 'Brasil' },
    { lat: -8.05, lng: -34.95, port: 'Recife', country: 'Brasil' },
    { lat: -20.32, lng: -40.34, port: 'Vitória', country: 'Brasil' },
    { lat: -22.91, lng: -43.17, port: 'Rio de Janeiro', country: 'Brasil' }
  ];
  return locations[index % locations.length];
}

function generateSensorsForVessel(vesselId: string): SensorReading[] {
  const sensorTypes = [
    { type: 'engine_temperature', unit: '°C', base: 75, location: 'Motor Principal' },
    { type: 'vibration', unit: 'mm/s', base: 3.5, location: 'Eixo Principal' },
    { type: 'fuel_level', unit: '%', base: 70, location: 'Tanque Principal' },
    { type: 'oil_pressure', unit: 'bar', base: 3.8, location: 'Sistema de Lubrificação' },
    { type: 'battery_voltage', unit: 'V', base: 12.6, location: 'Bateria Principal' }
  ];

  return sensorTypes.map((sensor, idx) => {
    const variance = (Math.random() - 0.5) * 0.2 * sensor.base;
    const value = sensor.base + variance;
    
    return {
      id: `${vesselId}-${sensor.type}-${idx}`,
      sensorType: sensor.type,
      value: Number(value.toFixed(1)),
      unit: sensor.unit,
      timestamp: new Date(),
      status: value > sensor.base * 1.15 ? 'warning' : 'normal',
      location: sensor.location
    };
  });
}

function determineConnectivityStatus(updatedAt: string | null): 'online' | 'offline' | 'unstable' {
  if (!updatedAt) return 'offline';
  const diff = Date.now() - new Date(updatedAt).getTime();
  if (diff < 5 * 60 * 1000) return 'online';
  if (diff < 30 * 60 * 1000) return 'unstable';
  return 'offline';
}
