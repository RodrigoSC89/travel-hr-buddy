/**
 * useRealVessels Hook
 * Fetches real vessel data from database including positions
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RealVessel {
  id: string;
  name: string;
  imo: string | null;
  type: string;
  status: string;
  flag: string;
  currentLocation: string | null;
  position?: {
    lat: number;
    lon: number;
    course: number;
    speed: number;
    heading: number;
    navStatus: string;
    destination: string | null;
  };
}

export interface VesselPosition {
  id: string;
  vesselId: string;
  lat: number;
  lon: number;
  speed: number;
  course: number;
  heading: number;
  navStatus: string;
  destination: string | null;
  recordedAt: string;
}

export function useRealVessels() {
  return useQuery({
    queryKey: ['real-vessels-with-positions'],
    queryFn: async (): Promise<RealVessel[]> => {
      // Fetch vessels
      const { data: vessels, error: vesselsError } = await supabase
        .from('vessels')
        .select('id, name, imo_number, vessel_type, status, flag, current_location')
        .order('name');

      if (vesselsError) throw vesselsError;

      // Fetch latest positions
      const { data: positions, error: positionsError } = await supabase
        .from('vessel_positions')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (positionsError) {
        console.warn('Could not fetch vessel positions:', positionsError);
      }

      // Map vessels with their latest positions
      return (vessels || []).map(vessel => {
        const latestPosition = positions?.find(p => p.vessel_id === vessel.id);
        
        return {
          id: vessel.id,
          name: vessel.name || 'Unknown Vessel',
          imo: vessel.imo_number,
          type: vessel.vessel_type || 'General',
          status: vessel.status || 'active',
          flag: vessel.flag || 'Unknown',
          currentLocation: vessel.current_location,
          position: latestPosition ? {
            lat: latestPosition.latitude,
            lon: latestPosition.longitude,
            course: latestPosition.course || 0,
            speed: latestPosition.speed || 0,
            heading: latestPosition.heading || 0,
            navStatus: latestPosition.nav_status || 'unknown',
            destination: latestPosition.destination,
          } : undefined,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5 min cache - PATCH v41
    refetchInterval: false, // DISABLED - prevent background refetch issues
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useVesselPositions(vesselIds?: string[]) {
  return useQuery({
    queryKey: ['vessel-positions', vesselIds],
    queryFn: async (): Promise<VesselPosition[]> => {
      let query = supabase
        .from('vessel_positions')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (vesselIds && vesselIds.length > 0) {
        query = query.in('vessel_id', vesselIds);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return (data || [])
        .filter(pos => pos.vessel_id !== null)
        .map(pos => ({
          id: pos.id,
          vesselId: pos.vessel_id as string,
          lat: pos.latitude,
          lon: pos.longitude,
          speed: pos.speed || 0,
          course: pos.course || 0,
          heading: pos.heading || 0,
          navStatus: pos.nav_status || 'unknown',
          destination: pos.destination,
        recordedAt: pos.recorded_at,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 min cache - PATCH v41
    refetchInterval: false, // DISABLED - prevent background refetch issues
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useActiveVesselsForMap() {
  const { data: vessels, isLoading, error } = useRealVessels();

  // Transform to map-friendly format
  const mapVessels = (vessels || [])
    .filter(v => v.position)
    .map(v => ({
      id: v.id,
      name: v.name,
      lat: v.position!.lat,
      lon: v.position!.lon,
      course: v.position!.course,
      speed: v.position!.speed,
      status: v.position!.navStatus,
    }));

  return {
    vessels: mapVessels,
    isLoading,
    error,
    totalVessels: vessels?.length || 0,
    vesselsWithPosition: mapVessels.length,
  };
}

export default useRealVessels;
