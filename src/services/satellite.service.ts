/**
 * PATCH 350: Satellite Tracker v2 - Service Layer
 * Schema-aligned version
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

// Types aligned with actual database schema
export interface SatelliteDB {
  id: string;
  norad_id: string;
  name: string;
  satellite_type: string | null;
  operator: string | null;
  launch_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SatellitePositionDB {
  id: string;
  norad_id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number | null;
  status: string | null;
  last_updated: string | null;
  created_at: string;
}

export interface SatelliteAlertDB {
  id: string;
  satellite_id: string;
  alert_type: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export interface SatelliteTelemetryDB {
  id: string;
  satellite_id: string;
  telemetry_type: string;
  value: number;
  unit: string | null;
  status: string | null;
  timestamp: string;
  created_at: string;
}

export interface SatellitePassDB {
  id: string;
  satellite_id: string;
  observer_lat: number;
  observer_lon: number;
  rise_time: string;
  max_elevation: number | null;
  set_time: string;
  duration_seconds: number | null;
  is_visible: boolean | null;
  created_at: string;
}

export interface SatelliteMissionLinkDB {
  id: string;
  satellite_id: string;
  mission_id: string | null;
  link_type: string | null;
  is_active: boolean;
  created_at: string;
}

// Friendly interfaces
export interface Satellite {
  id: string;
  satellite_id: string;
  satellite_name: string;
  satellite_type: string;
  operator?: string;
  launch_date?: string;
  status: string;
  orbit_type: string;
  is_tracked: boolean;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface SatellitePosition {
  id: string;
  satellite_id: string;
  satellite_name: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh?: number;
  timestamp: string;
  data_source: string;
}

export interface SatelliteAlert {
  id: string;
  satellite_id: string;
  alert_type: string;
  severity: string;
  title: string;
  status: string;
  triggered_at: string;
}

export type SatelliteSearchFilters = {
  satellite_type?: string[];
  status?: string[];
  orbit_type?: string[];
  is_tracked?: boolean;
};

export class SatelliteService {
  private static toSatellite(db: SatelliteDB): Satellite {
    return {
      id: db.id,
      satellite_id: db.norad_id,
      satellite_name: db.name,
      satellite_type: db.satellite_type || "unknown",
      operator: db.operator || undefined,
      launch_date: db.launch_date || undefined,
      status: db.is_active ? "active" : "inactive",
      orbit_type: "LEO",
      is_tracked: db.is_active,
      priority: "normal",
      created_at: db.created_at,
      updated_at: db.updated_at,
    };
  }

  private static toPosition(db: SatellitePositionDB): SatellitePosition {
    return {
      id: db.id,
      satellite_id: db.norad_id,
      satellite_name: db.name,
      latitude: Number(db.latitude),
      longitude: Number(db.longitude),
      altitude_km: Number(db.altitude),
      velocity_kmh: db.velocity ? Number(db.velocity) : undefined,
      timestamp: db.last_updated || db.created_at,
      data_source: "api",
    };
  }

  private static toAlert(db: SatelliteAlertDB): SatelliteAlert {
    return {
      id: db.id,
      satellite_id: db.satellite_id,
      alert_type: db.alert_type,
      severity: db.severity,
      title: db.message,
      status: db.acknowledged ? "acknowledged" : "active",
      triggered_at: db.created_at,
    };
  }

  static async getSatellites(filters?: SatelliteSearchFilters): Promise<Satellite[]> {
    let query = supabase.from("satellites").select("*").order("name");

    if (filters?.satellite_type?.length) {
      query = query.in("satellite_type", filters.satellite_type);
    }
    if (filters?.is_tracked !== undefined) {
      query = query.eq("is_active", filters.is_tracked);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(d => this.toSatellite(d as SatelliteDB));
  }

  static async getSatellite(satelliteId: string): Promise<Satellite | null> {
    const { data, error } = await supabase
      .from("satellites")
      .select("*")
      .eq("norad_id", satelliteId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.toSatellite(data as SatelliteDB) : null;
  }

  static async getTrackedSatellites(): Promise<Satellite[]> {
    return this.getSatellites({ is_tracked: true });
  }

  static async toggleTracking(satelliteId: string, tracked: boolean): Promise<void> {
    const { error } = await supabase
      .from("satellites")
      .update({ is_active: tracked })
      .eq("norad_id", satelliteId);

    if (error) throw error;
  }

  static async getLatestPositions(limit = 100): Promise<SatellitePosition[]> {
    const { data, error } = await supabase
      .from("satellite_positions")
      .select("*")
      .order("last_updated", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(d => this.toPosition(d as SatellitePositionDB));
  }

  static async getLatestPosition(satelliteId: string): Promise<SatellitePosition | null> {
    const { data, error } = await supabase
      .from("satellite_positions")
      .select("*")
      .eq("norad_id", satelliteId)
      .order("last_updated", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? this.toPosition(data as SatellitePositionDB) : null;
  }

  static async getPositionHistory(satelliteId: string, hours = 24): Promise<SatellitePosition[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("satellite_positions")
      .select("*")
      .eq("norad_id", satelliteId)
      .gte("last_updated", startTime.toISOString())
      .order("last_updated", { ascending: true });

    if (error) throw error;
    return (data || []).map(d => this.toPosition(d as SatellitePositionDB));
  }

  static async updatePosition(
    satelliteId: string,
    position: { latitude: number; longitude: number; altitude_km: number; velocity_kmh?: number }
  ): Promise<string> {
    const rpcParams = {
      p_satellite_id: satelliteId,
      p_latitude: position.latitude,
      p_longitude: position.longitude,
      p_altitude_km: position.altitude_km,
      p_velocity_kmh: position.velocity_kmh ?? undefined,
    };

    const { data, error } = await supabase.rpc("update_satellite_position", rpcParams);

    if (error) throw error;
    return data as string;
  }

  static async getAlerts(status?: string): Promise<SatelliteAlert[]> {
    let query = supabase
      .from("satellite_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (status === "active") {
      query = query.eq("acknowledged", false);
    } else if (status === "acknowledged") {
      query = query.eq("acknowledged", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(d => this.toAlert(d as SatelliteAlertDB));
  }

  static async getActiveAlerts(): Promise<SatelliteAlert[]> {
    return this.getAlerts("active");
  }

  static async getSatelliteAlerts(satelliteId: string): Promise<SatelliteAlert[]> {
    const { data, error } = await supabase
      .from("satellite_alerts")
      .select("*")
      .eq("satellite_id", satelliteId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(d => this.toAlert(d as SatelliteAlertDB));
  }

  static async acknowledgeAlert(alertId: string, _userId: string): Promise<void> {
    const { error } = await supabase
      .from("satellite_alerts")
      .update({ acknowledged: true })
      .eq("id", alertId);

    if (error) throw error;
  }

  static async getMissionLinks(missionId?: string, satelliteId?: string): Promise<SatelliteMissionLinkDB[]> {
    let query = supabase.from("satellite_mission_links").select("*");

    if (missionId) query = query.eq("mission_id", missionId);
    if (satelliteId) query = query.eq("satellite_id", satelliteId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as SatelliteMissionLinkDB[];
  }

  static async getLatestTelemetry(satelliteId: string): Promise<SatelliteTelemetryDB | null> {
    const { data, error } = await supabase
      .from("satellite_telemetry")
      .select("*")
      .eq("satellite_id", satelliteId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as SatelliteTelemetryDB | null;
  }

  static async getUpcomingPasses(satelliteId: string, limit = 10): Promise<SatellitePassDB[]> {
    const satellite = await this.getSatellite(satelliteId);
    if (!satellite) return [];

    const { data, error } = await supabase
      .from("satellite_passes")
      .select("*")
      .eq("satellite_id", satellite.id)
      .gte("rise_time", new Date().toISOString())
      .order("rise_time", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as SatellitePassDB[];
  }

  static async getTrackingView(satelliteId: string): Promise<{
    satellite: Satellite;
    latest_position?: SatellitePosition;
    active_alerts: SatelliteAlert[];
    mission_links: SatelliteMissionLinkDB[];
    latest_telemetry?: SatelliteTelemetryDB;
    upcoming_passes: SatellitePassDB[];
  } | null> {
    const satellite = await this.getSatellite(satelliteId);
    if (!satellite) return null;

    const [position, alerts, links, telemetry, passes] = await Promise.all([
      this.getLatestPosition(satelliteId),
      this.getSatelliteAlerts(satellite.id),
      this.getMissionLinks(undefined, satellite.id),
      this.getLatestTelemetry(satellite.id),
      this.getUpcomingPasses(satelliteId, 5),
    ]);

    return {
      satellite,
      latest_position: position || undefined,
      active_alerts: alerts.filter(a => a.status === "active"),
      mission_links: links,
      latest_telemetry: telemetry || undefined,
      upcoming_passes: passes,
    };
  }

  static async getGlobalView(): Promise<{
    satellites: Satellite[];
    positions: SatellitePosition[];
    active_alerts: SatelliteAlert[];
  }> {
    const [satellites, positions, alerts] = await Promise.all([
      this.getTrackedSatellites(),
      this.getLatestPositions(100),
      this.getActiveAlerts(),
    ]);

    return { satellites, positions, active_alerts: alerts };
  }

  static async fetchTLEFromCelestrak(satelliteName: string): Promise<{ line1: string; line2: string } | null> {
    try {
      const response = await fetch(
        `https://celestrak.org/NORAD/elements/gp.php?NAME=${encodeURIComponent(satelliteName)}&FORMAT=TLE`
      );

      if (!response.ok) throw new Error(`Failed to fetch TLE: ${response.statusText}`);

      const text = await response.text();
      const lines = text.split("\n").filter(line => line.trim());

      if (lines.length >= 3) {
        return { line1: lines[1].trim(), line2: lines[2].trim() };
      }

      return null;
    } catch (error) {
      logger.error("Error fetching TLE from Celestrak", error as Error, { satelliteName });
      return null;
    }
  }

  static async exportToCSV(filters?: SatelliteSearchFilters): Promise<string> {
    const satellites = await this.getSatellites(filters);
    let csv = "ID,Name,Type,Operator,Status,Tracked\n";

    for (const sat of satellites) {
      csv += `"${sat.satellite_id}","${sat.satellite_name}","${sat.satellite_type}",`;
      csv += `"${sat.operator || "N/A"}","${sat.status}","${sat.is_tracked}"\n`;
    }

    return csv;
  }

  static async exportPositionsToCSV(satelliteId?: string): Promise<string> {
    const positions = satelliteId
      ? await this.getPositionHistory(satelliteId, 24)
      : await this.getLatestPositions(100);

    let csv = "Satellite ID,Satellite Name,Latitude,Longitude,Altitude (km),Velocity (km/h),Timestamp\n";

    for (const pos of positions) {
      csv += `"${pos.satellite_id}","${pos.satellite_name}",`;
      csv += `${pos.latitude},${pos.longitude},${pos.altitude_km},`;
      csv += `${pos.velocity_kmh || "N/A"},"${pos.timestamp}"\n`;
    }

    return csv;
  }
}
