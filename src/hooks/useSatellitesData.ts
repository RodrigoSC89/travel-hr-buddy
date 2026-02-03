/**
 * Satellites Real Data Hook
 * Fetches satellite tracking data from Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Satellite {
  id: string;
  satellite_id: string;
  satellite_name: string;
  norad_id: number;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  orbit_type: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  status: 'active' | 'inactive' | 'maintenance';
  visibility: 'visible' | 'eclipsed' | 'daylight';
  timestamp: string;
  inclination_deg: number;
  period_min: number;
  launch_date: string;
  country: string;
  purpose: string;
}

// Determine orbit type based on altitude
function getOrbitType(altitude: number): Satellite['orbit_type'] {
  if (altitude < 2000) return 'LEO';
  if (altitude < 35786) return 'MEO';
  return 'GEO';
}

export function useSatellites() {
  return useQuery({
    queryKey: ['satellites'],
    queryFn: async (): Promise<Satellite[]> => {
      const { data, error } = await supabase
        .from('satellite_positions')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('[useSatellites] Error:', error);
        // Return empty array - no mock data
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(s => ({
        id: s.id,
        satellite_id: s.satellite_id || s.norad_id,
        satellite_name: s.name || `SAT-${s.norad_id}`,
        norad_id: typeof s.norad_id === 'string' ? parseInt(s.norad_id, 10) : (s.norad_id || 0),
        latitude: s.latitude,
        longitude: s.longitude,
        altitude_km: s.altitude,
        velocity_kmh: s.velocity * 3600 / 1000, // Convert m/s to km/h if needed
        orbit_type: getOrbitType(s.altitude),
        status: (s.status as Satellite['status']) || 'active',
        visibility: 'visible' as const,
        timestamp: s.last_updated || s.calculated_at || new Date().toISOString(),
        inclination_deg: s.inclination || 0,
        period_min: s.orbital_period || 0,
        launch_date: '',
        country: '',
        purpose: ''
      }));
    },
    staleTime: 30 * 1000, // 30 seconds - satellites move fast
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useSatelliteStats() {
  const { data: satellites } = useSatellites();

  return {
    total: satellites?.length || 0,
    active: satellites?.filter(s => s.status === 'active').length || 0,
    leo: satellites?.filter(s => s.orbit_type === 'LEO').length || 0,
    meo: satellites?.filter(s => s.orbit_type === 'MEO').length || 0,
    geo: satellites?.filter(s => s.orbit_type === 'GEO').length || 0,
    visible: satellites?.filter(s => s.visibility === 'visible').length || 0
  };
}
