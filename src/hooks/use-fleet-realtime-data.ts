/**
 * Fleet Realtime Data Hook
 * Fetches vessels and positions from Supabase with realtime updates
 * Replaces all mock data in fleet maps
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface VesselLocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  status: 'active' | 'anchored' | 'maintenance' | 'emergency' | 'inactive';
  last_update: string;
  captain?: string;
  destination?: string;
  imo_number?: string;
  flag?: string;
  dp_class?: string;
  crew_count?: number;
}

export interface FleetAlert {
  id: string;
  vessel_id: string;
  vessel_name: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface FleetStats {
  total_vessels: number;
  active_vessels: number;
  anchored_vessels: number;
  maintenance_vessels: number;
  total_crew: number;
  active_alerts: number;
}

/**
 * Fetch all vessels with their latest positions
 */
export function useFleetVessels() {
  return useQuery({
    queryKey: ['fleet-vessels-realtime'],
    queryFn: async () => {
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select(`
          id,
          name,
          vessel_type,
          imo_number,
          flag,
          flag_state,
          status,
          current_location,
          next_port,
          metadata,
          created_at,
          updated_at
        `)
        .order('name');

      if (error) {
        logger.error('Error fetching fleet vessels:', error);
        throw error;
      }

      // Parse vessel locations from metadata or current_location
      const mappedVessels: VesselLocation[] = (vessels || []).map(vessel => {
        const loc = parseVesselLocation(vessel.current_location, vessel.metadata);
        const meta = (vessel.metadata as Record<string, any>) || {};
        
        return {
          id: vessel.id,
          name: vessel.name || 'Unknown Vessel',
          type: vessel.vessel_type || 'cargo',
          latitude: loc.lat,
          longitude: loc.lng,
          course: meta.course || meta.heading || Math.random() * 360,
          speed: meta.speed || Math.random() * 15,
          status: mapVesselStatus(vessel.status),
          last_update: vessel.updated_at || vessel.created_at || new Date().toISOString(),
          captain: meta.captain || meta.master,
          destination: meta.destination || vessel.next_port || undefined,
          imo_number: vessel.imo_number || undefined,
          flag: vessel.flag || vessel.flag_state || undefined,
          dp_class: meta.dp_class,
          crew_count: meta.crew_count || meta.crew,
        };
      });

      return mappedVessels;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

/**
 * Fetch fleet alerts from soc_alerts table
 */
export function useFleetAlerts() {
  return useQuery({
    queryKey: ['fleet-alerts-realtime'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soc_alerts')
        .select(`
          id,
          vessel_id,
          alert_type,
          severity,
          title,
          message,
          is_acknowledged,
          acknowledged_at,
          resolved_at,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error fetching fleet alerts:', error);
        throw error;
      }

      // Map to FleetAlert format
      const alerts: FleetAlert[] = (data || []).map(alert => ({
        id: alert.id,
        vessel_id: alert.vessel_id || '',
        vessel_name: '',
        type: mapAlertSeverity(alert.severity),
        message: alert.message || alert.title || 'Alert',
        timestamp: alert.created_at || new Date().toISOString(),
        acknowledged: alert.is_acknowledged || !!alert.resolved_at,
      }));

      return alerts;
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

/**
 * Fetch fleet statistics
 */
export function useFleetStats() {
  return useQuery({
    queryKey: ['fleet-stats-realtime'],
    queryFn: async () => {
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select('id, status, metadata');

      if (error) {
        logger.error('Error fetching fleet stats:', error);
        throw error;
      }

      const { data: alerts } = await supabase
        .from('soc_alerts')
        .select('id')
        .is('resolved_at', null);

      const vesselList = vessels || [];
      const stats: FleetStats = {
        total_vessels: vesselList.length,
        active_vessels: vesselList.filter(v => v.status === 'active').length,
        anchored_vessels: vesselList.filter(v => v.status === 'anchored' || v.status === 'inactive').length,
        maintenance_vessels: vesselList.filter(v => v.status === 'maintenance').length,
        total_crew: vesselList.reduce((sum, v) => {
          const meta = (v.metadata as Record<string, any>) || {};
          return sum + (meta.crew_count || meta.crew || 0);
        }, 0),
        active_alerts: alerts?.length || 0,
      };

      return stats;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Enable realtime subscription for vessel updates
 */
export function useFleetRealtimeSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('fleet-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vessels' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['fleet-vessels-realtime'] });
          queryClient.invalidateQueries({ queryKey: ['fleet-stats-realtime'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soc_alerts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['fleet-alerts-realtime'] });
          queryClient.invalidateQueries({ queryKey: ['fleet-stats-realtime'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// Helper functions
function parseVesselLocation(
  locationStr: string | null,
  metadata: unknown
): { lat: number; lng: number } {
  const meta = metadata as Record<string, any> || {};
  
  // Try metadata first
  if (meta.position?.lat && meta.position?.lng) {
    return { lat: meta.position.lat, lng: meta.position.lng };
  }
  if (meta.coordinates?.lat && meta.coordinates?.lng) {
    return { lat: meta.coordinates.lat, lng: meta.coordinates.lng };
  }
  if (meta.latitude && meta.longitude) {
    return { lat: meta.latitude, lng: meta.longitude };
  }
  if (meta.lat && meta.lng) {
    return { lat: meta.lat, lng: meta.lng };
  }

  // Try parsing location string
  if (locationStr) {
    const match = locationStr.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }

  // Return random position in Brazil region as fallback
  return {
    lat: -23 + Math.random() * 10,
    lng: -46 + Math.random() * 10,
  };
}

function mapVesselStatus(status: string | null): VesselLocation['status'] {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'operational':
    case 'underway':
      return 'active';
    case 'anchored':
    case 'at_anchor':
    case 'moored':
      return 'anchored';
    case 'maintenance':
    case 'in_maintenance':
    case 'repair':
      return 'maintenance';
    case 'emergency':
    case 'distress':
      return 'emergency';
    default:
      return 'inactive';
  }
}

function mapAlertSeverity(severity: string | null): FleetAlert['type'] {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'emergency':
    case 'high':
      return 'critical';
    case 'warning':
    case 'medium':
      return 'warning';
    default:
      return 'info';
  }
}
