/**
 * useAISTracking - Hook to consume the ais-tracking edge function
 * Provides real-time vessel position data from the database + MarineTraffic API
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VesselPosition {
  mmsi: string;
  imo?: string;
  name: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  navStatus: string;
  shipType: string;
  destination?: string;
  eta?: string;
  lastUpdate: string;
  vesselId?: string;
}

interface FleetStatusResponse {
  success: boolean;
  vessels: VesselPosition[];
  summary: {
    total: number;
    atSea: number;
    atAnchor: number;
    moored: number;
    avgSpeed: number;
  };
  source: string;
  timestamp: string;
}

async function fetchFleetStatus(): Promise<FleetStatusResponse> {
  const { data, error } = await supabase.functions.invoke('ais-tracking', {
    body: { operation: 'fleet-status' },
  });
  if (error) throw error;
  return data;
}

async function fetchAreaVessels(bounds: { north: number; south: number; east: number; west: number }) {
  const { data, error } = await supabase.functions.invoke('ais-tracking', {
    body: { operation: 'area-search', bounds },
  });
  if (error) throw error;
  return data;
}

async function trackVessel(params: { mmsi?: string; imo?: string; vesselId?: string }) {
  const { data, error } = await supabase.functions.invoke('ais-tracking', {
    body: { operation: 'track-vessel', ...params },
  });
  if (error) throw error;
  return data;
}

export function useFleetStatus(enabled = true) {
  return useQuery({
    queryKey: ['ais-fleet-status'],
    queryFn: fetchFleetStatus,
    enabled,
    refetchInterval: 60_000, // Refresh every minute
    staleTime: 30_000,
  });
}

export function useAreaVessels(bounds: { north: number; south: number; east: number; west: number } | null) {
  return useQuery({
    queryKey: ['ais-area', bounds],
    queryFn: () => fetchAreaVessels(bounds!),
    enabled: !!bounds,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useTrackVessel(params: { mmsi?: string; imo?: string; vesselId?: string } | null) {
  return useQuery({
    queryKey: ['ais-track', params],
    queryFn: () => trackVessel(params!),
    enabled: !!params && !!(params.mmsi || params.imo || params.vesselId),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
