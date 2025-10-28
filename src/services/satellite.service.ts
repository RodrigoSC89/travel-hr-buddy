/**
 * PATCH 350: Satellite Tracker v2 - Service Layer
 * Service for satellite tracking, alerts, and mission integration
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Satellite,
  SatellitePosition,
  SatelliteAlert,
  SatelliteMissionLink,
  SatellitePass,
  SatelliteTelemetry,
  SatelliteTrackingView,
  GlobalSatelliteView,
  SatelliteSearchFilters,
  SatelliteType,
  AlertStatus,
} from '@/types/satellite';

export class SatelliteService {
  // Satellites
  static async getSatellites(
    filters?: SatelliteSearchFilters
  ): Promise<Satellite[]> {
    let query = supabase.from('satellites').select('*').order('satellite_name');

    if (filters?.satellite_type?.length) {
      query = query.in('satellite_type', filters.satellite_type);
    }
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.orbit_type?.length) {
      query = query.in('orbit_type', filters.orbit_type);
    }
    if (filters?.is_tracked !== undefined) {
      query = query.eq('is_tracked', filters.is_tracked);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getSatellite(satelliteId: string): Promise<Satellite | null> {
    const { data, error } = await supabase
      .from('satellites')
      .select('*')
      .eq('satellite_id', satelliteId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getTrackedSatellites(): Promise<Satellite[]> {
    return this.getSatellites({ is_tracked: true });
  }

  static async createSatellite(
    satellite: Partial<Satellite>
  ): Promise<Satellite> {
    const { data, error } = await supabase
      .from('satellites')
      .insert(satellite)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSatellite(
    id: string,
    updates: Partial<Satellite>
  ): Promise<Satellite> {
    const { data, error } = await supabase
      .from('satellites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async toggleTracking(satelliteId: string, tracked: boolean): Promise<void> {
    const { error } = await supabase
      .from('satellites')
      .update({ is_tracked: tracked })
      .eq('satellite_id', satelliteId);

    if (error) throw error;
  }

  // Positions
  static async getLatestPositions(limit = 100): Promise<SatellitePosition[]> {
    const { data, error } = await supabase
      .from('satellite_positions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getLatestPosition(
    satelliteId: string
  ): Promise<SatellitePosition | null> {
    const { data, error } = await supabase
      .from('satellite_positions')
      .select('*')
      .eq('satellite_id', satelliteId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getPositionHistory(
    satelliteId: string,
    hours = 24
  ): Promise<SatellitePosition[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('satellite_positions')
      .select('*')
      .eq('satellite_id', satelliteId)
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updatePosition(
    satelliteId: string,
    position: {
      latitude: number;
      longitude: number;
      altitude_km: number;
      velocity_kmh?: number;
    }
  ): Promise<string> {
    const { data, error } = await supabase.rpc('update_satellite_position', {
      p_satellite_id: satelliteId,
      p_latitude: position.latitude,
      p_longitude: position.longitude,
      p_altitude_km: position.altitude_km,
      p_velocity_kmh: position.velocity_kmh || null,
    });

    if (error) throw error;
    return data;
  }

  // Alerts
  static async getAlerts(status?: AlertStatus): Promise<SatelliteAlert[]> {
    let query = supabase
      .from('satellite_alerts')
      .select('*')
      .order('triggered_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getActiveAlerts(): Promise<SatelliteAlert[]> {
    return this.getAlerts('active');
  }

  static async getSatelliteAlerts(satelliteId: string): Promise<SatelliteAlert[]> {
    const { data, error } = await supabase
      .from('satellite_alerts')
      .select('*')
      .eq('satellite_id', satelliteId)
      .order('triggered_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createAlert(
    alert: Partial<SatelliteAlert>
  ): Promise<SatelliteAlert> {
    const { data, error } = await supabase
      .from('satellite_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async acknowledgeAlert(
    alertId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('satellite_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  static async resolveAlert(
    alertId: string,
    userId: string,
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('satellite_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
        resolution_notes: notes,
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  static async checkCoverage(
    satelliteId: string,
    criticalArea: Record<string, unknown>
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_satellite_coverage', {
      p_satellite_id: satelliteId,
      p_critical_area: criticalArea,
    });

    if (error) throw error;
    return data;
  }

  // Mission Links
  static async getMissionLinks(
    missionId?: string,
    satelliteId?: string
  ): Promise<SatelliteMissionLink[]> {
    let query = supabase
      .from('satellite_mission_links')
      .select('*')
      .order('priority', { ascending: false });

    if (missionId) {
      query = query.eq('mission_id', missionId);
    }
    if (satelliteId) {
      query = query.eq('satellite_id', satelliteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createMissionLink(
    link: Partial<SatelliteMissionLink>
  ): Promise<SatelliteMissionLink> {
    const { data, error } = await supabase
      .from('satellite_mission_links')
      .insert(link)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMissionLink(
    id: string,
    updates: Partial<SatelliteMissionLink>
  ): Promise<SatelliteMissionLink> {
    const { data, error } = await supabase
      .from('satellite_mission_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Satellite Passes
  static async calculatePasses(
    satelliteId: string,
    latitude: number,
    longitude: number,
    hoursAhead = 24
  ): Promise<SatellitePass[]> {
    const { data, error } = await supabase.rpc('calculate_satellite_passes', {
      p_satellite_id: satelliteId,
      p_location_lat: latitude,
      p_location_lon: longitude,
      p_hours_ahead: hoursAhead,
    });

    if (error) throw error;
    return data || [];
  }

  static async getUpcomingPasses(
    satelliteId: string,
    limit = 10
  ): Promise<SatellitePass[]> {
    const { data, error } = await supabase
      .from('satellite_passes')
      .select('*')
      .eq('satellite_id', satelliteId)
      .gte('rise_time', new Date().toISOString())
      .order('rise_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Telemetry
  static async getLatestTelemetry(
    satelliteId: string
  ): Promise<SatelliteTelemetry | null> {
    const { data, error } = await supabase
      .from('satellite_telemetry')
      .select('*')
      .eq('satellite_id', satelliteId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getTelemetryHistory(
    satelliteId: string,
    hours = 24
  ): Promise<SatelliteTelemetry[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('satellite_telemetry')
      .select('*')
      .eq('satellite_id', satelliteId)
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async saveTelemetry(
    telemetry: Partial<SatelliteTelemetry>
  ): Promise<SatelliteTelemetry> {
    const { data, error } = await supabase
      .from('satellite_telemetry')
      .insert(telemetry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Composite Views
  static async getTrackingView(
    satelliteId: string
  ): Promise<SatelliteTrackingView | null> {
    const [satellite, position, alerts, links, telemetry, passes] =
      await Promise.all([
        this.getSatellite(satelliteId),
        this.getLatestPosition(satelliteId),
        this.getSatelliteAlerts(satelliteId),
        this.getMissionLinks(undefined, satelliteId),
        this.getLatestTelemetry(satelliteId),
        this.getUpcomingPasses(satelliteId, 5),
      ]);

    if (!satellite) return null;

    const activeAlerts = alerts.filter((a) => a.status === 'active');

    return {
      satellite,
      latest_position: position || undefined,
      active_alerts: activeAlerts,
      mission_links: links,
      latest_telemetry: telemetry || undefined,
      upcoming_passes: passes,
    };
  }

  static async getGlobalView(): Promise<GlobalSatelliteView> {
    const [satellites, positions, alerts] = await Promise.all([
      this.getTrackedSatellites(),
      this.getLatestPositions(100),
      this.getActiveAlerts(),
    ]);

    return {
      satellites,
      positions,
      active_alerts: alerts,
      coverage_maps: [], // Would be populated from satellite_coverage_maps
    };
  }

  // Coverage Maps
  static async getCoverageMaps(satelliteId?: string) {
    let query = supabase
      .from('satellite_coverage_maps')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (satelliteId) {
      query = query.eq('satellite_id', satelliteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Simulation and Testing
  static async simulateOrbit(
    satelliteId: string,
    steps = 100,
    intervalSeconds = 60
  ): Promise<SatellitePosition[]> {
    // This would integrate with orbital mechanics library
    // For now, return sample data
    const satellite = await this.getSatellite(satelliteId);
    if (!satellite) return [];

    const positions: Partial<SatellitePosition>[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < steps; i++) {
      positions.push({
        satellite_id: satelliteId,
        satellite_name: satellite.satellite_name,
        latitude: Math.sin((i * 2 * Math.PI) / steps) * 45,
        longitude: ((i * 360) / steps - 180) % 360,
        altitude_km: 400 + Math.random() * 50,
        velocity_kmh: 27000 + Math.random() * 1000,
        timestamp: new Date(baseTime + i * intervalSeconds * 1000).toISOString(),
        data_source: 'calculated',
      });
    }

    return positions as SatellitePosition[];
  }
}
